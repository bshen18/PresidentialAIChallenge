export interface Launch {
    id: string;
    missionName: string;
    rocket: string;
    provider: string;
    date: string;
    launchSite: string;
    description: string;
    trajectory: "Easterly" | "Southerly" | "Polar";
    scrubRisk: number; // 0-100%
    padCoordinates?: { lat: number; lng: number };
    image?: string | null;
}

export interface WeatherData {
    cloudCover: number; // 0-100%
    windSpeed: number; // mph
    precipitationChance: number; // 0-100%
    condition: "Clear" | "Partly Cloudy" | "Cloudy" | "Overcast" | "Rain";
}

export interface ViewingLocation {
    id: string;
    name: string;
    distanceMiles: number; // from launch pad usually, but for mock we might just fix it
    azimuth: number; // relative to launch pad
    elevation: "Low" | "Medium" | "High";
    amenities: string[];
    isProprietary: boolean;
    parkingCost: number;
    entryCost: number;
    crowdLevel: "Low" | "Medium" | "High" | "Extreme";
    weather: WeatherData;
    coordinates: { lat: number; lng: number };
}

export const launches: Launch[] = [
    {
        id: "starship-ift6",
        missionName: "Starship IFT-6",
        rocket: "Starship Super Heavy",
        provider: "SpaceX",
        date: "2026-03-14T08:00:00Z",
        launchSite: "Starbase, TX",
        description: "The sixth integrated flight test of Starship, aiming for orbital velocity and tower catch.",
        trajectory: "Easterly",
        scrubRisk: 40,
    },
    {
        id: "falcon9-starlink",
        missionName: "Starlink 12-4",
        rocket: "Falcon 9 Block 5",
        provider: "SpaceX",
        date: "2026-01-20T17:30:00Z",
        launchSite: "KSC LC-39A, FL",
        description: "Batch of Starlink V2 Mini satellites to low Earth orbit.",
        trajectory: "Easterly",
        scrubRisk: 10,
    },
    {
        id: "artemis-ii",
        missionName: "Artemis II",
        rocket: "SLS Block 1",
        provider: "NASA",
        date: "2026-02-14T12:00:00Z", // Set to upcoming relative to Jan 2026
        launchSite: "KSC LC-39B, FL",
        description: "The first crewed flight test of the Space Launch System and Orion spacecraft around the Moon.",
        trajectory: "Easterly",
        scrubRisk: 15,
    }
];

// Mock locations specifically for Florida launches (generic enough for demo)
export const floridaLocations: ViewingLocation[] = [
    {
        id: "cocoa-beach-pier",
        name: "Cocoa Beach Pier",
        distanceMiles: 15,
        azimuth: 180,
        elevation: "Low",
        amenities: ["Restrooms", "Dining", "Parking"],
        isProprietary: false,
        parkingCost: 20,
        entryCost: 0,
        crowdLevel: "High",
        weather: { cloudCover: 20, windSpeed: 10, precipitationChance: 10, condition: "Partly Cloudy" },
        coordinates: { lat: 28.3666, lng: -80.6034 },
    },
    {
        id: "playalinda-beach",
        name: "Playalinda Beach",
        distanceMiles: 5,
        azimuth: 0, // North of pads
        elevation: "Low",
        amenities: ["Restrooms", "Nature"],
        isProprietary: false,
        parkingCost: 10,
        entryCost: 0,
        crowdLevel: "Medium",
        weather: { cloudCover: 5, windSpeed: 8, precipitationChance: 0, condition: "Clear" },
        coordinates: { lat: 28.6450, lng: -80.6834 },
    },
    {
        id: "max-brewer-bridge",
        name: "Max Brewer Bridge",
        distanceMiles: 11,
        azimuth: 270,
        elevation: "High",
        amenities: ["Walking Path", "Parking"],
        isProprietary: false,
        parkingCost: 0,
        entryCost: 0,
        crowdLevel: "Extreme",
        weather: { cloudCover: 15, windSpeed: 12, precipitationChance: 5, condition: "Clear" },
        coordinates: { lat: 28.6133, lng: -80.8077 },
    },
    {
        id: "jetty-park",
        name: "Jetty Park",
        distanceMiles: 12,
        azimuth: 170,
        elevation: "Low",
        amenities: ["Restrooms", "Camping", "fishing"],
        isProprietary: true,
        parkingCost: 25,
        entryCost: 15,
        crowdLevel: "High",
        weather: { cloudCover: 30, windSpeed: 15, precipitationChance: 20, condition: "Partly Cloudy" },
        coordinates: { lat: 28.4057, lng: -80.5927 },
    }
];

// Calculation Helpers
export function calculateTravelTime(userLocation: string, siteCoordinates: { lat: number, lng: number }): number {
    // Mock logic: seeded random based on string length to be deterministic
    const seed = userLocation.length + siteCoordinates.lat;
    return Math.floor((seed % 5) * 30 + 30); // Returns 30-150 minutes
}

export function calculateScore(site: ViewingLocation, launch: Launch): number {
    let score = 100;

    // Penalize distance
    score -= site.distanceMiles * 1.5;

    // Reward Elevation
    if (site.elevation === "High") score += 10;

    // Penalize Clouds
    score -= site.weather.cloudCover * 0.5;

    // Penalize Cost
    score -= (site.entryCost + site.parkingCost) * 0.5;

    // Penalize Crowds
    if (site.crowdLevel === "Extreme") score -= 15;
    if (site.crowdLevel === "High") score -= 5;

    return Math.max(0, Math.round(score));
}
