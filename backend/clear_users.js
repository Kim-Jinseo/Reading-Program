import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const db = client.db("stepping_stones_v2");
    await db.collection("users").deleteMany({});
    console.log("Cleared users collection");
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
