import { auth } from "@/lib/auth";
import { Session, User } from "better-auth";

export type WithAuthOptions = {
	forceAuth?: boolean;
	headers: Headers;
};

export type SessionData = {
	session: Session;
	user: User;
}

export async function withAuth<T>(
	handler: (session: SessionData) => Promise<T>,
	options: WithAuthOptions = {
		headers: new Headers()
	}
): Promise<Response> {
	try {
		const session = await auth.api.getSession({ headers: options.headers });
		if (!session && options.forceAuth) {
			return new Response(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
			});
		}

		if ((!session?.session && !session?.user) && options.forceAuth) {
			return new Response(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
			});
		}

		const result = await handler(session as SessionData);
		if (result instanceof Response) return result;
		return new Response(JSON.stringify(result), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: "Internal Server Error" }), {
			status: 500,
		});
	}
}