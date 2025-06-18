"use client";

import { useContext, useMemo } from "react";
import { useMessages } from "@/hooks/use-messages";
import { useEnhanceStore } from "@/stores/use-enhance";
import { useAgentActionsStore } from "@/stores/use-agent-actions";
import { useAgentSelectionStore } from "@/stores/use-agent-selection";
import { Z3Context } from "@/contexts/Z3Provider";
import { Dropdown } from "../ui/Dropdown";
import { cn } from "@colidy/ui-utils";
import { Add01Icon, ArrowUp01Icon, Brain02Icon, CrownIcon, FileAddIcon, Globe02Icon, ImageAdd01Icon, SlidersHorizontalIcon } from "hugeicons-react";
import { useAgentFeatureStore } from "@/stores/use-feature-store";
import { Select } from "@/ui/Select";
import {
	Gemini,
	Anthropic,
	OpenAI,
	DeepSeek,
	Mistral,
	Qwen,
	Meta,
	Grok,
	Microsoft,
	Replicate
} from "@lobehub/icons";
import { reduceAgents } from "@/lib/get-agents";
import { Tooltip } from "@/ui/Tooltip";
import { Button } from "../ui/Button";
import { Switch } from "../ui/Switch";
import { usePromptStore } from "@/stores/use-prompt";
import { RiSparkling2Fill } from "@remixicon/react";

export function Toolbar({ handleSubmit, isResponding, isCreatingConversation, setIsResponding, uploadRef, shouldShowSpinner }: {
	handleSubmit: () => void;
	isResponding?: boolean;
	isCreatingConversation?: boolean;
	setIsResponding?: (value: boolean) => void;
	uploadRef: React.RefObject<HTMLInputElement | null>;
	shouldShowSpinner?: boolean;
}) {
	const z3Context = useContext(Z3Context);
	const agents = z3Context?.agents || [];
	const changeAgent = useAgentActionsStore(s => s.changeAgent);
	const selectedAgent = useAgentSelectionStore(s => s.selectedAgent);
	const prompt = usePromptStore(state => state.prompt);

	const setFeature = useAgentFeatureStore(state => state.setFeature);
	const features = useAgentFeatureStore(state => state.features);
	const isEnhancing = useEnhanceStore(state => state.isEnhancing);
	const enhancePrompt = useEnhanceStore(state => state.enhancePrompt);

	const { messages: allMessages } = useMessages();

	const isWaiting = useMemo(() => {
		if (!allMessages || allMessages.length === 0) return false;
		const lastMessage = allMessages[allMessages.length - 1] as any;
		return lastMessage?.role === 'assistant' && lastMessage?.is_waiting;
	}, [allMessages]);

	const toolsClassName = `flex w-full justify-between text-xs select-none ${isEnhancing ? "opacity-50" : ""}`;
	const actionButtonClasses = (className: string) => cn([
		"flex items-center justify-center gap-2 text-foreground cursor-pointer transition-all",
		"border w-9 h-9 rounded-xl bg-muted/20 hover:bg-muted/30 active:bg-muted/40"
	], className);

	return (
		<div className={toolsClassName}>
			<div className="flex items-center gap-2">
				{selectedAgent && (selectedAgent.features.vision || selectedAgent.features.pdfSupport) && (
					<Dropdown>
						<Dropdown.Trigger className={actionButtonClasses("")}>
							<Add01Icon className="w-4 h-4" />
						</Dropdown.Trigger>
						<Dropdown.Content side="top" align="start" className="!min-w-[0px] z-[11]">
							{selectedAgent?.features.vision && (
								<Dropdown.Item
									className="flex items-center justify-start gap-2"
									onClick={() => {
										uploadRef.current?.setAttribute("accept", "image/*");
										uploadRef.current?.click();
									}}
								>
									<ImageAdd01Icon className="w-4 h-4" />
									<span>
										Add photos
									</span>
								</Dropdown.Item>
							)}
							{selectedAgent?.features.pdfSupport && (
								<Dropdown.Item
									className="flex items-center justify-start gap-2"
									onClick={() => {
										uploadRef.current?.setAttribute("accept", ".pdf,.txt,.doc,.docx");
										uploadRef.current?.click();
									}}
								>
									<FileAddIcon className="w-4 h-4" />
									<span>
										Add files (pdf, txt...)
									</span>
								</Dropdown.Item>
							)}
						</Dropdown.Content>
					</Dropdown>
				)}
				<Select
					placeholder="Select a model"
					value={selectedAgent?.id || ''}
					onValueChange={(change: string) => changeAgent(change, z3Context as any)}
					triggerProps={{
						className: actionButtonClasses("w-auto px-4 justify-start max-w-56 text-left")
					}}
				>
					{reduceAgents(agents).map((agent) => (
						<Select.Group key={agent.provider} label={agent.provider}>
							{agent.models.map((model, index) => (
								<Select.Item key={index} value={model.id}>
									<Model
										company={agent.provider}
										modelName={model.name}
										reasoning={model.features.reasoning}
										premium={model.premium}
									/>
								</Select.Item>
							))}
						</Select.Group>
					))}
				</Select>
				{selectedAgent && (selectedAgent.features.reasoning || selectedAgent.features.search) && (
					<Dropdown>
						<Dropdown.Trigger className={actionButtonClasses("")}>
							<SlidersHorizontalIcon className="w-4 h-4" />
						</Dropdown.Trigger>
						<Dropdown.Content side="top" align="start" className="!min-w-[0px] z-[11]">
							{selectedAgent.features.reasoning && (
								<Dropdown.Item
									className="flex items-center justify-between gap-2"
									onClick={() => setFeature('reasoning', !features.reasoning)}
								>
									<div className="flex items-center gap-2">
										<Brain02Icon className="w-4 h-4" />
										<span>
											Reasoning
										</span>
									</div>
									<Switch checked={features.reasoning} />
								</Dropdown.Item>
							)}
							{selectedAgent.features.search && (
								<Dropdown.Item className="flex items-center justify-between gap-2" onClick={() => setFeature('search', !features.search)}>
									<div className="flex items-center gap-2">
										<Globe02Icon className="w-4 h-4" />
										<span>
											Web search
										</span>
									</div>
									<Switch checked={features.search} />
								</Dropdown.Item>
							)}
						</Dropdown.Content>
					</Dropdown>
				)}


			</div>

			<div className="flex items-center gap-2">
				<Tooltip content="Enhance prompt with AI">
					<Button
						size="icon"
						onClick={() => {
							if (isEnhancing) return;
							enhancePrompt();
						}}
						disabled={isEnhancing || isResponding || isCreatingConversation}
						className={actionButtonClasses("")}
					>
						<RiSparkling2Fill className="w-4 h-4" />
					</Button>
				</Tooltip>
				<Button
					size="icon"
					onClick={handleSubmit}
					disabled={shouldShowSpinner || !prompt}
					isLoading={shouldShowSpinner}
					className="bg-colored"
				>
					<ArrowUp01Icon className="w-4 h-4" strokeWidth={3} />
				</Button>
			</div>
		</div>
	);
}


