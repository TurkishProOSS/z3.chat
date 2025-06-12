"use client";

import logoAnimation from "@/animations/logo.json";
import { useAPI } from "@/hooks/use-api";
import Lottie from "lottie-react";

export default function HomePage() {
    const { data, isLoading, error } = useAPI(api => api.delay({ delay: "1000" }).get())

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return <>
        <div className="flex w-full flex-col items-center justify-center flex-1 space-y-10">
            <div className="bg-primary relative rounded-full">
                <div className="bg-gradient-to-br absolute -inset-px -z-1 from-orange-400 animate-slow-spin to-orange-600 via-transparent rounded-full p-px" />
                <div className="bg-orange-700/20 rounded-full">
                    <Lottie style={{ width: "100px", height: "100px" }} animationData={logoAnimation} loop={false} />
                </div>
            </div>
            <h1 className="text-5xl pb-10 font-semibold max-w-2xl text-center text-foreground">İyi günler, <span className="bg-gradient-to-br from-orange-400 via-orange-600 to-orange-500 inline-block text-transparent bg-clip-text">Agam</span>. Nasıl yardımcı olabilirim?</h1>
            <textarea 
                className="w-full max-w-2xl h-40 bg-secondary shadow-lg outline-none border rounded-lg p-4 text-sm text-foreground resize-none"
            >
                Öylesine textarea
            </textarea>
        </div>
    </>
}