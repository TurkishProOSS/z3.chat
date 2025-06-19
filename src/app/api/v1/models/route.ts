import { AgentModel } from "@/database/models/Models";
import { AgentModel as TAgentModel } from "@/lib/definitions";
import { withAuth } from "@/middleware/withAuth";
import { ObjectId } from "mongoose";
import { type NextRequest } from 'next/server';


export const GET = async (
	request: NextRequest
) => {
	return await withAuth(async (session) => {
		const userPinnedAgents = session?.user?.pinned_agents || [];

		const page = request.nextUrl.searchParams.get("page") || "1";
		const limit = request.nextUrl.searchParams.get("limit") || "10";
		const skip = (parseInt(page) - 1) * parseInt(limit);

		const userPinnedAgentsWithFallback = userPinnedAgents.length > 0 ? userPinnedAgents : [
			"google/imagen-4-ultra",
			"deepseek/deepseek-chat-v3-0324:free",
			"deepseek/deepseek-r1-0528:free",
			"deepseek/deepseek-r1:free",
			"google/gemini-2.0-flash-exp:free",
			"anthropic/claude-4-opus-20250522",
			"anthropic/claude-4-sonnet-20250522",
			"anthropic/claude-3-7-sonnet-20250219",
			"qwen/qwen3-14b:free",
			"mistralai/mistral-nemo:free",
			"meta-llama/llama-4-maverick:free",
			"meta-llama/llama-3.3-70b-instruct:free",
			"openai/gpt-4o-mini",
			"openai/gpt-4.1",
			"openai/gpt-4o",
			"google/gemini-2.5-pro-exp-03-25",
			"google/gemini-2.5-flash-preview"
		];

		type Model = TAgentModel & any;

		const fallbackModel: Model | null = await AgentModel.findOne({
			is_fallback: true
		}).lean().exec();

		if (!fallbackModel) {
			return Response.json({
				success: false,
				message: "No fallback model found"
			}, { status: 404 });
		}

		const selectionInput = request.nextUrl.searchParams.get("selection") == "1";
		const selector: Record<string, any> = selectionInput ? {
			openRouterId: {
				$in: [
					fallbackModel.openRouterId
				].concat(userPinnedAgentsWithFallback.filter(id => id !== fallbackModel.openRouterId))
			},
		} : {};


		let agents = await AgentModel.find(selector)
			.sort({ createdAt: -1 })
			.skip(+(selectionInput ? 0 : skip))
			.limit(+(selectionInput ? (userPinnedAgents.length > 0 ? 10 : 1000) : limit))
			.lean()
			.exec();

		const allProviders = await AgentModel.find({}).select("id provider").lean().exec();
		const providersWithModelCount = allProviders.reduce((acc: Record<string, number>, model) => {
			if (!acc[model.provider]) {
				acc[model.provider] = 0;
			}
			acc[model.provider]++;
			return acc;
		}, {});

		const allModelsWithAvaiable = agents.map(agent => {
			return {
				...agent,
				enabled: agent.premium ? (session?.user?.is_premium ? true : false) : (agent.available)
			}
		});

		return Response.json({
			success: true,
			message: "OK",
			data: {
				agents: allModelsWithAvaiable,
				providersWithModelCount,
				fallbackModel
			}
		});
	}, {
		forceAuth: false,
		headers: request.headers
	});
};