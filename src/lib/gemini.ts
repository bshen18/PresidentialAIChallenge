import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Launch, ViewingLocation } from "./mockData";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey || "dummy");

export interface LocationAnalysis {
    locationId: string;
    score: number;
    travelTimeMinutes: number;
    isImpossible: boolean;
    reasoning: string;
}

export async function generateLocationAnalysis(
    userLocation: string,
    launch: Launch,
    candidates: ViewingLocation[]
): Promise<LocationAnalysis[]> {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: SchemaType.ARRAY,
                items: {
                    type: SchemaType.OBJECT,
                    properties: {
                        locationId: { type: SchemaType.STRING },
                        score: { type: SchemaType.NUMBER },
                        travelTimeMinutes: { type: SchemaType.NUMBER },
                        isImpossible: { type: SchemaType.BOOLEAN },
                        reasoning: { type: SchemaType.STRING },
                    },
                    required: ["locationId", "score", "travelTimeMinutes", "isImpossible", "reasoning"],
                },
            },
        },
    });

    const candidateInfo = candidates.map(c => ({
        id: c.id,
        name: c.name,
        coordinates: c.coordinates,
        distanceFromPad: c.distanceMiles
    }));

    const prompt = `
    Analyze viewing locations for a rocket launch.
    
    Context:
    - User Starting Location: "${userLocation}"
    - Launch Mission: "${launch.missionName}" (${launch.rocket})
    - Launch Site: "${launch.launchSite}"
    - Launch Date: "${launch.date}"
    - Trajectory: "${launch.trajectory}"

    Task:
    For each candidate location, estimate the driving time from the user's location, calculate a 'viewing score' (0-100) based on visibility/distance/amenities, and determine if it is impossible to reach (isImpossible).
    Also provide a short 'reasoning' string explaining the score.
    
    Candidate Locations:
    ${JSON.stringify(candidateInfo, null, 2)}
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return JSON.parse(text) as LocationAnalysis[];
    } catch (error) {
        console.error("Gemini Analysis Failed:", error);
        if (error instanceof Error) {
            console.error("Error Message:", error.message);
            console.error("Error Stack:", error.stack);
        }
        throw new Error("Failed to analyze locations with Gemini: " + (error instanceof Error ? error.message : "Unknown error"));
    }
}

export async function getUpcomingLaunches(): Promise<Launch[]> {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: SchemaType.ARRAY,
                items: {
                    type: SchemaType.OBJECT,
                    properties: {
                        id: { type: SchemaType.STRING },
                        missionName: { type: SchemaType.STRING },
                        rocket: { type: SchemaType.STRING },
                        provider: { type: SchemaType.STRING },
                        date: { type: SchemaType.STRING },
                        launchSite: { type: SchemaType.STRING },
                        description: { type: SchemaType.STRING },
                        trajectory: { type: SchemaType.STRING, enum: ["Easterly", "Southerly", "Polar"], format: "enum" },
                        scrubRisk: { type: SchemaType.NUMBER },
                    },
                    required: ["id", "missionName", "rocket", "provider", "date", "launchSite", "description", "trajectory", "scrubRisk"],
                },
            },
        },
    });

    const currentDate = new Date().toISOString();
    const prompt = `
    Generate a list of 5 real upcoming rocket launches from Florida or Texas relative to today's date (${currentDate}).
    Use your knowledge of the 2026 launch manifest (Artemis II, Starship flights, Starlink, etc.).
    For "id", create a kebab-case unique string.
    Ensure dates are valid ISO strings in the future.
    estimate scrubRisk (0-100) based on typical reliability and weather patterns for the season.
    `;

    try {
        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text()) as Launch[];
    } catch (error) {
        console.error("Failed to fetch launches:", error);
        return [];
    }
}

export async function getLaunchDetails(id: string): Promise<Launch | null> {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: SchemaType.OBJECT,
                properties: {
                    id: { type: SchemaType.STRING },
                    missionName: { type: SchemaType.STRING },
                    rocket: { type: SchemaType.STRING },
                    provider: { type: SchemaType.STRING },
                    date: { type: SchemaType.STRING },
                    launchSite: { type: SchemaType.STRING },
                    description: { type: SchemaType.STRING },
                    trajectory: { type: SchemaType.STRING, enum: ["Easterly", "Southerly", "Polar"], format: "enum" },
                    scrubRisk: { type: SchemaType.NUMBER },
                },
                required: ["id", "missionName", "rocket", "provider", "date", "launchSite", "description", "trajectory", "scrubRisk"],
            },
        },
    });

    const prompt = `
    Provide details for a rocket launch with ID or name approximate to: "${id}".
    Assume the current year is 2026.
    If it's a generic ID like "starlink", find the next immediate Starlink launch.
    If the ID is specific like "artemis-ii", provide accurate details.
    `;

    try {
        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text()) as Launch;
    } catch (error) {
        console.error("Failed to fetch launch details:", error);
        return null;
    }
}
