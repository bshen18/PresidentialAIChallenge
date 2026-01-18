"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

export function LaunchAnimation() {
    const [count, setCount] = useState(10);
    const [isFinished, setIsFinished] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (!hasStarted) return;

        if (count > 0) {
            const timer = setTimeout(() => setCount(count - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setIsFinished(true);
            if (videoRef.current) {
                videoRef.current.play();
            }
        }
    }, [count, hasStarted]);

    const handleStart = () => {
        setHasStarted(true);
    };

    return (
        <section className="relative w-full h-[600px] md:h-[800px] bg-black overflow-hidden flex items-center justify-center">
            {/* Background Video */}
            <video
                ref={videoRef}
                className={cn(
                    "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000",
                    isFinished ? "opacity-100" : "opacity-30"
                )}
                muted
                playsInline
                loop
                poster="https://images-assets.nasa.gov/image/NHQ22111601/NHQ22111601~orig.jpg"
            >
                <source src="https://images-assets.nasa.gov/video/Artemis%20I%20Launch%20Highlights/Artemis%20I%20Launch%20Highlights~orig.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Retro Overlay */}
            <div className="absolute inset-0 bg-black/40 pointer-events-none" />
            <div className="absolute inset-0 border-[20px] border-white/5 pointer-events-none" />

            {!hasStarted ? (
                <button
                    onClick={handleStart}
                    className="group relative px-12 py-6 bg-white text-black font-bold text-2xl rounded-none border-4 border-black shadow-[8px_8px_0_0_rgba(255,255,255,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0_0_rgba(255,255,255,0.2)] transition-all active:scale-95 z-20"
                >
                    INITIATE LAUNCH SEQUENCE
                </button>
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
                    <p className="text-white/60 font-mono mt-2">ARTEMIS I • NOVEMBER 16, 2022</p>
                </div>
            )}

            {/* Scanning Line Effect */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-30" />
        </section>
    );
}
