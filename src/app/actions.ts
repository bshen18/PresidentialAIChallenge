"use server";

import { generateLocationAnalysis, LocationAnalysis } from "@/lib/gemini";
import { fetchRealUpcomingLaunches, fetchRealLaunchDetails } from "@/lib/spaceDevs";
import { floridaLocations, Launch } from "@/lib/mockData";

export async function getUpcomingLaunchesAction() {
    return await fetchRealUpcomingLaunches();
}

export async function getLaunchDetailsAction(id: string) {
    return await fetchRealLaunchDetails(id);
}

export async function getRankedLocationsAction(
    userLocation: string,
    launchId: string
): Promise<LocationAnalysis[]> {
    // 1. Fetch launch details (now dynamic)
    const launch = await fetchRealLaunchDetails(launchId);

    if (!launch) {
        throw new Error("Launch details not found");
    }

    // Call Gemini API
    const results = await generateLocationAnalysis(userLocation, launch, floridaLocations);

    // Sort: "Impossible" ones last, then by score descending
    return results.sort((a, b) => {
        if (a.isImpossible && !b.isImpossible) return 1;
        if (!a.isImpossible && b.isImpossible) return -1;
        return b.score - a.score;
    });
}
