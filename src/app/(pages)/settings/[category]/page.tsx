'use client';

import { RiArrowLeftLine, RiUser3Line, RiBrushLine, RiChatHistoryLine, RiChatSmileAiLine, RiKeyLine } from '@remixicon/react';
import { useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useSession } from "@/hooks/use-session";
import { useFontStore } from '@/stores/use-font';
import Textarea from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { authClient } from '@/lib/authClient';
import { useTranslations } from "next-intl";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import { useTheme } from 'next-themes';
import { cn } from '@colidy/ui-utils';
import { Logo } from '@/brand/Logo';
import Link from 'next/link';
import { useAPI } from '../../../../../hooks/use-api';

type IProps = {
	session?: ReturnType<typeof useSession>['data'];
	refetch: () => void;
	isPending: boolean;
};

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
				className="bg-primary sticky top-0 shrink-0 group h-screen flex flex-col justify-between p-6 border-r transition-all duration-300 ease-in-out"
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
									<button
										className="text-muted cursor-pointer flex items-center space-x-2"
										onClick={() => router.back()}
									>
										<RiArrowLeftLine />
									</button>
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
							['Account', <RiUser3Line size={48} />],
							['Customization', <RiBrushLine size={48} />],
							['ApiKeys', <RiKeyLine size={48} />],
						].map((item, index) => (
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
										{item[1]}
									</div>
									<div className="space-y-1">
										<h1 className={(category === String(item[0]).toLowerCase() ? 'text-primary' : 'text-foreground') + " leading-none text-lg"}>{t(`Categories.${item[0]}.Title`)}</h1>
										<p className={(category === String(item[0]).toLowerCase() ? 'text-primary/60' : 'text-foreground/60') + " leading-none"}>{t(`Categories.${item[0]}.Description`)}</p>
									</div>
								</Link>
							</motion.div>
						))}
					</div>
				</div>
			</motion.div >
			<div className="w-full flex-1 h-full min-h-screen flex flex-col">
                <div className="lg:hidden bg-secondary border-b py-3 px-4 flex items-center space-x-2">
                    <button
                        className="text-muted cursor-pointer flex items-center space-x-2"
                        onClick={() => router.back()}
                    >
                        <RiArrowLeftLine size={20} />
                    </button>
                    <h1 className="text-lg text-foreground leading-none">{t("Title")}</h1>
                </div>
				<div className="flex-1 flex flex-col justify-between px-2 lg:px-5 py-5 lg:py-20 space-y-10">
                    {category === 'account' && <AccountSettings {...props} />}
                    {category === 'customization' && <CustomizationSettings {...props} />}
                    {category === 'apikeys' && <ApiKeysSettings {...props} />}
                </div>
			</div>
		</div >
	);
};

