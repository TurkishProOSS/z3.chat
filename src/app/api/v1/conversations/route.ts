import { Conversation } from "@/database/models/Conversations";
import { withAuth } from "@/middleware/withAuth";
import { type NextRequest } from 'next/server';

export const GET = async (
	request: NextRequest
) => {
	return await withAuth(async (session) => {
		const conversations = await Conversation.find({
			userId: session.user.id
		})
			.select('-messages')
			.sort({ updatedAt: -1 })
			.lean();

		return Response.json({
			success: true,
			conversations
		}, { status: 200 });
	}, {
		forceAuth: true,
		headers: request.headers
	});
};