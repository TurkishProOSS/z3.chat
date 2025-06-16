"use client";

import { ArrowDown01Icon, BrainIcon, GitBranchIcon, Globe02Icon, GlobeIcon, ThumbsDownIcon, ThumbsUpIcon } from "hugeicons-react";
import { useClientFunctions } from "@/hooks/use-client-functions";
import { RiErrorWarningFill, RiFileLine } from "@remixicon/react";
import { redirect, useParams } from "next/navigation";
import { useMessages } from "@/hooks/use-messages";
import { useId, useMemo, useState, useContext } from "react";
import { DocumentViewer } from "react-documents";
import { useMounted } from "@/hooks/use-mounted";
import { AgentModel } from "@/lib/definitions";
import { RotatingLines } from "../ui/Spinner";
import { AnimatedLogo } from "../brand/Logo";
import ReactMarkdown from "react-markdown";
import { cn } from "@colidy/ui-utils";
import rehypeKatex from "rehype-katex";
import { Z3Context } from "@/contexts/Z3Provider";
import { motion } from "framer-motion";
import { Tooltip } from "../ui/Tooltip";
import { Accordion } from "radix-ui";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import { api } from "@/lib/api";
import { UIMessage } from "ai";
import { toast } from "sonner";

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Link from "next/link";

type AdditionalParts = {
	_id?: string;
	agentId?: string;
	content: string;
	vote?: 'up' | 'down' | 'neutral';
	streaming?: boolean;
	is_waiting?: boolean;
	experimental_attachments?: {
		name: string;
		url: string;
		contentType: string;
	}[];
};

export default function Messages({ isShared }: { isShared: boolean }) {
	const { messages } = useMessages();

	return (
		<div className="flex flex-col gap-4">
			{messages.map((message: any, index: number) =>
				<MessageBox
					key={index}
					message={message}
					messageIndex={index}
					isShared={isShared}
				/>
			)}
		</div>
	);
}

function MessageBox({ message, messageIndex, isShared }: {
	message: UIMessage & AdditionalParts;
	messageIndex: number;
	isShared: boolean;
}) {
	return (
		<motion.div
			initial={{ opacity: 0, x: message.role === 'user' ? 10 : -10 }}
			whileInView={{ opacity: 1, x: 0 }}
		>
			{message.role === 'assistant' && (
				<AssistantMessage
					message={message}
					messageIndex={messageIndex}
					isShared={isShared}
				/>
			)}

			{message.role === 'user' && (
				<UserMessage parts={message.parts} attachments={message.experimental_attachments} />
			)}

			{message.role === 'system' && (
				message.parts.map((part, index) => (
					// @ts-ignore
					part.type === 'line-message' && <LineMessage content={part.text} key={index} />
				))
			)}
		</motion.div>
	);
}

function AssistantMessage({
	message,
	messageIndex,
	isShared
}: {
	message: UIMessage & AdditionalParts;
	messageIndex?: number;
	isShared: boolean;
}) {
	const id = useId();
	const z3Context = useContext(Z3Context);
	const agents = z3Context?.agents || [];
	const messageAgent = agents.flatMap(agent => agent.models).find(model => model.id === message.agentId) || null;
	const messageId = message?._id || (messageIndex || undefined);
	const isStreaming = message.streaming || isShared;
	const isLoading = message.is_waiting;

	return (
		<motion.div className={cn("mt-6 prose prose-md dark:prose-invert my-12 !max-w-none")}>
			{isLoading && (
				<div className="bg-border grayscale-100 w-fit rounded-full animate-mid-spin">
					<AnimatedLogo loop size={48} />
				</div>
			)}

			{message.parts.map((part, partIndex) => {
				if (part.type === 'reasoning') {
					return (
						<ReasoningMessage
							key={id + partIndex}
							content={part.reasoning}
							nextElement={message.parts[partIndex + 1]}
						/>
					);
				}

				if (part.type === 'text') {
					return (
						<ReactMarkdown
							key={id + partIndex}
							children={part.text}
							remarkPlugins={[remarkMath, remarkGfm]}
							rehypePlugins={[rehypeKatex]}
							components={{
								code({ node, className, children, inline, ...props }: any) {
									if (typeof inline === 'undefined') inline = false;
									const match = /language-(\w+)/.exec(className || '');

									return !inline && match ? (
										<div className="relative dark !bg-secondary !rounded-xl border w-full">
											<div className="border-b border-accent px-3 py-0.5 font-sans">
												<span className="text-sm text-muted">
													<code>{match[1]}</code>
												</span>
											</div>
											<SyntaxHighlighter
												style={dracula as any}
												language={match[1]}
												PreTag="div"
												{...(props as any)}
												className="!bg-transparent !py-2 !px-4 !w-full"
												wrapLines
											>
												{String(children).replace(/\n$/, '')}
											</SyntaxHighlighter>
										</div>
									) : (
										<code className={className} {...props}>
											{children}
										</code>
									);
								},
								pre: ({ children }) => (
									<pre className="not-prose">{children}</pre>
								),
							}}
						/>
					);
				}

				if (part.type === 'tool-invocation') {
					return (
						<div key={id + partIndex} className="flex items-center justify-center my-4">
							<ToolInvocation
								toolName={part.toolInvocation.toolName}
								args={part.toolInvocation.args}
								data={(part.toolInvocation as any)[part.toolInvocation.state] as any}
								nextElement={message.parts[partIndex + 1] as any}
							/>
						</div>
					);
				}

				// @ts-ignore
				if (part.type === 'error') {
					return (
						// @ts-ignore
						<ErrorMessage error={part.content} />
					);
				}

				return null;
			})}

			{!isStreaming && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
				<AssistantActions
					messageId={messageId}
					messageIndex={messageIndex}

					actionKey={messageId}
					actionBy={message?._id ? 'object_id' : 'index'}

					messageAgent={messageAgent}
					vote={message.vote}
				/>
			</motion.div>}
		</motion.div>
	);
}

