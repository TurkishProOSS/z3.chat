"use client";

import Sidebar from '@/layout/Sidebar';
import { usePathname } from 'next/navigation';

export default function Layout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	if (pathname.startsWith('/auth')) return children;

	return (
		<div className="flex min-h-screen">
			<Sidebar />
			<main className="flex-1 p-9 flex flex-col h-screen overflow-y-auto">
				{children}
			</main>
		</div>
	);
};