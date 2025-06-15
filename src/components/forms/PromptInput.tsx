"use client";

import { cn } from "@colidy/ui-utils";
import { useTools } from "@/hooks/use-tools";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { ToolButton } from "@/forms/ToolButton";
import { useId, useState, useRef, useEffect } from "react";
import { useZ3 } from "@/hooks/use-z3";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm'

const getAnimationVariants = (groupIndex: number) => ({
	initial: { opacity: 0, x: (groupIndex === 0 ? -1 : 1) * 10 },
	animate: { opacity: 1, x: 0 },
	exit: { opacity: 0, x: (groupIndex === 0 ? -1 : 1) * 10 }
});

export default function PromptInput({
	className
}: {
	className?: string;
}) {
	const id = useId();
	const t = useTranslations("PromptInput");

	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const [focus, setFocus] = useState(false);
	const [_, setIsAtMaxHeight] = useState(false);

	const prompt = useZ3(state => state.prompt);
	const setPrompt = useZ3(state => state.setPrompt);
	const isEnhancing = useZ3(state => state.isEnhancing);
	const alert = useZ3(state => state.alert);


	const autoResize = () => {
		if (!textareaRef.current) return;
		const textarea = textareaRef.current;
		const maxHeight = 260;
		textarea.style.height = 'auto';
		const newHeight = Math.min(Math.max(textarea.scrollHeight, 60), maxHeight);
		textarea.style.height = `${newHeight}px`;
		const atMaxHeight = textarea.scrollHeight > maxHeight;
		setIsAtMaxHeight(atMaxHeight);
		if (atMaxHeight) textarea.style.overflowY = 'auto';
		else textarea.style.overflowY = 'hidden';
	};

	useEffect(() => {
		autoResize();
	}, [prompt]);

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setPrompt(e.target.value);
		autoResize();
	};

	// useEffect(() => {
	// 	if (conversationId && searchParams.get('autoStart') === 'true') {
	// 		handleSubmit();
	// 	}
	// }, [conversationId, searchParams]);


	// const handleSubmit = async () => {
	// 	if (isEnhancing || !prompt.trim()) return;

	// 	if (conversationId) {
	// 		const promptReceived = prompt.trim();
	// 		// if (searchParams.get('autoStart') === 'true') {
	// 		// 	searchParams.delete('autoStart');
	// 		// }
	// 		setPrompt("");
	// 		const { data } = await api.chat({ conversationId }).post({
	// 			message: prompt,
	// 			model: selectedAgent?.id || ""
	// 		});

	// 		if (!data) {
	// 			setAlert("No data returned from chat API");
	// 			setPrompt(promptReceived);
	// 			return;
	// 		}

	// 		onSubmit?.(promptReceived);

	// 		for await (const chunk of data as AsyncIterable<string | null>) {
	// 			if (typeof chunk !== 'string') {
	// 				setAlert("Received non-string chunk from chat API");
	// 				setPrompt(promptReceived);
	// 				return;
	// 			}
	// 			if (chunk === "[DONE]") {
	// 				onStreamEnd?.();
	// 				return;
	// 			}

	// 			onStream?.(chunk);
	// 		}
	// 	} else {
	// 		const { data } = await api.createConversation.post({
	// 			prompt
	// 		});

	// 		if (!data) {
	// 			setAlert("No data returned from create conversation API");
	// 			return;
	// 		}

	// 		if (!data.success) {
	// 			setAlert(data.message || "An error occurred while creating the conversation.");
	// 			return;
	// 		}

	// 		if (data.alert) {
	// 			setAlert(data.alert.message);
	// 			if (data.alert.duration) {
	// 				setAlertDuration(data.alert.duration);
	// 			}
	// 		}

	// 		if (data.data.redirect) {
	// 			redirect(data.data.redirect + '?autoStart=true');
	// 		}
	// 	}
	// }

	const tools = useTools();

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
				className={cn([
					"relative flex flex-col items-center justify-center overflow-hidden",
					"w-full max-h-72 bg-input shadow-lg outline-none border rounded-2xl text-sm text-foreground resize-none",
					"transition-shadow ease-in-out pt-2"
				], {
					"cursor-not-allowed opacity-50": isEnhancing,
					"ring-2 ring-orange-500 ring-offset-2 ring-offset-secondary bg-input": focus,
					"hover:border-border-hover": !focus
				})}
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: 20 }}
				htmlFor={isEnhancing ? undefined : id}
			>
				{isEnhancing && <div className="shimmer !absolute inset-0 z-10" />}
				<textarea
					ref={textareaRef}
					placeholder={t("Placeholder")}
					disabled={isEnhancing}
					className={cn([
						"w-full bg-transparent outline-none select-none px-4 pb-4 pt-2 resize-none",
						// Custom scrollbar styles
						"scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border",
						"hover:scrollbar-thumb-border-hover"
					], {
						"cursor-not-allowed opacity-50": isEnhancing
					})}
					id={id}
					rows={1}
					value={prompt}
					onChange={handleChange}
					autoFocus
					onFocus={() => setFocus(true)}
					onBlur={() => setFocus(false)}
					style={{
						// Custom scrollbar for browsers that don't support scrollbar-* classes
						scrollbarWidth: 'thin',
						scrollbarColor: 'rgb(203 213 225) transparent'
					}}
				/>
				<div
					className={cn("flex w-full justify-between text-xs text-muted-foreground select-none p-2", {
						"opacity-50": isEnhancing
					})}
				>
					{tools.map((toolGroup, groupIndex) => (
						<motion.div
							key={groupIndex}
							className="flex items-center gap-2"
						>
							<AnimatePresence>
								{toolGroup
									.map((tool, index) => (
										<motion.div
											key={`${groupIndex}-${index}`}
											variants={getAnimationVariants(groupIndex)}
											initial="initial"
											animate="animate"
											exit="exit"
											transition={{ duration: 0.2, delay: index * 0.1 }}
											className="flex items-center"
										>
											<ToolButton
												key={index}
												tool={tool}
											/>
										</motion.div>
									))}
							</AnimatePresence>
						</motion.div>
					))}
				</div>
			</motion.label>
		</div>
	)
}