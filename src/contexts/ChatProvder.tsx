"use client";
import { MessageDocument } from '@/database/models/Messages';
import { usePathname } from 'next/navigation';
import { createContext, Dispatch, SetStateAction, useMemo, useState } from 'react';

type Message = {
	_id?: string;
	agentId?: string;
	role: 'user' | 'assistant';
	content: string;
	chatId?: string;
	createdAt?: Date;
};

type ChatContextType = {
	messages: Message[];
	setMessages: Dispatch<SetStateAction<Message[]>>;
};

export const ChatContext = createContext<ChatContextType>({
	messages: [],
	setMessages: () => { },
});

export const ChatProvider = ({ children, }: {
	children: React.ReactNode;
}) => {
	const [messages, setMessages] = useState<Message[]>([]);
	const pathname = usePathname();

	const ChatValue = useMemo(() => ({
		messages,
		setMessages,
	}), [messages, setMessages]);

	useMemo(() => {
		setMessages([]);
	}, [pathname]);

	return (
		<ChatContext.Provider
			value={ChatValue}
		>
			{children}
		</ChatContext.Provider>
	)
};