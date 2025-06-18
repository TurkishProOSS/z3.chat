import { AgentModel } from "@/database/models/Models";
import { AgentModel as TAgentModel } from "@/lib/definitions";
import { withAuth } from "@/middleware/withAuth";
import { ObjectId } from "mongoose";
import { type NextRequest } from 'next/server';
import { categories } from "@/constants/categories";
import { Z3Cs } from "@/database/models/Z3Cs";


export const GET = async (
	request: NextRequest
) => {
	return await withAuth(async (session) => {
		const userPinnedAgents = session?.user?.pinned_agents || [];

		const categoriesWithZ3Cs = (await Promise.all(categories.map(async (category) => {
			const z3cs = await Z3Cs.find({ category: category }).sort({ createdAt: -1 }).limit(10).populate("author", "_id username image").lean().exec();
			return z3cs;
		})));

		return Response.json({
			success: true,
			message: "OK",
			data: {
				categories: categoriesWithZ3Cs.flat().reduce((acc: any, curr: any) => {
					if (!acc.find((c: any) => c.id === curr.category)) {
						acc.push({
							id: curr.category,
							z3cs: []
						});
					}

					acc.find((c: any) => c.id === curr.category).z3cs.push(curr);
					return acc;
				}, [])

			}
		});
	}, {
		forceAuth: false,
		headers: request.headers
	});
};