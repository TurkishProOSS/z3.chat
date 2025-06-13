import { set, z } from 'zod';

export const useThemeSchema = z.object({
	theme: z.string(),
	setTheme: z.function().args(z.string()).returns(z.void())
});
export type useThemeSchema = z.infer<typeof useThemeSchema>;

export const agentModelSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	version: z.string().optional().nullable().default(null),
	features: z.object({
		vision: z.boolean().optional(),
		imageInput: z.boolean().optional(),
		imageGeneration: z.boolean().optional(),
		objectGeneration: z.boolean().optional(),
		toolUsage: z.boolean().optional(),
		toolStreaming: z.boolean().optional(),
		reasoning: z.boolean().optional(),
		pdfSupport: z.boolean().optional(),
		search: z.boolean().optional(),
		effortControl: z.boolean().optional(),
		fast: z.boolean().optional(),
		premium: z.boolean().optional(),
		apiKeyRequired: z.boolean().optional(),
		experimental: z.boolean().optional()
	}).partial().default({}),
	enabled: z.boolean(),
	available: z.boolean(),
	priority: z.number().int().min(0).max(100)
});
export type AgentModel = z.infer<typeof agentModelSchema>;

export const z3Schema = z.object({
	agents: z.object({
		OpenAI: z.array(agentModelSchema).optional(),
		Anthropic: z.array(agentModelSchema).optional(),
	}),
	defaultAgent: agentModelSchema.optional().nullable(),
	selectedAgent: z.object(agentModelSchema.shape).nullable().optional()
		.default(null),
	changeAgent: z.function().args(z.string().nullable())
		.returns(z.void()),
	features: z.object({
		search: z.boolean().optional()
	}).partial().default({}),
	setFeature: z.function().args(z.string(), z.any())
		.returns(z.void()),
	prompt: z.string().default(''),
	setPrompt: z.function().args(z.string())
		.returns(z.void()),
	isEnhancing: z.boolean().default(false),
	enhancePrompt: z.function().args().returns(z.void())
});

export const initZ3Schema = z3Schema.omit({ selectedAgent: true, changeAgent: true });
export type Z3Schema = z.infer<typeof z3Schema>;
export type InitZ3Schema = z.infer<typeof initZ3Schema>;