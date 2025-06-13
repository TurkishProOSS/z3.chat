import { AgentModel, agentModelSchema } from "@/lib/definitions";
import Elysia, { t } from "elysia";
import { version } from "os";

export const agents = new Elysia({ prefix: "/agents" })
	.get("/", () => {

		const OpenAI = [
			{
				id: "openai-o3-pro",
				name: "o3 Pro",
				available: true,
				enabled: true,
				description: "The o3 series of models are trained with reinforcement learning to think before they answer and perform complex reasoning.",
				features: {
					vision: true,
					effortControl: true,
					reasoning: true,
					pdfSupport: true,
					apiKeyRequired: true
				}
			},
			{
				id: "openai-o3",
				name: "o3",
				available: true,
				enabled: true,
				description: "o3 is a well-rounded and powerful model across domains.",
				features: {
					vision: true,
					pdfSupport: true,
					premium: true
				}
			},
			{
				id: "openai-o3-mini",
				name: "o3 Mini",
				available: true,
				enabled: false,
				description: "A small, fast, super smart reasoning model.",
				features: {
					reasoning: true,
					fast: true,
					experimental: true
				}
			},
			{
				id: "openai-gpt-4.1",
				name: "GPT-4.1",
				available: true,
				enabled: true,
				description: "GPT-4.1 is a flagship large language model optimized for advanced instruction following, real-world software engineering, and long-context reasoning.",
				features: {
					vision: true,
					reasoning: true
				}
			},
			{
				id: "openai-gpt-4.1-mini",
				name: "GPT-4.1 Mini",
				available: true,
				enabled: false,
				description: "GPT-4.1 Mini is a mid-sized model delivering performance competitive with GPT-4o at substantially lower latency.",
				features: {
					vision: true,
					reasoning: true
				}
			},
			{
				id: "openai-gpt-4o-mini",
				name: "GPT-4o Mini",
				available: true,
				enabled: false,
				description: "Like gpt-4o, but faster.",
				features: {
					vision: true,
					fast: true
				}
			},
			{
				id: "openai-gpt-imagegen",
				name: "GPT ImageGen",
				available: true,
				enabled: true,
				description: "OpenAI's latest and greatest image generation model, using lots of crazy tech like custom tools for text and reflections.",
				features: {
					imageGeneration: true,
					vision: true,
					premium: true
				}
			}
		];


		const Anthropic = [
			{
				id: "claude-3.5-sonnet",
				name: "Claude 3.5 Sonnet",
				available: true,
				enabled: false,
				description: "Anthropic's Claude 3.5 Sonnet model with reasoning capabilities.",
				features: {
					reasoning: true,
					vision: true
				}
			},
			{
				id: "claude-4-opus",
				name: "Claude 4 Opus",
				available: true,
				enabled: false,
				description: "Claude 4 Opus model by Anthropic, likely SOTA-level performance.",
				features: {
					reasoning: true,
					apiKeyRequired: true
				}
			},
			{
				id: "claude-4-sonnet",
				name: "Claude 4 Sonnet",
				available: true,
				enabled: false,
				description: "Claude 4 Sonnet with vision and reasoning.",
				features: {
					reasoning: true,
					vision: true
				}
			}
		];

		const Gemini = [
			{
				id: "gemini-2.0-flash",
				name: "Gemini 2.0 Flash",
				available: true,
				enabled: false,
				description: "Google's flagship model, known for speed and accuracy (and also web search!).",
				features: {
					vision: true,
					pdfSupport: true,
					search: true
				}
			},
			{
				id: "gemini-2.0-flash-lite",
				name: "Gemini 2.0 Flash Lite",
				available: true,
				enabled: false,
				description: "Similar to 2.0 Flash, but even faster.",
				features: {
					fast: true,
					vision: true,
					pdfSupport: true
				}
			},
			{
				id: "gemini-2.5-flash",
				name: "Gemini 2.5 Flash",
				available: true,
				enabled: true,
				description: "Google's latest fast model, known for speed and accuracy (and also web search!).",
				features: {
					vision: true,
					pdfSupport: true,
					search: true
				}
			},
			{
				id: "gemini-2.5-flash-thinking",
				name: "Gemini 2.5 Flash",
				available: true,
				enabled: false,
				description: "Google's latest fast model, but now it can think!",
				features: {
					vision: true,
					pdfSupport: true,
					search: true,
					effortControl: true,
					reasoning: true
				}
			},
			{
				id: "gemini-2.5-pro",
				name: "Gemini 2.5 Pro",
				available: true,
				enabled: true,
				description: "Google's most advanced model, excelling at complex reasoning and problem-solving.",
				features: {
					vision: true,
					pdfSupport: true,
					search: true,
					reasoning: true,
					effortControl: true
				}
			}
		];

		const DeepSeek = [
			{
				id: "deepseek-v3-fireworks",
				name: "DeepSeek V3",
				version: "Fireworks",
				available: true,
				enabled: false,
				description: "DeepSeek V3, a 685B-parameter, mixture-of-experts model, is the latest iteration of the flagship chat model family from the DeepSeek team.",
				features: {
					reasoning: true,
					vision: false,
					experimental: true
				}
			},
			{
				id: "deepseek-v3-0324",
				name: "DeepSeek V3",
				version: "0324",
				available: true,
				enabled: false,
				description: "685B MoE chat model trained by DeepSeek, released March 24. High performance, experimental model.",
				features: {
					reasoning: true,
					experimental: true
				}
			},
			{
				id: "deepseek-r1-openrouter",
				name: "DeepSeek R1",
				version: "OpenRouter",
				available: true,
				enabled: false,
				description: "The open source reasoning model that shook the whole industry.",
				features: {
					reasoning: true,
					experimental: true
				}
			},
			{
				id: "deepseek-r1-0528",
				name: "DeepSeek R1",
				version: "0528",
				available: true,
				enabled: false,
				description: "The May 28 version of DeepSeek R1, a fast, accurate open source reasoning model.",
				features: {
					reasoning: true,
					fast: true,
					experimental: true
				}
			}
		];


		const Meta = [
			{
				id: "llama-4-scout",
				name: "Llama 4 Scout",
				available: true,
				enabled: false,
				description: "Llama 4 Scout 17B Instruct (16E) is a MoE language model from Meta with 17B active params.",
				features: {
					experimental: true
				}
			},
			{
				id: "llama-4-maverick",
				name: "Llama 4 Maverick",
				available: true,
				enabled: false,
				description: "Llama 4 Maverick 17B Instruct (128E), high-capacity MoE model by Meta (400B total).",
				features: {
					vision: true,
					reasoning: true,
					experimental: true
				}
			},
			{
				id: "llama-3.3-70b",
				name: "Llama 3.3 70B",
				available: true,
				enabled: false,
				description: "70B version of Meta's LLaMA 3.3, likely distilled for performance.",
				features: {
					experimental: true
				}
			}
		];

		const Qwen = [
			{
				id: "qwen-2.5-32b",
				name: "Qwen 2.5 32B",
				available: true,
				enabled: false,
				description: "The other really good open source model from China.",
				features: {
					reasoning: true,
					experimental: true
				}
			},
			{
				id: "qwen-qwq-32b",
				name: "Qwen qwq-32B",
				available: true,
				enabled: false,
				description: "A surprisingly smart reasoning model that punches way above its weight.",
				features: {
					reasoning: true,
					experimental: true
				}
			}
		];

		const Grok = [
			{
				id: "grok-3",
				name: "Grok 3",
				available: true,
				enabled: false,
				description: "Grok 3 is the flagship model from xAI, designed for premium-level capabilities. Experimental.",
				features: {
					premium: true,
					experimental: true
				}
			},
			{
				id: "grok-3-mini",
				name: "Grok 3 Mini",
				available: true,
				enabled: false,
				description: "A lightweight model that thinks before responding. Grok 3 Mini delivers strong reasoning ability with efficient performance.",
				features: {
					reasoning: true,
					experimental: true
				}
			}
		];


		const agentMap = {
			OpenAI,
			Anthropic,
			Gemini,
			DeepSeek,
			Meta,
			Qwen,
			Grok
		};

		return {
			defaultAgent: Anthropic.at(0) as AgentModel,
			agents: agentMap
		};
	}, {
		response: t.Object({
			defaultAgent: t.Any(),
			agents: t.Any()
		})
	});