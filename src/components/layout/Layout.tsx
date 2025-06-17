"use client";

import HotkeysHelp from '@/layout/HotkeysHelp';
import Sidebar from '@/layout/Sidebar';
import Navbar from '@/layout/Navbar';

import { usePathname } from 'next/navigation';
import { authClient } from '@/lib/authClient';
import { useEffect } from 'react';

import { useFontStore } from '@/stores/use-font';
import { useSession } from "@/hooks/use-session";

export default function Layout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const { data: session, isPending } = useSession();
	const { codeFont, mainFont } = useFontStore();

	useEffect(() => {
		if (!isPending && !session) {
			authClient.signIn.anonymous();
		}
	}, [isPending, session]);

	if (['/auth', '/settings'].some(p => pathname.startsWith(p))) return (
		<div className={`w-full min-h-screen main-font-${mainFont} code-font-${codeFont}`}>
			{children}
		</div>
	);

	return (
		<div className={`flex min-h-screen main-font-${mainFont} code-font-${codeFont}`}>
			<Sidebar />
			<main className="flex-1 lg:p-9 p-3 pb-0 flex flex-col h-screen overflow-y-auto">
				<Navbar />
				{children}
				<HotkeysHelp />
			</main>
		</div>
	);
};