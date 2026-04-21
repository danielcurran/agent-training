const { MongoClient } = require('mongodb');
require('dotenv').config();

async function seed() {
  const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
  
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME);

    // Create collections with intentionally "wrong" state
    
    // 1. projects collection — flat, no embedding, no index
    const projectsCollection = db.collection('projects');
    await projectsCollection.deleteMany({});
    await projectsCollection.insertMany([
      {
        _id: 'proj-1',
        name: 'Analytics Dashboard',
        status: 'active',
        priority: 1,
        description: 'Real-time analytics and reporting platform for e-commerce'
      },
      {
        _id: 'proj-2',
        name: 'Mobile App Redesign',
        status: 'active',
        priority: 2,
        description: 'Redesign mobile experience for iOS and Android'
      },
      {
        _id: 'proj-3',
        name: 'API Gateway',
        status: 'paused',
        priority: 3,
        description: 'Centralized API gateway for microservices architecture'
      }
    ]);
    console.log('✓ projects collection seeded (3 documents, no indexes, flat schema)');

    // 2. tasks collection — flat with status and priority (no embedding yet)
    const tasksCollection = db.collection('tasks');
    await tasksCollection.deleteMany({});
    await tasksCollection.insertMany([
      {
        _id: 'task-1',
        title: 'Design mockups',
        project_id: 'proj-2',
        status: 'in_progress',
        priority: 1,
        assigned_to: 'alice'
      },
      {
        _id: 'task-2',
        title: 'Setup database',
        project_id: 'proj-1',
        status: 'completed',
        priority: 1,
        assigned_to: 'bob'
      },
      {
        _id: 'task-3',
        title: 'Write API endpoints',
        project_id: 'proj-3',
        status: 'pending',
        priority: 2,
        assigned_to: 'alice'
      }
    ]);
    console.log('✓ tasks collection seeded (3 documents, no indexes)');

    // 3. users collection — flat
    const usersCollection = db.collection('users');
    await usersCollection.deleteMany({});
    await usersCollection.insertMany([
      {
        _id: 'alice',
        name: 'Alice Chen',
        email: 'alice@example.com',
        role: 'engineer'
      },
      {
        _id: 'bob',
        name: 'Bob Smith',
        email: 'bob@example.com',
        role: 'designer'
      }
    ]);
    console.log('✓ users collection seeded (2 documents)');

    await client.close();
    console.log('\nSeed complete. Collections ready for lab.');
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
