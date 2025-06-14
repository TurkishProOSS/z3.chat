import Elysia, { t } from "elysia";
import { getConfig } from '@/lib/getConfig';
import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv';
import { ip } from "elysia-ip";
import { res } from '@/server';
import md5 from 'md5';
import { ai } from "@/lib/ai";
import { generateText } from "ai";

const ratelimit = new Ratelimit({
	redis: kv,
	limiter: Ratelimit.slidingWindow(20, '24 h')
});

export const promptEnhancement = new Elysia({ prefix: "/enhancePrompt" })
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

		const response = await generateText({
			model: (await ai()).languageModel("llama-3.1-8b-instruct"),
			messages: [
				{
					role: 'user',
					content: `
						You are a prompt enhancement assistant. Your task is to improve the given prompt by making it more specific, detailed, and clear. Focus on enhancing the prompt's clarity and effectiveness for generating high-quality responses.	
						Do not change the original intent of the prompt, but rather refine it to ensure it is well-structured and easy to understand. Provide a revised version of the prompt that maintains its original meaning while improving its overall quality.
						Just enhance the prompt, do not generate a new one. And only return the enhanced prompt without any additional text or explanation.
						Write in the same language as the original prompt.

						Here is the original prompt:
						${prompt}
					`
				}
			],
			maxTokens: 128,
			temperature: 0.7
		});

		return res(true, {
			message: "OK",
			data: response.text,
			customReturn: 'prompt',
			alert: {
				message: `You have ${remaining} prompt enhancements remaining. [Increase your limit](https://z3.chat/pro)`,
				duration: 10000
			},
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