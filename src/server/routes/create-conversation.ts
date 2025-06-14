import { createOpenAI } from '@ai-sdk/openai';
import { getAIApiKey } from '@/lib/getConfig';
import { randomUUID } from 'crypto';
import Elysia, { t } from "elysia";
import { streamText } from 'ai';
import { res } from '@/server';
// import { mongoClient } from '@/lib/db';
// import { db } from '../../lib/db';


export const createConversation = new Elysia({ prefix: "/create-conversation" })
	.get("/", async ({ body, query, set }) => {
		const { prompt } = query;
		const apiKey = await getAIApiKey('llama');

		const response = await fetch(process.env.Z3_LLAMA_API_URL!, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				messages: [
					{
						role: 'user',
						content: `
							Generate a short, clear, and descriptive title in English for the following user prompt, preserving its technical context.
							Dont use more than 5 words.
							Write in the same language as the original prompt.

							Example:
							- "I want to replace the 404 returned image with the local image with Gravatar, how can I do it in React?" -> "Gravatar 404 Instead of Image"
							

							Here is the original prompt:
							${prompt}
						`
					}
				],
				max_tokens: 60,
				temperature: 1
			})
		})
			.then(res => res.json())
			.catch(err => {
				return { error: "Failed to enhance prompt." };
			});

		if (!response || !response.choices || response.choices.length === 0) {
			return res(false, {
				message: "Failed to generate a conversation."
			});
		}

		const fullResponse = response.choices.map((choice: any) => choice.message.content).join('\n');
		// const insert = await db.collection('conversations').insertOne({
		// 	id: randomUUID(),
		// 	title: fullResponse,
		// 	prompt: prompt,
		// 	createdAt: new Date()
		// });

		// console.log('Inserted conversation:', insert);

		return res(true, {
			message: "OK",
			data: {
				title: fullResponse,
				prompt: prompt
			},
			rateLimit: {
				remaining: 1000, // Example value, adjust as needed
				limit: 1000, // Example value, adjust as needed
				reset: Date.now() + 3600000 // Example value, adjust as needed
			}
		});
	}, {
		query: t.Object({
			prompt: t.String()
		})
	});