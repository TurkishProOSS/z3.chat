"use client";

import { useParams, useRouter } from "next/navigation";
import { useZ3 } from "@/hooks/use-z3";
import { api } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";
import { useAutoSubmit } from "@/stores/use-auto-submit";
import { useMessages } from "@/hooks/use-messages";
import { AxiosResponse } from "axios";

type UseChatOptions = {
	initialMessages?: string[];
	disableSubmittion?: boolean;
};

export const useChat = (options: UseChatOptions) => {
	const router = useRouter();
	const params = useParams();
	const prompt = useZ3(state => state.prompt);
	const setPrompt = useZ3(state => state.setPrompt);
	const isEnhancing = useZ3(state => state.isEnhancing);
	const model = useZ3(state => state.selectedAgent);
	const setAlert = useZ3(state => state.setAlert);
	const autoSubmit = useAutoSubmit(state => state.autoSubmit);
	const setAutoSubmit = useAutoSubmit(state => state.setAutoSubmit);
	const { messages, setMessages, streamMesage, addUserMessage } = useMessages();

	async function handleStreamMessage(response: AxiosResponse<any, any>, $prompt: string) {
		const reader = response.data.getReader();
		const decoder = new TextDecoder("utf-8");
		let done = false;
		let streamContent = "";

		addUserMessage($prompt);

		while (!done) {
			const { value, done: streamDone } = await reader.read();
			done = streamDone;
			if (value) {
				const chunk = decoder.decode(value, { stream: true });
				streamContent += chunk;
				streamMesage(chunk);
			}
		}
	}

	const sendMessage = useCallback(async (cId?: string) => {
		if (options?.disableSubmittion) return;
		if (isEnhancing) return;
		if (!prompt) return;
		const $prompt = prompt;

		setPrompt("");

		const conversationId = cId || params?.conversationId as string;
		const response = await api.post("/conversation/" + conversationId, {
			model: model?.id as string,
			prompt
		}, {
			adapter: 'fetch',
			responseType: "stream"
		});


		if (!response || !response.data) {
			setAlert("Failed to send message");
			return;
		}

		await handleStreamMessage(response, $prompt);
	}, [params, prompt, isEnhancing, setPrompt, model, messages, setMessages, options?.disableSubmittion, handleStreamMessage]);

	const createNewConversation = async () => {
		const response = await api.post("/create-conversation", {
			prompt
		})
			.then((res) => res.data)
			.catch(() => null);

		if (!response || !response.success) {
			setAlert(response?.message || "Failed to create conversation");
			return;
		}

		return response.data;
	};

	const handleSubmit = useCallback(async () => {
		if (options?.disableSubmittion) return;
		if (isEnhancing) return;

		const conversationId = params?.conversationId as string;
		if (!conversationId) {
			const newConversation = await createNewConversation();
			if (!newConversation) return;

			setMessages([]);
			setAutoSubmit(true);
			router.push(newConversation.redirect, {
				scroll: true
			});
		} else {
			setAutoSubmit(false);
			sendMessage();
		}
	}, [params, isEnhancing, sendMessage, setMessages, setAutoSubmit, options?.disableSubmittion, router, createNewConversation]);

	useEffect(() => {
		if (autoSubmit && params?.conversationId)
			handleSubmit();
	}, [autoSubmit, params, handleSubmit]);

	useEffect(() => {
		(async () => {
			if (params?.conversationId) {
				const resumeResponse = await api.post(`/conversation/${params.conversationId}/resume`, {}, {
					adapter: 'fetch',
					responseType: "stream"
				}).catch(() => null);

				if (!resumeResponse) return;

				await handleStreamMessage(resumeResponse, prompt);
			}
		})();
	}, []);

	return {
		handleSubmit,
		messages: (options?.initialMessages || []).concat(messages),
		setMessages
	};
};