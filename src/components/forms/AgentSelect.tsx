"use client";

import { useContext } from 'react';
import { Z3Context } from '@/contexts/Z3Provider';
import { useAgentActionsStore } from '@/stores/use-agent-actions';
import { Select } from '@/ui/Select';
import {
	Gemini,
	Anthropic,
	OpenAI,
	DeepSeek,
	Mistral,
	MetaAI,
	MetaGPT,
	LlamaIndex,
	Qwen,
	Meta,
	Grok,
	Microsoft
} from "@lobehub/icons";
import { CrownIcon } from 'hugeicons-react';
import { useAgentSelectionStore } from '@/stores/use-agent-selection';


export default function AgentSelect({
	size = 'normal'
}: {
	size?: 'normal' | 'sm';
}) {
	const z3Context = useContext(Z3Context);
	const agents = z3Context?.agents || [];
	const changeAgent = useAgentActionsStore(s => s.changeAgent);
	const selectedAgent = useAgentSelectionStore(s => s.selectedAgent);

	return (
		<>
			<Select
				placeholder="Select a model"
				value={selectedAgent?.id || ''}
				onValueChange={(change: string) => changeAgent(change, z3Context as any)}
				triggerProps={{
					className: "h-10 text-sm bg-tertiary hover:bg-tertiary",
				}}
			>
				{agents.map((agent) => (
					<Select.Group key={agent.provider} label={agent.provider}>
						{agent.models.map((model) => (
							<Select.Item key={model.id} value={model.id}>
								<Model
									company={agent.provider}
									modelName={model.name}
									reasoning={model.features.reasoning}
									premium={model.features.premium}
								/>
							</Select.Item>
						))}
					</Select.Group>
				))}
			</Select>
		</>
	);
};

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
			default:
				return null;
		}
	})();

	return (
		<div className="flex items-center space-x-2 w-full">
			{Icon && <Icon className="w-4 h-4" />}
			<div className="flex-1 flex items-center justify-between gap-2">
				<span className="text-sm font-medium line-clamp-1">{modelName}</span>
				{premium && (
					<span className="text-xs text-muted-foreground ml-1 bg-colored/10 text-colored px-1 py-0.5 rounded">
						<CrownIcon size={12} />
					</span>
				)}
			</div>
		</div>
	);
}