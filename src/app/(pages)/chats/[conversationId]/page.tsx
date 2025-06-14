'use client';

import PromptInput from "@/forms/PromptInput";
import { readStreamableValue } from 'ai/rsc';
import { useChat } from '@ai-sdk/react';
import { Logo } from '@/brand/Logo';
import { use, useEffect, useState } from 'react';
import axios from "axios";
import { set } from "mongoose";
import { useZ3 } from "@/hooks/use-z3";
import { api } from "@/server/client";
import ReactMarkdown from 'react-markdown';
import { cn } from "@colidy/ui-utils";
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm'
import { motion } from 'framer-motion';

async function* streamingFetch(input: RequestInfo | URL, init?: RequestInit, doneFunc?: () => void) {
	const response = await fetch(input, init)
	const reader = (response as any).body.getReader();
	const decoder = new TextDecoder('utf-8');

	for (; ;) {
		const { done, value } = await reader.read()
		if (done) {
			if (typeof doneFunc === 'function') doneFunc();
			break;
		}

		try {
			yield decoder.decode(value)
		} catch (e: any) {
			console.warn(e.message)
		}
	}
}

export default function Chat({ params }: {
	params: Promise<{ conversationId: string }>;
}) {
	const { conversationId } = use(params);
	const [msgs, setMsgs] = useState<{ type: 'generating' | 'ended', role: 'user' | 'assistant', msg: string }[]>([]);
	// const setPrompt = useZ3(state => state.setPrompt);
	const [showScrollToBottom, setShowScrollToBottom] = useState(false);

	// const sendMsg = async (prompt: string) => {
	// 	setMsgs(prev => [...prev, { type: 'ended', role: 'user', msg: prompt }]);
	// 	setPrompt("");
	// 	const it = streamingFetch('/api/chat?message=' + encodeURIComponent(prompt), undefined, () => {
	// 		setMsgs(prev => prev.map(msg => msg.type === 'generating' ? { ...msg, type: 'ended' } : msg));
	// 	});
	// 	for await (let value of it) {
	// 		try {
	// 			setMsgs(prev => {
	// 				const lastGenerating = prev.find(msg => msg.type === 'generating');
	// 				if (lastGenerating) {
	// 					return prev.map(msg => msg === lastGenerating ? { ...msg, msg: msg.msg + value } : msg);
	// 				}
	// 				return [...prev, { type: 'generating', role: 'assistant', msg: value }];
	// 			});
	// 		} catch (e: any) {
	// 			console.warn(e.message)
	// 		}
	// 	}

	// 	try {
	// 	} catch (e) {
	// 		console.log(e);
	// 	};
	// };

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const scrollContainer = document.querySelector('main') as HTMLElement;

		const handleScroll = () => {
			const scrollPosition = scrollContainer.scrollTop + scrollContainer.clientHeight;
			const scrollHeight = scrollContainer.scrollHeight;
			setShowScrollToBottom(scrollPosition < scrollHeight - 100);
		};


		handleScroll();
		scrollContainer.addEventListener('scroll', handleScroll);
		return () => {
			scrollContainer.removeEventListener('scroll', handleScroll);
		}
	}, []);

	const scrollToBottom = () => {
		if (typeof window === 'undefined') return;
		const scrollContainer = document.querySelector('main') as HTMLElement;
		scrollContainer.scrollTo({
			top: scrollContainer.scrollHeight,
			behavior: 'smooth'
		});
		setShowScrollToBottom(false);
	}


	return (
		<>
			{showScrollToBottom && (
				<motion.div
					className="fixed mx-auto w-fit bg-secondary text-foreground p-2 rounded-full cursor-pointer shadow-lg hover:bg-secondary/80 transition-colors"
					onClick={() => scrollToBottom()}
				>
					<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
					</svg>
				</motion.div>
			)}
			<div className="flex flex-col justify-between w-full max-w-2xl mx-auto">
				<div className="w-full flex flex-1 flex-col space-y-8 overflow-y-auto pb-32">
					{msgs.map((msg, i) => <ChatMessage key={i} role={msg.role} msg={msg.msg} type={msg.type} />)}
				</div>
				<div className="bg-primary flex justify-center absolute left-[70px] right-0 bottom-0 pb-4 max-w-2xl mx-auto rounded-t-2xl">
					<PromptInput
						conversationId={conversationId}
						onStream={(response: string) => {
							setMsgs(prev => {
								const lastGenerating = prev.find(msg => msg.type === 'generating');
								if (lastGenerating) {
									return prev.map(msg => msg === lastGenerating ? { ...msg, msg: msg.msg + response } : msg);
								}
								return [...prev, { type: 'generating', role: 'assistant', msg: response }];
							});
						}}
						onStreamEnd={() => {
							setMsgs(prev => prev.map(msg => msg.type === 'generating' ? { ...msg, type: 'ended' } : msg));
						}}
						onSubmit={(prompt) => {
							if (msgs.find(msg => msg.type === 'generating' && msg.role === 'assistant')) return;
							setMsgs(prev => [...prev, { type: 'ended', role: 'user', msg: prompt }]);
						}}
					/>
				</div>
			</div>
		</>
	);
};

function ChatMessage({ type, role, msg }: { type: 'generating' | 'ended', role: 'user' | 'assistant', msg: string }) {
	return (
		<div
			className={cn(
				"flex gap-2", {
				'flex-row-reverse': role === 'user',
				'flex-row': role === 'assistant',
			})}
		>
			<div
				className={cn("prose dark:prose-invert", {
					"ml-auto max-w-xl bg-secondary text-foreground rounded-br-none rounded-2xl p-4": role === 'user',
					"py-6": role === 'assistant'
				})}
			>
				{role === 'assistant' ? (
					<ReactMarkdown
						children={msg}
						remarkPlugins={[remarkMath, remarkGfm]}
						rehypePlugins={[rehypeKatex]}
					/>
				) : (
					msg
				)}
			</div>
		</div>
	);
}