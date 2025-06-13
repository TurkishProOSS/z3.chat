import Elysia from "elysia";

import { agents } from "@/server/routes/agents";
import { upload } from "@/server/routes/upload";

const app = new Elysia({ prefix: '/api' })
	.use(agents)
	.use(upload)

export type App = typeof app;
export { app };