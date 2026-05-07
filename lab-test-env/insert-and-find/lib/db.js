const { MongoClient } = require('mongodb');
require('dotenv').config();

let client;

async function connect() {
  if (!client) {
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
  }
  return client.db(process.env.DB_NAME);
}

async function close() {
  if (client) {
    await client.close();
    client = null;
  }
}

module.exports = { connect, close };
