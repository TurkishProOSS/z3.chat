"use client";

import { cn } from "@colidy/ui-utils";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { useId, useRef, useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import { useSWRApi } from "@/hooks/use-swr-api";
import { useChat } from "@/hooks/use-chat";
import { useMessages } from "@/hooks/use-messages";
import { AttachmentUploader } from "./AttachmentUploader";
import { Toolbar } from "./Toolbar";
import TextareaAutosize from "react-textarea-autosize";
import { usePromptStore } from "@/stores/use-prompt";
import { useEnhanceStore } from "@/stores/use-enhance";
import { useAlertStore } from "@/stores/use-alert";

const getAnimationVariants = (groupIndex: number) => ({
	initial: { opacity: 0, x: (groupIndex === 0 ? -1 : 1) * 10 },
	animate: { opacity: 1, x: 0 },
	exit: { opacity: 0, x: (groupIndex === 0 ? -1 : 1) * 10 },
});

export default function PromptInput({
	className,
	isResponding = false,
	setIsResponding = (value: boolean) => { },
}: {
	className?: string;
	isResponding?: boolean;
	setIsResponding?: (value: boolean) => void;
}) {
	const {
		data: usages,
		isLoading,
		error,
		mutate,
	} = useSWRApi("/usages", {}, {
		revalidateOnFocus: false,
		revalidateOnReconnect: false,
		refreshInterval: 30000,
		dedupingInterval: 5000,
	});

	const id = useId();
	const t = useTranslations("PromptInput");

	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const uploadRef = useRef<HTMLInputElement | null>(null);

	const prompt = usePromptStore((state) => state.prompt);
	const setPrompt = usePromptStore((state) => state.setPrompt);

	const isEnhancing = useEnhanceStore((state) => state.isEnhancing);
	const alert = useAlertStore((state) => state.alert);

	const { handleSubmit, isCreatingConversation } = useChat({
		isResponding,
		setIsResponding,
	});

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setPrompt(e.target.value);
		},
		[setPrompt]
	);

	const { messages: allMessages } = useMessages();

	const labelClassName = useMemo(
		() =>
			cn([
				"relative flex flex-col items-center justify-center overflow-hidden",
				"w-full max-h-72 bg-input shadow-lg outline-none border rounded-2xl text-sm text-foreground resize-none",
				"transition-all ease-in-out duration-200 pt-2",
				"focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2 focus-within:ring-offset-secondary focus-within:bg-input",
				"hover:border-border-hover focus-within:hover:border-orange-500",
			], {
				"cursor-not-allowed opacity-50": isEnhancing,
			}),
		[isEnhancing]
	);

	const textareaClassName = useMemo(
		() =>
			cn([
				"w-full bg-transparent outline-none select-none px-4 pb-4 pt-2 resize-none",
				"scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border",
				"hover:scrollbar-thumb-border-hover",
			], {
				"cursor-not-allowed opacity-50": isEnhancing,
			}),
		[isEnhancing]
	);

	const textareaStyles = useMemo(
		() => ({
			scrollbarWidth: "thin" as const,
			scrollbarColor: "rgb(203 213 225) transparent",
		}),
		[]
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if (e.key === "Enter") {
				if (e.shiftKey) {
					return;
				} else {
					e.preventDefault();
					if (!isEnhancing && prompt.trim()) {
						handleSubmit();
					}
				}
			}
		},
		[isEnhancing, prompt, handleSubmit]
	);
	return (
		<div className={cn("relative w-full max-w-2xl", className)}>
			<AnimatePresence>
				{alert && (
					<motion.div
						className="absolute bottom-full mb-6 left-0 w-full px-6 py-4 bg-orange-500 text-white rounded-full shadow-lg z-50 text-sm"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 20 }}
					>
						<ReactMarkdown
							children={alert}
							remarkPlugins={[remarkMath, remarkGfm]}
							rehypePlugins={[rehypeKatex]}
						/>
					</motion.div>
				)}
			</AnimatePresence>

			<motion.label
				className={labelClassName}
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: 20 }}
				htmlFor={isEnhancing ? undefined : id}
			>
				<AnimatePresence>
					<AttachmentUploader uploadRef={uploadRef} />
				</AnimatePresence>

				{isEnhancing && <div className="shimmer !absolute inset-0 z-10" />}

				<TextareaAutosize
					ref={textareaRef}
					placeholder={t("Placeholder")}
					disabled={isEnhancing}
					className={textareaClassName}
					id={id}
					minRows={1}
					maxRows={10}
					value={prompt}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					autoFocus
					style={textareaStyles}
				/>

				<Toolbar
					{...{
						handleSubmit,
						isResponding,
						isCreatingConversation,
						setIsResponding,
						uploadRef,
					}}
				/>
			</motion.label>
		</div>
	);
}
