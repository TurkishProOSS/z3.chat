import { customProvider } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { getConfig } from "./getConfig";

export const ai = async () => {
	return customProvider({
		languageModels: await getLanguageModels(),
		imageModels: await getImageModels()
	})
};

export const getLanguageModels = async () => {
	const apiKeys = await getConfig();

	const openai = createOpenAI({
		apiKey: apiKeys.openai || ""
	});

	const llama = createOpenAI({
		baseURL: process.env.Z3_LLAMA_API_URL || "https://api.llama3.ai",
		apiKey: apiKeys.llama || ""
	});

	const google = createGoogleGenerativeAI({
		apiKey: apiKeys.gemini || ""
	});

	return {
		"gpt-4o-mini": openai("gpt-4o-mini", { structuredOutputs: true }),
		"llama-3.1-8b-instruct": llama("llama-3.1-8b-instruct"),
		"gemini-2.5-flash-preview": google("gemini-2.5-flash-preview-04-17")
	}
}

export const getImageModels = async () => {
	const apiKeys = await getConfig();

	return {};
};

export const getAllModelsArray = async () => {
	const languageModels = await getLanguageModels();
	const imageModels = await getImageModels();

	return Object.keys(languageModels).concat(Object.keys(imageModels));
}