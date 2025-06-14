import Elysia from "elysia";

import { agents } from "@/server/routes/agents";
import { upload } from "@/server/routes/upload";
import { chat } from "@/server/routes/chat";
import { promptEnhancement } from "@/server/routes/prompt-enhancement";
import { createConversation } from "./routes/create-conversation";

const app = new Elysia({ prefix: '/api' })
	.use(agents)
	.use(upload)
	.use(chat)
	.use(promptEnhancement)
	.use(createConversation);

export type App = typeof app;
export { app };

type ResOptions<T> = {
	customReturn?: string;
	message?: string;
	data?: T;
	error?: [string, string];
	pagination?: {
		current_page: number;
		max_page: number;
		per_page: number;
		total: number;
	};
	rateLimit?: {
		limit: number;
		remaining: number;
		reset: number | string;
	};
};

export function res<T = string>(success: boolean, options: ResOptions<T> = {}) {
	if (!options?.customReturn) options.customReturn = 'data';
	const { data, error } = options || {};

	return {
		success,
		message: options?.message || (success ? 'OK' : 'ERROR'),
		[options?.customReturn || 'data']: data,
		error: error ? { code: error[0], message: error[1] } : undefined,
		pagination: options?.pagination,
		rateLimit: options?.rateLimit
	};
};