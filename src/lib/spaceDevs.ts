import { Launch } from "./mockData";

const API_BASE = "https://ll.thespacedevs.com/2.2.0";

// Simple in-memory cache
let upcomingCache: { data: Launch[], timestamp: number } | null = null;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

interface SpaceDevsLaunch {
    id: string;
    name: string;
    status: { abbrev: string };
    net: string;
    window_start: string;
    window_end: string;
    image: string | null;
    rocket: {
        configuration: {
            full_name: string;
        }
    };
    launch_service_provider: {
        name: string;
    };
    pad: {
        name: string;
        location: {
            name: string;
        };
        latitude: string;
        longitude: string;
    };
    mission: {
        description: string;
        type: string;
    } | null;
}

export async function fetchRealUpcomingLaunches(): Promise<Launch[]> {
    const now = Date.now();
    if (upcomingCache && (now - upcomingCache.timestamp < CACHE_DURATION_MS)) {
        console.log("Returning cached launches");
        return upcomingCache.data;
    }

    try {
        // Fetch net (scheduled) launches
        const response = await fetch(`${API_BASE}/launch/upcoming/?limit=10&mode=detailed`, {
            headers: {
                "User-Agent": "Antigravity-Agent/1.0" // Polite to set UA
            }
        });

        if (!response.ok) {
            console.error("SpaceDevs API Error:", response.status, response.statusText);
            throw new Error(`SpaceDevs API Error: ${response.status}`);
        }

        const data = await response.json();
        const results = data.results as SpaceDevsLaunch[];

        const mapped: Launch[] = results
            .filter(l => new Date(l.net).getTime() > now)
            .map(l => ({
                id: l.id,
                missionName: l.name,
                rocket: l.rocket.configuration.full_name,
                provider: l.launch_service_provider.name,
                date: l.net,
                launchSite: l.pad.location.name,
                description: l.mission?.description || "No description available.",
                // Simple logic for trajectory/scrub risk since API doesn't provide them directly
                trajectory: "Easterly",
                scrubRisk: Math.floor(Math.random() * 30), // Still need to estimate this or ask Gemini to enrich
                padCoordinates: {
                    lat: parseFloat(l.pad.latitude),
                    lng: parseFloat(l.pad.longitude)
                },
                image: l.image
            }));

        upcomingCache = { data: mapped, timestamp: now };
        return mapped;
    } catch (error) {
        console.error("Failed to fetch from SpaceDevs:", error);
        return [];
    }
}

export async function fetchRealLaunchDetails(id: string): Promise<Launch | null> {
    // Check cache first to see if we already have it
    if (upcomingCache) {
        const cached = upcomingCache.data.find(l => l.id === id);
        if (cached) return cached;
    }

    try {
        const response = await fetch(`${API_BASE}/launch/${id}/`, {
            headers: {
                "User-Agent": "Antigravity-Agent/1.0"
            }
        });

        if (!response.ok) return null;

        const l = await response.json() as SpaceDevsLaunch;

        return {
            id: l.id,
            missionName: l.name,
            rocket: l.rocket.configuration.full_name,
            provider: l.launch_service_provider.name,
            date: l.net,
            launchSite: l.pad.location.name,
            description: l.mission?.description || "No description available.",
            trajectory: "Easterly",
            scrubRisk: 10,
            padCoordinates: {
                lat: parseFloat(l.pad.latitude),
                lng: parseFloat(l.pad.longitude)
            },
            image: l.image
        };

    } catch (error) {
        console.error("Failed to fetch launch details:", error);
        return null;
    }
}
