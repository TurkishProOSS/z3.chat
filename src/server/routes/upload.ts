import { put } from "@/lib/blob";
import Elysia, { t } from "elysia";

export const upload = new Elysia({ prefix: "/upload" })
	.post('/upload', async ({ query, body }) => {
		const { filename } = query;
		const { image } = body;
		if (!image) throw new Error('Image is required');
		if (!filename) throw new Error('Filename is required');

		const blob = await put('chat-files', filename, await image.arrayBuffer(), {
			access: 'public',
			addRandomSuffix: true
		});

		return blob;
	}, {
		query: t.Object({
			filename: t.String()
		}),
		body: t.Object({
			image: t.File()
		})
	});