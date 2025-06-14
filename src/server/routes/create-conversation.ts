import { createOpenAI } from '@ai-sdk/openai';
import Elysia, { t } from "elysia";
import { generateText, streamText } from 'ai';
import { getAuth, res } from '@/server';
import getConfig from 'next/config';
import { ai } from '@/lib/ai';
import { Conversation } from '@/database/models/Conversations';
import { randomUUID } from 'crypto';
import { redirect } from 'next/dist/server/api-utils';
import { Message } from '@/database/models/Messages';


export const createConversation = new Elysia({ prefix: "/createConversation" })
	.post("/", async ({ body, headers, set }) => {
		const auth = await getAuth(headers);
		if (!auth) {
			return res(false, {
				message: "Unauthorized"
			});
		}

		const { prompt } = body;
		const response = await generateText({
			model: (await ai()).languageModel("llama-3.1-8b-instruct"),
			messages: [
				{
					role: 'user',
					content: `
Generate a short, clear, and descriptive title in English for the following user prompt, preserving its technical context.
Dont use more than 5 words.
Write in the same language as the original prompt.
And dont use any special characters, just use words.

Example:
- "I want to replace the 404 returned image with the local image with Gravatar, how can I do it in React?" -> "Gravatar 404 Instead of Image"


Here is the original prompt:
${prompt}
							`
				}
			],
			maxTokens: 128,
			temperature: 0.7
		}).catch(() => null);

		if (!response || !response.text) {
			return res(false, {
				message: "Failed to generate title",
				error: ['generation_failed', 'Failed to generate title from the prompt']
			});
		}

		const conversation = new Conversation({
			title: response.text.trim(),
			originalPrompt: prompt,
			userId: auth.user.id,
			createdAt: new Date(),
			updatedAt: new Date()
		})

		const savedConversation = await conversation.save().catch(() => null);

		if (!savedConversation) {
			return res(false, {
				message: "Failed to create conversation",
				error: ['conversation_creation_failed', 'Failed to create conversation in the database']
			});
		};

		return res(true, {
			message: "OK",
			data: {
				id: savedConversation._id,
				title: response.text.trim(),
				prompt: prompt,
				redirect: `/chats/${conversation._id}`
			}
		});
	}, {
		body: t.Object({
			prompt: t.String()
		})
	});