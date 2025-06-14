import { createOpenAI } from '@ai-sdk/openai';
import { getConfig } from '@/lib/getConfig';
import { randomUUID } from 'crypto';
import Elysia, { t } from "elysia";
import { streamText } from 'ai';
import { getAuth, res } from '@/server';
import { Conversation } from '@/database/models/Conversations';
import { Message, MessageDocument } from '@/database/models/Messages';
import { ai, getAllModelsArray } from '@/lib/ai';


export const chat = new Elysia({ prefix: "/chat" })
	.post("/:conversationId", async function* ({ body, set, params, headers }) {
		const auth = await getAuth(headers);
		if (!auth) {
			return res(false, {
				message: "Unauthorized"
			});
		}

		const { conversationId } = params;
		if (!conversationId) {
			return res(false, { error: ['conversation_id_required', 'Conversation ID is required'] });
		}

		const conversation = await Conversation.findOne({
			_id: conversationId,
			userId: auth.user.id
		}).select('-messages').lean();

		if (!conversation) {
			return res(false, { error: ['conversation_not_found', 'Conversation not found'] });
		}

		if (!body.message || typeof body.message !== 'string') {
			return res(false, { error: ['message_required', 'Message is required and must be a string'] });
		}

		if (!body.model || typeof body.model !== 'string') {
			return res(false, { error: ['model_required', 'Model is required and must be a string'] });
		}

		const models = await getAllModelsArray();
		const model = models.find(m => m === body.model);
		if (!model) return res(false, { error: ['model_not_found', 'Unknown model'] });

		const newMessage = new Message({
			chatId: conversationId,
			role: 'user',
			content: body.message,
			createdAt: new Date()
		});

		await Conversation.updateOne(
			{ _id: conversationId, userId: auth.user.id },
			{
				$push: { messages: newMessage._id }
			}
		);

		await newMessage.save()
			.catch(() => {
				Conversation.updateOne(
					{ _id: conversationId, userId: auth.user.id },
					{
						$pull: { messages: newMessage._id }
					}
				);
				return res(false, { error: ['message_save_failed', 'Failed to save message'] });
			});

		const messages = (await Message.find({
			chatId: conversationId
		}).sort({ createdAt: 1 }).lean()).map((m) => ({
			role: m.role as 'user' | 'assistant' | 'system',
			content: m.content as string
		})).concat({
			role: 'user',
			content: body.message
		});


		const result = await streamText({
			model: (await ai()).languageModel(model),
			system: "You are a helpful assistant.",
			messages,
			stopSequences: ['[DONE]'],
			onFinish: async (text) => {
				const responseMessage = new Message({
					chatId: conversationId,
					role: 'assistant',
					content: text,
					createdAt: new Date(),
					agentId: model
				});

				await Conversation.updateOne(
					{ _id: conversationId, userId: auth.user.id },
					{
						$push: { messages: responseMessage._id }
					}
				);

				await responseMessage.save()
					.catch(() => {
						Conversation.updateOne(
							{ _id: conversationId, userId: auth.user.id },
							{
								$pull: { messages: responseMessage._id }
							}
						);
						return res(false, { error: ['response_message_save_failed', 'Failed to save response message'] });
					});
			}
		});

		set.headers['Content-Type'] = 'text/event-stream; charset=utf-8';

		for await (const chunk of result.textStream) {
			yield chunk;
		}
	}, {
		body: t.Object({
			id: t.Optional(t.String()),
			model: t.String(),
			message: t.String()
		})
	});