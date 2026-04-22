const { MongoClient } = require('mongodb');
require('dotenv').config();

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME);
    
    console.log('✓ Connected to MongoDB');
    console.log(`✓ Database: ${process.env.DB_NAME}`);
    const collectionNames = (await db.listCollections().toArray()).map(c => c.name);
    console.log(`✓ Collections: ${collectionNames.join(', ')}`);
    
  } finally {
    await client.close();
  }
}

main().catch(console.error);
