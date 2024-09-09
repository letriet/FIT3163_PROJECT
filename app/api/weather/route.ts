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
    console.log("MongoDB connected");
  }
  return cachedClient;
}

export async function GET() {
  try {
    const client = await getClient();
    const db = client.db(dbName);

    console.log(`Fetching collections from database: ${dbName}`);

    // Fetch collections in parallel
    const collections = await db.listCollections().toArray();

    // Limit the number of collections processed to prevent overloading (e.g., only process 10 collections at a time)
    const limitedCollections = collections.slice(0, 218);  // Adjust this limit as needed

    // Fetch documents from each collection in parallel
    const weatherStations = await Promise.all(
      limitedCollections.map(async (collectionInfo) => {
        const collection = db.collection(collectionInfo.name);

        // Fetch only a limited number of documents (e.g., 100)
        const documents = await collection.find().limit(1050).toArray();

        if (documents.length > 0) {
          const firstDoc = documents[0];  // Assume first doc has Lat/Long

          const weatherData = documents.map((doc) => ({
            index: doc.index,
            date: doc.Date,
            rain: doc.Rain,
            max_temperature: doc.Max_temperature,
            min_temperature: doc.Min_temperature,
          }));

          return {
            name: collectionInfo.name,
            latitude: firstDoc.Latitude,
            longitude: firstDoc.Longitude,
            data: weatherData,
          };
        }

        return null;  // Return null if no data
      })
    );

    // Filter out any null responses
    const filteredWeatherStations = weatherStations.filter(station => station !== null);

    console.log(`Fetched data from ${filteredWeatherStations.length} collections`);

    return NextResponse.json(filteredWeatherStations);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}