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
				className={cn("bg-primary sticky top-0 shrink-0 group h-screen flex flex-col justify-between p-6 border-r transition-all duration-300 ease-in-out", {
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
							['Account', <RiUser3Line size={48} className="text-foreground/60" />],
							['Customization', <RiBrushLine size={48} className="text-foreground/60" />],
							['History', <RiChatHistoryLine size={48} className="text-foreground/60" />],
							['Models', <RiChatSmileAiLine size={48} className="text-foreground/60" />],
							['ApiKeys', <RiKeyLine size={48} className="text-foreground/60" />],
						].map((item, index) => (
							<motion.div
								key={index}
								initial={a ? {} : { opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 0.1 * (index + 1) + 0.7 }}
								className={cn(item[2] || 'from-muted/20 to-muted/20', "rounded-2xl bg-gradient-to-br via-border p-px cursor-pointer")}
							>
								<Link href={`/settings/${String(item[0]).toLowerCase()}?a=1`} className={cn("bg-secondary rounded-2xl transition-colors p-4 flex items-center space-x-4", {
									'bg-orange-700': category === String(item[0]).toLowerCase(),
									'hover:bg-primary/50': category !== String(item[0]).toLowerCase(),
								})}>
									<div className="relative">
										<span className={cn("absolute inset-0 bg-gradient-to-tl from-secondary via-transparent", {
											'from-orange-700': category === String(item[0]).toLowerCase(),
										})} />
										{item[1]}
									</div>
									<div className="space-y-1">
										<h1 className="text-foreground leading-none text-lg">{t(`Categories.${item[0]}.Title`)}</h1>
										<p className="text-foreground/60 leading-none">{t(`Categories.${item[0]}.Description`)}</p>
									</div>
								</Link>
							</motion.div>
						))}
					</div>
				</div>
			</motion.div>
			<div className="w-full flex-1 h-full min-h-screen flex flex-col justify-between px-5 py-20 space-y-10">
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
					<h1 className="text-lg text-foreground font-medium">E-mail</h1>
					<p className="text-muted text-sm">E-mail adresiniz.</p>
				</div>
				<div className="col-span-2 py-5 pl-5 space-y-3">
					<Input label='Email' value="me@swoth.dev" disabled />
					<p className="text-muted text-sm">E-mail adresi değiştirilemez.</p>
				</div>
			</div>
			<div className="w-full grid grid-cols-3">
				<div className="border-r flex flex-col items-end pr-5 py-5">
					<h1 className="text-lg text-foreground font-medium">Parola</h1>
					<p className="text-muted text-sm">Şifrenizi güncelleyin.</p>
				</div>
				<div className="col-span-2 py-5 pl-5 space-y-3">
					<Input label='Eski şifre' type="password" />
					<Input label='Yeni şfire' type="password" />
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
					<div className="grid grid-cols-2 gap-3 w-full">
						<div className={cn("from-muted/40 via-border to-muted/40 rounded-2xl p-px", { "bg-gradient-to-br": false, "bg-orange-400": true /* active */ })}>
							<div className="bg-secondary rounded-2xl p-2">
								<ThemePreview
									background="bg-primary"
									sidebar="bg-primary"
									sidebarItems="bg-muted"
									border="border-border"
									prompt="bg-secondary"
									logo="bg-orange-600/50"
									circles="border-orange-600/25"
									button="bg-foreground"
								/>
							</div>
						</div>
						<div className="bg-gradient-to-br from-muted/40 via-border to-muted/40 rounded-2xl p-px">
							<div className="bg-secondary rounded-2xl p-2">
								<ThemePreview
									background="bg-white"
									sidebar="bg-white"
									sidebarItems="bg-muted"
									border="border-gray-300"
									prompt="bg-gray-200"
									logo="bg-orange-800/50"
									circles="border-orange-800/25"
									button="bg-primary"
								/>
							</div>
						</div>
					</div>
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
					<Select value="off">
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

function ThemePreview(props: {
	background: string;
	sidebar: string;
	sidebarItems: string;
	border: string;
	prompt: string;
	logo: string;
	circles: string;
	button: string;
}) {
	return (
		<div className={cn("w-full aspect-video overflow-hidden rounded-lg relative flex border", props.background)}>
			<span className={cn("absolute top-1 right-1 rounded-full h-2 w-4", props.button)} />
			<div className={cn("w-3 h-full shrink-0 border-r flex flex-col space-y-1 items-center py-1", props.sidebar, props.border)}>
				{Array.from({ length: 4 }).map((_, i) => (
					<span key={i} className={cn("w-1 h-1 block rounded-full", props.sidebarItems)} />
				))}
			</div>
			<div className="flex-1 flex flex-col items-center justify-center py-1">
				<div className="flex items-center justify-center flex-1">
					<div className={cn("border rounded-full p-2", props.circles)}>
						<div className={cn("border rounded-full p-2", props.circles)}>
							<span className={cn("w-2 h-2 rounded-full block", props.logo)} />
						</div>
					</div>
				</div>
				<span className={cn("block shrink-0 w-16 h-5 border rounded-lg", props.prompt, props.border)} />
			</div>
		</div>
	);
};