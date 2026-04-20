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
module.exports = { connect };