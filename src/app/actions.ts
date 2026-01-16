"use server";

import { generateLocationAnalysis, LocationAnalysis } from "@/lib/gemini";
import { fetchRealUpcomingLaunches, fetchRealLaunchDetails } from "@/lib/spaceDevs";
import { fetchNearbyViewingKeypoints } from "@/lib/places";
import { Launch, ViewingLocation } from "@/lib/mockData";

export interface RankedLocation {
    location: ViewingLocation;
    analysis: LocationAnalysis;
}

export async function getUpcomingLaunchesAction() {
    return await fetchRealUpcomingLaunches();
}

export async function getLaunchDetailsAction(id: string) {
    return await fetchRealLaunchDetails(id);
}

export async function getRankedLocationsAction(
    userLocation: string,
    launchId: string
): Promise<RankedLocation[]> {
    // 1. Fetch launch details (now dynamic)
    const launch = await fetchRealLaunchDetails(launchId);

    if (!launch) {
        throw new Error("Launch details not found");
    }

    // 2. Fetch/Determine Candidate Locations
    // If we have pad coordinates, look for real places. Otherwise fallback to Florida mock.
    let candidates: ViewingLocation[] = [];
    if (launch.padCoordinates) {
        candidates = await fetchNearbyViewingKeypoints(launch.padCoordinates.lat, launch.padCoordinates.lng);
    }

    // Fallback if no dynamic results found (e.g. API error or 0 results)
    if (candidates.length === 0) {
        // Only use florida fallback if it looks like a florida launch? Or just generic fallback?
        // For now, let's just return empty or maybe keep florida as a safe backup if name contains "FL" or "Kennedy"
        const isFlorida = launch.launchSite.includes("FL") || launch.launchSite.includes("Kennedy") || launch.launchSite.includes("Canaveral");
        if (isFlorida) {
            const { floridaLocations } = await import("@/lib/mockData");
            candidates = floridaLocations;
        } else {
            // No candidates found for a non-FL launch
            // We could return a generic error or empty list
            // Let's rely on empty list for now, UI should handle it
        }
    }

    // 3. Fetch Weather for all candidates in parallel
    // We import getWeatherForecast inside the function or file to use it
    const { getWeatherForecast } = await import("@/lib/weather");

    // We create a map of locationId -> Weather
    const weatherMap = new Map();

    // Process in parallel
    await Promise.all(candidates.map(async (loc) => {
        const weather = await getWeatherForecast(loc.coordinates.lat, loc.coordinates.lng);
        if (weather) {
            weatherMap.set(loc.id, weather);
        }
    }));

    // 4. Call Gemini API with weather context
    // generateLocationAnalysis signature updated to accept weatherMap
    const analysisResults = await generateLocationAnalysis(userLocation, launch, candidates, weatherMap);

    // 5. Combine and Sort
    const combined: RankedLocation[] = analysisResults.map(analysis => {
        const location = candidates.find(c => c.id === analysis.locationId);
        if (!location) {
            // Should not happen if AI returns valid IDs, but handle gracefully
            console.error(`Location for ID ${analysis.locationId} not found in candidates`);
            return null;
        }
        return {
            location: {
                ...location,
                // Ensure the weather in the location object is the real fetched weather
                weather: weatherMap.get(location.id)?.forecast[0] ? {
                    condition: weatherMap.get(location.id)?.forecast[0].shortForecast,
                    cloudCover: 0, // specific detailed parsing needed or just rely on text
                    precipitationChance: weatherMap.get(location.id)?.forecast[0].probabilityOfPrecipitation.value ?? 0,
                    windSpeed: parseFloat(weatherMap.get(location.id)?.forecast[0].windSpeed) || 0
                } : location.weather
            },
            analysis
        };
    }).filter((item): item is RankedLocation => item !== null);

    // Sort: "Impossible" ones last, then by score descending
    return combined.sort((a, b) => {
        if (a.analysis.isImpossible && !b.analysis.isImpossible) return 1;
        if (!a.analysis.isImpossible && b.analysis.isImpossible) return -1;
        return b.analysis.score - a.analysis.score;
    });
}
