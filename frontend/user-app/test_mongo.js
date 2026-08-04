const { MongoClient } = require('mongodb');

async function run() {
  const uri = "mongodb+srv://joshep3407:Ice12345%40@stepping-stones.x2xjdyc.mongodb.net/?appName=Stepping-Stones";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected successfully!");
    const db = client.db("stepping_stones_v2");
    const count = await db.collection("users").countDocuments();
    console.log("Users count:", count);
  } catch (err) {
    console.error("Connection failed:", err.message);
  } finally {
    await client.close();
  }
}

run();
