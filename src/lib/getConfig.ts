import { Z3CKey } from '@/database/models/Keys';

export const getConfig = async (): Promise<{
	[key: string]: string | null
}> => {
	return {
		openai: await getApiKey('openai').catch(() => null),
		llama31: await getApiKey('llama_31').catch(() => null),
		llama33: await getApiKey('llama_33').catch(() => null),
		deepseek: await getApiKey('deepseek').catch(() => null),
		google: await getApiKey('google').catch(() => null),
		xai: await getApiKey('xai').catch(() => null),
		anthropic: await getApiKey('anthropic').catch(() => null)
	}
};

const getApiKey = async (provider: string): Promise<string | null> => {
	const apiKey = process.env[`Z3_${provider.toUpperCase()}_API_KEY`];
	if (!apiKey) return null;

	return apiKey;
}