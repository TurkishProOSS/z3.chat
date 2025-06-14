"use client";

import { authClient } from '@/lib/authClient';
import { Button } from '@/ui/Button';
import { Dropdown } from '@/ui/Dropdown';
import { Avatar } from '@/ui/Avatar';

export default function Navbar() {
	const { data: session, isPending } = authClient.useSession();

	const isAuthenticated = !!session && !isPending;

	const handleLogout = async () => {
		await authClient.signOut();
	};

	return (
		<nav className="flex justify-end items-center">
			{!isAuthenticated ? (
				<Button href="/auth/signin" className="rounded-full">Giriş Yap</Button>
			) : (
				<Dropdown>
					<Dropdown.Trigger asChild>
						<button className="!outline-none !ring-0 !border-0 !bg-transparent cursor-pointer select-none">
							<Avatar user={session.user as any} className="w-10 h-10 relative rounded-full overflow-hidden border-2 border-foreground border-dashed" />
						</button>
					</Dropdown.Trigger>
					<Dropdown.Content sideOffset={5} align="end">
						<Dropdown.Item>
							Profil
						</Dropdown.Item>
						<Dropdown.Separator />
						<Dropdown.Item>
							Ayarlar
						</Dropdown.Item>
						<Dropdown.Item>
							API Anahtarları
						</Dropdown.Item>
						<Dropdown.Separator />
						<Dropdown.Item>
							Upgrade to Plus
						</Dropdown.Item>
						<Dropdown.Separator />
						<Dropdown.Item>
							Yardım ve Destek
						</Dropdown.Item>
						<Dropdown.Item>
							Dökümanlar
						</Dropdown.Item>
						<Dropdown.Separator />
						<Dropdown.Item onClick={handleLogout}>
							Çıkış Yap
						</Dropdown.Item>
					</Dropdown.Content>
				</Dropdown>
			)}
		</nav>
	);
};