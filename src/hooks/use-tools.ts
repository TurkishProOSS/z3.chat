"use client";

import AgentSelect from "@/forms/AgentSelect";
import { RiArrowUpLine, RiAttachmentLine, RiEqualizer2Line, RiSparklingFill, RiSquareFill } from "@remixicon/react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { useAgentFeatureStore } from "@/stores/use-feature-store";
import { useAgentSelectionStore } from "@/stores/use-agent-selection";
import { useEnhanceStore } from "@/stores/use-enhance";
import { usePromptStore } from "@/stores/use-prompt";

export const useTools = ({
	isResponding = false,
	setIsResponding = (value: boolean) => { /* no-op */ },
	uploadRef,
	handleSubmit
}: {
	isResponding?: boolean;
	setIsResponding?: (value: boolean) => void;
	uploadRef?: React.RefObject<HTMLInputElement>;
	handleSubmit: () => void;
}) => {
	const setFeature = useAgentFeatureStore((state) => state.setFeature);
	const features = useAgentFeatureStore((state) => state.features);

	const activeAgent = useAgentSelectionStore((state) => state.selectedAgent);
	const isEnhancing = useEnhanceStore((state) => state.isEnhancing);
	const prompt = usePromptStore((state) => state.prompt);
	const enhancePrompt = useEnhanceStore((state) => state.enhancePrompt);
	const enhanceRemaining = useEnhanceStore((state) => state.enhanceRemaining);

	const t = useTranslations("PromptInput.Tools");

	const fileTypes = [activeAgent?.features?.vision ? "image" : "", activeAgent?.features?.pdfSupport ? "pdf" : ""].filter(Boolean).join(", ");
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
					hidden: !activeAgent?.features?.search
				},
				{
					type: 'switch',
					label: t("Agent_Feature_Reasoning"),
					value: features.reasoning,
					onValueChange: () => setFeature("reasoning", !features.reasoning),
					hidden: !activeAgent?.features?.reasoning
				}
			].filter((option) => !option.hidden),
			tooltip: t("Agent_Features"),
			disabled: !activeAgent?.features.search && !activeAgent?.features?.reasoning,
		},
		{
			icon: RiAttachmentLine,
			onClick: () => {
				if (uploadRef?.current) {
					uploadRef.current.click();
				};
			},
			disabled: !activeAgent?.features?.vision && !activeAgent?.features?.pdfSupport,
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
						variant: "primary",
						icon: isResponding ? RiSquareFill : RiArrowUpLine,
						onClick: handleSubmit,
						tooltip: (isEnhancing || !prompt.trim()) ? t("Submit_Disabled") : t("Submit"),
						disabled: isResponding ? true : (isEnhancing || !prompt.trim())
					},
				]
			])
		),
		[t, activeAgent, features, isEnhancing, enhancePrompt, enhanceRemaining, prompt, handleSubmit, agentFeatures, isResponding]
	);

	return tools;
};