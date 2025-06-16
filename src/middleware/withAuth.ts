import { auth } from "@/lib/auth";
import { Session, User } from "better-auth";
import { UserWithAnonymous } from "better-auth/plugins";
import { cache } from "react";

export type WithAuthOptions = {
	forceAuth?: boolean;
	headers: Headers;
};

export type SessionData = {
	session: Session;
	user: UserWithAnonymous & {
		usage_enhance?: number
		usage_models?: number
		username?: string;
		interests?: string;
		tone?: string;
		bio?: string;
	};
}

const getAuth = cache(async (headers: Headers): Promise<SessionData | null> => {
	const session = await auth.api.getSession({ headers });
	if (!session || !session.session || !session.user) {
		return null;
	}
	return {
		session: session.session,
		user: session.user as SessionData["user"]
	};
});

export async function withAuth<T>(
	handler: (session: SessionData) => Promise<T>,
	options: WithAuthOptions = {
		headers: new Headers()
	}
): Promise<Response> {
	try {
		const session = await getAuth(options.headers);
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