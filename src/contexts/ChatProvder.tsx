"use client";

import { ChatProviderMessage as Message, ChatProviderChatContext as ChatContextType } from '@/lib/definitions';
import { createContext, useMemo, useState, useEffect } from 'react';

export const ChatContext = createContext<ChatContextType>({
	messages: [],
	// @ts-ignore
	setMessages: () => { }
});

export const ChatProvider = ({ children, initialMessages }: {
	children: React.ReactNode;
	initialMessages?: Message[];
}) => {
	const [messages, setMessages] = useState<Message[]>(() => {
		// SSR uyumlu initial state - always use initialMessages
		return initialMessages || [];
	});
	const [isHydrated, setIsHydrated] = useState(false);

	// Client-side hydration kontrolü
	useEffect(() => {
		setIsHydrated(true);

		// Hydration sonrası initialMessages kontrolü
		if (initialMessages && initialMessages.length > 0) {
			setMessages(initialMessages);
		}
	}, [initialMessages]);

	const ChatValue = useMemo(() => ({
		messages,
		setMessages,
	}), [messages]);

	return (
		<ChatContext.Provider value={ChatValue as any}>
			{children}
		</ChatContext.Provider>
	);
};