function AccountSettings({ session, refetch, isPending }: IProps) {
	const [submitable, setSubmittable] = useState(false);
	const [submiting, setSubmiting] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const [username, setUsername] = useState<string>(String(session?.user?.username || ''));
	const [oldpass, setOldpass] = useState<string>('');
	const [newpass, setNewpass] = useState<string>('');

	const [interests, setInterests] = useState<string>(String(session?.user?.interests || ''));
	const [tone, setTone] = useState<string>(String(session?.user?.tone || ''));
	const [bio, setBio] = useState<string>(String(session?.user?.bio || ''));

	useEffect(() => {
		if (!oldpass) setNewpass('');

		const newErrs = {
			username: username.length < 3 ? 'Kullanıcı adı en az 3 karakter olmalıdır.' :
				username.length > 32 ? 'Kullanıcı adı en fazla 32 karakter olmalıdır.' :
					username.replace(/[a-z0-9-_]/gi, '').length > 0 ? 'Kullanıcı adı sadece harf, rakam, tire ve alt çizgi içerebilir.' : '',
			password: !oldpass ? '' :
				newpass.length < 8 ? 'Yeni şifre en az 8 karakter olmalıdır.' :
					newpass.length > 64 ? 'Yeni şifre en fazla 64 karakter olmalıdır.' :
						!newpass.match(/[a-z]/) ? 'Yeni şifre en az bir küçük harf içermelidir.' :
							!newpass.match(/[A-Z]/) ? 'Yeni şifre en az bir büyük harf içermelidir.' :
								!newpass.match(/[0-9]/) ? 'Yeni şifre en az bir rakam içermelidir.' :
									'',
			interests: interests?.length > 64 ? 'İlgi alanı en fazla 64 karakter olmalıdır.' : '',
			tone: tone?.length > 24 ? 'Konuşma tarzı en fazla 24 karakter olmalıdır.' : '',
			bio: bio?.length > 256 ? 'Hakkında en fazla 256 karakter olmalıdır.' : '',
		};

		setErrors(newErrs);
		setSubmittable(Object.values(newErrs).filter(e => !!e).length === 0 ? true : false);
	}, [username, oldpass, newpass, interests, tone, bio]);

	const handleReset = () => {
		setUsername(String(session?.user?.username || ''));
		setOldpass('');
		setNewpass('');
		setInterests(String(session?.user?.interests || ''));
		setTone(String(session?.user?.tone || ''));
		setBio(String(session?.user?.bio || ''));
	};

	const handleSubmit = async () => {
		if (submiting) return;
		setSubmiting(true);

		if (oldpass && newpass) await authClient.changePassword({
			currentPassword: oldpass,
			newPassword: newpass,
			revokeOtherSessions: true
		});

		if (username || interests || tone || bio) await authClient.updateUser({
			username,
			interests,
			tone,
			bio
		} as any);

		refetch();
		await new Promise(r => {
			let i: any;
			i = setInterval(() => {
				if (isPending) return;
				clearInterval(i);
				r(true);
			}, 1000);
		});

		handleReset();
		setSubmiting(false);
	};

	return (
		<>
			<div className="w-full max-w-2xl h-full mx-auto flex flex-col space-y-10">
				<div className="w-full grid grid-cols-3">
					<div className="border-r flex flex-col items-end pr-5 py-5 text-right">
						<h1 className="text-lg text-foreground font-medium">Kullanıcı Adı</h1>
						<p className="text-muted text-sm">Kullanıcı adınızı değiştirin.</p>
					</div>
					<div className="col-span-2 py-5 pl-5 space-y-3">
						<Input label='Kullanıcı Adı' disabled={submiting} value={username} onChange={e => setUsername(e.target.value)} />
						<AnimatePresence>
							{errors?.username && <motion.p initial={{ opacity: 0 }} exit={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-orange-400 text-sm">{errors.username}</motion.p>}
						</AnimatePresence>
					</div>
				</div>
				<div className="w-full grid grid-cols-3">
					<div className="border-r flex flex-col items-end pr-5 py-5 text-right">
						<h1 className="text-lg text-foreground font-medium">E-mail</h1>
						<p className="text-muted text-sm">E-mail adresiniz.</p>
					</div>
					<div className="col-span-2 py-5 pl-5 space-y-3">
						<Input label='Email' value={session?.user?.email || '???'} disabled />
						<p className="text-muted text-sm">E-mail adresi değiştirilemez.</p>
					</div>
				</div>
				<div className="w-full grid grid-cols-3">
					<div className="border-r flex flex-col items-end pr-5 py-5 text-right">
						<h1 className="text-lg text-foreground font-medium">Parola</h1>
						<p className="text-muted text-sm">Şifrenizi güncelleyin.</p>
					</div>
					<div className="col-span-2 py-5 pl-5 space-y-3">
						<Input label='Eski şifre' value={oldpass} onChange={e => setOldpass(e.target.value)} type="password" disabled={submiting} />
						<Input label='Yeni şfire' value={newpass} onChange={e => setNewpass(e.target.value)} type="password" disabled={!oldpass || submiting} />
						<AnimatePresence>
							{errors?.password && <motion.p initial={{ opacity: 0 }} exit={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-orange-400 text-sm">{errors.password}</motion.p>}
						</AnimatePresence>
					</div>
				</div>
				<div className="w-full grid grid-cols-3">
					<div className="border-r flex flex-col items-end pr-5 py-5 text-right">
						<h1 className="text-lg text-foreground font-medium">İlgi Alanın</h1>
						<p className="text-muted text-sm">Ne iş yapıyorsun?</p>
					</div>
					<div className="col-span-2 py-5 pl-5 space-y-3">
						<Input label='İlgi Alanın' disabled={submiting} value={interests} onChange={e => setInterests(e.target.value)} />
						<p className="text-muted text-sm">mühendis, geliştirici, öğrenci, vb.</p>
						<AnimatePresence>
							{errors?.interests && <motion.p initial={{ opacity: 0 }} exit={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-orange-400 text-sm">{errors.interests}</motion.p>}
						</AnimatePresence>
					</div>
				</div>
				<div className="w-full grid grid-cols-3">
					<div className="border-r flex flex-col items-end pr-5 py-5 text-right">
						<h1 className="text-lg text-foreground font-medium">Konuşma Tarzı</h1>
						<p className="text-muted text-sm">Z3 seninle nasıl konuşmalı?</p>
					</div>
					<div className="col-span-2 py-5 pl-5 space-y-3">
						<Input label='Konuşma Tarzı' disabled={submiting} value={tone} onChange={e => setTone(e.target.value)} />
						<p className="text-muted text-sm">şakacı, ciddi, net, detaylı, vb.</p>
						<AnimatePresence>
							{errors?.tone && <motion.p initial={{ opacity: 0 }} exit={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-orange-400 text-sm">{errors.tone}</motion.p>}
						</AnimatePresence>
					</div>
				</div>
				<div className="w-full grid grid-cols-3">
					<div className="border-r flex flex-col items-end pr-5 py-5 text-right">
						<h1 className="text-lg text-foreground font-medium">Hakkında</h1>
						<p className="text-muted text-sm">Z3 senin hakkında ne bilmeli?</p>
					</div>
					<div className="col-span-2 py-5 pl-5 space-y-3">
						<Textarea label='Hakkında' disabled={submiting} value={bio} onChange={e => setBio(e.target.value)} />
						<p className="text-muted text-sm">Z3'e kısaca nasıl biri olduğunu anlat.</p>
						<AnimatePresence>
							{errors?.bio && <motion.p initial={{ opacity: 0 }} exit={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-orange-400 text-sm">{errors.bio}</motion.p>}
						</AnimatePresence>
					</div>
				</div>
			</div>
			<div className="flex justify-center items-center space-x-5 sticky bottom-0 py-3 bg-gradient-to-t from-primary via-primary/50">
				<div className="rounded-2xl h-11 px-5 backdrop-blur bg-primary/50 flex items-center justify-center">
					<Button onClick={handleReset} disabled={submiting} variant="link" className="text-muted">Sıfırla</Button>
				</div>
				<div className="rounded-2xl bg-primary">
					<Button onClick={handleSubmit} disabled={!submitable || submiting} isLoading={submiting}>Kaydet</Button>
				</div>
			</div>
		</>
	);
};

function CustomizationSettings({ session }: IProps) {
	const [viewMcMode, setViewMcMode] = useState(false);
	const [mcMode, setMcMode] = useState(false);

	const { theme, setTheme } = useTheme();
	const { codeFont, mainFont, setCodeFont, setMainFont } = useFontStore();

	useEffect(() => {
		if (theme !== 'pixel') return;
		setMainFont('lufga');

		setMcMode(true);
		setViewMcMode(true);
	}, [theme]);

	return (
		<div className="w-full max-w-2xl h-full mx-auto flex flex-col space-y-10">
			<div className="w-full grid grid-cols-3">
				<div className="border-r flex flex-col items-end pr-5 py-5 text-right">
					<h1 className="text-lg text-foreground font-medium">Tema</h1>
					<p className="text-muted text-sm">Renk temasını değiştirin.</p>
				</div>
				<div className="col-span-2 py-5 pl-5 space-y-3">
					<div className="grid grid-cols-2 gap-3 w-full">
						{['dark', 'light'].map((t, i) => (
							<motion.a onClick={() => setTheme(t)} whileHover={{ scale: theme === t ? 1 : 0.95 }} key={i} className={cn("cursor-pointer from-muted/40 via-border to-muted/40 rounded-2xl p-px", { "bg-gradient-to-br": theme !== t, "bg-orange-400": theme === t })}>
								<div className="bg-secondary rounded-2xl p-2">
									<ThemePreview theme={t} />
								</div>
							</motion.a>
						))}
						{mcMode && (
							<motion.a
								onClick={() => setTheme("pixel")}
								whileHover={{ scale: theme === "pixel" ? 1 : 0.95 }}
								className={cn("cursor-pointer from-muted/40 via-border to-muted/40 rounded-2xl p-px", { "bg-gradient-to-br": theme !== "pixel", "bg-orange-400": theme === "pixel" })}
								initial={{ opacity: 0, scale: 0.75 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.75 }}
							>
								<div className="bg-secondary rounded-2xl p-2">
									<ThemePreview theme={"pixel"} />
								</div>
							</motion.a>
						)}
					</div>
				</div>
			</div>
			<div className="w-full grid grid-cols-3">
				<div className="border-r flex flex-col items-end pr-5 py-5 text-right">
					<h1 className="text-lg text-foreground font-medium">Yazı Tipi</h1>
					<p className="text-muted text-sm">Genel yazı tipini değiştirin.</p>
				</div>
				<div className="col-span-2 py-5 pl-5 space-y-1.5">
					<p className="text-muted text-sm">Genel Yazı Tipi</p>
					<div className={"w-full transition-opacity " + (theme === 'pixel' ? 'opacity-50' : 'opacity-100')}>
						<Select
							placeholder="Yazı tipi seçin"
							value={mainFont || 'lufga'}
							onValueChange={v => setMainFont(v)}
							disabled={theme === 'pixel'}
						>
							{['Lufga', 'Inter', 'Roboto', 'Montserrat', 'Quicksand'].map((font, i) => (
								<Select.Item value={font.toLowerCase()} key={i}>
									<p style={{ fontFamily: `var(--font-${font === 'Lufga' ? 'main' : font.toLowerCase()})` }}>
										{font}
									</p>
								</Select.Item>
							))}
						</Select>
					</div>
					<p className="text-muted text-sm pt-3">Kod Yazı Tipi</p>
					<Select
						placeholder="Yazı tipi seçin"
						value={(codeFont || 'jetbrains-mono').toLowerCase().replace(/ /g, '-')}
						onValueChange={v => setCodeFont(v.toLowerCase().replace(/ /g, '-'))}
					>
						{['JetBrains Mono', 'Geist Mono', 'Roboto Mono', 'Source Code Pro'].map((font, i) => (
							<Select.Item value={font.toLowerCase().replace(/ /g, '-')} key={i}>
								<p style={{ fontFamily: `var(--font-${font.toLowerCase().replace(/ /g, '-')})` }}>
									{font}
								</p>
							</Select.Item>
						))}
					</Select>
				</div>
			</div>
			<div className="w-full grid grid-cols-3">
				<div className="border-r flex flex-col items-end pr-5 py-5 text-right">
					<h1 className="text-lg text-foreground font-medium">Minecraft?</h1>
					<p className="text-muted text-sm">Huh.</p>
				</div>
				<div className="col-span-2 py-5 pl-5 space-y-3">
					<Select
						value={viewMcMode ? 'on' : 'off'}
						onValueChange={v => {
							if (v === 'off' && theme === 'pixel') setTheme('dark');
							setViewMcMode(v === 'on' ? true : false);
							if (v === 'off') setMcMode(false);
						}}
					>
						<Select.Item value="on">
							Açık
						</Select.Item>
						<Select.Item value="off">
							Kapalı
						</Select.Item>
					</Select>
				</div>
			</div>
			<AnimatePresence>
				{viewMcMode && (
					<motion.div
						className="w-full grid grid-cols-3"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 20 }}
					>
						<div className="border-r flex flex-col text-right items-end pr-5 py-5">
							<h1 className="text-lg text-foreground font-medium">Minecraft, gerçekten?</h1>
							<p className="text-muted text-sm">La-la-la-lava, ch-ch-ch-chicken.</p>
						</div>
						<div className="col-span-2 py-5 pl-5 space-y-3">
							<Select
								value={mcMode ? 'on' : 'off'}
								onValueChange={v => {
									if (v === 'off' && theme === 'pixel') setTheme('dark');
									setMcMode(v === 'on' ? true : false);
								}}
							>
								<Select.Item value="on">
									Açık
								</Select.Item>
								<Select.Item value="off">
									Kapalı
								</Select.Item>
							</Select>
							<AnimatePresence>
								{mcMode && (
									<motion.p initial={{ opacity: 0 }} exit={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-orange-400 text-sm">
										Özel tema açıldı.
									</motion.p>
								)}
							</AnimatePresence>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

function ApiKeysSettings({ session }: IProps) {
    // TODO: culku
    // useAPI patlak ne kullancaz aq

	return (
        <>
            <div className="w-full max-w-2xl h-full mx-auto flex flex-col space-y-10">
                <div className="w-full grid grid-cols-3">
                    <div className="border-r flex flex-col items-end pr-5 py-5 text-right">
                        <h1 className="text-lg text-foreground font-medium">OpenAI</h1>
                        <p className="text-muted text-sm">OpenAI API anahtarınız.</p>
                    </div>
                    <div className="col-span-2 py-5 pl-5 space-y-3">
                        <Input label='Anahtar' value="dassak" />
                    </div>
                </div>
                <div className="w-full grid grid-cols-3">
                    <div className="border-r flex flex-col items-end pr-5 py-5 text-right">
                        <h1 className="text-lg text-foreground font-medium">Gemini</h1>
                        <p className="text-muted text-sm">Gemini API anahtarınız.</p>
                    </div>
                    <div className="col-span-2 py-5 pl-5 space-y-3">
                        <Input label='Anahtar' value="dassak" />
                    </div>
                </div>
                <div className="w-full grid grid-cols-3">
                    <div className="border-r flex flex-col items-end pr-5 py-5 text-right">
                        <h1 className="text-lg text-foreground font-medium">Anthropic</h1>
                        <p className="text-muted text-sm">Claude API anahtarınız.</p>
                    </div>
                    <div className="col-span-2 py-5 pl-5 space-y-3">
                        <Input label='Anahtar' value="dassak" />
                    </div>
                </div>
            </div>
            <div className="flex justify-center items-center space-x-5 sticky bottom-0 py-3 bg-gradient-to-t from-primary via-primary/50">
				<div className="rounded-2xl h-11 px-5 backdrop-blur bg-primary/50 flex items-center justify-center">
					<Button variant="link" className="text-muted">Sıfırla</Button>
				</div>
				<div className="rounded-2xl bg-primary">
					<Button>Kaydet</Button>
				</div>
			</div>
        </>
	);
};

function ThemePreview({ theme }: { theme: string }) {
	return (
		<div className={cn(theme, "w-full aspect-video overflow-hidden rounded-lg relative flex border", `bg-[hsl(var(--primary))]`)}>
			<span className={cn("absolute top-1 right-1 rounded-full h-2 w-4", `bg-[--foreground]`)} />
			<div className={cn("w-3 h-full shrink-0 border-r flex flex-col space-y-1 items-center py-1", `bg-[hsl(var(--primary))]`, `border-[hsl(var(--border))]`)}>
				{Array.from({ length: 4 }).map((_, i) => (
					<span key={i} className={cn("w-1 h-1 block rounded-full", `bg-[hsl(var(--muted))]`)} />
				))}
			</div>
			<div className="flex-1 flex flex-col items-center justify-center py-1">
				<div className="flex items-center justify-center flex-1">
					<div className={cn("border rounded-full p-2", `border-[hsl(var(--colored))]`)}>
						<div className={cn("border rounded-full p-2", `border-[hsl(var(--colored))]`)}>
							<span className={cn("w-2 h-2 rounded-full block", `bg-[hsl(var(--colored))]`)} />
						</div>
					</div>
				</div>
				<span className={cn("block shrink-0 w-16 h-5 border rounded-lg", `bg-[hsl(var(--secondary))]`, `border-[hsl(var(--border))]`)} />
			</div>
		</div>
	);
};