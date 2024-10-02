import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';
import { stationNames, StateStations } from '../../../stations'; // Import station data from stations.ts
import { fetchStationData, calculateAverages, rankStations } from '../../../recommendation';

// MongoDB connection URI and DB name
const uri = 'mongodb+srv://triet_le:12345@datascienceproj.n0xik.mongodb.net/';


const dbName = "FIT3164";

let cachedClient: MongoClient | null = null;

async function getClient() {
  if (!cachedClient) {
    const client = new MongoClient(uri);
    cachedClient = await client.connect();
    console.log("MongoDB connected100");
  }
  return cachedClient;
}

// Main API function to fetch weather data, calculate averages, and rank stations
export async function GET(req:any) {
    let client;
    try {
      client = await getClient();
      const db = client.db(dbName);
      console.log("hey");
      const queryParams = new URLSearchParams(req.url.split('?')[1]);
      const rainfall = queryParams.get('rainfall');
      const temperature = queryParams.get('temperature');
      const state = queryParams.get('state');
      const month = queryParams.get('month');
      console.log('Parsed parameters:', { rainfall, temperature, state, month });
  
      if (state === null|| month=== null) {
        return NextResponse.json({ error: 'State or month is required' }, { status: 400 });
    }
      if (!(state in stationNames)) {
        return NextResponse.json({ error: 'State not found' }, { status: 400 });
      }
  
      const rainPreference = rainfall === 'High' ? 'High' : 'Low';
      const tempPreference = temperature === 'High' ? 'High' : 'Low';
  
      const stations = stationNames[state as keyof StateStations];
      const stationAverages: { stationName: string, avgRain: number, avgTemp: number, touristSpot: string }[] = [];
  
      for (const station of stations) {
        const stationData = await fetchStationData(station, month, db);
        console.log(`Data for station ${station}:`, stationData);
        if (stationData.length > 0) {
          const { avgRain, avgTemp } = calculateAverages(stationData);
          console.log(`Averages for station ${station}: Avg Rain: ${avgRain}, Avg Temp: ${avgTemp}`);
          stationAverages.push({
            stationName: station,
            avgRain,
            avgTemp,
            touristSpot: stationData[0].Tourist_Spot_Name,
          });
        }
      }

      if (stationAverages.length === 0) {
        return NextResponse.json({ message: 'No data found for the given parameters.' }, { status: 404 });
      }
  
      const rankedStations = rankStations(stationAverages, rainPreference, tempPreference, 0.5, 0.5);
      if (rankedStations.length === 0) {
        return NextResponse.json({ message: 'No suitable stations found.' }, { status: 404 });
      }
  
      return NextResponse.json({ rankedStations });
    } catch (error) {
      console.error('Error occurred:', error);
      return NextResponse.json({ error: 'Error fetching data.' }, { status: 500 });
    } finally {
      if (client) {
        await client.close();
      }
    }
  }