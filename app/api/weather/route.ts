import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// MongoDB connection URI and DB name
const uri = "mongodb+srv://triet_le:12345@datascienceproj.n0xik.mongodb.net/";
const dbName = "FIT3164";

let cachedClient: MongoClient | null = null;

async function getClient() {
  if (!cachedClient) {
    const client = new MongoClient(uri);
    cachedClient = await client.connect();
    console.log("MongoDB connected");  // Log connection success
  }
  return cachedClient;
}

export async function GET() {
  try {
    const client = await getClient();
    const db = client.db(dbName);

    // Log when accessing collections
    console.log(`Accessing collections in database: ${dbName}`);

    // Get all collections (weather stations)
    const collections = await db.listCollections().toArray();
    console.log("Collections retrieved:", collections);  // Log collections

    const weatherStations: any[] = [];

    for (const collectionInfo of collections) {
      const collection = db.collection(collectionInfo.name);
      const documents = await collection.find().toArray();

      // Log the number of documents found in the collection
      console.log(`Collection: ${collectionInfo.name}, Documents found: ${documents.length}`);

      // Transform MongoDB documents into your WeatherStation structure
      if (documents.length > 0) {
        const firstDoc = documents[0]; // Assume first doc has Lat/Long
        const weatherData = documents.map((doc) => ({
          index: doc.index,
          date: doc.Date,
          rain: doc.Rain,
          max_temperature: doc.Max_temperature,
          min_temperature: doc.Min_temperature,
        }));

        weatherStations.push({
          name: collectionInfo.name,
          latitude: firstDoc.Latitude,
          longitude: firstDoc.Longitude,
          data: weatherData,
        });
      }
    }

    // Log the weather stations data being returned
    console.log("Weather stations data prepared:", weatherStations);

    return NextResponse.json(weatherStations);  // Return the weather stations as JSON
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
