"use client";

import { useState, useEffect } from "react";
import { Launch } from "@/lib/mockData";
import { getUpcomingLaunchesAction } from "@/app/actions";
import { Loader2, Rocket, Calendar, MapPin, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function LaunchComparison() {
    const [launches, setLaunches] = useState<Launch[]>([]);
    const [loading, setLoading] = useState(true);
    const [launchA, setLaunchA] = useState<Launch | null>(null);
    const [launchB, setLaunchB] = useState<Launch | null>(null);

    useEffect(() => {
        async function fetchLaunches() {
            try {
                const data = await getUpcomingLaunchesAction();
                setLaunches(data);
                // Default to first two launches
                if (data.length >= 2) {
                    setLaunchA(data[0]);
                    setLaunchB(data[1]);
                } else if (data.length === 1) {
                    setLaunchA(data[0]);
                }
            } catch (err) {
                console.error("Failed to fetch launches", err);
            } finally {
                setLoading(false);
            }
        }
        fetchLaunches();
    }, []);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                <p className="text-xl font-medium animate-pulse">Loading upcoming launches...</p>
            </div>
        );
    }

    if (launches.length === 0) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center">
                <Rocket className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold">No Launches Found</h2>
                <p className="text-muted-foreground mt-2">Check back later for upcoming launches.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-medium backdrop-blur-sm border border-purple-500/20 mb-4">
                    <Rocket className="w-3 h-3 mr-2" />
                    Launch Comparison Tool
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white/90 to-white/50 mb-4">
                    Compare Launches
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Select two upcoming launches to compare their specifications, timing, and details side-by-side.
                </p>
            </div>

            {/* Selection Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/80 pl-1">Launch A</label>
                    <select
                        value={launchA?.id || ""}
                        onChange={(e) => {
                            const selected = launches.find(l => l.id === e.target.value);
                            setLaunchA(selected || null);
                        }}
                        className="w-full bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
                    >
                        <option value="">Select a launch...</option>
                        {launches.map(launch => (
                            <option key={launch.id} value={launch.id}>
                                {launch.missionName} • {new Date(launch.date).toLocaleDateString()}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/80 pl-1">Launch B</label>
                    <select
                        value={launchB?.id || ""}
                        onChange={(e) => {
                            const selected = launches.find(l => l.id === e.target.value);
                            setLaunchB(selected || null);
                        }}
                        className="w-full bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none cursor-pointer"
                    >
                        <option value="">Select a launch...</option>
                        {launches.map(launch => (
                            <option key={launch.id} value={launch.id}>
                                {launch.missionName} • {new Date(launch.date).toLocaleDateString()}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Comparison Cards */}
            {launchA && launchB ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <LaunchCard launch={launchA} variant="blue" label="A" />
                    <LaunchCard launch={launchB} variant="purple" label="B" />
                </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    <Info className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select two launches above to compare</p>
                </div>
            )}

            {/* Comparison Table (if both selected) */}
            {launchA && launchB && (
                <div className="mt-8 bg-card/30 backdrop-blur-md border border-white/5 rounded-3xl p-6 overflow-x-auto">
                    <h2 className="text-2xl font-bold mb-6">Detailed Comparison</h2>
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-3 px-4 text-foreground/60 font-semibold">Attribute</th>
                                <th className="text-left py-3 px-4 text-blue-400 font-semibold">Launch A</th>
                                <th className="text-left py-3 px-4 text-purple-400 font-semibold">Launch B</th>
                            </tr>
                        </thead>
                        <tbody>
                            <ComparisonRow
                                label="Mission Name"
                                valueA={launchA.missionName}
                                valueB={launchB.missionName}
                                highlight={launchA.missionName !== launchB.missionName}
                            />
                            <ComparisonRow
                                label="Provider"
                                valueA={launchA.provider}
                                valueB={launchB.provider}
                                highlight={launchA.provider !== launchB.provider}
                            />
                            <ComparisonRow
                                label="Rocket"
                                valueA={launchA.rocket}
                                valueB={launchB.rocket}
                                highlight={launchA.rocket !== launchB.rocket}
                            />
                            <ComparisonRow
                                label="Launch Site"
                                valueA={launchA.launchSite}
                                valueB={launchB.launchSite}
                                highlight={launchA.launchSite !== launchB.launchSite}
                            />
                            <ComparisonRow
                                label="Launch Date"
                                valueA={new Date(launchA.date).toLocaleString()}
                                valueB={new Date(launchB.date).toLocaleString()}
                                highlight={launchA.date !== launchB.date}
                            />
                            <ComparisonRow
                                label="Scrub Risk"
                                valueA={`${launchA.scrubRisk}%`}
                                valueB={`${launchB.scrubRisk}%`}
                                highlight={launchA.scrubRisk !== launchB.scrubRisk}
                            />
                            <ComparisonRow
                                label="Trajectory"
                                valueA={launchA.trajectory}
                                valueB={launchB.trajectory}
                                highlight={launchA.trajectory !== launchB.trajectory}
                            />
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

interface LaunchCardProps {
    launch: Launch;
    variant: "blue" | "purple";
    label: string;
}

function LaunchCard({ launch, variant, label }: LaunchCardProps) {
    const colorClasses = variant === "blue"
        ? "border-blue-500/30 bg-blue-500/5"
        : "border-purple-500/30 bg-purple-500/5";

    const accentColor = variant === "blue" ? "text-blue-400" : "text-purple-400";
    const badgeBg = variant === "blue" ? "bg-blue-500" : "bg-purple-500";

    return (
        <div className={cn("relative bg-card/50 backdrop-blur-md border rounded-3xl p-8 transition-all duration-300", colorClasses)}>
            {/* Label Badge */}
            <div className={cn("absolute -top-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold border-2 border-background", badgeBg)}>
                {label}
            </div>

            {/* Provider Icon */}
            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold border mb-6",
                variant === "blue" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-purple-500/20 text-purple-400 border-purple-500/30")}>
                {launch.provider.charAt(0)}
            </div>

            {/* Mission Name */}
            <h3 className="text-2xl font-bold mb-2">{launch.missionName}</h3>
            <p className={cn("text-sm font-semibold mb-6", accentColor)}>{launch.provider}</p>

            {/* Details */}
            <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <Rocket className={cn("w-5 h-5 shrink-0 mt-0.5", accentColor)} />
                    <div>
                        <p className="text-xs text-muted-foreground">Rocket</p>
                        <p className="font-medium">{launch.rocket}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <MapPin className={cn("w-5 h-5 shrink-0 mt-0.5", accentColor)} />
                    <div>
                        <p className="text-xs text-muted-foreground">Launch Site</p>
                        <p className="font-medium">{launch.launchSite}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <Calendar className={cn("w-5 h-5 shrink-0 mt-0.5", accentColor)} />
                    <div>
                        <p className="text-xs text-muted-foreground">Launch Date</p>
                        <p className="font-medium">{new Date(launch.date).toLocaleString()}</p>
                    </div>
                </div>

                {launch.scrubRisk > 20 && (
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-orange-400" />
                        <div>
                            <p className="text-xs text-muted-foreground">Scrub Risk</p>
                            <p className="font-medium text-orange-400">{launch.scrubRisk}%</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Description */}
            <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-sm text-foreground/70 leading-relaxed">{launch.description}</p>
            </div>
        </div>
    );
}

interface ComparisonRowProps {
    label: string;
    valueA: string;
    valueB: string;
    highlight?: boolean;
}

function ComparisonRow({ label, valueA, valueB, highlight }: ComparisonRowProps) {
    return (
        <tr className={cn("border-b border-white/5", highlight && "bg-white/5")}>
            <td className="py-3 px-4 font-medium text-foreground/80">{label}</td>
            <td className="py-3 px-4">{valueA}</td>
            <td className="py-3 px-4">{valueB}</td>
        </tr>
    );
}
