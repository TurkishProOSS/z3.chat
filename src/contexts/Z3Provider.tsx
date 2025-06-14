"use client";
import { agentModelSchema, InitZ3Schema, Z3Schema } from '@/lib/definitions';
import { emptyZ3 } from '@/lib/init-z3';
import { api } from '@/server/client';
import { useAgentSelectionStore } from '@/stores/use-agent-selection';
import { useAgentFeatureStore } from '@/stores/use-feature-store';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';

export const Z3Context = createContext<Z3Schema>(emptyZ3);
export const Z3Provider = ({ z3, children, }: {
	z3: InitZ3Schema;
	children: React.ReactNode;
}) => {
	const [alert, setAlert] = useState<string | null>(null);
	const [prompt, setPrompt] = useState<string>('');
	const [enhanceRemaining, setEnhanceRemaining] = useState<number>(0);
	const [isEnhancing, setIsEnhancing] = useState<boolean>(false);

	const defaultAgent = z3.defaultAgent || null;
	const selectedAgent = useAgentSelectionStore((state) => state.selectedAgent);
	const setSelectedAgent = useAgentSelectionStore((state) => state.setSelectedAgent);
	const setFeature = useAgentFeatureStore((state) => state.setFeature);
	const features = useAgentFeatureStore((state) => state.features);

	if (!z3) throw new Error('Z3Provider requires a z3 prop');

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

	const enhancePrompt = useCallback(() => {
		setIsEnhancing(true);

		api['prompt-enhancement'].post({
			prompt
		}).then((response) => {
			if (!response.data) return;
			if (!response.data.success) {
				setAlert(response.data.message || "An error occurred while enhancing the prompt.");
				return;
			}
			if (response.data?.remain) setEnhanceRemaining(response.data?.remain);
			if (response.data?.prompt) setPrompt(response.data?.prompt);
		}).finally(() => {
			setIsEnhancing(false);
		});
	}, [prompt, setIsEnhancing]);

	useEffect(() => {
		if (alert) {
			setTimeout(() => {
				setAlert(null);
			}, 5000);
		}
	}, [alert]);

	const z3ContextValue = useMemo(() => ({
		...z3,
		selectedAgent,
		changeAgent,
		defaultAgent,
		features,
		setFeature,
		prompt,
		setPrompt,
		isEnhancing,
		enhancePrompt,
		enhanceRemaining,
		alert,
		setAlert
	}), [z3, selectedAgent, changeAgent, features, setFeature, prompt, setPrompt, isEnhancing, enhancePrompt, enhanceRemaining]);

	return (
		<Z3Context.Provider
			value={z3ContextValue}
		>
			{children}
		</Z3Context.Provider>
	)
};