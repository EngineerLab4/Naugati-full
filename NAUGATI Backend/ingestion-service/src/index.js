const express = require('express');
const cron = require('node-cron');

// --- Lane (a): live API pollers — every 15-60 min, per ARCHITECTURE.md §4 ---
const pollWeather = require('./pollers/weather.poller');
const pollGlobalMarket = require('./pollers/global-market.poller');
const pollGlobalTrade = require('./pollers/global-trade.poller');
const pollCongestion = require('./pollers/congestion.poller');
const pollVesselPosition = require('./pollers/vessel-position.poller');

// --- Lane (b): dataset loaders — daily/weekly/on-demand, per ARCHITECTURE.md §4 ---
const loadPortMaster = require('./loaders/port-master.loader');
const loadHistoricTurnaround = require('./loaders/historic-turnaround.loader');
const loadDistanceTable = require('./loaders/distance-between-ports.loader');
const loadVesselAvailability = require('./loaders/vessel-availability.loader');
const loadCommodityPrice = require('./loaders/commodity-price.loader');

const app = express();
app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));

// Manual trigger endpoints — useful for local dev without waiting on cron.
app.post('/internal/poll/:name', express.json(), async (req, res) => {
  const pollers = {
    weather: pollWeather,
    'global-market': pollGlobalMarket,
    'global-trade': pollGlobalTrade,
    congestion: pollCongestion,
    'vessel-position': pollVesselPosition,
  };
  const fn = pollers[req.params.name];
  if (!fn) return res.status(404).json({ error: 'unknown poller' });
  const result = await fn();
  res.json({ result });
});

app.post('/internal/load/:name', express.json(), async (req, res) => {
  const loaders = {
    'port-master': loadPortMaster,
    'historic-turnaround': loadHistoricTurnaround,
    'distance-table': loadDistanceTable,
    'vessel-availability': loadVesselAvailability,
    'commodity-price': loadCommodityPrice,
  };
  const fn = loaders[req.params.name];
  if (!fn) return res.status(404).json({ error: 'unknown loader' });
  const result = await fn(req.body?.filePath);
  res.json({ result });
});

// --- Cron schedules ---
// Live pollers: every 30 min (tune per-provider rate limits in .env-driven config later)
cron.schedule('*/30 * * * *', pollWeather);
cron.schedule('*/30 * * * *', pollGlobalMarket);
cron.schedule('*/30 * * * *', pollGlobalTrade);
cron.schedule('*/15 * * * *', pollCongestion);
cron.schedule('*/15 * * * *', pollVesselPosition);

// Dataset loaders: daily at 02:00 (adjust once dataset refresh cadence is confirmed)
cron.schedule('0 2 * * *', () => loadPortMaster().catch(console.error));
cron.schedule('0 2 * * *', () => loadHistoricTurnaround().catch(console.error));
cron.schedule('0 2 * * *', () => loadDistanceTable().catch(console.error));
cron.schedule('0 3 * * *', () => loadVesselAvailability().catch(console.error));
cron.schedule('0 3 * * *', () => loadCommodityPrice().catch(console.error));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`ingestion-service listening on :${PORT} (pollers + loaders scheduled)`);
});
