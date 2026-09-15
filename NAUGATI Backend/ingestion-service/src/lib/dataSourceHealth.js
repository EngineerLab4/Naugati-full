const { getDb } = require('./mongo');

// ARCHITECTURE.md §8 / DESIGN.md §5 — DataSourceHealth distinguishes
// kind: api (freshness/retry monitoring) from kind: dataset (load-success only).
async function recordHealth(source, kind, status, errorMessage = null) {
  const db = await getDb();
  await db.collection('data_source_health').updateOne(
    { source },
    {
      $set: {
        kind,
        status,
        error_message: errorMessage,
        last_sync_at: new Date(),
      },
    },
    { upsert: true },
  );
}

module.exports = { recordHealth };
