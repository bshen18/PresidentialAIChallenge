"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Rocket, MapPin, Calendar, AlertTriangle, Loader2 } from "lucide-react";
import { getUpcomingLaunchesAction } from "../actions";
import { Launch } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { Starfield } from "@/components/Starfield";

export default function SearchPage() {
    const router = useRouter();
    const [location, setLocation] = useState("");
    const [selectedLaunchId, setSelectedLaunchId] = useState<string | null>(null);
    const [launches, setLaunches] = useState<Launch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLaunches() {
            try {
                const data = await getUpcomingLaunchesAction();
                setLaunches(data);
            } catch (err) {
                console.error("Failed to fetch launches", err);
            } finally {
                setLoading(false);
            }
        }
        fetchLaunches();
    }, []);

    const handleSearch = () => {
        if (!location || !selectedLaunchId) return;
        const params = new URLSearchParams({
            location,
            launchId: selectedLaunchId,
        });
        router.push(`/comparison?${params.toString()}`);
    };

    return (
        <>
            <Starfield />
            <div className="container mx-auto px-4 py-8 max-w-5xl min-h-[85vh] flex flex-col justify-center relative z-10">
                {/* Hero Section */}
                <div className="flex flex-col items-center text-center space-y-8 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium backdrop-blur-sm border border-blue-500/20">
                        <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse" />
                        Lumina Launch Assistant
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-white/90 to-white/50">
                        Find the Perfect <br /> Vantage Point.
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl text-balance">
                        Select an upcoming launch and your location. AI will calculate the optimal viewing spot based on trajectory, weather, and traffic.
                    </p>

                    {/* Input Group */}
                    <div className="flex flex-col md:flex-row gap-4 w-full max-w-2xl items-stretch">
                        {/* Location Input */}
                        <div className="relative flex-1 group">
                            <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative flex items-center bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-1 h-full shadow-2xl">
                                <MapPin className="ml-4 w-5 h-5 text-muted-foreground shrink-0" />
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Enter City or Zip Code (e.g. Orlando, FL)"
                                    className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 outline-none w-full"
                                />
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={handleSearch}
                            disabled={!location || !selectedLaunchId}
                            className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground px-8 py-3 rounded-2xl font-semibold transition-all duration-300 md:w-auto w-full flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/25"
                        >
                            Find Spots <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Launch Selection Grid */}
                <div className="w-full max-w-4xl mx-auto">
                    <h2 className="text-xl font-semibold mb-6 pl-1 flex items-center gap-2">
                        <Rocket className="w-5 h-5 text-purple-400" />
                        Select Upcoming Launch
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {loading ? (
                            <div className="col-span-3 flex justify-center py-12 text-muted-foreground">
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                    <p>Scanning 2026 Launch Manifest...</p>
                                </div>
                            </div>
                        ) : launches.length === 0 ? (
                            <div className="col-span-3 text-center py-12 text-muted-foreground">
                                No upcoming launches found.
                            </div>
                        ) : (
                            launches.map((launch, i) => (
                                <div
                                    key={launch.id}
                                    onClick={() => setSelectedLaunchId(launch.id)}
                                    className={cn(
                                        "cursor-pointer group relative bg-card/30 backdrop-blur-md border rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02]",
                                        selectedLaunchId === launch.id
                                            ? "border-blue-500 bg-blue-500/10 shadow-2xl shadow-blue-500/10"
                                            : "border-white/5 hover:bg-card/50 hover:border-white/10"
                                    )}
                                    style={{ animationDelay: `${i * 100}ms` }}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold border",
                                            selectedLaunchId === launch.id
                                                ? "bg-blue-500 text-white border-blue-400"
                                                : "bg-white/5 text-muted-foreground border-white/5"
                                        )}>
                                            {launch.provider.charAt(0)}
                                        </div>
                                        {launch.scrubRisk > 20 && (
                                            <div className="flex items-center gap-1 bg-orange-500/10 text-orange-400 px-2 py-1 rounded-lg text-xs font-medium border border-orange-500/20">
                                                <AlertTriangle className="w-3 h-3" />
                                                {launch.scrubRisk}% Risk
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-lg font-bold mb-1 line-clamp-1">{launch.missionName}</h3>
                                    <p className="text-sm text-foreground/70 mb-2 line-clamp-1">{launch.rocket}</p>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                                        <MapPin className="w-3 h-3" />
                                        {launch.launchSite}
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(launch.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                            )))}
                    </div>
                </div>
            </div>
        </>
    );
}
