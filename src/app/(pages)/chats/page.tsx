"use client";

import PromptInput from "@/forms/PromptInput";
import { Logo } from '@/brand/Logo';
import { cn } from "@colidy/ui-utils";
import Link from "next/link";
import { useSWRApi } from "@/hooks/use-swr-api";
import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { Delete01Icon } from "hugeicons-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { useClientFunctions } from "@/hooks/use-client-functions";
import { AnimatePresence, motion } from "framer-motion";

export default function Chat() {
	const {
		data,
		isLoading,
		error,
		mutate
	} = useSWRApi("/conversations", {}, {
		revalidateOnFocus: false,
		revalidateOnReconnect: false,
		refreshInterval: 10000
	});

	const [search, setSearch] = useState("");
	const conversations = data?.conversations || [];
	const { deleteConversation: { deleteConversation, isDeleting } } = useClientFunctions();
	const itemAnimationVariants = {
		hidden: { opacity: 0, x: -5 },
		visible: { opacity: 1, x: 0 },
		exit: { opacity: 0, x: 5 }
	};

	const filteredConversations = useMemo(() => {
		if (!conversations) return [];
		return conversations.filter((conversation: any) => {
			if (!search) return true;
			return conversation.title?.toLowerCase().includes(search.toLowerCase());
		});
	}, [conversations, search]);


	return (
		<>
			<div className="flex flex-col h-full justify-between w-full max-w-2xl mx-auto mt-12">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-2xl font-semibold text-foreground">
						Sohbet geçmişin
					</h1>
					<Link href="/" className="text-sm text-orange-500 hover:underline">
						Yeni sohbet başlat
					</Link>
				</div>
				<input
					className={cn(
						"relative flex items-center justify-center",
						"w-full max-w-2xl rounded-2xl bg-input outline-none border p-4 text-sm text-foreground resize-none",
						"focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-secondary",
						"transition-all duration-200 ease-in-out hover:border-border-hover focus:!bg-input"
					)}
					placeholder="Sohbet başlıkları arasında ara..."
					type="text"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
				<motion.div
					className="w-full flex flex-1 flex-col space-y-2 mt-6"
				>

					{isLoading ? (
						<LoadingState />
					) : (
						<>
							{!filteredConversations || filteredConversations?.length === 0 ? (
								<EmptyState />
							) : (
								error ? (
									<EmptyState />
								) : (
									<AnimatePresence>
										<motion.div
											layout
											initial="initial"
											animate="visible"
											transition={{
												staggerChildren: 0.12,
												when: "beforeChildren",
												duration: 0.2
											}}
											className="flex flex-col space-y-2 pb-12"
										>
											{filteredConversations.map((conversation: any, index: number) => (
												<motion.div
													className="relative group w-full" key={conversation?._id || index}
													layout
													variants={itemAnimationVariants}
												>
													<motion.div>
														<Link
															href={`/chats/${conversation?._id}`}
															onAbort={(e) => e.stopPropagation()}
														>
															<div
																className="relative bg-secondary hover:bg-tertiary text-foreground w-full rounded-2xl p-4 transition-all cursor-pointer">
																{conversation.title || "Yeni Sohbet"}
																<p className="text-muted text-xs mt-1">
																	Last message: {
																		new Date(conversation.updatedAt).toLocaleDateString("tr-TR", {
																			year: "numeric",
																			month: "2-digit",
																			day: "2-digit",
																			hour: "2-digit",
																			minute: "2-digit"
																		})
																	}
																</p>
															</div>
														</Link>
													</motion.div>


													<Dialog>
														<Dialog.Trigger
															onClick={e => e.stopPropagation()}
															asChild
														>
															<button
																onClick={(e) => e.stopPropagation()}
																className="can-focus flex items-center cursor-pointer justify-center w-6 h-6 text-red-400 bg-red-400/10 rounded-lg hover:bg-red-400/20 text-xs absolute right-4 top-4 opacity-0 translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-200"
															>
																<Delete01Icon className="inline-block w-4 h-4" />
															</button>
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
																			mutate();
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
												</motion.div>
											))}
										</motion.div>
									</AnimatePresence>
								))}
						</>
					)}
				</motion.div>
			</div>
		</>
	);
};

function EmptyState() {
	return (
		<div className="flex flex-col items-center justify-center h-full border border-dotted rounded-2xl">
			<p className="text-muted text-sm">Henüz sohbet geçmişin yok.</p>
		</div>
	);
}

function LoadingState() {
	return (
		<div className="flex flex-col items-center justify-center h-full gap-2">
			{Array.from({ length: 10 }).map((_, index) => (
				<div key={index} className="relative bg-secondary text-foreground w-full rounded-2xl h-16">
					<div className="shimmer w-full h-full absolute inset-0" />
				</div>
			))}
		</div>
	);
}