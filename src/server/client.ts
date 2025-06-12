import { treaty } from '@elysiajs/eden';
import type { App } from '@/server';

const app = treaty<App>(process.env.ELYSIA_URL! || 'localhost:3000');

export const api = app.api;