import { generateViewingLocations } from "./src/lib/gemini";
import dotenv from "dotenv";

dotenv.config();

console.log("Environment Debug:");
const key = process.env.GEMINI_API_KEY;
console.log("- Key exists?", !!key);
console.log("- Key length:", key ? key.length : 0);
console.log("- Key start:", key ? key.substring(0, 5) + "..." : "N/A");

async function test() {
    console.log("Testing Gemini Location Generation...");

    // Test Case 1: Starbase, TX (Boca Chica)
    const starbaseParams = {
        site: "Starbase, Boca Chica, TX",
        lat: 25.997,
        lng: -97.156
    };

    console.log(`\nGenerating for: ${starbaseParams.site}`);
    const locs1 = await generateViewingLocations(starbaseParams.site, starbaseParams.lat, starbaseParams.lng);

    if (locs1.length > 0) {
        console.log("✅ Success! Found locations:");
        locs1.forEach(l => console.log(`- ${l.name} (${l.distanceMiles} mi) [${l.elevation}]`));
    } else {
        console.error("❌ Failed to generate locations for Starbase.");
    }

    // Test Case 2: Vandenberg (California)
    const vandenbergParams = {
        site: "Vandenberg T-0 Pad, CA",
        lat: 34.632,
        lng: -120.610
    };

    console.log(`\nGenerating for: ${vandenbergParams.site}`);
    const locs2 = await generateViewingLocations(vandenbergParams.site, vandenbergParams.lat, vandenbergParams.lng);

    if (locs2.length > 0) {
        console.log("✅ Success! Found locations:");
        locs2.forEach(l => console.log(`- ${l.name} (${l.distanceMiles} mi) [${l.elevation}]`));
    } else {
        console.error("❌ Failed to generate locations for Vandenberg.");
    }
}

test();
