import { z } from 'zod';

const useThemeSchema = z.object({
	theme: z.string(),
	setTheme: z.function().args(z.string()).returns(z.void())
});
export type useThemeSchema = z.infer<typeof useThemeSchema>;