"use client";

import { useContext } from "react";
import { Z3Schema } from "@/lib/definitions";
import { Z3Context } from "@/contexts/Z3Provider";
import { emptyZ3 } from "@/lib/init-z3";

export const useZ3 = <T>(callback: (data: Z3Schema) => T) => {
	try {
		const data = useContext(Z3Context);
		return callback(data);
	} catch (error) {
		return callback(emptyZ3);
	}
}
