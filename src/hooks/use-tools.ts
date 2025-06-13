"use client";

import AgentSelect from "@/forms/AgentSelect";
// import { usePrompt } from "@/states/use-prompt";
import { RiArrowUpFill, RiArrowUpLine, RiAttachment2, RiAttachmentLine, RiBrain2Fill, RiBrain2Line, RiEqualizer2Line, RiFile2Fill, RiMicFill, RiMicOffFill, RiSettings2Line, RiSettings3Line, RiSparklingFill, RiUpload2Fill, RiUpload2Line } from "@remixicon/react";
import { useSpeech } from "@uidotdev/usehooks";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { useZ3 } from "./use-z3";

export const useTools = (
	submitPrompt: () => void
) => {
	const activeAgent = useZ3((state) => state.selectedAgent);
	const setFeature = useZ3((state) => state.setFeature);
	const features = useZ3((state) => state.features);

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
			disabled: true,
			tooltip: t("Attachment")
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
						// onClick: enhancePrompt,
						disabled: true,
						tooltip: t("Enhance_Prompt")
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
						onClick: submitPrompt,
						disabled: true
					},
				]
			])
		),
		[t, SpeechRecognition.browserSupportsSpeechRecognition, listening, activeAgent, isMicrophoneAvailable, features]
	);

	return tools;
};