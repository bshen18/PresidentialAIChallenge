"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function LaunchAnimation() {
    const [count, setCount] = useState(10);
    const [isFinished, setIsFinished] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!hasStarted) return;

        if (count > 0) {
            const timer = setTimeout(() => setCount(count - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setIsFinished(true);
        }
    }, [count, hasStarted]);

    const handleStart = () => {
        setHasStarted(true);
    };

    return (
        <section className="relative w-full h-[600px] md:h-[800px] bg-black overflow-hidden flex items-center justify-center">
            {/* Background Video */}
            <div className={cn(
                "absolute inset-0 w-full h-full transition-opacity duration-1000 overflow-hidden pointer-events-none bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/Artemis_I_Launch_Wide_Shot.jpg')] bg-cover bg-center",
                isFinished ? "opacity-100" : "opacity-50"
            )}>
                <div className="absolute inset-0 bg-black/40" />
                {hasStarted && (
                    <iframe
                        src={`https://www.youtube.com/embed/C3iHAgwIYtI?start=22&autoplay=1&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&mute=1&enablejsapi=1&playsinline=1`}
                        className={cn(
                            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full scale-[1.5] transition-opacity duration-1000",
                            isReady ? "opacity-100" : "opacity-0"
                        )}
                        onLoad={() => setIsReady(true)}
                        allow="autoplay; encrypted-media"
                        title="Launch Video"
                    />
                )}
            </div>

            {/* Retro Overlay */}
            <div className="absolute inset-0 bg-black/20 pointer-events-none" />
            <div className="absolute inset-0 border-[20px] border-white/5 pointer-events-none" />

            {!hasStarted ? (
                <div className="relative z-20 flex flex-col items-center gap-6">
                    <button
                        onClick={handleStart}
                        className="group relative px-12 py-6 bg-white text-black font-bold text-2xl rounded-none border-4 border-black shadow-[8px_8px_0_0_rgba(255,255,255,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0_0_rgba(255,255,255,0.2)] transition-all active:scale-95"
                    >
                        INITIATE LAUNCH SEQUENCE
                    </button>
                    {!isReady && (
                        <p className="text-white/40 font-mono text-xs animate-pulse">Establishing Satellite Uplink...</p>
                    )}
                </div>
            ) : !isFinished ? (
                <div className="relative z-20 flex flex-col items-center">
                    {/* Retro Spinner/Countdown */}
                    <div className="w-64 h-64 rounded-full border-8 border-dashed border-white/20 animate-spin-slow flex items-center justify-center p-4">
                        <div className="w-full h-full rounded-full border-8 border-white/80 flex items-center justify-center">
                            <span className="text-8xl font-black text-white font-mono tabular-nums animate-pulse">
                                {count}
                            </span>
                        </div>
                    </div>
                    <div className="mt-8 text-white font-mono tracking-[0.5em] text-xl animate-pulse">
                        T-MINUS
                    </div>
                </div>
            ) : (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 text-center animate-in fade-in duration-1000">
                    <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase drop-shadow-2xl">
                        LIFTOFF
                    </h2>
                    <p className="text-white/60 font-mono mt-2">STARSHIP IFT-2 • NOVEMBER 18, 2023</p>
                </div>
            )}

            {/* Scanning Line Effect */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-30" />
        </section>
    );
}
