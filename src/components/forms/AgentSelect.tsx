"use client";

import { useZ3 } from '@/hooks/use-z3';
import { Select } from '@/ui/Select';
import { motion } from 'motion/react';
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
	Grok
} from "@lobehub/icons";
import { RiExternalLinkLine, RiLink } from '@remixicon/react';


export default function AgentSelect({
	size = 'normal'
}: {
	size?: 'normal' | 'sm';
}) {
	const agents = useZ3((state) => state.agents);
	const activeAgent = useZ3((state) => state.selectedAgent);
	const changeAgent = useZ3((state) => state.changeAgent);

	const SHOW_AGENT_PER_PROVIDER = 2;
	const agentsCount = Object.values(agents)
		.reduce((acc, models) => acc + models.length, 0);
	const showedAgentSize = Object.values(agents)
		.reduce((acc, models) => acc + Math.min(models.length, SHOW_AGENT_PER_PROVIDER), 0);
	const notShowedAgentSize = agentsCount - showedAgentSize;

	return (
		<>
			<Select
				placeholder="Select a model"
				value={activeAgent?.id || ''}
				onValueChange={(change: string) => changeAgent(change)}
				triggerProps={{
					className: "h-10 text-sm bg-tertiary hover:bg-tertiary",
				}}
			>
				{Object.entries(agents)
					.map(([provider, _]) => {
						const models = Object.values(_).flat();
						if (models.length === 0) return null;

						return (
							<Select.Group key={provider} label={provider}>
								{models
									.slice(0, SHOW_AGENT_PER_PROVIDER)
									.map((agent) => (
										<Select.Item key={agent.id} value={agent.id}>
											<Model company={provider} modelName={agent.name} version={agent.version} />
										</Select.Item>
									))}
							</Select.Group>
						)
					})}
				<hr className="my-1 border-border" />
				{notShowedAgentSize > 0 && (
					<Select.Item>
						<span className="font-medium">Show {notShowedAgentSize} more models</span>
					</Select.Item>
				)}
			</Select>
		</>
	);
};

function Model({
	company,
	version,
	modelName
}: {
	company?: string;
	version?: string | null;
	modelName: string;
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
			default:
				return null;
		}
	})();

	return (
		<div className="flex items-center space-x-2 w-full">
			{Icon && <Icon className="w-4 h-4" />}
			<div className="flex-1 flex items-center justify-between">
				<span className="text-sm font-medium line-clamp-1">{modelName}</span>
				{version && (
					<span className="text-xs text-muted-foreground ml-1 bg-colored/10 text-colored px-1 py-0.5 rounded">
						{version}
					</span>
				)}
			</div>
		</div>
	);
}