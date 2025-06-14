import { createOpenAI } from '@ai-sdk/openai';
import { getAIApiKey } from '@/lib/getConfig';
import { randomUUID } from 'crypto';
import Elysia, { t } from "elysia";
import { streamText } from 'ai';
import { res } from '@/server';

const models = [
	{
		code: 'gpt-4o-mini',
		provider: 'openai',
	}
];

let history: any[] = []

export const chat = new Elysia({ prefix: "/chat" })
	.get("/", async function* ({ set, request, query }) {
		const { id, model = 'gpt-4o-mini', message } = query;
		const uuid = id || randomUUID();

		const apiKey = await getAIApiKey('openai');
		if (!apiKey) return {
			status: 400,
			body: { error: 'API key for OpenAI is not set.' }
		}

		const openai = createOpenAI({
			apiKey
		});

		history.push({
			role: 'user',
			content: message,
		});

		const result = await streamText({
			model: openai(model),
			system: "You are a helpful assistant.",
			messages: history
		});

		history.push({
			role: 'assistant',
			content: ''
		});

		set.headers['Content-Type'] = 'text/event-stream; charset=utf-8';
		set.headers['Cache-Control'] = 'no-cache';
		set.headers['Connection'] = 'keep-alive';
		set.headers['X-Accel-Buffering'] = 'no';

		for await (const chunk of result.textStream) {
			history[history.length - 1].content += chunk;
			yield chunk;
		};
	}, {
		query: t.Object({
			id: t.Optional(t.String()),
			model: t.Optional(t.String()),
			message: t.String()
		})
	})
	.post("/", async function* ({ body, set }) {
		const model = models.find(m => m.code === body.model);
		if (!model) return res(false, { error: ['model_not_found', 'Unknown model'] });

		const apiKey = await getAIApiKey(model.provider);
		if (!apiKey) return res(false, { error: ['api_key_not_set', 'API key is not set.'] });

		const openai = createOpenAI({
			apiKey
		});

		const result = await streamText({
			model: openai(model.code),
			system: "You are a helpful assistant.",
			messages: [
				{
					role: 'user',
					content: body.message
				}
			]
		});

		console.log(result);

		set.headers['Content-Type'] = 'text/event-stream; charset=utf-8';
		yield 'YANIT: ';

		for await (const chunk of result.textStream) {
			yield chunk;
		}
	}, {
		body: t.Object({
			id: t.Optional(t.String()),
			model: t.Union(models.map(m => t.Literal(m.code))),
			message: t.String()
		})
	});