#!/usr/bin/env node
// scripts/seed.js
// Seeds the online_bookstore database with sample data for the Aggregation Foundations lab.
// Run: npm run seed          (add to existing data, skips if already seeded)
// Run: npm run seed:fresh    (drop and reseed — idempotent)

require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

const DROP = process.argv.includes('--drop');
const URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB || 'online_bookstore';

// ------------------------------------------------------------------
// Stable ObjectIds — consistent foreign key references across runs
// ------------------------------------------------------------------

// Customers (50)
const customerIds = Array.from({ length: 50 }, (_, i) =>
  new ObjectId('507f1f77bcf86cd7994390' + String(i + 1).padStart(2, '0'))
);

// Books (30 — embedded in sales; no separate collection)
const GENRES = ['Fantasy', 'Science Fiction', 'Mystery', "Children's literature", 'Romance', 'Non-fiction'];
const BOOKS = [
  { book_id: new ObjectId('507f1f77bcf86cd799439021'), title: 'The Hobbit',                        genre: 'Fantasy',                  price: 12.99 },
  { book_id: new ObjectId('507f1f77bcf86cd799439022'), title: 'Where the Wild Things Are',         genre: "Children's literature",    price: 9.99  },
  { book_id: new ObjectId('507f1f77bcf86cd799439023'), title: 'Dune',                              genre: 'Science Fiction',          price: 14.99 },
  { book_id: new ObjectId('507f1f77bcf86cd799439024'), title: 'The Name of the Wind',              genre: 'Fantasy',                  price: 13.50 },
  { book_id: new ObjectId('507f1f77bcf86cd799439025'), title: 'The Martian',                       genre: 'Science Fiction',          price: 11.99 },
  { book_id: new ObjectId('507f1f77bcf86cd799439026'), title: "Charlotte's Web",                   genre: "Children's literature",    price: 8.99  },
  { book_id: new ObjectId('507f1f77bcf86cd799439027'), title: 'Gone Girl',                         genre: 'Mystery',                  price: 10.99 },
  { book_id: new ObjectId('507f1f77bcf86cd799439028'), title: 'The Very Hungry Caterpillar',       genre: "Children's literature",    price: 7.99  },
  { book_id: new ObjectId('507f1f77bcf86cd799439029'), title: 'Pride and Prejudice',               genre: 'Romance',                  price: 9.50  },
  { book_id: new ObjectId('507f1f77bcf86cd799439030'), title: 'Sapiens',                           genre: 'Non-fiction',              price: 15.99 },
  { book_id: new ObjectId('507f1f77bcf86cd799439031'), title: 'Foundation',                        genre: 'Science Fiction',          price: 12.50 },
  { book_id: new ObjectId('507f1f77bcf86cd799439032'), title: 'A Game of Thrones',                 genre: 'Fantasy',                  price: 16.99 },
  { book_id: new ObjectId('507f1f77bcf86cd799439033'), title: "The Girl with the Dragon Tattoo",  genre: 'Mystery',                  price: 11.50 },
  { book_id: new ObjectId('507f1f77bcf86cd799439034'), title: 'Outlander',                         genre: 'Romance',                  price: 13.99 },
  { book_id: new ObjectId('507f1f77bcf86cd799439035'), title: 'Educated',                          genre: 'Non-fiction',              price: 14.50 },
  { book_id: new ObjectId('507f1f77bcf86cd799439036'), title: 'Neuromancer',                       genre: 'Science Fiction',          price: 10.50 },
  { book_id: new ObjectId('507f1f77bcf86cd799439037'), title: 'The Lightning Thief',               genre: "Children's literature",    price: 10.99 },
  { book_id: new ObjectId('507f1f77bcf86cd799439038'), title: 'Ender\'s Game',                     genre: 'Science Fiction',          price: 11.99 },
  { book_id: new ObjectId('507f1f77bcf86cd799439039'), title: 'The Big Sleep',                     genre: 'Mystery',                  price: 9.99  },
  { book_id: new ObjectId('507f1f77bcf86cd799439040'), title: 'The Notebook',                      genre: 'Romance',                  price: 10.50 },
  { book_id: new ObjectId('507f1f77bcf86cd799439041'), title: 'Becoming',                          genre: 'Non-fiction',              price: 16.99 },
  { book_id: new ObjectId('507f1f77bcf86cd799439042'), title: 'Mistborn',                          genre: 'Fantasy',                  price: 13.99 },
  { book_id: new ObjectId('507f1f77bcf86cd799439043'), title: 'Goodnight Moon',                    genre: "Children's literature",    price: 6.99  },
  { book_id: new ObjectId('507f1f77bcf86cd799439044'), title: 'The Da Vinci Code',                 genre: 'Mystery',                  price: 12.99 },
  { book_id: new ObjectId('507f1f77bcf86cd799439045'), title: 'Me Before You',                     genre: 'Romance',                  price: 11.50 },
  { book_id: new ObjectId('507f1f77bcf86cd799439046'), title: 'The Body Keeps the Score',          genre: 'Non-fiction',              price: 17.99 },
  { book_id: new ObjectId('507f1f77bcf86cd799439047'), title: 'The Way of Kings',                  genre: 'Fantasy',                  price: 18.99 },
  { book_id: new ObjectId('507f1f77bcf86cd799439048'), title: 'Harry Potter and the Sorcerer\'s Stone', genre: "Children's literature", price: 11.99 },
  { book_id: new ObjectId('507f1f77bcf86cd799439049'), title: 'In the Woods',                      genre: 'Mystery',                  price: 10.99 },
  { book_id: new ObjectId('507f1f77bcf86cd799439050'), title: 'Atomic Habits',                     genre: 'Non-fiction',              price: 14.99 },
];

