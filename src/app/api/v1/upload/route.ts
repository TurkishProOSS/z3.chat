import { put } from "@/lib/blob";
import { withAuth } from "@/middleware/withAuth";
import { type NextRequest } from 'next/server';

export const POST = async (
	request: NextRequest
) => {
	return await withAuth(async (session) => {
		const filename = request.nextUrl.searchParams.get('filename') || '';
		const { image } = await request.json();

		if (!image) throw new Error('Image is required');
		if (!filename) throw new Error('Filename is required');

		const blob = await put('chat-files', filename, await image.arrayBuffer(), {
			access: 'public',
			addRandomSuffix: true
		});

		return blob;
	}, {
		forceAuth: true,
		headers: request.headers
	});
};