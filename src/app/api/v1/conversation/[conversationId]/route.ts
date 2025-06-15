import { Conversation } from "@/database/models/Conversations";
import { Message } from "@/database/models/Messages";
import { ai, getAllModelsArray } from "@/lib/ai";
import { withAuth } from "@/middleware/withAuth";
import { appendResponseMessages, createDataStream, smoothStream, streamText } from "ai";
import { isValidObjectId } from "mongoose";
import { type NextRequest } from 'next/server'
import { createResumableStreamContext } from "resumable-stream";
import { after } from "next/server";
import { randomUUID } from "crypto";

const streamContext = createResumableStreamContext({
	waitUntil: after
});

export const GET = async (
	request: NextRequest,
	{ params }: { params: { conversationId: string } }
) => {
	return await withAuth(async (session) => {
		const { conversationId } = await params;
		if (!conversationId) return Response.json({ success: false, message: 'Conversation ID is required' }, { status: 400 });

		if (isValidObjectId(conversationId) === false) {
			return Response.json({ success: false, message: 'Invalid conversation ID' }, { status: 400 });
		}

		const isExists = await Conversation.exists({ _id: conversationId, userId: session.user.id });
		if (!isExists) return Response.json({ success: false, message: 'Conversation not found' }, { status: 404 });

		const conversation = await Conversation.findOne({
			_id: conversationId,
			userId: session.user.id
		}).populate({
			path: 'messages',
			options: {
				lean: true
			}
		}).lean();

		return Response.json({
			success: true,
			conversation
		}, { status: 200 });
	}, {
		forceAuth: true,
		headers: request.headers
	});
};

export const POST = async (
	request: NextRequest,
	{ params }: { params: { conversationId: string } }
) => {
	return await withAuth(async (session) => {
		const { conversationId } = await params;
		const { prompt, model } = await request.json();
		if (!prompt) return Response.json({ success: false, message: 'Message is required' }, { status: 400 });
		if (!model) return Response.json({ success: false, message: 'Model is required' }, { status: 400 });

		if (!conversationId) return Response.json({ success: false, message: 'Conversation ID is required' }, { status: 400 });
		if (isValidObjectId(conversationId) === false) {
			return Response.json({ success: false, message: 'Invalid conversation ID' }, { status: 400 });
		}

		const models = await getAllModelsArray();
		const requestModel = models.find(m => m === model);
		if (!requestModel) return Response.json({ success: false, message: 'Invalid model' }, { status: 400 });

		const conversation = await Conversation.findOne({
			_id: conversationId,
			userId: session.user.id
		}).select('-messages').lean();
		if (!conversation) return Response.json({ success: false, message: 'Conversation not found' }, { status: 404 });

		const newMessage = new Message({
			chatId: conversationId,
			role: 'user',
			content: prompt,
			createdAt: new Date()
		});

		await newMessage.save();

		await Conversation.updateOne(
			{ _id: conversationId, userId: session.user.id },
			{
				$push: { messages: newMessage._id }
			}
		);

		const messages = (await Message.find({
			chatId: conversationId
		}).sort({ createdAt: 1 }).lean()).map((m) => ({
			role: m.role as 'user' | 'assistant' | 'system',
			content: m.content as string
		})).concat({
			role: 'user',
			content: prompt as string
		});

		const responseMessage = new Message({
			chatId: conversationId,
			role: 'assistant',
			content: '',
			resume: true,
			agentId: requestModel
		});

		await Conversation.updateOne(
			{ _id: conversationId, userId: session.user.id },
			{
				$push: { messages: responseMessage._id }
			}
		);

		await responseMessage.save();

		const d = await ai();
		const stream = createDataStream({
			execute: dataStream => {
				const result = streamText({
					model: d.languageModel(requestModel),
					system: "You are a helpful assistant.",
					messages,
					onFinish: async ({ response }) => {
						const [, assistantMessage] = appendResponseMessages({
							messages: [prompt],
							responseMessages: response.messages,
						});

						const dbData = await Message.findOne({ chatId: conversationId, role: 'assistant', resume: true })
							.catch((err) => null);

						if (!dbData) {
							console.error('No assistant message found in database');
							return;
						}

						await Message.updateOne(
							{ _id: dbData._id },
							{
								role: assistantMessage.role,
								content: assistantMessage.content,
								experimental_attachments: assistantMessage.experimental_attachments,
								resume: false
							}
						).catch((err) => {
							console.error('Error updating assistant message:', err);
						});

					},
					experimental_transform: smoothStream({ chunking: 'word', delayInMs: 50 }),
					onError: async ({ error }) => {
						try {
							dataStream.writeData({
								type: 'error',
								error: 'An error occurred while processing your request.'
							});

							const dbData = await Message.findOne({ chatId: conversationId, role: 'assistant', resume: true })
								.catch((err) => null);

							if (!dbData) {
								console.error('No assistant message found in database');
								return;
							}

							await Message.deleteOne({ _id: dbData._id });
							await Conversation.updateOne(
								{ _id: conversationId, userId: session.user.id },
								{
									$pull: { messages: dbData._id }
								}
							);
						} catch (err) {
							console.error('Error handling error in stream:', err);
						}
					}
				});

				result.consumeStream();

				return result.mergeIntoDataStream(dataStream);
			}
		});

		const str = await streamContext.createNewResumableStream(conversationId, () => stream);

		return new Response(str, {
			status: 200
		});
	}, {
		forceAuth: true,
		headers: request.headers
	});
};