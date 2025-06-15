import { ChatContext } from "@/contexts/ChatProvder";
import { useParams } from "next/navigation";
import { useContext } from "react";

export const useMessages = (initialMessages?: any[]) => {
	const { messages, setMessages } = useContext(ChatContext);
	const params = useParams();

	const streamMesage = (message: string) => {
		setMessages(prev => {
			const updatedMessages = [...prev];
			const lastMessage = updatedMessages.at(-1);
			if (lastMessage && lastMessage.role === "assistant") {
				updatedMessages[updatedMessages.length - 1] = {
					...lastMessage,
					content: lastMessage.content + message
				};
			} else {
				updatedMessages.push({
					role: "assistant",
					content: message
				});
			}
			return updatedMessages;
		});
	};

	const addUserMessage = (content: string) => {
		const conversationId = params?.conversationId as string;

		setMessages(prev => prev.concat({
			role: 'user',
			content,
			chatId: conversationId,
			createdAt: new Date()
		}));
	};

	return {
		messages: (initialMessages || []).concat(messages || []).filter(m => m.content && m.content.trim() !== ""),
		setMessages,
		streamMesage,
		addUserMessage
	};
}