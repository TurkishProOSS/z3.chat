import { InitZ3Schema, Z3Schema } from "@/lib/definitions";
import { api } from "./api";

export const initZ3 = async (): Promise<InitZ3Schema> => {
	const result = await api.get("/agents");
	return result.data as InitZ3Schema;
}

export const emptyZ3: Z3Schema = {
	agents: {},
	defaultAgent: null,
	selectedAgent: null,
	changeAgent: () => { },
	features: {
		search: false
	},
	setFeature: (feature: string, value: any) => { },
	prompt: '',
	isEnhancing: false,
	enhancePrompt: () => { },
	setPrompt: (prompt: string) => { },
	enhanceRemaining: 0,
	alert: null,
	setAlert: (alert: string | null) => { },
	setAlertDuration: (duration: number) => { },
	alertDuration: 5000
};