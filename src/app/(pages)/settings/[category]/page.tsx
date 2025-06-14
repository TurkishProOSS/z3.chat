'use client';

import { RiArrowLeftLine, RiUser3Line, RiBrushLine, RiChatHistoryLine, RiChatSmileAiLine, RiKeyLine } from '@remixicon/react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslations } from "next-intl";
import { useState, useEffect } from 'react';
import { cn } from '@colidy/ui-utils';
import { Logo } from '@/brand/Logo';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';

export default function Settings() {
    const [mount, setMount] = useState(false);
    const t = useTranslations("SettingsPage");

    const { category } = useParams() || { category: 'account' };

    const searchParams = useSearchParams();
    const a = searchParams.get('a');

    useEffect(() => {
        setMount(true);
    }, []);

    return (
        <div className="flex">
            <motion.div
                className={cn("bg-primary shrink-0 group h-screen flex flex-col justify-between p-6 border-r transition-all duration-300 ease-in-out", {
                    'bg-secondary': a,
                })}
                initial={a ? {} : { width: 85 }}
                animate={{ width: a ? undefined : '24rem', backgroundColor: 'var(--color-secondary)' }}
            >
                <div className="w-full h-full space-y-10">
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
                                    <Link href="/" className="text-muted flex items-center space-x-2">
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
                    <div className="space-y-3">
                        {[
                            ['Account', <RiUser3Line size={48} className="text-muted/50" />],
                            ['Customization', <RiBrushLine size={48} className="text-muted/50" />],
                            ['History', <RiChatHistoryLine size={48} className="text-muted/50" />],
                            ['Models', <RiChatSmileAiLine size={48} className="text-muted/50" />],
                            ['ApiKeys', <RiKeyLine size={48} className="text-muted/50" />],
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={a ? {} : { opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 * (index + 1) + 0.7 }}
                                className={cn(item[2] || 'from-muted/20 to-muted/20', "rounded-2xl bg-gradient-to-br via-border p-px cursor-pointer")}
                            >
                                <Link href={`/settings/${String(item[0]).toLowerCase()}?a=1`} className={cn("bg-secondary rounded-2xl transition-colors p-4 flex items-center space-x-4", {
                                    'bg-primary': category === String(item[0]).toLowerCase(),
                                    'hover:bg-primary/50': category !== String(item[0]).toLowerCase(),
                                })}>
                                    <div className="relative">
                                        <span className={cn("absolute inset-0 bg-gradient-to-tl from-secondary via-transparent", {
                                            'from-primary': category === String(item[0]).toLowerCase(),
                                        })} />
                                        {item[1]}
                                    </div>
                                    <div className="space-y-1">
                                        <h1 className="text-foreground leading-none text-lg">{t(`Categories.${item[0]}.Title`)}</h1>
                                        <p className="text-muted leading-none">{t(`Categories.${item[0]}.Description`)}</p>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
            <div className="w-full flex-1 h-full px-5 py-20 space-y-10">
                {category === 'account' && <AccountSettings />}
                {category === 'customization' && <CustomizationSettings />}
                {category === 'history' && <HistorySettings />}
                {category === 'models' && <ModelsSettings />}
                {category === 'apikeys' && <ApiKeysSettings />}
                <div className="flex justify-center items-center space-x-5">
                    <Button variant="link" className="text-muted">Sıfırla</Button>
                    <Button>Kaydet</Button>
                </div>
            </div>
        </div>
    );
};

function AccountSettings() {
    return (
        <div className="w-full max-w-2xl h-full mx-auto flex flex-col space-y-10">
            <div className="w-full grid grid-cols-3">
                <div className="border-r flex flex-col items-end pr-5 py-5">
                    <h1 className="text-lg text-foreground font-medium">Kullanıcı Adı</h1>
                    <p className="text-muted text-sm">Kullanıcı adınızı değiştirin.</p>
                </div>
                <div className="col-span-2 py-5 pl-5 space-y-3">
                    <Input label='Kullanıcı Adı' value="swoth" />
                </div>
            </div>
            <div className="w-full grid grid-cols-3">
                <div className="border-r flex flex-col items-end pr-5 py-5">
                    <h1 className="text-lg text-foreground font-medium">İlgi Alanın</h1>
                    <p className="text-muted text-sm">Ne iş yapıyorsun?</p>
                </div>
                <div className="col-span-2 py-5 pl-5 space-y-3">
                    <Input label='İlgi Alanın' value="öğrenci baba" />
                    <p className="text-muted text-sm">mühendis, geliştirici, öğrenci, vb.</p>
                </div>
            </div>
            <div className="w-full grid grid-cols-3">
                <div className="border-r flex flex-col items-end pr-5 py-5">
                    <h1 className="text-lg text-foreground font-medium">Konuşma Tarzı</h1>
                    <p className="text-muted text-sm">Z3 seninle nasıl konuşmalı?</p>
                </div>
                <div className="col-span-2 py-5 pl-5 space-y-3">
                    <Input label='Konuşma Tarzı' value="kısa ve net amk" />
                    <p className="text-muted text-sm">şakacı, ciddi, net, detaylı, vb.</p>
                </div>
            </div>
            <div className="w-full grid grid-cols-3">
                <div className="border-r flex flex-col items-end pr-5 py-5">
                    <h1 className="text-lg text-foreground font-medium">Hakkında</h1>
                    <p className="text-muted text-sm">Z3 senin hakkında ne bilmeli?</p>
                </div>
                <div className="col-span-2 py-5 pl-5 space-y-3">
                    <Textarea label='Hakkında' />
                    <p className="text-muted text-sm">Z3'e kısaca nasıl biri olduğunu anlat.</p>
                </div>
            </div>
        </div>
    );
};

function CustomizationSettings() {
    return (
        <div className="w-full max-w-2xl h-full mx-auto flex flex-col space-y-10">
            <div className="w-full grid grid-cols-3">
                <div className="border-r flex flex-col items-end pr-5 py-5">
                    <h1 className="text-lg text-foreground font-medium">Tema</h1>
                    <p className="text-muted text-sm">Renk temasını değiştirin.</p>
                </div>
                <div className="col-span-2 py-5 pl-5 space-y-3">
                    grid
                </div>
            </div>
            <div className="w-full grid grid-cols-3">
                <div className="border-r flex flex-col items-end pr-5 py-5">
                    <h1 className="text-lg text-foreground font-medium">Yazı Tipi</h1>
                    <p className="text-muted text-sm">Genel yazı tipini değiştirin.</p>
                </div>
                <div className="col-span-2 py-5 pl-5 space-y-1.5">
                    <p className="text-muted text-sm">Genel Yazı Tipi</p>
                    <Select
                        placeholder="Yazı tipi seçin"
                        value='lufga'
                    >
                        <Select.Item value="lufga">
                            Lufga
                        </Select.Item>
                        <Select.Item value="inter">
                            Inter
                        </Select.Item>
                        <Select.Item value="roboto">
                            Roboto
                        </Select.Item>
                        <Select.Item value="montserrat">
                            Montserrat
                        </Select.Item>
                    </Select>
                    <p className="text-muted text-sm pt-3">Kod Yazı Tipi</p>
                    <Select
                        placeholder="Yazı tipi seçin"
                        value='lufga'
                    >
                        <Select.Item value="lufga">
                            Lufga
                        </Select.Item>
                        <Select.Item value="inter">
                            Inter
                        </Select.Item>
                        <Select.Item value="roboto">
                            Roboto
                        </Select.Item>
                        <Select.Item value="montserrat">
                            Montserrat
                        </Select.Item>
                    </Select>
                </div>
            </div>
            <div className="w-full grid grid-cols-3">
                <div className="border-r flex flex-col items-end pr-5 py-5">
                    <h1 className="text-lg text-foreground font-medium">İstatistikler</h1>
                    <p className="text-muted text-sm">İnekler için bazı veriler.</p>
                </div>
                <div className="col-span-2 py-5 pl-5 space-y-3">
                    <Select value="on">
                        <Select.Item value="on">
                            Açık
                        </Select.Item>
                        <Select.Item value="off">
                            Kapalı
                        </Select.Item>
                    </Select>
                </div>
            </div>
        </div>
    );
};

function HistorySettings() {
    return (
        <div className="w-full max-w-2xl h-full mx-auto flex flex-col space-y-10">
            <div className="w-full grid grid-cols-3">
                <div className="border-r flex flex-col items-end pr-5 py-5">
                    <h1 className="text-lg text-foreground font-medium">Geçmişi Temizle</h1>
                    <p className="text-muted text-sm">Kullanım geçmişini temizle.</p>
                </div>
                <div className="col-span-2 py-5 pl-5 space-y-3">
                    <Button>Temizle</Button>
                    <p className="text-muted text-sm">Temizleme işlemi geri alınamaz!</p>
                </div>
            </div>
            <div className="w-full grid grid-cols-3">
                <div className="border-r flex flex-col items-end pr-5 py-5">
                    <h1 className="text-lg text-foreground font-medium">Geçmiş</h1>
                    <p className="text-muted text-sm">Kullanım geçmişiniz.</p>
                </div>
                <div className="col-span-2 py-5 pl-5 space-y-3">
                    list
                </div>
            </div>
        </div>
    );
};

function ModelsSettings() {
    return (
        <div className="w-full max-w-2xl h-full mx-auto flex flex-col space-y-10">
            <div className="w-full grid grid-cols-3">
                <div className="border-r flex flex-col items-end pr-5 py-5">
                    <h1 className="text-lg text-foreground font-medium">bilmem</h1>
                    <p className="text-muted text-sm">tasarım bulamadım.</p>
                </div>
                <div className="col-span-2 py-5 pl-5 space-y-3">
                    öyle
                </div>
            </div>
        </div>
    );
};

function ApiKeysSettings() {
    return (
        <div className="w-full max-w-2xl h-full mx-auto flex flex-col space-y-10">
            <div className="w-full grid grid-cols-3">
                <div className="border-r flex flex-col items-end pr-5 py-5">
                    <h1 className="text-lg text-foreground font-medium">OpenAI</h1>
                    <p className="text-muted text-sm">OpenAI API anahtarınız.</p>
                </div>
                <div className="col-span-2 py-5 pl-5 space-y-3">
                    <Input label='Anahtar' value="dassak" />
                </div>
            </div>
            <div className="w-full grid grid-cols-3">
                <div className="border-r flex flex-col items-end pr-5 py-5">
                    <h1 className="text-lg text-foreground font-medium">Gemini</h1>
                    <p className="text-muted text-sm">Gemini API anahtarınız.</p>
                </div>
                <div className="col-span-2 py-5 pl-5 space-y-3">
                    <Input label='Anahtar' value="dassak" />
                </div>
            </div>
            <div className="w-full grid grid-cols-3">
                <div className="border-r flex flex-col items-end pr-5 py-5">
                    <h1 className="text-lg text-foreground font-medium">Claude</h1>
                    <p className="text-muted text-sm">Claude API anahtarınız.</p>
                </div>
                <div className="col-span-2 py-5 pl-5 space-y-3">
                    <Input label='Anahtar' value="dassak" />
                </div>
            </div>
        </div>
    );
};