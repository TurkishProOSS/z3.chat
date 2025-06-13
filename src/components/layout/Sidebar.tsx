"use client";

import { RiAppsFill, RiAppsLine, RiChat1Fill, RiChat1Line, RiHistoryFill, RiHistoryLine, RiHome3Fill, RiHome3Line, RiSettings3Fill, RiSettings3Line } from '@remixicon/react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '@/brand/Logo';
import { useHover } from "@uidotdev/usehooks";
import { cn } from '@colidy/ui-utils';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
	const [ref, hovering] = useHover();
	const pathname = usePathname();

	const isActive = (item: { path: string }) => {
		return pathname === item.path;
	};

	const items = [
		{ icon: [RiHome3Line, RiHome3Fill], label: 'New Chat', path: '/' },
		{ icon: [RiAppsLine, RiAppsFill], label: 'Eklentiler', path: '/extensions' },
		{ icon: [RiHistoryLine, RiHistoryFill], label: 'Chat History', path: '/chats' }
	]
	return (
		<>
			<div className="shrink-0 w-[85px] min-h-screen" />
			<div className="fixed z-50 bg-primary group top-0 left-0 bottom-0 w-[85px] flex flex-col justify-between p-6 border-r transition-all duration-300 ease-in-out">
				<div className="w-full space-y-6">
					<div className="flex items-center gap-2 grayscale-100">
						<div className="shrink-0">
							<Logo size={36} />
						</div>
						<AnimatePresence>
							{hovering && (
								<motion.h1
									className="text-2xl font-medium text-foreground"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
								>
									z3<span className="font-normal opacity-50">.chat</span>
								</motion.h1>
							)}
						</AnimatePresence>
					</div>
					<div className="space-y-1">
						{items.map((item, i) => {
							const Icon = isActive(item) ? item.icon[1] : item.icon[0];
							return (
								<div key={i} className="flex items-center w-60">
									<div className={cn(
										"w-9 aspect-square rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-medium text-foreground cursor-pointer",
										{
											"hover:bg-secondary": !isActive(item),
											"bg-secondary": isActive(item)
										}
									)}>
										<Icon className="w-5 h-5 text-foreground" />
									</div>
								</div>
							)
						})}
					</div>
				</div>
				<div className="w-8 flex flex-col gap-4">
					<div
						className={cn(
							"w-full aspect-square rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-medium text-foreground cursor-pointer hover:bg-secondary"
						)}
					>
						<RiSettings3Fill className="w-5 h-5 text-foreground" />
					</div>
					<img
						src="https://pbs.twimg.com/profile_images/1872801951995314176/axOtnYW0_400x400.jpg"
						alt="User Avatar"
						className="w-full aspect-square rounded-full object-cover shrink-0"
					/>
				</div>
			</div>
		</>
	);
};