

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from './lib/auth';
import { headers } from 'next/headers';

export async function middleware(request: NextRequest) {
	const headersList = await headers();
	const session = await auth.api.getSession({ headers: headersList }).catch(() => null);

	if (!session || session?.user?.isAnonymous) return NextResponse.redirect(new URL('/auth/signin', request.url));
	return NextResponse.next();
}

export const config = {
	runtime: "nodejs",
	matcher: [
		'/settings',
		'/settings/:path*'
	],
}