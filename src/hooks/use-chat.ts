"use client";

import { useParams, usePathname } from "next/navigation";
import { useZ3 } from "@/hooks/use-z3";

export const useChat = () => {
	const params = useParams();
	const pathname = usePathname();
	const prompt = useZ3(state => state.prompt);
	const setPrompt = useZ3(state => state.setPrompt);
	const isEnhancing = useZ3(state => state.isEnhancing);

	const handleSubmit = () => {
		const conversationId = params?.conversationId as string;
		console.log("Create new conversation?: ", !conversationId);
	}

	return {
		handleSubmit
	};
};