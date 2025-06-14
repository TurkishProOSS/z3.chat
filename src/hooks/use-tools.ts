"use client";

import AgentSelect from "@/forms/AgentSelect";
// import { usePrompt } from "@/states/use-prompt";
import { RiArrowUpLine, RiAttachmentLine, RiEqualizer2Line, RiMicFill, RiMicOffFill, RiSparklingFill } from "@remixicon/react";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { useZ3 } from "@/hooks/use-z3";
import { useChat } from "@/hooks/use-chat";

export const useTools = () => {
	const { handleSubmit } = useChat();
	const activeAgent = useZ3((state) => state.selectedAgent);
	const setFeature = useZ3((state) => state.setFeature);
	const features = useZ3((state) => state.features);
	const isEnhancing = useZ3(state => state.isEnhancing);
	const prompt = useZ3(state => state.prompt);
	const enhancePrompt = useZ3(state => state.enhancePrompt);
	const enhanceRemaining = useZ3(state => state.enhanceRemaining);

	const {
		browserSupportsSpeechRecognition,
		listening,
		isMicrophoneAvailable,
		interimTranscript,
		transcript
	} = useSpeechRecognition();

	const [inserting, setInserting] = useState(false);
	const t = useTranslations("PromptInput.Tools");


	const toggleListening = useCallback(() => {
		if (!browserSupportsSpeechRecognition) {
			alert(t("Speech_Recognition_Not_Supported"));
			return;
		}

		if (listening) {
			SpeechRecognition.stopListening();
		} else {
			SpeechRecognition.startListening();
		}
	}, []);

	// useEffect(() => {
	// 	if (listening) {
	// 		handleTranscript();
	// 	}
	// }, [listening, transcript, handleTranscript]);

	const fileTypes = [activeAgent?.features?.vision ? "Image" : "", activeAgent?.features?.pdfSupport ? "PDF Document" : ""].filter(Boolean).join(", ");
	const agentFeatures = [
		{
			type: "menu",
			icon: RiEqualizer2Line,
			options: [
				{
					type: 'switch',
					label: t("Agent_Feature_Web_Search"),
					value: features.search,
					onValueChange: () => setFeature("search", !features.search),
					hidden: false
				}
			].filter((option) => !option.hidden),
			tooltip: t("Agent_Features"),
		},
		{
			icon: RiAttachmentLine,
			onClick: () => { },
			disabled: !activeAgent?.features?.vision || !activeAgent?.features?.pdfSupport,
			tooltip: fileTypes.length > 0 ? t("Attachment", { types: fileTypes }) : t("Attachment_Not_Available")
		}
	]

	const tools = useMemo(
		() => new Array(
			...new Set([
				[
					{
						content: AgentSelect
					},
					...agentFeatures
				],
				[
					{
						icon: RiSparklingFill,
						onClick: enhancePrompt,
						disabled: isEnhancing,
						tooltip: t("Enhance_Prompt", { remaining: enhanceRemaining }),
					},
					{
						icon: listening ? RiMicOffFill : RiMicFill,
						disabled: !isMicrophoneAvailable || !SpeechRecognition.browserSupportsSpeechRecognition,
						onClick: toggleListening,
						tooltip: listening ? t("Recording") : t("Start_Dictate"),
					},
					{
						variant: "primary",
						icon: RiArrowUpLine,
						onClick: () => handleSubmit(),
						tooltip: (isEnhancing || !prompt.trim()) ? t("Submit_Disabled") : t("Submit"),
						disabled: isEnhancing || !prompt.trim()
					},
				]
			])
		),
		[t, SpeechRecognition.browserSupportsSpeechRecognition, listening, activeAgent, isMicrophoneAvailable, features, isEnhancing, enhancePrompt]
	);

	return tools;
};