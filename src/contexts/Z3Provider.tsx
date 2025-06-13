"use client";
import { agentModelSchema, InitZ3Schema, Z3Schema } from '@/lib/definitions';
import { useAgentSelectionStore } from '@/stores/use-agent-selection';
import { useAgentFeatureStore } from '@/stores/use-feature-store';
import { createContext, useMemo } from 'react';
import { z } from 'zod';

export const Z3Context = createContext<Z3Schema>({
	agents: {},
	defaultAgent: null,
	selectedAgent: null,
	changeAgent: () => { },
	features: {
		search: false
	},
	setFeature: (feature: string, value: any) => { }
});
export const Z3Provider = ({ z3, children, }: {
	z3: InitZ3Schema;
	children: React.ReactNode;
}) => {
	const defaultAgent = z3.defaultAgent || null;
	const selectedAgent = useAgentSelectionStore((state) => state.selectedAgent);
	const setSelectedAgent = useAgentSelectionStore((state) => state.setSelectedAgent);
	const setFeature = useAgentFeatureStore((state) => state.setFeature);
	const features = useAgentFeatureStore((state) => state.features);


	if (!z3) {
		throw new Error('Z3Provider requires a z3 prop');
	}

	const changeAgent = (agentId: string | null) => {
		if (agentId === null) {
			if (!defaultAgent) {
				console.warn('No default agent available, setting to DefaultAgent');
				return;
			};

			setSelectedAgent(defaultAgent);
			return;
		}

		const agent = Object.values(z3.agents)
			.flat().find((a) => a.id === agentId);
		if (agent) setSelectedAgent(agent);
		console.log(`Changed agent to: ${agent?.name || 'None'}`);
		if (!agent) console.warn(`Agent with id ${agentId} not found`);
	};

	useMemo(() => {
		if (!selectedAgent) changeAgent(defaultAgent?.id || null);
	}, [selectedAgent, defaultAgent, setSelectedAgent]);

	const z3ContextValue = useMemo(() => ({
		...z3,
		selectedAgent,
		changeAgent,
		defaultAgent,
		features,
		setFeature
	}), [z3, selectedAgent, changeAgent, features, setFeature]);

	return (
		<Z3Context.Provider
			value={z3ContextValue}
		>
			{children}
		</Z3Context.Provider>
	)
};