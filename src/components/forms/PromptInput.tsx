"use client";

import { cn } from "@colidy/ui-utils";
import { useTools } from "@/hooks/use-tools";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { ToolButton } from "@/forms/ToolButton";
import { useId, useState } from "react";

const getAnimationVariants = (groupIndex: number) => ({
	initial: { opacity: 0, x: (groupIndex === 0 ? -1 : 1) * 10 },
	animate: { opacity: 1, x: 0 },
	exit: { opacity: 0, x: (groupIndex === 0 ? -1 : 1) * 10 }
});


export default function PromptInput({ enableAgents = false }: {
	enableAgents?: boolean
}) {
	const id = useId();
	const t = useTranslations("PromptInput");
	const isEnhancing = false;
	const tools = useTools(() => { });
	const [focus, setFocus] = useState(false);

	return <motion.label
		className={cn([
			"relative flex items-center justify-center",
			"w-full max-w-2xl h-40 bg-input shadow-lg outline-none border rounded-2xl p-4 text-sm text-foreground resize-none",
			"transition-shadow ease-in-out"
		], {
			"cursor-not-allowed opacity-50": isEnhancing,
			"ring-2 ring-orange-500 ring-offset-2 ring-offset-secondary bg-input": focus,
			"hover:border-border-hover": !focus
		})}
		initial={{ opacity: 0, y: 20 }}
		animate={{ opacity: 1, y: 0 }}
		exit={{ opacity: 0, y: 20 }}
		htmlFor={id}
	>
		{isEnhancing && <Shimmer className="absolute inset-0 bg-secondary/50 rounded-lg animate-pulse" />}
		<textarea
			placeholder={t("Placeholder")}
			disabled={isEnhancing}
			className="w-full h-full bg-transparent outline-none resize-none select-none"
			id={id}
			onFocus={() => setFocus(true)}
			onBlur={() => setFocus(false)}
		/>
		<div className="absolute bottom-4 inset-x-4 flex justify-between text-xs text-muted-foreground select-none">
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
	</motion.label >
}

function Shimmer({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"absolute inset-0 bg-gradient-to-r from-secondary/20 via-secondary/30 to-secondary/20",
				"animate-shimmer rounded-lg",
				className
			)}
			suppressHydrationWarning
		/>
	);
}
