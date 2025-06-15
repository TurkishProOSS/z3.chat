import { AgentModel } from '@/lib/definitions';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AgentSelectionState {
	selectedAgent: AgentModel | null;
	setSelectedAgent: (agent: AgentModel | null) => void;
}

export const useAgentSelectionStore = create<AgentSelectionState>()(
	persist(
		(set) => ({
			selectedAgent: null,
			setSelectedAgent: (agent) => set({ selectedAgent: agent }),
		}),
		{
			name: 'agent-selection',
			storage: createJSONStorage(() => localStorage)
		}
	)
);