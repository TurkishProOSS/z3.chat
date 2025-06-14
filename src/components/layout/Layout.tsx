"use client";

import Sidebar from '@/layout/Sidebar';
import Navbar from '@/layout/Navbar';
import { usePathname } from 'next/navigation';
import { authClient } from '@/lib/authClient';
import { useEffect } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const { data: session, isPending } = authClient.useSession();

	useEffect(() => {
		if (!isPending && !session) {
			authClient.signIn.anonymous();
		}
	}, [isPending, session]);

	if (['/auth', '/settings'].some(p => pathname.startsWith(p))) return children;

	return (
		<div className="flex min-h-screen">
			<Sidebar />
			<main className="flex-1 p-9 flex flex-col h-screen overflow-y-auto">
				<Navbar />
				{children}
			</main>
		</div>
	);
};