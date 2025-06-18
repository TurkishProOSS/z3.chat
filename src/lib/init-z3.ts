import { AgentModel, InitZ3Schema } from "@/lib/definitions";
import { api } from "./api";

type A = {
	fallbackModel: AgentModel;
	providersWithModelCount: Record<string, number>;
	agents: AgentModel[];
};
export const initZ3 = async (): Promise<InitZ3Schema> => {
	const b = (await api.get<InitZ3Schema['agents']>('/models?selection=1', {
		headers: {
			'Cache-Control': 'no-cache'
		}
	}).then((res: any) => res.data?.data)) as A;


	return {
		agents: b.agents,
		defaultAgent: b.fallbackModel
	};
};