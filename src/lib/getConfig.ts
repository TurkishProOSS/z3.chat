export const getConfig = async (): Promise<{
	[key: string]: string | null
}> => {

	return {
		openai: await getApiKey('openai').catch(() => null),
		llama: await getApiKey('llama').catch(() => null)
	}
};

const getApiKey = async (provider: string): Promise<string | null> => {
	const apiKey = process.env[`Z3_${provider.toUpperCase()}_API_KEY`];
	if (!apiKey) {
		console.warn(`API key for ${provider} is not set.`);
		return null;
	}
	return apiKey;
}