import { ai } from "@/lib/ai";
import { withAuth } from "@/middleware/withAuth";
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";
import { generateText } from "ai";
import md5 from "md5";
import { type NextRequest } from 'next/server';

const ratelimit = new Ratelimit({
	redis: kv,
	limiter: Ratelimit.slidingWindow(20, '24 h')
});

export const POST = async (
	request: NextRequest
) => {
	return await withAuth(async (session) => {
		const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || request.headers.get('cf-connecting-ip') || request.headers.get('x-client-ip') || 'unknown';
		const { success, remaining, limit, reset } = await ratelimit.limit(`prompt-enhancement:${md5(ip)}`);

		if (!success) {
			return Response.json({
				success: false,
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
			}, { status: 429 });
		}

		const { prompt } = await request.json();

		const response = await generateText({
			model: (await ai()).languageModel("llama-3.1-8b-instruct"),
			messages: [
				{
					role: 'user',
					content: `
Enhance the following user prompt by making it more clear, concise, and descriptive. The enhanced prompt should maintain the original intent and context of the user's request. Avoid using special characters and keep it in the same language as the original prompt.
Write in the same language as the original prompt.

Here is the original prompt:
${prompt}
							`
				}
			],
			maxTokens: 128,
			temperature: 0.7
		});

		if (!response || !response.text) {
			return Response.json({
				success: false,
				message: "Failed to enhance prompt",
			}, { status: 500 });
		}

		return Response.json({
			success: true,
			message: "Prompt enhanced successfully",
			originalPrompt: prompt,
			prompt: response.text,
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
		forceAuth: true,
		headers: request.headers
	});
};