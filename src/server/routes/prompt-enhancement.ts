import Elysia, { t } from "elysia";
import { getAIApiKey } from '@/lib/getConfig';
import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv';
import { ip } from "elysia-ip";
import { res } from '@/server';
import md5 from 'md5';

const ratelimit = new Ratelimit({
	redis: kv,
	limiter: Ratelimit.slidingWindow(5, '24 h')
});

export const promptEnhancement = new Elysia({ prefix: "/prompt-enhancement" })
	.use(ip())
	.post("/", async ({ request, ip, body }) => {
		const { success, remaining, limit, reset } = await ratelimit.limit(`prompt-enhancement:${md5(ip)}`);

		if (!success) {
			return res(false, {
				message: `You have reached of your prompt enhancement limit. Please try at ${new Date(reset).toLocaleDateString("en-US", {
					year: 'numeric',
					month: '2-digit',
					day: '2-digit',
					hour: '2-digit',
					minute: '2-digit'
				})}.`,
				rateLimit: {
					remaining,
					limit,
					reset
				}
			});
		}

		const { prompt } = body;

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
							You are a prompt enhancement assistant. Your task is to improve the given prompt by making it more specific, detailed, and clear. Focus on enhancing the prompt's clarity and effectiveness for generating high-quality responses.	
							Do not change the original intent of the prompt, but rather refine it to ensure it is well-structured and easy to understand. Provide a revised version of the prompt that maintains its original meaning while improving its overall quality.
							Write in the same language as the original prompt.

							Here is the original prompt:
							${prompt}
						`
					}
				],
				max_tokens: 128,
				temperature: 1
			})
		})
			.then(res => res.json())
			.catch(err => {
				return { error: "Failed to enhance prompt." };
			});

		const fullResponse = response.choices.map((choice: any) => choice.message.content).join('\n');

		return res(true, {
			message: "OK",
			data: fullResponse,
			customReturn: 'prompt',
			rateLimit: {
				remaining,
				limit,
				reset
			}
		});
	}, {
		body: t.Object({
			prompt: t.String()
		})
	})