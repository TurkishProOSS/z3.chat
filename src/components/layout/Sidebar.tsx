"use client";

import { RiAppsFill, RiAppsLine, RiHistoryFill, RiHistoryLine, RiHome3Fill, RiHome3Line, RiExpandRightLine } from '@remixicon/react';
import { motion, AnimatePresence } from 'motion/react';
import { useHotkeys } from 'react-hotkeys-hook';
import { redirect, usePathname } from 'next/navigation';
import { cn } from '@colidy/ui-utils';
import { Logo } from '@/brand/Logo';
import { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { useSWRApi } from '@/hooks/use-swr-api';
import { Delete01Icon, PinIcon } from 'hugeicons-react';
import { pin, unpin } from '@/app/actions';
import { RotatingLines } from '@/ui/Spinner';
import { Button } from '@/ui/Button';
import { Dialog } from '@/ui/Dialog';
import { useClientFunctions } from '@/hooks/use-client-functions';

export default function Sidebar() {
	const [conversations, setConversations] = useState({
		pinnedConversations: [],
		conversations: []
	});
	const [expand, setExpand] = useState(false);
	const pathname = usePathname();

	const {
		data,
		isLoading,
		error,
		mutate
	} = useSWRApi("/conversations?limit=10&sidebar=1", {}, {
		revalidateOnFocus: true,
		revalidateOnReconnect: true,
		revalidateIfStale: true,
		revalidateOnMount: true,
		refreshInterval: 5000
	});

	useHotkeys('e', () => setExpand(!expand));

	const isActive = (item: { path: string }) => {
		return pathname === item.path;
	};


	const items = [
		{ icon: [RiHome3Line, RiHome3Fill], label: 'New Chat', path: '/' },
		{ icon: [RiAppsLine, RiAppsFill], label: "Explore", path: '/explore' },
		{ icon: [RiHistoryLine, RiHistoryFill], label: 'Chat History', path: '/chats' }
	];

	const itemAnimationVariants = {
		hidden: { opacity: 0, y: 5 },
		visible: { opacity: 1, y: 0 },
		exit: { opacity: 0, y: 5 }
	};

	const itemAnimationVariantsConversation = {
		hidden: { opacity: 0, x: -5 },
		visible: { opacity: 1, x: 0 },
		exit: { opacity: 0, x: 5 }
	};

	const pinClient = (conversationId: string) => {
		// @ts-ignore
		setConversations((prev) => {
			const finded = prev.conversations.find((c: any) => c._id === conversationId);
			if (finded) {
				const newPinned = [...prev.pinnedConversations, finded];
				const newConversations = prev.conversations.filter((c: any) => c._id !== conversationId);
				return {
					pinnedConversations: newPinned,
					conversations: newConversations
				};
			}
		});

		pin(conversationId);
	};
	const unpinClient = (conversationId: string) => {
		// @ts-ignore
		setConversations((prev) => {
			const finded = prev.pinnedConversations.find((c: any) => c._id === conversationId);
			if (finded) {
				const newPinned = prev.pinnedConversations.filter((c: any) => c._id !== conversationId);
				const newConversations = [...prev.conversations, finded];
				return {
					pinnedConversations: newPinned,
					conversations: newConversations
				};
			}
		});

		unpin(conversationId);
	};

	useEffect(() => {
		if (data && !isLoading && !error) {
			setConversations({
				pinnedConversations: data.pinnedConversations,
				conversations: data.conversations
			});
		}
	}, [data]);

	return (
		<>
			<motion.div animate={{ width: expand ? '15rem' : 89 }} className="shrink-0 w-[89px] min-h-screen" />
			<motion.div
				className={cn("fixed z-50 bg-primary group top-0 left-0 bottom-0 flex flex-col justify-between p-6 border-r", {
					"w-[15rem]": expand,
					"w-[89px]": !expand
				})}
				layout
				initial="hidden"
				animate="visible"
				exit="exit"
				transition={{ staggerChildren: 0.2, duration: 0.2 }}
			>
				<motion.div className="w-full space-y-6">
					<motion.div className="flex items-center gap-2 grayscale-100">
						<motion.div className="shrink-0" layout>
							<Logo size={36} />
						</motion.div>
						<AnimatePresence>
							{expand && (
								<motion.h1
									className="text-2xl font-medium text-foreground"
									layout
									variants={itemAnimationVariants}
								>
									z3c<span className="font-normal opacity-50">.dev</span>
								</motion.h1>
							)}
						</AnimatePresence>
					</motion.div>
					<motion.div className="space-y-1">
						{items.map((item, i) => {
							const Icon = isActive(item) ? item.icon[1] : item.icon[0];
							return (
								<Link key={i} className="flex items-center" href={item.path}>
									<motion.div
										className={cn("flex items-center gap-2 h-10 w-full transition-colors",
											{
												"hover:bg-secondary": !isActive(item),
												"bg-secondary": isActive(item)
											})}
										animate={{ borderRadius: 12 }}
										layout
									>
										<motion.div
											className={cn(
												"grid place-content-center w-10 h-full text-lg aspect-square"
											)}
											layout
										>
											<Icon className="text-foreground aspect-square" size={16} />
										</motion.div>
										{expand && (
											<motion.span
												className="text-foreground line-clamp-1 text-sm"
												layout
												variants={itemAnimationVariants}
											>
												{item.label}
											</motion.span>
										)}
									</motion.div>
								</Link>
							)
						})}
					</motion.div>
				</motion.div>

				{expand && (
					<motion.div
						className={cn("flex-1 overflow-y-auto overflow-x-hidden")}
						layout
						initial="hidden"
						animate="visible"
						exit="exit"
						transition={{ staggerChildren: 0.2, duration: 0.2 }}
					>
						{(conversations.pinnedConversations.length > 0) && (
							<motion.div
								className="flex w-full relative mt-6"
							>
								<motion.div
									className="flex flex-col w-full space-y-1"
									initial="hidden"
									animate="visible"
									exit="exit"
									transition={{ staggerChildren: 0.2, duration: 0.2 }}
								>
									<motion.p
										className="text-muted text-xs mb-2 pl-3"
										layout
										variants={itemAnimationVariantsConversation}
									>
										Pinned
									</motion.p>
									{conversations.pinnedConversations.map((conversation: any) => (
										<ConversationCard
											key={conversation._id}
											conversation={conversation}
											pinnedConversations={conversations.pinnedConversations}
											isActive={isActive}
											isPinned
											pinClient={pinClient}
											unpinClient={unpinClient}
											motionProps={{
												layout: true,
												transition: { duration: 0.2 },
												variants: itemAnimationVariantsConversation
											}}
										/>
									))}
								</motion.div>
							</motion.div>
						)}

						{(conversations.conversations.length > 0) && (
							<motion.div
								className="flex w-full relative mt-6"
							>
								<motion.div
									className="flex flex-col w-full space-y-1"
									layout
									initial="hidden"
									animate="visible"
									exit="exit"
									transition={{ staggerChildren: 0.2, duration: 0.2 }}
								>
									<motion.p
										className="text-muted text-xs mb-2 pl-3"
										layout
										variants={itemAnimationVariantsConversation}
									>
										Conversations
									</motion.p>
									{conversations.conversations.map((conversation: any) => (
										<ConversationCard
											key={conversation._id}
											conversation={conversation}
											pinnedConversations={conversations.pinnedConversations}
											isActive={isActive}
											pinClient={pinClient}
											unpinClient={unpinClient}

											motionProps={{
												layout: true,
												transition: { duration: 0.2 },
												variants: itemAnimationVariantsConversation
											}}
										/>
									))}
								</motion.div>
							</motion.div>
						)}
					</motion.div>
				)}

				<motion.div className="w-full flex flex-col items-start space-y-2" layout>
					<motion.div layout className="w-9 h-9 flex items-center justify-center">
						<span className="font-mono shadow-[inset_0_-2px_4px_var(--color-primary)] text-sm bg-secondary border border-b-4 rounded-md py-1 px-3">E</span>
					</motion.div>
					<motion.button
						className={cn("flex items-center gap-2 h-10 w-full transition-colors hover:bg-secondary cursor-pointer")}
						animate={{ borderRadius: 12 }}
						layout
						onClick={() => setExpand(!expand)}
					>
						<motion.div
							className={cn(
								"grid place-content-center w-10 h-full text-lg aspect-square"
							)}
							layout
						>
							<RiExpandRightLine className={cn("w-5 h-5 text-foreground transition-all", { 'rotate-180': expand })} size={16} />
						</motion.div>
						{expand && (
							<motion.span
								className="text-foreground line-clamp-1 text-sm"
								layout
								variants={itemAnimationVariants}
							>
								Daralt
							</motion.span>
						)}
					</motion.button>
				</motion.div>
			</motion.div>
		</>
	);
};

function ConversationCard({
	conversation,
	pinnedConversations,
	isActive,
	pinClient,
	unpinClient,
	isPinned = false,
	motionProps = {}
}: {
	conversation: any;
	pinnedConversations: string[];
	isActive: (item: { path: string }) => boolean;
	pinClient: (conversationId: string) => void;
	unpinClient: (conversationId: string) => void;
	isPinned?: boolean;
	motionProps?: {
		layout?: boolean;
		transition?: { duration: number };
		variants?: any;
	};
}) {
	const id = useId();
	const { deleteConversation: { deleteConversation, isDeleting } } = useClientFunctions();

	return (
		<motion.div className="relative group/conversation-card w-full" key={conversation._id + id} {...motionProps}>
			<Link
				key={conversation._id}
				href={`/chats/${conversation._id}`}
			>
				<motion.div
					key={conversation._id}
					className={cn("flex items-center justify-between gap-2 h-10 w-full px-3 text-sm rounded-xl transition-colors cursor-pointer", {
						"group-hover/conversation-card:bg-secondary": !isActive({ path: `/chats/${conversation._id}` }),
						"bg-secondary": isActive({ path: `/chats/${conversation._id}` })
					})}
				>
					<p className="line-clamp-1 pr-5 group-hover/conversation-card:pr-[48px] transition-all">{conversation.title}</p>
					{conversation.isResponding && (
						<RotatingLines size={30} color="currentColor" />
					)}
				</motion.div>
			</Link>

			<div
				className="flex gap-1 cursor-pointer absolute top-1 right-1 opacity-0 translate-x-4 group-hover/conversation-card:opacity-100 group-hover/conversation-card:translate-x-0 transition-all"
			>
				<motion.button
					className="transition-all can-focus bg-border rounded-xl hover:bg-border-hover cursor-pointer"

					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						if (isPinned) unpinClient(conversation._id);
						else pinClient(conversation._id);
					}}
					aria-label={isPinned ? "Unpin conversation" : "Pin conversation"}
				>
					<motion.div
						className="grid place-content-center w-8 h-8 text-lg aspect-square"
					>
						<PinIcon className="text-foreground" size={16} fill={isPinned ? 'currentColor' : 'none'} />
					</motion.div>
				</motion.button>
				<Dialog>
					<Dialog.Trigger
						onClick={e => e.stopPropagation()}
						asChild
					>
						<motion.button
							className="transition-all can-focus bg-red-400/10 text-red-400 rounded-xl hover:bg-red-400/20 cursor-pointer"
							aria-label="Delete conversation"
						>
							<motion.div
								className="grid place-content-center w-8 h-8 text-lg aspect-square"
							>
								<Delete01Icon size={16} />
							</motion.div>
						</motion.button>
					</Dialog.Trigger>
					<Dialog.Content titleChildren="Sohbeti Sil" descriptionChildren="Bu sohbeti silmek istediğinize emin misiniz? Bu işlem geri alınamaz.">
						<div className="flex items-center justify-end gap-2 mt-4">
							<Dialog.Close asChild>
								<Button
									variant="link"
									className="text-muted"
								>
									Hayır, Vazgeçtim
								</Button>
							</Dialog.Close>
							<Button
								variant="destructive"
								onClick={() => {
									deleteConversation(conversation._id, () => {
										if (isActive({ path: `/chats/${conversation._id}` })) {
											redirect("/");
										}
									});
								}}
								isLoading={isDeleting}
								disabled={isDeleting}
							>
								Sohbeti Sil
							</Button>
						</div>
					</Dialog.Content>
				</Dialog>
			</div>
		</motion.div>
	)
}