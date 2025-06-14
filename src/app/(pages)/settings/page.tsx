'use client';

import { motion, AnimatePresence } from 'motion/react';
import { RiArrowLeftLine, RiUser3Line, RiBrushLine, RiChatHistoryLine, RiChatSmileAiLine, RiKeyLine } from '@remixicon/react';
import { useState, useEffect } from 'react';
import { cn } from '@colidy/ui-utils';
import { Logo } from '@/brand/Logo';

export default function Settings() {
	const [mount, setMount] = useState(false);

	useEffect(() => {
		setMount(true);
	}, []);

	return (
		<div>

			<motion.div
				className="bg-primary group h-screen flex flex-col justify-between p-6 border-r transition-all duration-300 ease-in-out"
				initial={{ width: 85 }}
				animate={{ width: '24rem', backgroundColor: 'var(--color-secondary)' }}
			>
				<div className="w-full h-full space-y-10">
					<div className="flex w-full">
						<AnimatePresence mode="wait">
							{!mount ? (
								<motion.div
									key={"logo"}
									className="grayscale-100"
									exit={{ opacity: 0, scale: 1, y: -20 }}
									animate={{ opacity: 1, scale: 1, y: 0 }}
								>
									<Logo size={36} />
								</motion.div>
							) : (
								<motion.div
									key={"arrow"}
									initial={{ opacity: 0, scale: 1, y: 20 }}
									animate={{ opacity: 1, scale: 1, y: 0 }}
								>
									<a className="text-muted flex items-center space-x-2">
										<RiArrowLeftLine />
									</a>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
					<div className="space-y-2">
						<motion.h1
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.5 }}
							className="text-2xl text-foreground"
						>
							Settings
						</motion.h1>
						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.7 }}
							className="text-muted max-w-64"
						>
							Manage settings related to your account and subscription.
						</motion.p>
					</div>
					<div className="space-y-3">
						{[
							['account', <RiUser3Line size={48} className="text-muted/50" />],
							['customization', <RiBrushLine size={48} className="text-muted/50" />],
							['history', <RiChatHistoryLine size={48} className="text-muted/50" />],
							['models', <RiChatSmileAiLine size={48} className="text-muted/50" />],
							['apikeys', <RiKeyLine size={48} className="text-muted/50" />],
						].map((item, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 0.1 * (index + 1) + 0.7 }}
								className={cn(item[2] || 'from-muted/20 to-muted/20', "rounded-2xl bg-gradient-to-br via-border p-px")}
							>
								<div className="bg-secondary rounded-2xl p-4 flex items-center hover:bg-popover space-x-4">
									<div className="relative">
										<span className="absolute inset-0 bg-gradient-to-tl from-secondary via-transparent" />
										{item[1]}
									</div>
									<div className="space-y-1">
										<h1 className="text-foreground leading-none text-lg">{item[0]}</h1>
										<p className="text-muted leading-none">{item[0]}</p>
									</div>
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</motion.div>
		</div>
	);
};