function Model({
	company,
	version,
	modelName,
	reasoning,
	premium
}: {
	company?: string;
	version?: string | null;
	modelName: string;
	reasoning?: boolean;
	premium?: boolean;
}) {

	const Icon = (() => {
		switch (company?.toLowerCase()) {
			case 'openai':
				return OpenAI;
			case 'anthropic':
				return Anthropic;
			case 'gemini':
			case 'google':
			case 'google vertex':
			case 'google ai studio':
				return Gemini;
			case 'meta':
				return Meta;
			case 'mistral':
				return Mistral;
			case 'deepseek':
				return DeepSeek;
			case 'qwen':
				return Qwen;
			case 'grok':
				return Grok;
			case 'microsoft':
				return Microsoft;
			case 'replicate':
				return Replicate;
			default:
				return null;
		}
	})();

	return (
		<div className="flex items-center space-x-2 w-full">
			{Icon && <Icon size={12} />}
			<div className="flex-1 flex items-center justify-between gap-2">
				<span className="text-sm font-medium line-clamp-1">{modelName}</span>
				{premium && (
					<Tooltip content="Premium model">
						<span className="flex-shrink-0 text-xs text-muted-foreground ml-1 bg-colored/10 text-colored w-5 h-5 flex justify-center items-center rounded-full">
							<CrownIcon size={12} />
						</span>
					</Tooltip>
				)}
			</div>
		</div>
	);
}