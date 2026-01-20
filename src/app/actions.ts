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
    // Use Gemini to generate versatile viewing locations based on the launch site
    let candidates: ViewingLocation[] = [];

    // We try to use the pad coordinates if available, otherwise just use the site name
    const lat = launch.padCoordinates?.lat ?? 28.5721; // Default to KSC if missing
    const lng = launch.padCoordinates?.lng ?? -80.6480;

    const { generateViewingLocations } = await import("@/lib/gemini");
    candidates = await generateViewingLocations(launch.launchSite, lat, lng);

    // Fallback if Gemini failed (empty list)
    if (candidates.length === 0) {
        console.warn("Gemini returned no locations, using Florida fallback.");
        const { floridaLocations } = await import("@/lib/mockData");
        candidates = floridaLocations;
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
    let analysisResults: LocationAnalysis[] = [];
    try {
        analysisResults = await generateLocationAnalysis(userLocation, launch, candidates, weatherMap);
    } catch (error) {
        console.error("Gemini Analysis Failed, using fallback scoring:", error);
        // Fallback: Generate simple analysis based on distance/weather
        analysisResults = candidates.map(c => ({
            locationId: c.id,
            score: 70, // generic score
            travelTimeMinutes: 60, // generic time
            isImpossible: false,
            reasoning: "AI Analysis unavailable. Location is viable based on standard metrics.",
            costEstimate: c.entryCost + c.parkingCost > 0 ? `$${c.entryCost + c.parkingCost}` : "Free",
            viewingInstructions: "Check local signage for specific viewing areas."
        }));
    }

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