// Customer data
const FIRST_NAMES = ['Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank', 'Grace', 'Henry', 'Iris', 'Jack',
                     'Kate', 'Liam', 'Mia', 'Noah', 'Olivia', 'Paul', 'Quinn', 'Rachel', 'Sam', 'Tara',
                     'Uma', 'Victor', 'Wendy', 'Xander', 'Yara', 'Zoe', 'Aaron', 'Beth', 'Chris', 'Diana',
                     'Ethan', 'Fiona', 'George', 'Hannah', 'Ivan', 'Julia', 'Kevin', 'Laura', 'Mike', 'Nina',
                     'Oscar', 'Penny', 'Quentin', 'Rosa', 'Steve', 'Tracy', 'Uri', 'Vera', 'Will', 'Xena'];
const LAST_NAMES  = ['Johnson', 'Smith', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Taylor',
                     'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Moore', 'Young', 'Lee',
                     'Walker', 'Hall', 'Allen', 'King', 'Wright', 'Hill', 'Scott', 'Green', 'Baker', 'Adams',
                     'Nelson', 'Carter', 'Mitchell', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards',
                     'Collins', 'Stewart', 'Sanchez', 'Morris', 'Rogers', 'Reed', 'Cook', 'Morgan', 'Bell', 'Murphy'];

function rng(seed) {
  // Simple deterministic pseudo-random (LCG) for reproducible data
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

function buildCustomers() {
  return customerIds.map((id, i) => ({
    _id: id,
    first_name: FIRST_NAMES[i],
    last_name: LAST_NAMES[i],
    email: `${FIRST_NAMES[i].toLowerCase()}.${LAST_NAMES[i].toLowerCase()}@example.com`
  }));
}

function buildSales() {
  const rand = rng(42);
  const sales = [];
  const start = new Date('2024-01-01').getTime();
  const end   = new Date('2024-12-31').getTime();

  for (let i = 0; i < 500; i++) {
    const date = new Date(start + rand() * (end - start));
    const customerId = customerIds[Math.floor(rand() * customerIds.length)];
    const numBooks = 1 + Math.floor(rand() * 3); // 1–3 books per sale
    const books = [];
    const chosen = new Set();
    while (books.length < numBooks) {
      const idx = Math.floor(rand() * BOOKS.length);
      if (!chosen.has(idx)) {
        chosen.add(idx);
        books.push({ ...BOOKS[idx] });
      }
    }
    const total = books.reduce((sum, b) => sum + b.price, 0);
    sales.push({
      _id: new ObjectId(),
      date,
      customer_id: customerId,
      books,
      total: Math.round(total * 100) / 100
    });
  }
  return sales;
}

function buildReviews() {
  const rand = rng(99);
  const reviews = [];
  // Span 2018–2024, emphasise post-2018
  const start = new Date('2018-01-01').getTime();
  const end   = new Date('2024-12-31').getTime();

  for (let i = 0; i < 200; i++) {
    const book = BOOKS[Math.floor(rand() * BOOKS.length)];
    const timestamp = new Date(start + rand() * (end - start));
    const reviewer = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)].toLowerCase() + '_' +
                     LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)].toLowerCase();
    reviews.push({
      _id: new ObjectId(),
      book_id: book.book_id,
      rating: 1 + Math.round(rand() * 4), // 1–5
      timestamp,
      reviewer
    });
  }
  return reviews;
}

async function seed() {
  const client = new MongoClient(URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);

    if (DROP) {
      await db.collection('sales').drop().catch(() => {});
      await db.collection('reviews').drop().catch(() => {});
      await db.collection('customers').drop().catch(() => {});
      console.log('✓ Collections dropped.');
    }

    // Customers
    const customers = buildCustomers();
    const custResult = await db.collection('customers').insertMany(customers, { ordered: false }).catch(e => {
      if (e.code === 11000) return { insertedCount: 0 };
      throw e;
    });
    console.log(`✓ customers: ${custResult.insertedCount} document(s) seeded`);

    // Sales
    const sales = buildSales();
    const salesResult = await db.collection('sales').insertMany(sales);
    console.log(`✓ sales: ${salesResult.insertedCount} document(s) seeded`);

    // Reviews
    const reviews = buildReviews();
    const reviewResult = await db.collection('reviews').insertMany(reviews);
    console.log(`✓ reviews: ${reviewResult.insertedCount} document(s) seeded`);

    // Indexes from spec
    await db.collection('sales').createIndex({ date: 1 });
    await db.collection('reviews').createIndex({ timestamp: 1 });
    console.log('✓ Indexes created');

    // Starting state verification
    const salesCount = await db.collection('sales').countDocuments();
    const reviewCount = await db.collection('reviews').countDocuments();
    const custCount   = await db.collection('customers').countDocuments();
    console.log('\n--- Starting state ---');
    console.log(`  sales:     ${salesCount} documents (spanning 2024)`);
    console.log(`  reviews:   ${reviewCount} documents (spanning 2018–2024)`);
    console.log(`  customers: ${custCount} documents`);
    console.log('\n⚠ Query files in queries/ contain // TODO: stubs.');
    console.log('  Complete each stage by filling in the aggregation pipeline logic.');

  } finally {
    await client.close();
  }
}

seed().catch(err => { console.error(err); process.exit(1); });
