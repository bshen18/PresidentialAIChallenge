import { ViewingLocation, WeatherData } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { Car, Cloud, MapPin, DollarSign, Users, Info } from "lucide-react";

interface LocationCardProps {
    location: ViewingLocation;
    rank: number;
    score: number;
    travelTimeMinutes: number;
    isImpossible: boolean;
    reasoning?: string;
    costEstimate?: string;
    viewingInstructions?: string;
}

export function LocationCard({ location, rank, score, travelTimeMinutes, isImpossible, reasoning, costEstimate, viewingInstructions }: LocationCardProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-3xl border p-6 transition-all duration-300",
                isImpossible
                    ? "bg-card/20 border-white/5 opacity-60 grayscale"
                    : "bg-card/40 backdrop-blur-md border-white/10 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10"
            )}
            style={{ animationDelay: `${rank * 100}ms` }}
        >
            {/* Rank Badge */}
            <div className={cn(
                "absolute top-0 right-0 px-4 py-2 rounded-bl-3xl font-bold text-lg",
                rank === 1 ? "bg-blue-500 text-white" : "bg-white/5 text-muted-foreground"
            )}>
                #{rank}
            </div>

            <div className="flex flex-col md:flex-row gap-6 md:items-center">
                {/* Score Ring */}
                <div className="relative shrink-0 flex flex-col items-center">
                    <div className={cn(
                        "w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold border-4",
                        score > 80 ? "border-green-500 text-green-400" :
                            score > 60 ? "border-yellow-500 text-yellow-400" : "border-red-500 text-red-400"
                    )}>
                        {score}
                    </div>
                    <span className="text-xs text-muted-foreground mt-2 font-medium uppercase tracking-wide">Match Score</span>
                </div>

                {/* Info */}
                <div className="flex-1 space-y-4">
                    <div>
                        <h3 className="text-2xl font-bold flex items-center gap-2">
                            {location.name}
                            {location.isProprietary && <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-0.5 rounded-full border border-purple-500/30">Private</span>}
                        </h3>
                        <p className="text-muted-foreground flex items-center gap-2 text-sm mt-1">
                            <MapPin className="w-4 h-4" /> {location.distanceMiles} miles from launch pad ({location.azimuth}° Azimuth)
                        </p>
                        {reasoning && (
                            <div className="mt-2 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-sm text-blue-200">
                                <span className="font-semibold text-blue-400 mr-1">AI Insight:</span>
                                {reasoning}
                            </div>
                        )}
                        {viewingInstructions && (
                            <div className="mt-2 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-sm text-emerald-200">
                                <span className="font-semibold text-emerald-400 mr-1">Pro Tip:</span>
                                {viewingInstructions}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Stat icon={<Car className="w-4 h-4" />} label="Travel Time" value={`${Math.floor(travelTimeMinutes / 60)}h ${travelTimeMinutes % 60}m`} subValue={isImpossible ? "Too late!" : "Traffic heavy"} alert={isImpossible} />
                        <Stat icon={<Cloud className="w-4 h-4" />} label="Weather" value={location.weather.condition} subValue={`${location.weather.cloudCover}% Cloud`} />
                        <Stat icon={<DollarSign className="w-4 h-4" />} label="Total Cost" value={costEstimate || (location.entryCost + location.parkingCost > 0 ? `$${location.entryCost + location.parkingCost}` : "Free")} />
                        <Stat icon={<Users className="w-4 h-4" />} label="Crowds" value={location.crowdLevel} />
                    </div>
                </div>
            </div>

            {/* Amenities */}
            <div className="mt-6 pt-6 border-t border-white/5 flex gap-2 flex-wrap">
                {location.amenities.map(a => (
                    <span key={a} className="px-3 py-1 rounded-full bg-white/5 text-xs text-muted-foreground border border-white/5">
                        {a}
                    </span>
                ))}
            </div>
        </div>
    );
}

function Stat({ icon, label, value, subValue, alert }: { icon: any, label: string, value: string, subValue?: string, alert?: boolean }) {
    return (
        <div className={cn("p-3 rounded-xl border border-white/5 bg-white/5", alert && "bg-red-500/10 border-red-500/30")}>
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                {icon} {label}
            </div>
            <div className={cn("font-semibold text-sm", alert ? "text-red-400" : "text-foreground")}>{value}</div>
            {subValue && <div className="text-xs text-muted-foreground/50 mt-0.5">{subValue}</div>}
        </div>
    )
}
