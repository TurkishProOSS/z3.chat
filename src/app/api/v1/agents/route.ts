import { AgentModel } from "@/lib/definitions";
import { withAuth } from "@/middleware/withAuth";
import { type NextRequest } from 'next/server';

export const GET = async (
	request: NextRequest
) => {
	return await withAuth(async (session) => {
		const OpenAI = [
			{
				id: "gpt-4o-mini",
				name: "GPT-4o Mini",
				available: true,
				enabled: false,
				description: "Like gpt-4o, but faster.",
				features: {
					vision: true,
					fast: true
				}
			}
		];

		const Gemini = [
			{
				id: "gemini-2.5-flash-preview",
				name: "Gemini 2.5 Flash Preview",
				available: true,
				enabled: true,
				features: {
					fast: true
				}
			}
		];

		const Meta = [
			{
				id: "llama-3.1-8b-instruct",
				name: "Llama 3.1 8B Instruct",
				available: true,
				enabled: true,
				features: {
					fast: true,
					reasoning: false,
					experimental: false
				}
			}
		];

		const agentMap = {
			OpenAI,
			Gemini,
			Meta
		};

		return Response.json({
			defaultAgent: Meta.at(0) as AgentModel,
			agents: agentMap
		});
	}, {
		forceAuth: false,
		headers: request.headers
	});
};