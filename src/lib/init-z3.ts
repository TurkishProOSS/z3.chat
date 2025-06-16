import { InitZ3Schema } from "@/lib/definitions";
import { getAgents, getDefaultAgent } from "@/lib/get-agents";

export const initZ3 = async (): Promise<InitZ3Schema> => {
	return {
		agents: await getAgents() as unknown as InitZ3Schema['agents'],
		defaultAgent: await getDefaultAgent()
	};
};