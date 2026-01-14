"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { launches, floridaLocations, calculateTravelTime, calculateScore, ViewingLocation, Launch } from "@/lib/mockData";
import { LocationCard } from "@/components/LocationCard";
import { Loader2, AlertCircle, ArrowLeft, RotateCcw, Info } from "lucide-react";

interface RankedLocation {
    location: ViewingLocation;
    score: number;
    travelTime: number;
    isImpossible: boolean;
}

function ComparisonContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const launchId = searchParams.get("launchId");
    const userLocation = searchParams.get("location");

    const [loading, setLoading] = useState(true);
    const [rankedLocations, setRankedLocations] = useState<RankedLocation[]>([]);
    const [selectedLaunch, setSelectedLaunch] = useState<Launch | undefined>(undefined);

    useEffect(() => {
        if (!launchId || !userLocation) {
            // Redirect back if missing params
            // router.push("/search"); 
            setLoading(false);
            return;
        }

        const launch = launches.find(l => l.id === launchId);
        setSelectedLaunch(launch);

        // Simulate AI Processing time
        const timer = setTimeout(() => {
            const results = floridaLocations.map(loc => {
                const travelTime = calculateTravelTime(userLocation, loc.coordinates);
                const score = calculateScore(loc, launch!);

                // Mock impossibility: if travel > 2 hours? (Just logical mock)
                // In real app compare to launch.date
                const isImpossible = travelTime > 120; // Arbitrary threshold for demo

                return {
                    location: loc,
                    score: isImpossible ? 0 : score,
                    travelTime,
                    isImpossible
                };
            });

            // Sort: Impossible last, then by score descending
            results.sort((a, b) => {
                if (a.isImpossible && !b.isImpossible) return 1;
                if (!a.isImpossible && b.isImpossible) return -1;
                return b.score - a.score;
            });

            setRankedLocations(results);
            setLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, [launchId, userLocation, router]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                <p className="text-xl font-medium animate-pulse">Analyzing satellite imagery & traffic patterns...</p>
                <div className="text-sm text-muted-foreground">Checking {floridaLocations.length} locations against trajectory...</div>
            </div>
        );
    }

    if (!selectedLaunch) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold">Launch Not Found</h2>
                <button onClick={() => router.push("/search")} className="mt-4 text-blue-400 hover:underline">Return to Search</button>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-white/5 transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold">Viewing Analysis</h1>
                    <p className="text-muted-foreground">
                        Results for <span className="text-blue-400 font-semibold">{selectedLaunch.missionName}</span> from <span className="text-blue-400 font-semibold">{userLocation}</span>
                    </p>
                </div>
            </div>

            <div className="grid gap-6">
                {rankedLocations.map((item, index) => (
                    <LocationCard
                        key={item.location.id}
                        location={item.location}
                        rank={index + 1}
                        score={item.score}
                        travelTimeMinutes={item.travelTime}
                        isImpossible={item.isImpossible}
                    />
                ))}
            </div>

            <div className="mt-12 p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-4">
                <Info className="w-6 h-6 text-blue-400 shrink-0 mt-1" />
                <div className="text-sm text-foreground/80">
                    <p className="font-semibold mb-1">AI Recommendation Logic</p>
                    <p>Rankings are generated based on a multi-factor analysis including real-time weather data (cloud cover masking star/rocket visibility), traffic incident reports affecting travel time, and launch trajectory azimuths relative to viewing angles. "Impossible" locations indicate travel time exceeds the countdown window.</p>
                </div>
            </div>
        </div>
    );
}

export default function ComparisonPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
            <ComparisonContent />
        </Suspense>
    );
}