function ReasoningMessage({ content, nextElement }: { content: string, nextElement?: UIMessage['parts'][number] }) {
	const isReasoningEnd = useMemo(() => {
		if (!nextElement) return false;
		const nextElementValue = (nextElement as any)?.[nextElement.type];
		if (typeof nextElementValue === 'string') return nextElementValue.trim().length > 0;
		return false;
	}, [nextElement]);


	return (
		<Accordion.Root
			type="single"
			collapsible
			className="w-full"
			value={isReasoningEnd ? undefined : "reasoning"}
		>
			<Accordion.Item value="reasoning">
				<Accordion.Header>
					<Accordion.Trigger className="text-muted text-sm flex items-center font-medium group hover:bg-secondary px-2 py-1 -ml-2 rounded-xl cursor-pointer">
						<BrainIcon className="w-4 h-4" />
						<span className="ml-2">Reasoning</span>
						<ArrowDown01Icon className="w-4 h-4 ml-auto transition-transform duration-200 ease-in-out group-[data-state=open]:rotate-180" />
					</Accordion.Trigger>
				</Accordion.Header>
				<Accordion.Content className={cn("!m-0", [
					"overflow-hidden text-sm transition-all duration-200 ease-in-out",
					"data-[state=open]:animate-accordion-down",
					"data-[state=closed]:animate-accordion-up",
				])}>
					<div className="border-l pl-6">
						<ReactMarkdown
							children={content}
							remarkPlugins={[remarkMath, remarkGfm]}
							rehypePlugins={[rehypeKatex]}
						/>
					</div>
				</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>
	);
}

