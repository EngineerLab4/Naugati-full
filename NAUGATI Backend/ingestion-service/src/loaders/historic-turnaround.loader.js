const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { getDb } = require('../lib/mongo');
const { recordHealth } = require('../lib/dataSourceHealth');

module.exports = async function loadHistoricTurnaround(filePath = process.env.HISTORIC_TAT_CSV) {
  try {
    const csv = fs.readFileSync(filePath, 'utf8');
    const rows = parse(csv, { columns: true, skip_empty_lines: true });
    const db = await getDb();
    const portStatus = db.collection('port_status');

    for (const row of rows) {
      await portStatus.updateOne(
        { port_id: row.port_id },
        {
          $set: {
            avg_turnaround_hrs: parseFloat(row.avg_turnaround_hrs),
            updated_at: new Date(),
          },
        },
        { upsert: true },
      );
    }

    await recordHealth('historic_tat_dataset', 'dataset', 'ok');
    return { loaded: rows.length };
  } catch (err) {
    await recordHealth('historic_tat_dataset', 'dataset', 'failed', err.message);
    throw err;
  }
};
