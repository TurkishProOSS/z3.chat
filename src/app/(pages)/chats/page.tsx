"use client";

import PromptInput from "@/forms/PromptInput";
import { Logo } from '@/brand/Logo';
import { cn } from "@colidy/ui-utils";
import Link from "next/link";
import { useSWRApi } from "@/hooks/use-swr-api";
import { useState } from "react";

export default function Chat() {
	const {
		data: {
			conversations = []
		} = {},
		isLoading
	} = useSWRApi("/conversations", {}, {
		revalidateOnFocus: false,
		revalidateOnReconnect: false,
		refreshInterval: 10000
	});

	const [search, setSearch] = useState("");

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
				<div className="w-full flex flex-1 flex-col space-y-2 mt-6">
					{isLoading ? (
						<p className="text-muted text-sm">Yükleniyor...</p>
					) : !conversations || conversations.length === 0 ? (
						<p className="text-muted text-sm">Henüz sohbet geçmişin yok.</p>
					) : (
						conversations
							.filter((conversation: any) => {
								if (!search) return true;
								return conversation.title?.toLowerCase().includes(search.toLowerCase());
							})
							.map((conversation: any, index: number) => (
								<Link
									key={conversation?._id || index}
									className="bg-secondary hover:bg-tertiary text-foreground w-full rounded-2xl p-4 transition-all cursor-pointer"
									href={`/chats/${conversation?._id}`}
								>
									{conversation.title || "Yeni Sohbet"}
									< p className="text-muted text-xs mt-1">Last message: {
										new Date(conversation.updatedAt).toLocaleDateString("tr-TR", {
											year: "numeric",
											month: "2-digit",
											day: "2-digit",
											hour: "2-digit",
											minute: "2-digit"
										})
									}</p>
								</Link>
							))
					)}
				</div>
			</div >
		</>
	);
};