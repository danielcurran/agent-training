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
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.DB_NAME);

  // Stage 1: insert a document here
  const result = await db.collection('test_items').insertOne({
    name: 'test-item',
    status: 'active',
    created_at: new Date()
  });
  console.log('Inserted document id:', result.insertedId);

  // Stage 2: find the document here
  const doc = await db.collection('test_items').findOne({ name: 'test-item' });
  console.log('Found document:', JSON.stringify(doc, null, 2));

  await client.close();
}

main().catch(console.error);