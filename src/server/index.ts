import { put } from "@vercel/blob";
import Elysia, { t } from "elysia";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const app = new Elysia({ prefix: '/api' })
	.get('/delay/:delay', ({ params }) => {
		delay(params.delay);

		return { message: 'Delayed response ' + params.delay };
	}, {
		params: t.Object({
			delay: t.Number({ description: 'Delay in milliseconds' })
		}),
		response: t.Object({
			message: t.String({ description: 'Delayed message' })
		})
	})
	.post('/upload', async ({ query, body }) => {
		const { filename } = query;
		const { image } = body;
		if (!image) throw new Error('Image is required');
		if (!filename) throw new Error('Filename is required');

		const blob = await put(filename, await image.arrayBuffer(), {
			access: 'public',
			addRandomSuffix: true
		});

		if (+process.env.MASK_VERCEL_BLOB_STORAGE_URL! === 1) {
			blob.url = blob.url.replace(process.env.VERCEL_BLOB_STORAGE_URL!, '/storage/public/chat-files');
			blob.downloadUrl = blob.downloadUrl.replace(process.env.VERCEL_BLOB_STORAGE_URL!, '/storage/public/chat-files');
		}

		return blob;
	}, {
		query: t.Object({
			filename: t.String()
		}),
		body: t.Object({
			image: t.File()
		})
	})

export type App = typeof app;
export { app };