"use client";

import { useState } from 'react';

export default function Navbar() {
	const [selectedModel, setSelectedModel] = useState<string>("gpt-3.5-turbo");

	const agentModels = [
		{ name: "gpt-3.5-turbo", description: "GPT-3.5 Turbo" },
		{ name: "gpt-4", description: "GPT-4" },
		{ name: "gpt-4-vision-preview", description: "GPT-4 Vision" },
		{ name: "gpt-4o", description: "GPT-4 Turbo" },
		{ name: "gpt-4o-mini", description: "GPT-4 Turbo Mini" },
		{ name: "gemini-2.5-pro", description: "Gemini 2.5 Pro" },
		{ name: "claude-2", description: "Claude 2" },
		{ name: "claude-3", description: "Claude 3" },
		{ name: "claude-3-opus", description: "Claude 3 Opus" },
	]
	return (
		<div className="flex justify-between items-center mb-6">
			Agent Select
		</div>
	);
};