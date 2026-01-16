"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { floridaLocations, ViewingLocation, Launch } from "@/lib/mockData";
import { LocationCard } from "@/components/LocationCard";
import { Loader2, AlertCircle, ArrowLeft, RotateCcw, Info } from "lucide-react";
import { getRankedLocationsAction, getLaunchDetailsAction } from "../actions";
import { LocationAnalysis } from "@/lib/gemini";

interface RankedLocation {
    location: ViewingLocation;
    analysis: LocationAnalysis;
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

        async function fetchAnalysis() {
            try {
                // Parallel fetch details + analysis? 
                // We need launch details for the UI header even if analysis handles it internally?
                // Actually getRankedLocationsAction does NOT return launch details, it returns analysis.
                // So we need to fetch details separately for the UI.

                const [launchDetails, analysisResults] = await Promise.all([
                    getLaunchDetailsAction(launchId!),
                    getRankedLocationsAction(userLocation!, launchId!)
                ]);

                if (launchDetails) {
                    setSelectedLaunch(launchDetails);
                }

                const rankedResults = analysisResults as unknown as RankedLocation[];

                const mappedResults: RankedLocation[] = rankedResults.map(r => {
                    // Client-side "Impossible" check
                    let isImpossible = r.analysis.isImpossible;

                    if (launchDetails) {
                        const launchTime = new Date(launchDetails.date).getTime();
                        const now = Date.now();
                        const timeUntilLaunchMinutes = (launchTime - now) / (1000 * 60);

                        // If travel time is longer than time until launch, it's impossible
                        if (r.analysis.travelTimeMinutes > timeUntilLaunchMinutes && timeUntilLaunchMinutes > 0) {
                            isImpossible = true;
                        }
                    }

                    return {
                        ...r,
                        analysis: {
                            ...r.analysis,
                            isImpossible
                        }
                    };
                });

                setRankedLocations(mappedResults);
            } catch (error) {
                console.error("Failed to fetch analysis:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchAnalysis();
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

            {/* Scrub Risk / Viewability Warnings */}
            {selectedLaunch && (
                <div className="space-y-4 mb-8">
                    {(selectedLaunch.scrubRisk > 50) && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                            <AlertCircle className="w-6 h-6 text-red-400" />
                            <div>
                                <h3 className="font-bold text-red-200">High Scrub Risk Detected ({selectedLaunch.scrubRisk}%)</h3>
                                <p className="text-sm text-red-200/70">Weather or technical factors indicate a high chance this launch will be postponed. Check official sources before traveling.</p>
                            </div>
                        </div>
                    )}

                    {rankedLocations.every(l => l.analysis.score < 50) && (
                        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-3">
                            <Info className="w-6 h-6 text-orange-400" />
                            <div>
                                <h3 className="font-bold text-orange-200">Poor Viewing Conditions</h3>
                                <p className="text-sm text-orange-200/70">None of the locations look great for this specific launch trajectory and weather combo.</p>
                            </div>
                        </div>
                    )}
                </div>
            )
            }

            <div className="grid gap-6">
                {rankedLocations.map((item, index) => (
                    <LocationCard
                        key={item.location.id}
                        location={item.location}
                        rank={index + 1}
                        score={item.analysis.score}
                        travelTimeMinutes={item.analysis.travelTimeMinutes}
                        isImpossible={item.analysis.isImpossible}
                        reasoning={item.analysis.reasoning}
                        costEstimate={item.analysis.costEstimate}
                        viewingInstructions={item.analysis.viewingInstructions}
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
