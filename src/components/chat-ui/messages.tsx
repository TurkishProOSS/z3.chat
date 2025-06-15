"use client";

import { useChat } from "@/hooks/use-chat";
import { useMessages } from "@/hooks/use-messages";
import { cn } from "@colidy/ui-utils";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";

export default function Messages({
	messages: initialMessages = [],
}) {
	const { messages } = useMessages(initialMessages || []);

	return (
		<div className="flex flex-col gap-4">
			{messages.map((message, index) => <MessageBox key={index} message={message} messageIndex={index} />)}
		</div>
	);
}

function MessageBox({ message, messageIndex }: {
	message: {
		_id?: string;
		agentId?: string;
		role: 'user' | 'assistant';
		content: string;
		chatId?: string;
		createdAt?: Date;
	},
	messageIndex: number;
}) {

	const messageId = message?._id || messageIndex;

	return (
		<div
			className={cn({
				"p-4 rounded-2xl rounded-tr-none w-fit ml-auto bg-secondary": message.role === 'user',
				"prose prose-md dark:prose-invert my-12 !max-w-none": message.role === 'assistant',
			})}
		>
			{message.role === 'assistant' && (
				<ReactMarkdown
					children={message.content}
					remarkPlugins={[remarkMath, remarkGfm]}
					rehypePlugins={[rehypeKatex]}
				/>
			)}

			{message.role === 'user' && (
				<p className="text-foreground">
					{message.content}
				</p>
			)}

			{message.role === 'assistant' && (
				<div className="text-xs text-muted-foreground mt-2">
					<button
						onClick={() => {
							alert(`Message ID: ${messageId}`);
						}}
					>
						Action
					</button>
				</div>
			)}
		</div>
	);
}