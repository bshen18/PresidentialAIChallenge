
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
        // 1. Get grid points
        const pointsUrl = `https://api.weather.gov/points/${lat},${lon}`;
        const pointsResponse = await fetch(pointsUrl, {
            headers: { "User-Agent": USER_AGENT }
        });

        if (!pointsResponse.ok) {
            console.error(`NWS Points API Error: ${pointsResponse.status}`);
            return null;
        }

        const pointsData = await pointsResponse.json();
        const forecastUrl = pointsData.properties.forecast;

        if (!forecastUrl) {
            console.error("No forecast URL found in NWS points data");
            return null;
        }

        // 2. Get forecast
        const forecastResponse = await fetch(forecastUrl, {
            headers: { "User-Agent": USER_AGENT }
        });

        if (!forecastResponse.ok) {
            console.error(`NWS Forecast API Error: ${forecastResponse.status}`);
            return null;
        }

        const forecastData = await forecastResponse.json();

        return {
            point: { lat, lon },
            forecast: forecastData.properties.periods as WeatherPeriod[]
        };

    } catch (error) {
        console.error("Failed to fetch weather:", error);
        return null;
    }
}
