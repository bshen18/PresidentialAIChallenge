import { ViewingLocation } from "./mockData";

const OVERPASS_API = "https://overpass-api.de/api/interpreter";

// Query for parks, beaches, viewpoints, piers within a radius
function buildOverpassQuery(lat: number, lng: number, radiusMeters: number = 20000) {
    return `
    [out:json];
    (
      node["leisure"="park"](around:${radiusMeters},${lat},${lng});
      way["leisure"="park"](around:${radiusMeters},${lat},${lng});
      node["natural"="beach"](around:${radiusMeters},${lat},${lng});
      way["natural"="beach"](around:${radiusMeters},${lat},${lng});
      node["tourism"="viewpoint"](around:${radiusMeters},${lat},${lng});
      node["man_made"="pier"](around:${radiusMeters},${lat},${lng});
      way["man_made"="pier"](around:${radiusMeters},${lat},${lng});
    );
    out center 15;
    `;
}

interface OverpassElement {
    type: "node" | "way";
    id: number;
    lat?: number;
    lon?: number;
    center?: { lat: number; lon: number };
    tags?: { [key: string]: string };
}

// Haversine formula to calculate distance in meters
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

// Calculate bearing (azimuth)
function getBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    const theta = Math.atan2(y, x);
    return (theta * 180 / Math.PI + 360) % 360; // Degrees 0-360
}

export async function fetchNearbyViewingKeypoints(lat: number, lng: number): Promise<ViewingLocation[]> {
    console.log(`Fetching nearby places for ${lat}, ${lng}...`);
    try {
        const query = buildOverpassQuery(lat, lng);
        const response = await fetch(OVERPASS_API, {
            method: "POST",
            body: `data=${encodeURIComponent(query)}`
        });

        if (!response.ok) {
            console.error("Overpass API Error:", response.status, response.statusText);
            return [];
        }

        const data = await response.json();
        const elements = data.elements as OverpassElement[];

        // Filter valid elements and map to ViewingLocation
        const locations: ViewingLocation[] = elements
            .filter(el => (el.lat || el.center) && el.tags && el.tags.name) // Must have name and coords
            .map(el => {
                const locationLat = el.lat || el.center!.lat!;
                const locationLng = el.lon || el.center!.lon!;

                // Calculate distance and azimuth
                const distMeters = getDistanceMeters(lat, lng, locationLat, locationLng);

                // Convert to miles
                const distMiles = Math.round((distMeters / 1609.34) * 10) / 10;

                const azimuth = Math.round(getBearing(lat * Math.PI / 180, lng * Math.PI / 180, locationLat * Math.PI / 180, locationLng * Math.PI / 180));

                let type = "Park";
                if (el.tags?.natural === "beach") type = "Beach";
                if (el.tags?.man_made === "pier") type = "Pier";
                if (el.tags?.tourism === "viewpoint") type = "Viewpoint";

                return {
                    id: `osm-${el.id}`,
                    name: el.tags!.name || "Unnamed Location",
                    distanceMiles: distMiles,
                    azimuth: azimuth,
                    elevation: "Low", // Default
                    amenities: [], // Populate in future
                    isProprietary: false,
                    parkingCost: 0,
                    entryCost: 0,
                    crowdLevel: "Medium",
                    weather: { // Placeholder
                        cloudCover: 0,
                        windSpeed: 0,
                        precipitationChance: 0,
                        condition: "Clear"
                    },
                    coordinates: { lat: locationLat, lng: locationLng }
                };
            });

        // remove duplicates by name
        const uniqueLocations = locations.filter((v, i, a) => a.findIndex(t => t.name === v.name) === i);

        // Limit to closest 10 to clear clutter
        return uniqueLocations.sort((a, b) => a.distanceMiles - b.distanceMiles).slice(0, 10);

    } catch (error) {
        console.error("Failed to fetch nearby places:", error);
        return [];
    }
}