function AssistantActions({ messageId, messageIndex, actionKey, actionBy, messageAgent, vote }: {
	messageId?: string | number;
	messageIndex?: number;
	actionKey?: string | number;
	actionBy?: 'object_id' | 'index';
	messageAgent: AgentModel | null;
	vote?: 'up' | 'down' | 'neutral';
}) {
	const { conversationId }: { conversationId: string } = useParams();
	const {
		fork: {
			handleFork,
			isForking
		},
		vote: {
			handleVote,
			isVoting
		}
	} = useClientFunctions();

	const button = cn("w-8 h-8 rounded-lg flex justify-center items-center cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed", [
		"data-[state=pressed]:bg-secondary data-[state=pressed]:text-foreground",
		"data-[state=not-pressed]:text-foreground data-[state=not-pressed]:bg-secondary data-[state=not-pressed]:hover:bg-accent data-[state=not-pressed]:hover:text-foreground",
	]);

	const showUpVoteButton = vote !== 'down';
	const showDownVoteButton = vote !== 'up';


	return (
		<div className="flex items-center justify-start gap-2 mt-2">
			{conversationId && (
				<>
					<Tooltip content="Fork this conversation from this message">
						<button
							className={button}
							onClick={() => handleFork(conversationId, messageId as string, actionBy)}
							data-state="not-pressed"
							disabled={isForking}
						>
							{isForking ? (
								<RotatingLines size={16} color="currentColor" />
							) : (
								<GitBranchIcon className="w-4 h-4" />
							)}
						</button>
					</Tooltip>
					{showUpVoteButton && (
						<Tooltip content="Upvote this message">
							<button
								className={button}
								onClick={() => handleVote(conversationId, messageId as string, 'up', messageIndex as number, actionBy as 'object_id' | 'index')}
								data-state={vote === 'up' ? 'pressed' : 'not-pressed'}
								disabled={isVoting !== null}
							>
								{isVoting === 'up' ? (
									<RotatingLines size={16} color="currentColor" />
								) : (
									<ThumbsUpIcon className="w-4 h-4" fill={vote === 'up' ? 'currentColor' : 'none'} />
								)}
							</button>
						</Tooltip>
					)}
					{showDownVoteButton && (
						<Tooltip content="Downvote this message">
							<button
								className={button}
								onClick={() => handleVote(conversationId, messageId as string, 'down', messageIndex as number, actionBy as 'object_id' | 'index')}
								data-state={vote === 'down' ? 'pressed' : 'not-pressed'}
								disabled={isVoting !== null}
							>
								{isVoting === 'down' ? (
									<RotatingLines size={16} color="currentColor" />
								) : (
									<ThumbsDownIcon className="w-4 h-4" fill={vote === 'down' ? 'currentColor' : 'none'} />
								)}
							</button>
						</Tooltip>
					)}
				</>
			)}
			{messageAgent && (
				<span className="text-xs text-muted">
					{messageAgent.name}
				</span>
			)}
		</div>
	);
};

function UserMessage({ parts, attachments }: {
	parts: UIMessage['parts'];
	attachments: AdditionalParts['experimental_attachments'];
}) {
	return (
		<div className="ml-auto flex flex-col gap-2">
			{attachments && (
				<FileMessage attachments={attachments} />
			)}
			<div className="p-4 rounded-2xl rounded-br-none w-fit ml-auto bg-secondary border">
				{parts.map((part, index) => (
					part.type === 'text' && <p key={part.text + index} className="text-foreground">{part.text}</p>
				))}
			</div>
		</div>
	);
}

function LineMessage({ content }: {
	content: string;
}) {
	return (
		<div className="flex items-center justify-center my-4">
			<hr className="flex-1 border-t border-border" />
			<span className="px-4 text-muted text-sm">{content}</span>
			<hr className="flex-1 border-t border-border" />
		</div>
	);
}

function ErrorMessage({ error }: { error: string }) {
	return (
		<div className="px-6 rounded-2xl bg-red-400/10 text-red-400 py-2 flex items-center justify-start gap-2">
			<RiErrorWarningFill className="inline-block w-4 h-4" />
			<span className="text-sm">
				{error}
			</span>
		</div>
	);
}

function FileMessage({ attachments }: { attachments: AdditionalParts['experimental_attachments'] }) {
	if (!attachments) return null;
	const isMounted = useMounted();

	const isImage = (type: string) => {
		return type.startsWith('image/');
	}

	const isPDF = (type: string) => {
		return type.startsWith('application/pdf');
	}

	// İmaj ve diğer dosyaları ayır
	const images = attachments.filter(attachment => isImage(attachment.contentType));
	const nonImages = attachments.filter(attachment => !isImage(attachment.contentType));

	return (
		<div className="flex flex-col items-end gap-4">
			{/* İmajları grid düzeninde göster */}
			{images.length > 0 && isMounted && (
				<div className={cn(
					"grid gap-2 w-fit ml-auto",
					{
						"grid-cols-1": images.length === 1,
						"grid-cols-2": images.length === 2 || images.length === 3 || images.length >= 4
					}
				)}>
					{images.map((attachment, index) => (
						<div
							key={index}
							className={cn(
								"overflow-hidden rounded-lg bg-muted/10 backdrop-blur-sm",
								{
									"col-span-2": images.length === 3 && index === 0,
									"max-h-96": images.length === 1,
									"max-h-40": images.length >= 2
								}
							)}
						>
							{attachment.url && attachment.url.trim() && attachment.url.trim().length > 0 ? (
								<img
									src={attachment.url}
									alt={attachment.name || 'Image'}
									className={cn(
										"object-cover w-full h-full"
									)}
									onError={(e) => {
										// Hatalı image'leri gizle
										(e.target as HTMLElement).style.display = 'none';
									}}
								/>
							) : (
								<div className="flex items-center justify-center min-h-24 text-muted-foreground">
									<RiFileLine className="w-8 h-8" />
								</div>
							)}
						</div>
					))}
				</div>
			)}

			{/* Diğer dosyaları (PDF vs.) ayrı olarak göster */}
			{nonImages.map((attachment, index) => isMounted && (
				<div key={`non-image-${index}`}>
					{isPDF(attachment.contentType) ? (
						attachment.url && attachment.url.trim() && attachment.url.trim().length > 0 ? (
							<embed
								src={`https://drive.google.com/viewerng/viewer?url=${attachment.url}&hl=en&pid=explorer&efh=false&a=v&chrome=false&embedded=true`}
								className="w-[20rem] aspect-[1/1.414] rounded-xl"
							/>
						) : (
							<div className="flex items-center justify-center min-h-24 text-muted-foreground">
								<RiFileLine className="w-8 h-8" />
							</div>
						)
					) : (
						<div className="flex items-center gap-2 p-3 bg-muted/10 rounded-lg">
							<RiFileLine className="w-4 h-4" />
							<span className="text-sm">{attachment.name}</span>
						</div>
					)}
				</div>
			))}
		</div>
	);
}

