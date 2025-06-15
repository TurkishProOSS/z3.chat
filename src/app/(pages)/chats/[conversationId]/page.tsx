"use server";

import Messages from "@/components/chat-ui/messages";
import PromptInput from "@/components/forms/PromptInput";
import { api } from "@/lib/api";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ArrowDown01Icon, ArrowDown02Icon } from "hugeicons-react";

export default async function Chat({ params }: {
	params: Promise<{ conversationId: string }>;
}) {

	const { conversationId } = await params;
	const response = await api.get(`/conversation/${conversationId}`, {
		headers: await headers() as any
	}).then(res => res.data).catch((er) => null);
	if (!response) return notFound();

	return (
		<div className="flex flex-col max-w-3xl w-full mx-auto relative mb-36">
			<Messages messages={response.conversation.messages} />
			<div className="fixed max-w-3xl w-full mx-auto bottom-0 flex flex-col justify-center gap-2">
				<button className="cursor-pointer flex items-center gap-2 bg-border/10 backdrop-brightness-110 backdrop-blur-lg w-fit px-4 py-2 rounded-full text-sm text-muted-foreground hover:bg-zinc-500/20 transition-colors duration-200 ease-in-out mx-auto mb-2">
					<ArrowDown01Icon size={16} />
					Scroll to bottom
				</button>
				<PromptInput className="max-w-3xl w-full  pb-4 rounded-t-3xl bg-primary" />
			</div>
		</div>
	);
};