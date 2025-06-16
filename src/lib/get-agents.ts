import { AgentModel } from "./definitions";

export const getAgents = () => {
	const models = [];

	models.push([
		{
			provider: "Gemini",
			orId: "google/gemma-3n-e4b-it:free",
			id: "gemini-2.0-flash-exp",
			name: "Gemini 2.0 Flash",
			available: true,
			enabled: true,
			features: {
				fast: true,
				reasoning: true,
				experimental: true,
				vision: true,
				pdfSupport: true,
				premium: false
			}
		}
	]);

	models.push([
		{
			provider: "Qwen",
			orId: "qwen/qwq-32b:free",
			id: "qwq-32b",
			name: "QWQ 32B",
			available: true,
			enabled: true,
			features: {
				fast: false,
				reasoning: true,
				experimental: true,
				premium: false
			}
		},
		{
			provider: "Qwen",
			orId: "qwen/qwen3-14b:free",
			id: "qwen3-14b",
			name: "Qwen 3 14B",
			available: true,
			enabled: true,
			features: {
				fast: false,
				reasoning: true,
				experimental: true,
				premium: false
			}
		}
	]);

	models.push([
		{
			provider: "Meta",
			orId: "meta-llama/llama-4-maverick:free",
			id: "llama-4-maverick",
			name: "Llama 4 Maverick",
			available: true,
			enabled: true,
			features: {
				fast: false,
				reasoning: true,
				experimental: true,
				search: true
			}
		},
		{
			provider: "Meta",
			orId: "meta-llama/llama-3.1-sonar-small-128k-online",
			id: "llama-3.1-sonar-small-128k-online",
			name: "Llama 3.1 Sonar Small 128K Online",
			available: true,
			enabled: true,
			features: {
				fast: false,
				reasoning: true,
				experimental: true,
				premium: false,
				search: true
			}
		}
	]);

	models.push([
		{
			provider: "DeepSeek",
			orId: "deepseek/deepseek-chat-v3-0324:free",
			id: "deepseek-chat-v3-0324",
			name: "DeepSeek Chat V3",
			available: true,
			enabled: true,
			features: {
				fast: false,
				reasoning: true,
				experimental: true,
				premium: false,
				search: true
			}
		}
	]);

	models.push([
		{
			provider: "Mistral",
			orId: "mistralai/devstral-small:free",
			id: "devstral-small",
			name: "DevStral Small",
			available: true,
			enabled: true,
			features: {
				fast: false,
				reasoning: true,
				experimental: true,
				premium: false,
				search: false
			}
		}
	]);

	const providers = new Set<string>();
	const flatten = models.flat();
	flatten.flat().map(agent => providers.add(agent.provider));

	// @ts-ignore
	return Array.from(providers).map(provider => {
		return {
			provider,
			models: flatten.filter(agent => agent.provider === provider)
		}
	}) as {
		provider: string;
		models: AgentModel[];
	}[]
}

export const getDefaultAgent = async () => {
	const agents = await getAgents();
	return agents.map(m => m.models).flat().find(agent => agent.id === "gemini-2.0-flash-exp") || null;
}