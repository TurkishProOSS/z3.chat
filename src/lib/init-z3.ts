import { InitZ3Schema } from "@/lib/definitions";
import { api } from "@/server/client";

export const initZ3 = async (): Promise<InitZ3Schema> => {
	const result = await api.agents.get();
	return result.data as InitZ3Schema;
}