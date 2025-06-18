'use client';

import { RiArrowLeftLine, RiUser3Line, RiBrushLine, RiKeyLine, RiBarChartLine, RiCodeLine } from '@remixicon/react';
import { useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useSession } from "@/hooks/use-session";
import { useTranslations } from "next-intl";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@colidy/ui-utils';
import { Logo } from '@/brand/Logo';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

import { AccountSettings } from './pages/account';
import { CustomizationSettings } from './pages/customization';
import { ApiKeysSettings } from './pages/apiket';
import { UsageSettings } from './pages/usage';
import { DevCredits } from './pages/dev';

const CATEGORIES = [
    ['Account', RiUser3Line],
    ['Customization', RiBrushLine],
    ['ApiKeys', RiKeyLine],
    ['Usage', RiBarChartLine]
];

export default function Settings() {
    const { data: session, isPending, refetch } = useSession();
    const [mount, setMount] = useState(false);
    const [load, setLoad] = useState(false);

    const t = useTranslations("SettingsPage");
    const router = useRouter();

    const { category } = useParams() || { category: 'account' };

    const searchParams = useSearchParams();
    const a = searchParams.get('a');

    useEffect(() => {
        setMount(true);
    }, []);

    useEffect(() => {
        if (isPending) return;

        if (!session || session?.user?.isAnonymous) {
            router.push('/auth/signin');
        } else {
            setLoad(true);
        }
    }, [isPending]);

    const isLoading = !load && (isPending || !session || session?.user?.isAnonymous);

    if (isLoading) return (
        <div className="flex h-screen w-full">
            <motion.div
                className="bg-primary sticky top-0 shrink-0 group h-screen hidden lg:flex flex-col justify-between p-6 border-r transition-all duration-300 ease-in-out"
                initial={{ width: 85 }}
            >
                <div className="w-full h-full space-y-10">
                    <div className="flex w-full grayscale-100">
                        <Logo size={36} />
                    </div>
                </div>
            </motion.div>
            <div className="flex-1 w-full h-full flex items-center justify-center">
                <div className="w-8 h-8 border border-muted rounded-full">
                    <div className="w-full h-full animate-spin relative flex justify-center">
                        <span className="w-2 h-2 bg-muted block rounded-full -translate-y-1/2" />
                    </div>
                </div>
            </div>
        </div>
    );

    const props = {
        session,
        isPending,
        refetch
    };

    return (
        <div className="flex">
            <motion.div
                className={cn("bg-primary hidden sticky top-0 shrink-0 group h-screen lg:flex flex-col justify-between p-6 border-r transition-all duration-300 ease-in-out", {
                    'bg-secondary': a,
                })}
                initial={a ? { width: '24rem' } : { width: 85 }}
                animate={{ width: '24rem', backgroundColor: 'var(--color-secondary)' }}
            >
                <div className="w-full h-full flex flex-col space-y-10">
                    <div className="flex w-full">
                        <AnimatePresence mode="wait">
                            {(!mount && !a) ? (
                                <motion.div
                                    key={"logo"}
                                    className="grayscale-100"
                                    exit={{ opacity: 0, scale: 1, y: -20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                >
                                    <Logo size={36} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={"arrow"}
                                    initial={a ? {} : { opacity: 0, scale: 1, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                >
                                    <Link href="/" className="text-muted cursor-pointer flex items-center space-x-2">
                                        <RiArrowLeftLine />
                                    </Link>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="space-y-2">
                        <motion.h1
                            initial={a ? {} : { opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-2xl text-foreground"
                        >
                            {t('Title')}
                        </motion.h1>
                        <motion.p
                            initial={a ? {} : { opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="text-muted max-w-64"
                        >
                            {t('Description')}
                        </motion.p>
                    </div>
                    <div className="space-y-3 flex-1">
                        {CATEGORIES.map((item, index) => {
                            const IconComp = item[1];
                            return (
                                <motion.div
                                    key={index}
                                    initial={a ? {} : { opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 * (index + 1) + 0.7 }}
                                    className={cn(item[2] || 'from-muted/20 to-muted/20', "rounded-2xl bg-gradient-to-br via-border p-px cursor-pointer")}
                                >
                                    <Link href={`/settings/${String(item[0]).toLowerCase()}?a=1`} className={cn("bg-secondary rounded-2xl transition-colors p-4 flex items-center space-x-4", {
                                        'bg-foreground': category === String(item[0]).toLowerCase(),
                                        'hover:bg-primary/50': category !== String(item[0]).toLowerCase(),
                                    })}>
                                        <div className={"relative " + (category === String(item[0]).toLowerCase() ? 'text-primary/60' : 'text-foreground/60')}>
                                            {category !== String(item[0]).toLowerCase() && <span className="absolute inset-0 bg-gradient-to-tl transition-all from-secondary via-transparent" />}
                                            <IconComp size={48} />
                                        </div>
                                        <div className="space-y-1">
                                            <h1 className={(category === String(item[0]).toLowerCase() ? 'text-primary' : 'text-foreground') + " leading-none text-lg"}>{t(`Categories.${item[0]}.Title`)}</h1>
                                            <p className={(category === String(item[0]).toLowerCase() ? 'text-primary/60' : 'text-foreground/60') + " leading-none"}>{t(`Categories.${item[0]}.Description`)}</p>
                                        </div>
                                    </Link>
                                </motion.div>
                            )
                        })}
                    </div>
                    <motion.div
                        initial={a ? {} : { opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-2xl bg-gradient-to-br via-border p-px cursor-pointer from-muted/20 to-muted/20"
                    >
                        <Link href={`/settings/devs?a=1`} className={cn("bg-secondary rounded-2xl transition-colors p-4 flex items-center space-x-4", {
                            'bg-foreground': category === 'devs',
                            'hover:bg-primary/50': category !== 'devs',
                        })}>
                            <div className={"relative " + (category === 'devs' ? 'text-primary/60' : 'text-foreground/60')}>
                                {category !== 'devs' && <span className="absolute inset-0 bg-gradient-to-tl transition-all from-secondary via-transparent" />}
                                <RiCodeLine size={48} />
                            </div>
                            <div className="space-y-1">
                                <h1 className={(category === 'devs' ? 'text-primary' : 'text-foreground') + " leading-none text-lg"}>{t(`Categories.Devs.Title`)}</h1>
                                <p className={(category === 'devs' ? 'text-primary/60' : 'text-foreground/60') + " leading-none"}>{t(`Categories.Devs.Description`)}</p>
                            </div>
                        </Link>
                    </motion.div>
                </div>
            </motion.div >
            <div className="w-full flex-1 h-full min-h-screen flex flex-col">
                <div className="lg:hidden flex flex-col p-3">
                    <Navbar sub={t("Title")} />
                </div>
                <div className="lg:hidden flex items-center gap-2 px-3 w-screen overflow-x-auto flex-wrap">
                    {[...CATEGORIES, ['Devs', RiCodeLine]].map((item, index) => {
                        const IconComp = item[1];
                        return (
                            <motion.div
                                key={index}
                                initial={a ? {} : { opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 * (index + 1) + 0.7 }}
                                className={cn(item[2] || 'from-muted/20 to-muted/20', "rounded-2xl bg-gradient-to-br via-border p-px cursor-pointer")}
                            >
                                <Link href={`/settings/${String(item[0]).toLowerCase()}?a=1`} className={cn("bg-secondary rounded-2xl transition-colors p-4 flex items-center space-x-4", {
                                    'bg-foreground': category === String(item[0]).toLowerCase(),
                                    'hover:bg-primary/50': category !== String(item[0]).toLowerCase(),
                                })}>
                                    <div className={"relative " + (category === String(item[0]).toLowerCase() ? 'text-primary/60' : 'text-foreground/60')}>
                                        {category !== String(item[0]).toLowerCase() && <span className="absolute inset-0 bg-gradient-to-tl transition-all from-secondary via-transparent" />}
                                        <IconComp size={20} />
                                    </div>
                                    <div className="space-y-1">
                                        <h1 className={(category === String(item[0]).toLowerCase() ? 'text-primary' : 'text-foreground') + " break-keep leading-none text-lg"}>{t(`Categories.${item[0]}.Title`)}</h1>
                                    </div>
                                </Link>
                            </motion.div>
                        )
                    })}
                </div>
                <div className="flex-1 flex flex-col justify-between px-2 lg:px-5 py-5 lg:py-20 space-y-10">
                    {category === 'account' && <AccountSettings {...props} />}
                    {category === 'customization' && <CustomizationSettings />}
                    {category === 'apikeys' && <ApiKeysSettings />}
                    {category === 'usage' && <UsageSettings />}
                    {category === 'devs' && <DevCredits />}
                </div>
            </div>
        </div >
    );
};