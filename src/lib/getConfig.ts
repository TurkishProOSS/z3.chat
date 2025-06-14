export const getAIApiKey = (provider: string): string | null => {
	const envKey = `Z3_${provider.toUpperCase()}_API_KEY`;
	const apiKey = process.env[envKey];
	if (!apiKey) {
		console.warn(`API key for ${provider} not found. Please set the environment variable ${envKey}.`);
		return null;
	}
	return apiKey;
};