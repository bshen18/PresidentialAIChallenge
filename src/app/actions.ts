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

    // 2. Fetch Weather for all candidates in parallel
    // We import getWeatherForecast inside the function or file to use it
    const { getWeatherForecast } = await import("@/lib/weather");

    // We create a map of locationId -> Weather
    const weatherMap = new Map();

    // Process in parallel
    await Promise.all(floridaLocations.map(async (loc) => {
        const weather = await getWeatherForecast(loc.coordinates.lat, loc.coordinates.lng);
        if (weather) {
            weatherMap.set(loc.id, weather);
        }
    }));

    // 3. Call Gemini API with weather context
    // generateLocationAnalysis signature updated to accept weatherMap
    const results = await generateLocationAnalysis(userLocation, launch, floridaLocations, weatherMap);

    // Sort: "Impossible" ones last, then by score descending
    return results.sort((a, b) => {
        if (a.isImpossible && !b.isImpossible) return 1;
        if (!a.isImpossible && b.isImpossible) return -1;
        return b.score - a.score;
    });
}
