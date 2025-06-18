"use client";

import { cn } from "@colidy/ui-utils";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { useId, useRef, useCallback, useMemo, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import { useSWRApi } from "@/hooks/use-swr-api";
import { useChat } from "@/hooks/use-chat";
import { useMessages } from "@/hooks/use-messages";
import { AttachmentItem, AttachmentUploader } from "./AttachmentUploader";
import { Toolbar } from "./Toolbar";
import TextareaAutosize from "react-textarea-autosize";
import { usePromptStore } from "@/stores/use-prompt";
import { useEnhanceStore } from "@/stores/use-enhance";
import { useAlertStore } from "@/stores/use-alert";
import { RotatingLines } from "../ui/Spinner";
import { useAttachmentsStore } from "@/stores/use-attachments";
import { Button } from "../ui/Button";
import { useAutoSubmit } from "@/stores/use-auto-submit";
import { useIsConversationCreating } from "@/stores/use-is-conversation-creating";

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
		refreshInterval: 60000
	});

	const id = useId();
	const t = useTranslations("PromptInput");

	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const inputContainerRef = useRef<HTMLDivElement>(null);
	const uploadRef = useRef<HTMLInputElement | null>(null);

	const prompt = usePromptStore((state) => state.prompt);
	const setPrompt = usePromptStore((state) => state.setPrompt);

	const isEnhancing = useEnhanceStore((state) => state.isEnhancing);
	const alert = useAlertStore((state) => state.alert);
	const attachments = useAttachmentsStore((state) => state.attachments);
	const removeAttachment = useAttachmentsStore((state) => state.removeAttachment);
	const autoSubmit = useAutoSubmit((state) => state.autoSubmit);
	const isCreatingConversation = useIsConversationCreating(state => state.isCreatingConversation);
	const [usageWarning, setUsageWarning] = useState<boolean>(false);
	const { messages: allMessages } = useMessages();

	const { handleSubmit } = useChat({
		isResponding,
		setIsResponding,
	});

	useMemo(() => {
		if (isLoading || error) return;
		const u = usages?.data;
		const promptEnhancmentRemaining = u?.promptEnhancement?.remaining || 0;
		const promptEnhancementLimit = u?.promptEnhancement?.limit || 0;

		const modelUsageRemaining = u?.models?.remaining || 0;
		const modelUsageLimit = u?.models?.limit || 0;

		const calculateRemainingPercentage = (remaining: number, limit: number) => {
			if (limit === 0) return 0;
			const p = Math.round((remaining / limit) * 100);
			return p;
		};

		const promptEnhancementPercentage = calculateRemainingPercentage(promptEnhancmentRemaining, promptEnhancementLimit);
		const modelUsagePercentage = calculateRemainingPercentage(modelUsageRemaining, modelUsageLimit);

		const WARNING_THRESHOLD = 20; // 20%

		if (promptEnhancementPercentage <= WARNING_THRESHOLD || modelUsagePercentage <= WARNING_THRESHOLD) {
			if (usageWarning) return;
			setUsageWarning(true);
		} else {
			if (!usageWarning) return;
			setUsageWarning(false);
		}
	}, [usages, t, setUsageWarning, usageWarning, isLoading, error]);

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setPrompt(e.target.value);
		},
		[setPrompt]
	);

	const labelClassName = useMemo(
		() =>
			cn([
				"relative flex flex-col items-center justify-center overflow-hidden",
				"w-full max-h-72 bg-input shadow-lg outline-none border rounded-2xl text-sm text-foreground resize-none",
				"transition-all ease-in-out duration-200 py-4",
				"hover:border-border-hover",
				"focus-within:!border-colored",
			], {
				"cursor-not-allowed opacity-50": isEnhancing,
			}),
		[isEnhancing]
	);

	const textareaClassName = useMemo(
		() =>
			cn([
				"w-full bg-transparent outline-none select-none px-4 resize-none",
				"scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border",
				"hover:scrollbar-thumb-border-hover disabled:opacity-50",
			]),
		[isEnhancing]
	);

	const textareaStyles = useMemo(
		() => ({
			scrollbarWidth: "thin" as const,
			scrollbarColor: "rgb(203 213 225) transparent",
		}),
		[]
	);

	const isWaiting = useMemo(() => {
		if (!allMessages || allMessages.length === 0) return false;
		const lastMessage = allMessages[allMessages.length - 1] as any;
		return lastMessage?.role === 'assistant' && lastMessage?.is_waiting;
	}, [allMessages]);

	const shouldShowSpinner = useMemo(() =>
		isResponding || isWaiting || isEnhancing || isCreatingConversation || autoSubmit,
		[isResponding, isWaiting, isEnhancing, isCreatingConversation, autoSubmit]
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

	const showTopBar = useMemo(() => {
		if ((alert && alert.length > 0) || usageWarning || attachments.length > 0) {
			return true;
		}
		return false;
	}, [attachments, alert, usageWarning]);

	return (
		<motion.div className={cn("relative w-full max-w-2xl bg-border border rounded-2xl", className)} ref={inputContainerRef} layout>

			<AnimatePresence>
				{showTopBar && (
					<motion.div
						className="bg-input-darker absolute bottom-full left-0 right-0 pb-7 -mb-6 rounded-t-2xl space-y-2"
						initial="initial"
						animate="animate"
						exit="exit"
						variants={{
							initial: { opacity: 0, maxHeight: 0 },
							animate: { opacity: 1, maxHeight: "100px" },
							exit: { opacity: 0, maxHeight: 0 },
						}}
					>
						<AnimatePresence mode="popLayout">
							{usageWarning && (
								<motion.div
									key={`usage-warning`}
									className="text-sm"
									initial={{ opacity: 0, y: 5, maxHeight: 0 }}
									animate={{ opacity: 1, y: 0, maxHeight: "100px" }}
									exit={{
										opacity: 0,
										y: 5,
										maxHeight: 0
									}}
									transition={{ duration: 0.3 }}
								>
									<div className="px-4 py-3 text-muted flex justify-between items-center">
										<p className="text-sm">
											{t("Usage_Warning")}
										</p>
										<Button href="/settings/usage" className="w-fit whitespace-nowrap">
											{t("Check_Usage")}
										</Button>
									</div>
								</motion.div>
							)}
							{typeof alert === "string" && (
								<motion.div
									key="alert"
									className="text-sm"
									initial={{ opacity: 0, y: 5, maxHeight: 0 }}
									animate={{ opacity: 1, y: 0, maxHeight: "100px" }}
									exit={{
										opacity: 0,
										y: 5,
										maxHeight: 0
									}}
									transition={{ duration: 0.3 }}
								>
									<div className="px-4 py-3 text-muted">
										<ReactMarkdown
											children={alert}
											remarkPlugins={[remarkMath, remarkGfm]}
											rehypePlugins={[rehypeKatex]}
										/>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
						{attachments && attachments.length > 0 && (
							<motion.div
								className="relative w-full"
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								transition={{ duration: 0.25, ease: "easeOut" }}
							>
								<motion.div
									className="flex items-center gap-2 px-4 py-3 select-none drag-none overflow-x-auto"
									style={textareaStyles}
									initial="initial"
									animate="animate"
									transition={{
										staggerChildren: 0.1,
										delayChildren: 0.1
									}}
								>
									<AnimatePresence mode="popLayout">
										{attachments?.map?.((attachment: any) => (
											<motion.div
												key={attachment.id}
												initial={{ opacity: 0, scale: 0.8, x: -20 }}
												animate={{ opacity: 1, scale: 1, x: 0 }}
												exit={{ opacity: 0, scale: 0.8, x: 20 }}
												transition={{
													duration: 0.2,
													ease: "easeOut",
													layout: { duration: 0.2 }
												}}
												layout
											>
												<AttachmentItem
													attachment={attachment}
													onRemove={() => removeAttachment(attachment.id)}
												/>
											</motion.div>
										))}
									</AnimatePresence>
								</motion.div>
							</motion.div>
						)}
					</motion.div>
				)}
			</AnimatePresence>

			<motion.label
				className={labelClassName}
				htmlFor={isEnhancing ? undefined : id}
			>
				<AnimatePresence>
					<AttachmentUploader uploadRef={uploadRef} />
				</AnimatePresence>
				{isEnhancing && (
					<div className="shimmer !absolute inset-0 z-10" />
				)}

				<TextareaAutosize
					ref={textareaRef}
					placeholder={t("Placeholder")}
					className={textareaClassName}
					id={id}
					minRows={1}
					maxRows={10}
					value={prompt}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					autoFocus
					style={textareaStyles}
					disabled={shouldShowSpinner}
				/>

				{shouldShowSpinner && (
					<div className="absolute inset-0 flex items-center justify-end pr-4">
						<RotatingLines
							color="currentColor"
							size={24}
						/>
					</div>
				)}
			</motion.label>

			<div className="p-2">
				<Toolbar
					{...{
						handleSubmit,
						isResponding,
						isCreatingConversation,
						setIsResponding,
						uploadRef,
						shouldShowSpinner,
					}}
				/>
			</div>
		</motion.div>
	);
}
