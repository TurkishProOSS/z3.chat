"use client";

import { useParams, usePathname } from 'next/navigation';
import { useHotkeys } from 'react-hotkeys-hook';
import { authClient } from '@/lib/authClient';
import { RiMenuLine } from '@remixicon/react';
import { Dropdown } from '@/ui/Dropdown';
import { Dialog } from '../ui/Dialog';
import { Button } from '@/ui/Button';
import { Avatar } from '@/ui/Avatar';
import { useState } from 'react';
import { api } from '@/lib/api';
import Input from '../ui/Input';
import Link from 'next/link';

import { useMounted } from '@/hooks/use-mounted';
import { useSession } from "@/hooks/use-session";

export default function Navbar({
    showChat = false,
    rightContent,
    leftContent,
    sub
}: {
    showChat?: boolean;
    rightContent?: React.ReactNode;
    leftContent?: React.ReactNode;
    sub?: string;
}) {
    const pathname = usePathname();
    const params = useParams();

    return (!showChat && pathname === ('/chats/' + params?.conversationId)) ? null : (
        <nav className="sticky top-0 flex justify-between items-center gap-2">
            <div className="flex items-center gap-2">
                <div className="lg:hidden w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                    <SidebarMenu />
                </div>
                <Link href="/">
                    <h1 className="text-lg lg:hidden font-medium text-foreground">
                        z3c<span className="font-normal opacity-50">.dev</span>
                    </h1>
                </Link>
                {sub && <>
                    <span className="text-sm lg:hidden text-muted select-none pointer-events-none">{'/'}</span>
                    <h1 className="text-sm font-normal lg:hidden text-foreground">
                        {sub}
                    </h1>
                </>}
                {leftContent}
            </div>
            <div className="flex items-center gap-4">
                {rightContent || (
                    <>
                        <div className="w-8 h-8 hidden lg:flex items-center justify-center">
                            <span className="font-mono shadow-[inset_0_-2px_4px_var(--color-primary)] text-sm bg-secondary border border-b-4 rounded-md py-1 px-3">P</span>
                        </div>
                        <UserMenu />
                    </>
                )}
            </div>
        </nav>
    );
};

export const SidebarMenu = () => {
    const [open, setOpen] = useState(false);

    return (
        <Dropdown open={open} onOpenChange={setOpen}>
            <Dropdown.Trigger asChild>
                <button className="!outline-none !ring-0 !border-0 !bg-transparent cursor-pointer select-none text-foreground">
                    <RiMenuLine size={20} />
                </button>
            </Dropdown.Trigger>
            <Dropdown.Content sideOffset={5} align="end">
                <Dropdown.Item>
                    item
                </Dropdown.Item>
            </Dropdown.Content>
        </Dropdown>
    )
};

export const UserMenu = () => {
    const { data: session, isPending } = useSession();
    const mounted = useMounted();
    const isAuthenticated = mounted && (!!session && !isPending && session.user && !session.user.isAnonymous);
    const [open, setOpen] = useState(false);

    useHotkeys('p', () => setOpen(!open));

    if (!isAuthenticated) return (
        <Button href="/auth/signin" className="rounded-full">Giriş Yap</Button>
    );

    const handleLogout = async () => {
        await authClient.signOut();
    };

    return (
        <Dropdown open={open} onOpenChange={setOpen}>
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
                    <Link href="/settings"> {/* test */}
                        Ayarlar
                    </Link>
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
    )
}