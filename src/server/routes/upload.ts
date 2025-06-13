import { put } from "@vercel/blob";
import Elysia, { t } from "elysia";

export const upload = new Elysia({ prefix: "/upload" })
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
	});