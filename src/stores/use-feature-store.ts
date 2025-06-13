import { AgentModel } from '@/lib/definitions';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AgentFeatureState {
	setFeature: (feature: string, value: any) => void;
	features: {
		search: boolean;
	};
}

export const useAgentFeatureStore = create<AgentFeatureState>()(
	persist(
		(set) => ({
			setFeature: (feature, value) => {
				set((state) => ({
					...state,
					features: {
						...state.features,
						[feature]: value
					}
				}));
			},
			features: {
				search: false
			}
		}),
		{
			name: 'agent-feature-storage',
			storage: createJSONStorage(() => sessionStorage)
		}
	)
);