const { MongoClient } = require('mongodb');
require('dotenv').config();

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.DB_NAME);

  // Stage 1: insert a document here

  // Stage 2: find the document here

  await client.close();
}

main().catch(console.error);