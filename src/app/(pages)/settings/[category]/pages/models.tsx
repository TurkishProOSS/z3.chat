'use client';

import { AnimatePresence, motion } from "framer-motion";
import { useSWRApi } from "@/hooks/use-swr-api";
import { reduceAgents } from "@/lib/get-agents";
import { RiGeminiFill, RiPushpinFill } from "@remixicon/react";
import Input from "@/components/ui/Input";
import { useState } from "react";
import { cn } from "@colidy/ui-utils";
import { authClient } from "@/lib/authClient";
import { useSession } from "@/hooks/use-session";

type IProps = {
    session?: ReturnType<typeof useSession>['data'];
    refetch: () => void;
    isPending: boolean;
};

export function ModelsSettings({ session, isPending }: IProps) {
    const [pinnedModels, setPinnedModels] = useState<any[]>(session?.user.pinned_agents || []);
    const { data, isLoading } = useSWRApi('/models/all');
    const [disabled, setDisabled] = useState('');
    const [search, setSearch] = useState('');

    const handlePin = async (model: any) => {
        if (disabled) return;
        setDisabled(model._id);

        const pinned = pinnedModels?.includes?.((model as any)._id);
        await authClient.updateUser({
            pinned_agents: pinned ? pinnedModels?.filter((m: any) => m !== (model as any)._id) : [...(pinnedModels || []), (model as any)._id]
        }).then(() => {
            setDisabled('');
        });

        if (pinned && pinnedModels) setPinnedModels(pinnedModels?.filter((m: any) => m !== (model as any)._id) as any);
        if (!pinned && pinnedModels) setPinnedModels([...(pinnedModels || []), (model as any)._id] as any);
        setDisabled('');
    };

    if (isLoading || isPending) return (
        <div className="flex h-[calc(100vh-10rem)] w-full">
            <div className="flex-1 w-full h-full flex items-center justify-center">
                <div className="w-8 h-8 border border-muted rounded-full">
                    <div className="w-full h-full animate-spin relative flex justify-center">
                        <span className="w-2 h-2 bg-muted block rounded-full -translate-y-1/2" />
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-2xl h-full mx-auto flex flex-col space-y-10">
            <div className="space-y-3">
                <div className="space-y-1">
                    <h1 className="text-xl text-foreground font-medium">Modeller</h1>
                    <p className="text-muted max-w-lg text-sm">Sabitlemek istediğiniz modellerin üstüne tıklayın. <span className="text-orange-400">Premium</span> modelleri kullanmak için <span className="text-orange-400">Premium</span> aboneliğiniz olmalıdır.</p>
                </div>
                <Input placeholder="Arayın..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {reduceAgents((data?.data as any[] || []).filter(m => !m ? true : m.name.toLowerCase().includes(search.toLowerCase()))).map((cat, i) => (
                <div className="space-y-3">
                    <h1 className="text-lg font-medium">{cat.provider}</h1>
                    <div className="space-y-3 w-full">
                        {cat.models.map((model, k) => {
                            const pinned = pinnedModels?.includes?.((model as any)._id);
                            return (
                                <motion.div
                                    key={k}
                                    onClick={() => handlePin(model)}
                                    className={cn("w-full flex bg-secondary cursor-pointer relative p-6 rounded-2xl space-x-5 border-2", {
                                        "border-secondary": !pinned,
                                        "border-orange-400": pinned
                                    })}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                >
                                    <div className="shrink-0">
                                        {pinned && <div className="absolute top-2 right-2">
                                            <RiPushpinFill size={24} className="text-orange-400" />
                                        </div>}
                                        <RiGeminiFill size={48} className="text-border" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <h1 className="text-lg font-medium">{model.name}</h1>
                                            {model.premium && <p className="bg-orange-800/10 text-xs text-orange-400 py-0.5 px-1.5 rounded-md">Premium</p>}
                                            {model.features?.experimental && <p className="bg-blue-800/10 text-xs text-blue-400 py-0.5 px-1.5 rounded-md">Experimental</p>}
                                            {(!model.enabled || !model.available) && <p className="bg-red-800/10 text-xs text-red-400 py-0.5 px-1.5 rounded-md">Disabled</p>}
                                        </div>
                                        <p className="text-muted text-sm line-clamp-2">{model.description}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};