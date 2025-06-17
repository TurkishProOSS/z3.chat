"use client";

import { AnimatedLogo } from "@/brand/Logo";
import PromptInput from "@/forms/PromptInput";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { useSession } from "@/hooks/use-session";
import { MotionGlobalConfig } from 'motion/react';
import { useReduceMotionStore } from "@/stores/use-reduce-motion";

export default function HomePage() {
	const { data: session, isPending } = useSession();
	const t = useTranslations("HomePage");

	const isSkipAnimations = useReduceMotionStore(s => s.skipAnimations);
	const toggleAnimation = useReduceMotionStore(s => s.toggleSkipAnimations);

	return <>

		{/* <button
			onClick={() => {
				toggleAnimation();
			}}
			className="absolute top-24 right-4 bg-secondary hover:bg-secondary/80 text-sm px-3 py-1 rounded-md transition-colors duration-200 cursor-pointer"
		>
			{isSkipAnimations ? "Recover Animations" : "Remove Animations"}
		</button> */}
		<div className="flex w-full flex-col items-center justify-center flex-1 space-y-5">
			<div className="flex flex-col items-center justify-center space-y-10 flex-1">
				<div className="bg-primary relative rounded-full mt-24">
					{['w-[36rem] h-[36rem] animate-mid-spin', 'w-96 h-96 animate-slow-spin'].map((size, i) => (
						<motion.div initial={{ opacity: 0 }} animate={{ opacity: .5 }} transition={{ delay: 0.2 * i }} key={i} className={size + " absolute hidden lg:block opacity-50 top-1/2 left-1/2 -z-1 bg-red-500 -translate-1/2 bg-gradient-to-r from-orange-400 to-orange-400 via-primary rounded-full p-px"}>
							<div className="w-full h-full flex justify-center rounded-full bg-primary">
								<span className="bg-orange-600/20 border border-orange-400 w-4 -translate-y-1/2 h-4 rounded-full block" />
							</div>
						</motion.div>
					))}
					<motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 * 2 }} className="bg-gradient-to-br absolute -inset-px -z-1 from-orange-400 animate-slow-spin to-orange-600 via-transparent rounded-full p-px" />
					<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 * 3 }} className="bg-orange-700/20 animated-logo rounded-full">
						<AnimatedLogo size={100} loop={true} />
					</motion.div>
				</div>
				{!isPending && <motion.h1
					className="lg:text-5xl text-3xl pb-10 font-semibold max-w-2xl text-center text-foreground"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
				>
					{t.rich((new Date().getHours() >= 18 || new Date().getHours() < 6) ? "Evening" : "Morning", {
						is_logged_in: session ? (session?.user?.isAnonymous ? 0 : 1) : 0,
						name: session?.user?.name || "",
						"name-mark": (chunks) => <span className="bg-gradient-to-br from-orange-400 via-orange-600 to-orange-500 inline-block text-transparent bg-clip-text">{chunks}</span>
					})}
				</motion.h1>}
			</div>
			<PromptInput />
			<h1 className="text-muted hidden lg:block text-sm text-center">{t("Warning")}</h1>
		</div>
	</>
}