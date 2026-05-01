const { MongoClient } = require('mongodb');
require('dotenv').config();

let client;

async function connect() {
  if (!client) {
    client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
    await client.connect();
  }
  return client.db(process.env.MONGODB_DB || 'online_bookstore');
}

async function close() {
  if (client) {
    await client.close();
    client = null;
  }
}

module.exports = { connect, close };
