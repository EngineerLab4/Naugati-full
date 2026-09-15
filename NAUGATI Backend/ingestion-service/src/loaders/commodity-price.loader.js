const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { recordHealth } = require('../lib/dataSourceHealth');

// ARCHITECTURE.md §2 — commodity price is an OPEN QUESTION: dataset vs API.
// This loader covers the dataset path; if the team decides on a live API
// instead, add commodity-price.poller.js under ../pollers and retire this file.
module.exports = async function loadCommodityPrice(filePath = process.env.COMMODITY_PRICE_CSV) {
  try {
    const csv = fs.readFileSync(filePath, 'utf8');
    const rows = parse(csv, { columns: true, skip_empty_lines: true });
    // TODO: persist to a `commodity_prices` collection once the shape is finalized
    await recordHealth('commodity_price', 'dataset', 'ok');
    return { loaded: rows.length };
  } catch (err) {
    await recordHealth('commodity_price', 'dataset', 'failed', err.message);
    throw err;
  }
};
