import { Conversation } from "@/database/models/Conversations";
import { ai } from "@/lib/ai";
import { withAuth } from "@/middleware/withAuth";
import { generateText } from "ai";
import { type NextRequest } from 'next/server';

export const POST = async (
	request: NextRequest
) => {
	return await withAuth(async (session) => {
		const { prompt } = await request.json();
		const response = await generateText({
			model: (await ai()).languageModel("llama-3.1-8b-instruct"),
			messages: [
				{
					role: 'user',
					content: `
- you will generate a short title based on the first message a user begins a conversation with
- ensure it is not more than 80 characters long
- the title should be a summary of the user's message
- do not use quotes or colons

Here is the original prompt:
${prompt}
							`
				}
			],
			maxTokens: 128,
			temperature: 0.7
		}).catch(() => null);

		if (!response || !response.text) {
			return Response.json({
				success: false,
				message: "Failed to generate title",
			}, { status: 500 });
		}

		const conversation = new Conversation({
			title: response.text.trim(),
			originalPrompt: prompt,
			userId: session.user.id,
			createdAt: new Date(),
			updatedAt: new Date()
		})

		const savedConversation = await conversation.save().catch(() => null);

		if (!savedConversation) return Response.json({
			success: false,
			message: "Failed to create conversation"
		}, { status: 500 });

		return Response.json({
			success: true,
			message: "OK",
			data: {
				id: savedConversation._id,
				title: response.text.trim(),
				prompt: prompt,
				redirect: `/chats/${conversation._id}`
			}
		});
	}, {
		forceAuth: true,
		headers: request.headers
	});
};