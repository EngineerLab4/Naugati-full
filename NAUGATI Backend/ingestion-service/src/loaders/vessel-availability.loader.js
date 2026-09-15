const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { getDb } = require('../lib/mongo');
const { recordHealth } = require('../lib/dataSourceHealth');

// VesselPerformance dataset (avg_delay_hist, incident_count, fuel_efficiency_json)
module.exports = async function loadVesselAvailability(filePath = process.env.VESSEL_AVAILABILITY_CSV) {
  try {
    const csv = fs.readFileSync(filePath, 'utf8');
    const rows = parse(csv, { columns: true, skip_empty_lines: true });
    const db = await getDb();
    const performance = db.collection('vessel_performance');

    for (const row of rows) {
      await performance.updateOne(
        { vessel_id: row.vessel_id },
        {
          $set: {
            avg_delay_hist: parseFloat(row.avg_delay_hist),
            incident_count: parseInt(row.incident_count, 10),
            fuel_efficiency_json: row.fuel_efficiency_json ? JSON.parse(row.fuel_efficiency_json) : {},
          },
        },
        { upsert: true },
      );
    }

    await recordHealth('vessel_availability_dataset', 'dataset', 'ok');
    return { loaded: rows.length };
  } catch (err) {
    await recordHealth('vessel_availability_dataset', 'dataset', 'failed', err.message);
    throw err;
  }
};
