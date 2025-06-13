"use client";

import { useContext } from "react";
import { Z3Schema } from "@/lib/definitions";
import { Z3Context } from "@/contexts/Z3Provider";

export const useZ3 = <T>(callback: (data: Z3Schema) => T) => {
	try {
		const data = useContext(Z3Context);
		return callback(data);
	} catch (error) {
		return callback({
			agents: {},
			defaultAgent: null,
			selectedAgent: null,
			changeAgent: () => {
				console.warn("useZ3: No Z3Context found. Ensure you are using Z3Provider.");
			},
			features: {
				search: false,
			},
			setFeature: () => {
				console.warn("useZ3: No Z3Context found. Ensure you are using Z3Provider.");
			}
		});
	}
}
