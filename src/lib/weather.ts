
interface WeatherPeriod {
    name: string;
    startTime: string;
    endTime: string;
    isDaytime: boolean;
    temperature: number;
    temperatureUnit: string;
    temperatureTrend: string | null;
    probabilityOfPrecipitation: {
        unitCode: string;
        value: number | null;
    };
    windSpeed: string;
    windDirection: string;
    icon: string;
    shortForecast: string;
    detailedForecast: string;
}

export interface LocationWeather {
    point: {
        lat: number;
        lon: number;
    };
    forecast: WeatherPeriod[];
}

const USER_AGENT = "(antigravity-app, contact@example.com)";

export async function getWeatherForecast(lat: number, lon: number): Promise<LocationWeather | null> {
    try {
        // 1. Try NWS first (Best for US)
        const nwsWeather = await fetchNWSWeather(lat, lon);
        if (nwsWeather) return nwsWeather;

        // 2. Fallback to Open-Meteo (Global)
        // console.log("Falling back to Open-Meteo for:", lat, lon);
        return await fetchOpenMeteoWeather(lat, lon);

    } catch (error) {
        console.error("Failed to fetch weather:", error);
        return null;
    }
}

async function fetchNWSWeather(lat: number, lon: number): Promise<LocationWeather | null> {
    try {
        const pointsUrl = `https://api.weather.gov/points/${lat},${lon}`;
        const pointsResponse = await fetch(pointsUrl, {
            headers: { "User-Agent": USER_AGENT }
        });

        if (!pointsResponse.ok) return null; // Likely not in US

        const pointsData = await pointsResponse.json();
        const forecastUrl = pointsData.properties.forecast;

        if (!forecastUrl) return null;

        const forecastResponse = await fetch(forecastUrl, {
            headers: { "User-Agent": USER_AGENT }
        });

        if (!forecastResponse.ok) return null;

        const forecastData = await forecastResponse.json();

        return {
            point: { lat, lon },
            forecast: forecastData.properties.periods as WeatherPeriod[]
        };
    } catch {
        return null;
    }
}

async function fetchOpenMeteoWeather(lat: number, lon: number): Promise<LocationWeather | null> {
    try {
        // Open-Meteo API (Free, no key)
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,wind_direction_10m,weather_code,cloud_cover&hourly=precipitation_probability,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`;

        const response = await fetch(url);
        if (!response.ok) return null;

        const data = await response.json();
        const current = data.current;
        const weatherCode = current.weather_code;

        // Map WMO code to condition string
        const condition = mapWMOToCondition(weatherCode);

        // Construct a single "period" that mimics NWS structure for compatibility
        const weatherPeriod: WeatherPeriod = {
            name: "Current",
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 3600000).toISOString(),
            isDaytime: true, // simplified
            temperature: Math.round(current.temperature_2m),
            temperatureUnit: "F",
            temperatureTrend: null,
            probabilityOfPrecipitation: {
                unitCode: "wmoUnit:percent",
                value: data.hourly.precipitation_probability[0] || 0
            },
            windSpeed: `${Math.round(current.wind_speed_10m)} mph`,
            windDirection: `${current.wind_direction_10m}°`,
            icon: "", // Placeholder or map WMO to icon URL
            shortForecast: condition,
            detailedForecast: `Currently ${condition} with temperatures around ${Math.round(current.temperature_2m)}°F and winds at ${Math.round(current.wind_speed_10m)} mph.`
        };

        return {
            point: { lat, lon },
            forecast: [weatherPeriod]
        };
    } catch (e) {
        console.error("Open-Meteo Fetch Error:", e);
        return null;
    }
}

function mapWMOToCondition(code: number): string {
    // Simple WMO code mapping
    if (code === 0) return "Clear";
    if (code >= 1 && code <= 3) return "Partly Cloudy";
    if (code === 45 || code === 48) return "Foggy";
    if (code >= 51 && code <= 67) return "Rain";
    if (code >= 71 && code <= 77) return "Snow";
    if (code >= 80 && code <= 82) return "Showers";
    if (code >= 95) return "Thunderstorm";
    return "Cloudy";
}

