import { MongoClient } from "mongodb";

async function fetchData() {
    
    const uri = "mongodb+srv://nitya_varagam:12345@datascienceproj.n0xik.mongodb.net/";
    const client = new MongoClient(uri);
  
    try {
    
      await client.connect();
  
     
      const database = client.db("FIT3164");
      const collection = database.collection("BRISBANE"); // testing for a station
      
      const query = {}; 
      const options = {
        
        projection: { _id: 0 }, 
      };
  
      const cursor = collection.find(query, options);
  
     
      const results = await cursor.toArray();
      console.log("Data fetched:", results);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
     
      await client.close();
    }
  }
  
  fetchData().catch(console.error);
  