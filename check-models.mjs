import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("GEMINI_API_KEY not found in env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        console.log("Fetching available models...");
        // GoogleGenerativeAI SDK doesn't have a direct listModels on the client instance in some versions,
        // but typically it's under the model manager or confirmed by trying a known one.
        // Actually the node SDK usually uses a specific manager. 
        // Let's try to just use valid known models or check for permissions.
        // Wait, the SDK definitely supports listing models via `getGenerativeModel`? No.

        // Alternative: Use fetch directly for list models endpoint if SDK is ambiguous.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => console.log(`- ${m.name}`));
        } else {
            console.log("No models found or error structure:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("Failed to list models:", error);
    }
}

listModels();
