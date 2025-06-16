import { AgentModel } from "@/lib/definitions";
import axios from "axios";
import fs from "fs";

// export const agentModelSchema = z.object({
// 	id: z.string(),
// 	name: z.string(),
// 	description: z.string(),
// 	version: z.string().optional().nullable().default(null),
// 	features: z.object({
// 		vision: z.boolean().optional(),
// 		imageInput: z.boolean().optional(),
// 		imageGeneration: z.boolean().optional(),
// 		objectGeneration: z.boolean().optional(),
// 		toolUsage: z.boolean().optional(),
// 		toolStreaming: z.boolean().optional(),
// 		reasoning: z.boolean().optional(),
// 		pdfSupport: z.boolean().optional(),
// 		search: z.boolean().optional(),
// 		effortControl: z.boolean().optional(),
// 		fast: z.boolean().optional(),
// 		experimental: z.boolean().optional()
// 	}).partial().default({}),
// 	enabled: z.boolean(),
// 	available: z.boolean(),
// 	priority: z.number().int().min(0).max(100)
// });


(async () => {
	const providers = await axios.get("https://openrouter.ai/api/frontend/all-providers").then(res => res.data);
	const providersData = providers.data.map((provider: any) => ({ slug: provider.slug, displayName: provider.displayName }));

	const parseModel = (model: any) => {
		const provider = providersData.find((p: any) => p.slug === model?.author)?.displayName;
		const inputMods = model?.endpoint?.model?.input_modalities || model?.input_modalities;
		const outputMods = model?.endpoint?.model?.output_modalities || model?.output_modalities;
		const isReasoning = model?.reasoning_config !== null;
		const slug = model?.endpoint?.model?.slug || model?.permaslug;
		const name = model?.endpoint?.model?.short_name || model?.short_name;
		const description = model?.endpoint?.model?.description || model?.description;
		const is_free = model?.endpoint?.is_free || model.name.endsWith("(free)") || slug?.endsWith("free");


		const modelData = {
			id: slug,
			name,
			description,
			features: {
				vision: inputMods.includes("image"),
				imageInput: inputMods.includes("image"),
				imageGeneration: outputMods.includes("image"),
				objectGeneration: outputMods.includes("object"),
				toolUsage: inputMods.includes("tool"),
				toolStreaming: inputMods.includes("tool"),
				reasoning: isReasoning,
				pdfSupport: inputMods.includes("file"),
				search: inputMods.includes("search"),
				effortControl: inputMods.includes("effort_control"),
				fast: name.includes("fast"),
				experimental: name.includes("experimental") || name.includes("exp"),
				premium: !is_free
			},
			provider
		};

		return modelData;
	}

	const response = await axios.get("https://openrouter.ai/api/frontend/models/find").then(res => res.data);
	const models: AgentModel[] = [];
	const freeModels: AgentModel[] = [];
	response.data.models.map((model: any) => {
		try {
			const modelData = parseModel(model);
			models.push(modelData);
		} catch (error) {
			console.log(`${model.permaslug} - ${error}`);
		}
	});

	fs.writeFileSync("models.json", JSON.stringify(models, null, 4));
})();