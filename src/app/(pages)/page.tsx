"use client";

import { AnimatedLogo } from "@/brand/Logo";
import PromptInput from "@/forms/PromptInput";
import { authClient } from "@/lib/authClient";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";

export default function HomePage() {
	const { data: session, isPending } = authClient.useSession();
	const t = useTranslations("HomePage");

	return <>
		<div className="flex w-full flex-col items-center justify-center flex-1 space-y-5">
			<div className="flex flex-col items-center justify-center space-y-10 flex-1">
				<div className="bg-primary relative rounded-full mt-24">
					{['w-[36rem] h-[36rem] animate-mid-spin', 'w-96 h-96 animate-slow-spin'].map((size, i) => (
						<div key={i} className={size + " absolute opacity-25 top-1/2 left-1/2 -z-1 bg-red-500 -translate-1/2 bg-gradient-to-r from-orange-400 to-orange-400 via-primary rounded-full p-px"}>
							<div className="w-full h-full flex justify-center rounded-full bg-primary">
								<span className="bg-orange-600/20 border border-orange-400 w-4 -translate-y-1/2 h-4 rounded-full block" />
							</div>
						</div>
					))}
					<div className="bg-gradient-to-br absolute -inset-px -z-1 from-orange-400 animate-slow-spin to-orange-600 via-transparent rounded-full p-px" />
					<div className="bg-orange-700/20 rounded-full">
						<AnimatedLogo size={100} loop={true} />
					</div>
				</div>
				{!isPending && <motion.h1
					className="text-5xl pb-10 font-semibold max-w-2xl text-center text-foreground"
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
			<h1 className="text-muted text-sm text-center">{t("Warning")}</h1>
		</div>
	</>
}