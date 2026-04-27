'use strict';

const { MongoClient } = require('mongodb');
require('dotenv').config();

let client;

async function connect() {
  if (!client) {
    client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
    await client.connect();
  }
  const dbName = process.env.MONGODB_DATABASE || 'esr-lab';
  return client.db(dbName);
}

async function close() {
  if (client) {
    await client.close();
    client = null;
  }
}

module.exports = { connect, close };
