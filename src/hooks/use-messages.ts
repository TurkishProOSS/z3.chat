import { ChatContext } from "@/contexts/ChatProvder";
import { ChatProviderChatContext } from "@/lib/definitions";
import { JSONValue } from "ai";
import { useParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { IS_REACT_LEGACY } from "swr/_internal";
import { useAttachmentsStore } from "@/stores/use-attachments";

export const useMessages = () => {
	const { messages, setMessages } = useContext(ChatContext);
	const params = useParams();
	const attachments = useAttachmentsStore((state) => state.attachments);

	const parseType = (type: string) => {
		return type.split('-').map((part, index) => {
			if (index === 0) {
				return part;
			}
			return part.charAt(0).toUpperCase() + part.slice(1);
		}).join('');
	}

	const streamMessage = (part: {
		type: string;
		value: string;
	}, data: Record<string, any>) => {
		// @ts-ignore
		setMessages(prev => {
			const updatedMessages = [...prev];
			const lastMessage = updatedMessages.at(-1);
			if (lastMessage && lastMessage.role === "assistant") {
				// Eğer waiting state'inde ise parts'ı temizle
				if (lastMessage.is_waiting) {
					lastMessage.parts = [];
				}

				// Mevcut part'ı bul
				const existingPartIndex = lastMessage.parts.findIndex((p: any) => p.type === part.type);

				if (existingPartIndex >= 0) {
					// Mevcut part'ı güncelle - value'yu birleştir
					const existingPart = lastMessage.parts[existingPartIndex];
					lastMessage.parts[existingPartIndex] = {
						...existingPart,
						[parseType(part.type)]: (existingPart[part.type === 'error' ? 'content' : part.type] || '') + part.value
					};
				} else {
					// Yeni part ekle
					lastMessage.parts.push({
						type: part.type,
						[parseType(part.type === 'error' ? 'content' : part.type)]: part.value,
					});
				}

				updatedMessages[updatedMessages.length - 1] = {
					...lastMessage,
					streaming: true,
					is_waiting: false,
					...data
				};
			}

			return updatedMessages;
		});
	};

	const setToolResult = (callId: string, toolResult: JSONValue) => {
		/*!SECTION
		
					{
						"toolInvocation": {
							"args": {
								"query": "Enes Batur"
							},
							"result": [
							],
							"state": "result",
							"step": 0,
							"toolCallId": "call_eeceDPukSiSsVOVy3IaR9g",
							"toolName": "webSearch"
						},
						"type": "tool-invocation"
					},*/
		// @ts-ignore
		setMessages(prev => {
			const updatedMessages = [...prev];
			const lastMessage = updatedMessages.at(-1);
			if (!lastMessage || lastMessage.role !== "assistant" || !lastMessage.streaming) {
				console.warn("No valid last message found for tool result update.");
				return updatedMessages;
			}

			// Mevcut part'ı bul
			const existingPartIndex = lastMessage.parts.findIndex((p: any) => p.type === 'tool-invocation' && p.toolInvocation.toolCallId === callId);
			console.log("Existing part index:", existingPartIndex, "for callId:", callId);
			if (existingPartIndex >= 0) {
				// Mevcut part'ı güncelle
				const existingPart = lastMessage.parts[existingPartIndex];
				console.log("Existing part found:", existingPart);
				lastMessage.parts[existingPartIndex] = {
					...existingPart,
					toolInvocation: {
						...existingPart.toolInvocation,
						result: toolResult,
						state: 'result'
					}
				};
			} else {
			}
			return updatedMessages;
		});
	}

	const addUserMessage = (content: string) => {
		const conversationId = params?.conversationId as string;

		// @ts-ignore
		setMessages(prev => prev.concat([
			{
				role: 'user',
				parts: [
					{
						type: 'text',
						text: content
					}
				],
				chatId: conversationId,
				experimental_attachments: attachments.map((attachment: any) => ({
					name: attachment.name,
					url: attachment.preview,
					contentType: attachment.type
				})),
				createdAt: new Date()
			},
			{
				role: 'assistant',
				parts: [
					{
						type: 'text',
						text: "Hmm..."
					}
				],
				chatId: conversationId,
				streaming: true,
				is_waiting: true
			}
		]));
	};

	const handleVoteFunction = async (messageIndex: number, direction: 'up' | 'down') => {
		// @ts-ignore
		setMessages(prev => {
			const updatedMessages = [...prev];
			const message = updatedMessages[messageIndex];
			if (message) {
				updatedMessages[messageIndex] = {
					...message,
					vote: direction
				};
			}

			return updatedMessages;
		});
	};

	const endStreaming = () => {
		// @ts-ignore
		setMessages(prev => {
			const updatedMessages = [...prev];
			const lastMessage = updatedMessages.at(-1);
			if (lastMessage && lastMessage.role === "assistant" && lastMessage.streaming) {
				updatedMessages[updatedMessages.length - 1] = {
					...lastMessage,
					streaming: false,
					resume: false // Mark as not resumable
				};
			}
			return updatedMessages;
		});
	}

	const continueStreaming = () => {
		// @ts-ignore
		setMessages(prev => {
			const updatedMessages = [...prev];
			const lastMessage = updatedMessages.at(-1);
			if (lastMessage && lastMessage.role === "assistant" && !lastMessage.streaming) {
				updatedMessages[updatedMessages.length - 1] = {
					...lastMessage,
					streaming: true,
					resume: true // Mark as resumable
				};
			}
			return updatedMessages;
		});
	};

	return {
		messages: messages as ChatProviderChatContext["messages"],
		setMessages,
		streamMessage,
		addUserMessage,
		handleVoteFunction,
		endStreaming,
		continueStreaming,
		setToolResult
	};
}