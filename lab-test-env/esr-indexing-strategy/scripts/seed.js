'use strict';

require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'esr-lab';

const CATEGORIES = [
  'Electronics', 'Clothing', 'Books', 'Sports', 'Home',
  'Garden', 'Toys', 'Automotive', 'Beauty', 'Health',
  'Food', 'Office', 'Music', 'Art', 'Travel'
];
const STATUSES = ['active', 'archived', 'draft'];

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomFloat(min, max, decimals = 2) {
  const val = Math.random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateProduct(i) {
  const status = randomElement(STATUSES);
  const category = randomElement(CATEGORIES);
  const hasSaleTag = Math.random() < 0.4;
  const baseTags = [category.toLowerCase()];
  if (hasSaleTag) baseTags.push('sale');
  const extraTags = ['featured', 'new', 'clearance', 'bestseller', 'limited'];
  const numExtra = randomInt(0, 2);
  for (let j = 0; j < numExtra; j++) {
    const tag = randomElement(extraTags);
    if (!baseTags.includes(tag)) baseTags.push(tag);
  }

  const now = new Date();
  const createdAt = new Date(now - randomInt(0, 365 * 3) * 24 * 60 * 60 * 1000);
  const updatedAt = new Date(createdAt.getTime() + randomInt(0, 30) * 24 * 60 * 60 * 1000);

  return {
    name: `Product ${i} - ${category} Item`,
    description: `A high-quality ${category.toLowerCase()} item for everyday use. Product number ${i}.`,
    status,
    category,
    price: randomFloat(5, 2000),
    rating: randomFloat(1, 5, 1),
    tags: baseTags,
    stock: randomInt(0, 500),
    createdAt,
    updatedAt
  };
}

async function seed() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DATABASE);
    const collection = db.collection('products');

    console.log('Dropping existing products collection...');
    await collection.drop().catch(() => {});

    console.log('Generating 10,000 products...');
    const BATCH_SIZE = 1000;
    const TOTAL = 10000;

    for (let start = 0; start < TOTAL; start += BATCH_SIZE) {
      const batch = [];
      for (let i = start; i < Math.min(start + BATCH_SIZE, TOTAL); i++) {
        batch.push(generateProduct(i + 1));
      }
      await collection.insertMany(batch);
      console.log(`  Inserted ${Math.min(start + BATCH_SIZE, TOTAL)} / ${TOTAL}`);
    }

    const count = await collection.countDocuments();
    console.log(`\nSeed complete. Total documents: ${count}`);

    const sample = await collection.findOne({ tags: 'sale' });
    console.log('Sample sale product:', JSON.stringify(sample, null, 2));
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();
