// Import MongoDB and readline
import { MongoClient } from 'mongodb';
// Import the stations data from stations.ts
import { stationNames, StateStations } from './stations';

// MongoDB connection URI
const uri = 'mongodb+srv://nitya_varagam:12345@datascienceproj.n0xik.mongodb.net/';
const client = new MongoClient(uri);



// Define WeatherData type
type WeatherData = {
    Date: string;
    Rain: number;
    Max_temperature: number;
    Min_temperature: number;
    Tourist_Spot_Name: string;
};

// Function to fetch weather data from a station collection
export async function fetchStationData(stationName: string, month: string, database: any): Promise<WeatherData[]> {
    const collection = database.collection(stationName);
    const regex = new RegExp(`-${month}-`, 'i'); // Match the month in the Date field
    const query = { Date: regex };

    const data = await collection.find(query).toArray();

    const weatherData: WeatherData[] = data.map((record:any) => ({
        Date: record.Date,
        Rain: record.Rain,
        Max_temperature: record.Max_temperature,
        Min_temperature: record.Min_temperature,
        Tourist_Spot_Name: record.Tourist_Spot_Name,
    }));

    return weatherData;
}


// Function to calculate average rainfall and temperature for a station
export function calculateAverages(data: WeatherData[]): { avgRain: number, avgTemp: number } {
    let totalRain = 0;
    let totalAvgTemp = 0;

    data.forEach((record) => {
        const dailyAvgTemp = (record.Max_temperature + record.Min_temperature) / 2;
        totalAvgTemp += dailyAvgTemp;
        totalRain += record.Rain;
    });

    const avgRain = totalRain / data.length;
    const avgTemp = totalAvgTemp / data.length;

    return { avgRain, avgTemp };
}

// Function to rank stations based on both rainfall and temperature preferences using weighted average
export function rankStations(
    stationAverages: { stationName: string, avgRain: number, avgTemp: number, touristSpot: string }[],
    rainPreference: 'High' | 'Low',
    tempPreference: 'High' | 'Low',
    rainWeight: number, // Weight assigned to rainfall
    tempWeight: number // Weight assigned to temperature
) {
    return stationAverages
        .map(station => {
            // Calculate score based on preference
            const rainScore = rainPreference === 'High' ? station.avgRain : -station.avgRain;
            const tempScore = tempPreference === 'High' ? station.avgTemp : -station.avgTemp;
            const rainWeight = 0.5; // Weight for rainfall
            const tempWeight = 0.5; // Weight for temperature
            // Weighted average score
            const combinedScore = (rainScore * rainWeight) + (tempScore * tempWeight);

            return { ...station, combinedScore };
        })
        .sort((a, b) => b.combinedScore - a.combinedScore) // Sort by highest score
        .slice(0, 5); // Return top 5 stations
}