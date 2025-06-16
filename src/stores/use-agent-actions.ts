import { create } from 'zustand';
import { AgentModel, InitZ3Schema } from '@/lib/definitions';
import { useAgentSelectionStore } from './use-agent-selection';

interface AgentActionsState {
	changeAgent: (agentId: string | null, z3: InitZ3Schema) => void;
}

export const useAgentActionsStore = create<AgentActionsState>()((set) => ({
	changeAgent: (agentId, z3) => {
		const { setSelectedAgent } = useAgentSelectionStore.getState();
		const defaultAgent = z3.defaultAgent || null;

		if (agentId === null) {
			if (!defaultAgent) {
				console.warn('No default agent available, setting to DefaultAgent');
				return;
			}
			setSelectedAgent(defaultAgent);
			return;
		}

		const agent = Object.values(z3.agents)
			.flatMap((agent) => agent.models)
			.find((a) => a.id === agentId);

		if (agent) {
			setSelectedAgent(agent as AgentModel);
		} else {
			console.warn(`Agent with id ${agentId} not found`);
		}
	},
})); 