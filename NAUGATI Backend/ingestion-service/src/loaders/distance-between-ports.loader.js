const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { getDb } = require('../lib/mongo');
const { recordHealth } = require('../lib/dataSourceHealth');

// Feeds Route.distance_nm baseline; used alongside the 2dsphere geospatial
// index (infra/init-mongo.js) rather than replacing it.
module.exports = async function loadDistanceTable(filePath = process.env.DISTANCE_CSV) {
  try {
    const csv = fs.readFileSync(filePath, 'utf8');
    const rows = parse(csv, { columns: true, skip_empty_lines: true });
    const db = await getDb();
    const distances = db.collection('port_distances');

    for (const row of rows) {
      await distances.updateOne(
        { origin_port_id: row.origin_port_id, destination_port_id: row.destination_port_id },
        { $set: { distance_nm: parseFloat(row.distance_nm) } },
        { upsert: true },
      );
    }

    await recordHealth('distance_dataset', 'dataset', 'ok');
    return { loaded: rows.length };
  } catch (err) {
    await recordHealth('distance_dataset', 'dataset', 'failed', err.message);
    throw err;
  }
};
