"use client";

import { useEffect, useState } from "react";
import { getUpcomingLaunchesAction } from "@/app/actions";
import { Launch } from "@/lib/mockData";
import { Rocket } from "lucide-react";

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export function LaunchCountdown() {
    const [nextLaunch, setNextLaunch] = useState<Launch | null>(null);
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch the next upcoming launch
        const fetchLaunch = async () => {
            try {
                const launches = await getUpcomingLaunchesAction();
                if (launches && launches.length > 0) {
                    setNextLaunch(launches[0]);
                }
            } catch (error) {
                console.error("Error fetching launch:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLaunch();
    }, []);

    useEffect(() => {
        if (!nextLaunch) return;

        // Update countdown every second
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const launchTime = new Date(nextLaunch.date).getTime();
            const distance = launchTime - now;

            if (distance > 0) {
                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000),
                });
            } else {
                setTimeLeft(null);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [nextLaunch]);

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                <Rocket className="w-4 h-4" />
                <span>Loading next launch...</span>
            </div>
        );
    }

    if (!nextLaunch || !timeLeft) {
        return null;
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-white/10">
                {/* Launch Image Background */}
                {nextLaunch.image && (
                    <div className="relative w-full aspect-[21/9] md:aspect-[3/1] overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000">
                        <img
                            src={nextLaunch.image}
                            alt={nextLaunch.missionName}
                            className="w-full h-full object-cover object-center scale-110 hover:scale-100 transition-transform duration-[2000ms]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    </div>
                )}

                <div className="p-8">
                    {/* Launch Info */}
                    <div className="text-center mb-6">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Rocket className="w-5 h-5 text-blue-400" />
                            <span className="text-sm font-medium text-blue-400 uppercase tracking-wider">
                                Next Launch
                            </span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold mb-1">{nextLaunch.missionName}</h3>
                        <p className="text-sm text-muted-foreground">{nextLaunch.launchSite}</p>
                    </div>

                    {/* Countdown Display */}
                    <div className="grid grid-cols-4 gap-4">
                        {[
                            { label: "Days", value: timeLeft.days },
                            { label: "Hours", value: timeLeft.hours },
                            { label: "Minutes", value: timeLeft.minutes },
                            { label: "Seconds", value: timeLeft.seconds },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="flex flex-col items-center p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10"
                            >
                                <div className="text-3xl md:text-4xl font-bold tabular-nums text-white mb-1 countdown-number">
                                    {String(item.value).padStart(2, "0")}
                                </div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                                    {item.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
