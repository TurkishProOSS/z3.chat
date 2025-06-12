"use client";

import { RiChat1Fill, RiChat1Line, RiSettings3Fill, RiSettings3Line } from '@remixicon/react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '@/components/shared/Logo';
import { useHover } from "@uidotdev/usehooks";
import { cn } from '@colidy/ui-utils';

export default function Sidebar() {
    const [ref, hovering] = useHover();

    return (
        <>
            <div className="shrink-0 w-[85px] min-h-screen" />
            <div ref={ref} className="fixed z-50 bg-primary group top-0 left-0 bottom-0 w-[85px] flex flex-col justify-between p-6 border-r hover:w-60 transition-all duration-300 ease-in-out">
                <div className="w-full space-y-6">
                    <div className="flex items-center gap-2 grayscale-100">
                        <div className="shrink-0">
                            <Logo size={36} />
                        </div>
                        <AnimatePresence>
                            {hovering && (
                                <motion.h1 
                                    className="text-2xl font-medium text-foreground"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    z3<span className="font-normal opacity-50">.chat</span>
                                </motion.h1>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="space-y-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center w-60">
                                <div className={cn(
                                    "w-9 aspect-square rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-medium text-foreground cursor-pointer",
                                    {
                                        "hover:bg-secondary": i !== 0,
                                        "bg-secondary": i === 0,
                                    }
                                )}>
                                    <RiChat1Line className="w-6 h-6 text-foreground" />
                                </div>
                                {hovering && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3, delay: 0.05 * i }}
                                    >
                                        sen yap kulu bunu
                                    </motion.div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="w-8 flex flex-col gap-4">
                    <div
                        className={cn(
                            "w-full aspect-square rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-medium text-foreground cursor-pointer hover:bg-secondary"
                        )}
                    >
                        <RiSettings3Line className="w-6 h-6 text-foreground" />
                    </div>
                    <img
                        src="https://avatars.githubusercontent.com/u/10231047?v=4"
                        alt="User Avatar"
                        className="w-full aspect-square rounded-full object-cover shrink-0"
                    />
                </div>
            </div>
        </>
    );
};