'use client';

import { useSession } from "@/hooks/use-session";
import { AnimatePresence, motion } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { authClient } from '@/lib/authClient';
import Textarea from '@/components/ui/Textarea';
import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import { api } from "@/lib/api";

type IProps = {
    session?: ReturnType<typeof useSession>['data'];
    refetch: () => void;
    isPending: boolean;
};

export function AccountSettings({ session, refetch }: IProps) {
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

        if (username) await authClient.updateUser({ username });

        if (interests || tone || bio) await api.patch('/user/details', {
            interests,
            tone,
            bio
        }).catch(() => {});

        refetch();
        setSubmiting(false);
    };

    return (
        <>
            <div className="w-full max-w-2xl h-full mx-auto flex flex-col space-y-10">
                <div className="w-full flex flex-col border-l lg:border-none lg:grid grid-cols-3">
                    <div className="lg:border-r flex flex-col pl-4 lg:pl-0 lg:items-end pr-5 pb-3 lg:pb-5 py-5 lg:text-right">
                        <h1 className="text-lg text-foreground font-medium">Kullanıcı Adı</h1>
                        <p className="text-muted text-sm">Kullanıcı adınızı değiştirin.</p>
                    </div>
                    <div className="col-span-2 pt-0 lg:pt-5 py-5 lg:pl-5 pl-2 space-y-3">
                        <Input label='Kullanıcı Adı' disabled={submiting} value={username} onChange={e => setUsername(e.target.value)} />
                        <AnimatePresence>
                            {errors?.username && <motion.p initial={{ opacity: 0 }} exit={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-orange-400 text-sm">{errors.username}</motion.p>}
                        </AnimatePresence>
                    </div>
                </div>
                <div className="w-full flex flex-col border-l lg:border-none lg:grid grid-cols-3">
                    <div className="lg:border-r flex flex-col pl-4 lg:pl-0 lg:items-end pr-5 pb-3 lg:pb-5 py-5 lg:text-right">
                        <h1 className="text-lg text-foreground font-medium">E-mail</h1>
                        <p className="text-muted text-sm">E-mail adresiniz.</p>
                    </div>
                    <div className="col-span-2 pt-0 lg:pt-5 py-5 lg:pl-5 pl-2 space-y-3">
                        <Input label='Email' value={session?.user?.email || '???'} disabled />
                        <p className="text-muted text-sm">E-mail adresi değiştirilemez.</p>
                    </div>
                </div>
                <div className="w-full flex flex-col border-l lg:border-none lg:grid grid-cols-3">
                    <div className="lg:border-r flex flex-col pl-4 lg:pl-0 lg:items-end pr-5 pb-3 lg:pb-5 py-5 lg:text-right">
                        <h1 className="text-lg text-foreground font-medium">Parola</h1>
                        <p className="text-muted text-sm">Şifrenizi güncelleyin.</p>
                    </div>
                    <div className="col-span-2 pt-0 lg:pt-5 py-5 lg:pl-5 pl-2 space-y-3">
                        <Input label='Eski şifre' value={oldpass} onChange={e => setOldpass(e.target.value)} type="password" disabled={submiting} />
                        <Input label='Yeni şfire' value={newpass} onChange={e => setNewpass(e.target.value)} type="password" disabled={!oldpass || submiting} />
                        <AnimatePresence>
                            {errors?.password && <motion.p initial={{ opacity: 0 }} exit={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-orange-400 text-sm">{errors.password}</motion.p>}
                        </AnimatePresence>
                    </div>
                </div>
                <div className="w-full flex flex-col border-l lg:border-none lg:grid grid-cols-3">
                    <div className="lg:border-r flex flex-col pl-4 lg:pl-0 lg:items-end pr-5 pb-3 lg:pb-5 py-5 lg:text-right">
                        <h1 className="text-lg text-foreground font-medium">İlgi Alanın</h1>
                        <p className="text-muted text-sm">Ne iş yapıyorsun?</p>
                    </div>
                    <div className="col-span-2 pt-0 lg:pt-5 py-5 lg:pl-5 pl-2 space-y-3">
                        <Input label='İlgi Alanın' disabled={submiting} value={interests} onChange={e => setInterests(e.target.value)} />
                        <p className="text-muted text-sm">mühendis, geliştirici, öğrenci, vb.</p>
                        <AnimatePresence>
                            {errors?.interests && <motion.p initial={{ opacity: 0 }} exit={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-orange-400 text-sm">{errors.interests}</motion.p>}
                        </AnimatePresence>
                    </div>
                </div>
                <div className="w-full flex flex-col border-l lg:border-none lg:grid grid-cols-3">
                    <div className="lg:border-r flex flex-col pl-4 lg:pl-0 lg:items-end pr-5 pb-3 lg:pb-5 py-5 lg:text-right">
                        <h1 className="text-lg text-foreground font-medium">Konuşma Tarzı</h1>
                        <p className="text-muted text-sm">Z3 seninle nasıl konuşmalı?</p>
                    </div>
                    <div className="col-span-2 pt-0 lg:pt-5 py-5 lg:pl-5 pl-2 space-y-3">
                        <Input label='Konuşma Tarzı' disabled={submiting} value={tone} onChange={e => setTone(e.target.value)} />
                        <p className="text-muted text-sm">şakacı, ciddi, net, detaylı, vb.</p>
                        <AnimatePresence>
                            {errors?.tone && <motion.p initial={{ opacity: 0 }} exit={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-orange-400 text-sm">{errors.tone}</motion.p>}
                        </AnimatePresence>
                    </div>
                </div>
                <div className="w-full flex flex-col border-l lg:border-none lg:grid grid-cols-3">
                    <div className="lg:border-r flex flex-col pl-4 lg:pl-0 lg:items-end pr-5 pb-3 lg:pb-5 py-5 lg:text-right">
                        <h1 className="text-lg text-foreground font-medium">Hakkında</h1>
                        <p className="text-muted text-sm">Z3 senin hakkında ne bilmeli?</p>
                    </div>
                    <div className="col-span-2 pt-0 lg:pt-5 py-5 lg:pl-5 pl-2 space-y-3">
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