function ToolInvocation({ toolName, args, data, nextElement }: {
	toolName: string;
	args: Record<string, any>;
	data: Record<string, any>;
	nextElement?: React.ReactNode;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const isMounted = useMounted();

	const handleToggle = () => {
		if (!isMounted) return;
		setIsOpen(!isOpen);
	};


	return (

		<Accordion.Root
			type="single"
			collapsible
			className="w-full"
			value={nextElement ? undefined : "query"}
		>
			<Accordion.Item value="query">
				<Accordion.Header>
					<Accordion.Trigger className="text-muted text-sm flex items-center font-medium group hover:bg-secondary px-2 py-1 -ml-2 rounded-xl cursor-pointer">
						<Globe02Icon className="w-4 h-4" />
						<span className="ml-2">
							{toolName}<span className="text-muted mx-2">&bull;</span>{
								// @ts-ignore
								data ? (Array.isArray(data) ? `${data.length} results` : 'Result') : 'No data'
							}
						</span>
						<ArrowDown01Icon className="w-4 h-4 ml-auto transition-transform duration-200 ease-in-out group-[data-state=open]:rotate-180" />
					</Accordion.Trigger>
				</Accordion.Header>
				<Accordion.Content className={cn("!m-0", [
					"overflow-hidden text-sm transition-all duration-200 ease-in-out",
					"data-[state=open]:animate-accordion-down",
					"data-[state=closed]:animate-accordion-up",
				])}>
					<div className="border-l pl-6">
						{Object.keys(args).length > 0 && (
							<div className="mb-4">
								<h3 className="text-sm font-medium mb-2">Arguments:</h3>
								<ul className="list-disc pl-6">
									{Object.entries(args).map(([key, value]) => (
										<li key={key} className="text-muted text-sm">
											<strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : value.toString()}
										</li>
									))}
								</ul>
							</div>
						)}

						<div className="space-y-4">
							{data && Object.keys(data).length > 0 && (
								toolName === 'webSearch' ? (
									data.map((result: any, index: number) => (
										<WebSearchResult
											key={index}
											result={result}
										/>
									))
								) : (
									<div className="mb-4">
										<h3 className="text-sm font-medium mb-2">Data:</h3>
										<pre className="bg-muted/10 p-2 rounded-lg">
											<code className="text-sm">{JSON.stringify(data, null, 2)}</code>
										</pre>
									</div>
								)
							)}
						</div>
					</div>
				</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>
	);
}

function WebSearchResult({ result }: {
	result: {
		title: string;
		content: string;
		url: string;
		publishedDate?: string;
		favicon?: string;
		image?: string;
	};
}) {
	const [imageError, setImageError] = useState(false);
	return (
		<div className="rounded-lg bg-secondary border not-prose p-4">
			<div className="flex items-center gap-4">
				<img src={!imageError ? (result.favicon || '/favicon.ico') : '/favicon.ico'} alt="Favicon" className="w-6 h-6 rounded-full" onError={() => setImageError(true)} />
				<div className="flex-1">
					<Link className="text-sm font-medium text-colored hover:underline line-clamp-1" href={result.url} target="_blank" rel="noopener noreferrer">
						{result.title}
					</Link>
				</div>
			</div>
			<p className="text-sm text-muted-foreground mt-2 line-clamp-2">
				<ReactMarkdown
					children={result.content}
					remarkPlugins={[remarkMath, remarkGfm]}
					rehypePlugins={[rehypeKatex]}
				/>
			</p>

		</div>
	);
}