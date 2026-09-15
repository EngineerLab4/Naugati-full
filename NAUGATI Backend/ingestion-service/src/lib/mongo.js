const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/naugati';

let clientPromise;

// Single shared connection, reused by dataSourceHealth.js and all loaders.
function getDb() {
  if (!clientPromise) {
    clientPromise = MongoClient.connect(MONGODB_URI).then((client) => client.db());
  }
  return clientPromise;
}

module.exports = { getDb };
