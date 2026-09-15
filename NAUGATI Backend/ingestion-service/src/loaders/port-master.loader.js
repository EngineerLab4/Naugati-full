const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { getDb } = require('../lib/mongo');
const { recordHealth } = require('../lib/dataSourceHealth');

// ARCHITECTURE.md §5 — dataset loaders run as simple batch jobs, no
// downstream event fan-out; they feed queries directly.
module.exports = async function loadPortMaster(filePath = process.env.PORT_MASTER_CSV) {
  try {
    const csv = fs.readFileSync(filePath, 'utf8');
    const rows = parse(csv, { columns: true, skip_empty_lines: true });
    const db = await getDb();
    const ports = db.collection('ports');

    for (const row of rows) {
      await ports.updateOne(
        { unlocode: row.unlocode },
        {
          $set: {
            name: row.name,
            country: row.country,
            location: {
              type: 'Point',
              coordinates: [parseFloat(row.lng), parseFloat(row.lat)], // GeoJSON is [lng, lat]
            },
            port_type: row.port_type,
            terminal_type: row.terminal_type,
            max_vessel_size: row.max_vessel_size,
            draft_restriction: row.draft_restriction ? parseFloat(row.draft_restriction) : undefined,
          },
        },
        { upsert: true },
      );
    }

    await recordHealth('port_dataset', 'dataset', 'ok');
    return { loaded: rows.length };
  } catch (err) {
    await recordHealth('port_dataset', 'dataset', 'failed', err.message);
    throw err;
  }
};
