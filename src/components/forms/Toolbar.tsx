"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ToolButton } from "@/forms/ToolButton";
import { RotatingLines } from "../ui/Spinner";
import { useTools } from "@/hooks/use-tools";
import { useMessages } from "@/hooks/use-messages";
import { useEnhanceStore } from "@/stores/use-enhance";

const getAnimationVariants = (groupIndex: number) => ({
	initial: { opacity: 0, x: (groupIndex === 0 ? -1 : 1) * 10 },
	animate: { opacity: 1, x: 0 },
	exit: { opacity: 0, x: (groupIndex === 0 ? -1 : 1) * 10 }
});

export function Toolbar({ handleSubmit, isResponding, isCreatingConversation, setIsResponding, uploadRef }: {
	handleSubmit: () => void;
	isResponding?: boolean;
	isCreatingConversation?: boolean;
	setIsResponding?: (value: boolean) => void;
	uploadRef: React.RefObject<HTMLInputElement | null>;
}) {
	const isEnhancing = useEnhanceStore(state => state.isEnhancing);

	const tools = useTools({
		isResponding,
		setIsResponding,
		uploadRef: uploadRef as React.RefObject<HTMLInputElement>,
		handleSubmit
	});

	const { messages: allMessages } = useMessages();

	const isWaiting = useMemo(() => {
		if (!allMessages || allMessages.length === 0) return false;
		const lastMessage = allMessages[allMessages.length - 1] as any;
		return lastMessage?.role === 'assistant' && lastMessage?.is_waiting;
	}, [allMessages]);

	const shouldShowSpinner = useMemo(() =>
		isResponding || isWaiting || isEnhancing || isCreatingConversation,
		[isResponding, isWaiting, isEnhancing, isCreatingConversation]
	);

	const toolsClassName = `flex w-full justify-between text-xs text-muted-foreground select-none p-2 ${isEnhancing ? "opacity-50" : ""}`;

	return (
		<div className={toolsClassName}>
			{tools.map((toolGroup, groupIndex) => (
				<motion.div
					key={groupIndex}
					className="flex items-center gap-2"
				>
					<AnimatePresence>
						{toolGroup.map((tool, index) => {
							const isSubmitButton = groupIndex === tools.length - 1 && index === toolGroup.length - 1;
							const showSpinner = shouldShowSpinner && isSubmitButton;

							return (
								<motion.div
									key={`${groupIndex}-${index}`}
									variants={getAnimationVariants(groupIndex)}
									initial="initial"
									animate="animate"
									exit="exit"
									transition={{ duration: 0.2, delay: index * 0.1 }}
									className="flex items-center"
								>
									{showSpinner ? (
										<div className="flex items-center justify-center w-8 h-8">
											<RotatingLines size={16} color="currentColor" />
										</div>
									) : (
										<ToolButton tool={tool} />
									)}
								</motion.div>
							);
						})}
					</AnimatePresence>
				</motion.div>
			))}
		</div>
	);
}
