import { customProvider, tool } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createXai } from "@ai-sdk/xai"
import { createDeepSeek } from '@ai-sdk/deepseek';

import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { getConfig } from "./getConfig";
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { getAgents } from "./get-agents";

export const ai = async () => {
	return customProvider({
		languageModels: await getLanguageModels(),
		imageModels: await getImageModels(),
	})
};
export const getLanguageModels = async () => {
	const z3c = createOpenRouter({
		apiKey: process.env.Z3_OPENROUTER_API_KEY || ""
	});

	const agents = await getAgents();
	const models = agents.map(agent => agent.models).flat();
	const languageModels = models.reduce((acc: any, model: any) => {
		acc[model.id] = z3c.chat(model.orId);
		return acc;
	}, {});

	return Object.assign({
		"title-0": z3c.chat("google/gemma-3n-e4b-it:free"),
		"enhancment-0": z3c.chat("google/gemma-3n-e4b-it:free")
	}, languageModels);
};
export const getImageModels = async () => {
	const z3c = createOpenRouter({
		apiKey: process.env.Z3_OPENROUTER_API_KEY || "",
	});

	return {};
};

export const getAllModelsArray = async () => {
	const languageModels = await getLanguageModels();
	const imageModels = await getImageModels();

	return Object.keys(languageModels).concat(Object.keys(imageModels));
}