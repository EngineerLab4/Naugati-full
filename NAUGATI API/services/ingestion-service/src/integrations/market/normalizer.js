function parseNullableNumber(val) {
  if (val === null || val === undefined || val === "") return null;
  const num = Number(val);
  return Number.isNaN(num) ? null : num;
}

export function normalizeTradingEconomicsMarkets(data) {
  const rawList = Array.isArray(data)
    ? data
    : data && typeof data === "object"
    ? [data]
    : [];

  const markets = rawList.map((item) => ({
    symbol: item.Symbol ?? item.symbol ?? null,
    ticker: item.Ticker ?? item.ticker ?? null,
    name: item.Name ?? item.name ?? null,
    country: item.Country ?? item.country ?? null,
    category:
      item.Group ??
      item.group ??
      item.Category ??
      item.category ??
      null,
    market_type:
      item.Type ??
      item.type ??
      null,

    price: parseNullableNumber(
      item.Last ?? item.last ?? item.Price ?? item.price
    ),
    close: parseNullableNumber(
      item.Close ?? item.close
    ),

    daily_change: parseNullableNumber(
      item.DailyChange ??
        item.dailyChange ??
        item.daily_change ??
        item.Change ??
        item.change
    ),
    daily_percent_change: parseNullableNumber(
      item.DailyPercentualChange ??
        item.dailyPercentualChange ??
        item.daily_percent_change ??
        item.PercentChange ??
        item.percentChange
    ),

    unit: item.Unit ?? item.unit ?? null,
    frequency: item.Frequency ?? item.frequency ?? null,

    market_date: item.Date ?? item.date ?? null,
    close_date: item.CloseDate ?? item.closeDate ?? item.close_date ?? null,
    last_update:
      item.LastUpdate ??
      item.lastUpdate ??
      item.last_update ??
      null
  }));

  return {
    markets,
    market_count: markets.length,
    provider: "trading-economics",
    fetched_at: new Date().toISOString()
  };
}

export function filterNaugatiMarketSignals(marketsInput) {
  const list = Array.isArray(marketsInput)
    ? marketsInput
    : Array.isArray(marketsInput?.markets)
    ? marketsInput.markets
    : [];

  const targetKeywords = [
    "coal",
    "iron ore",
    "crude oil",
    "brent",
    "steel",
    "wti"
  ];

  return list.filter((market) => {
    const fieldsToSearch = [
      market.name,
      market.category,
      market.market_type,
      market.symbol,
      market.ticker
    ]
      .filter(Boolean)
      .map((str) => String(str).toLowerCase());

    return targetKeywords.some((keyword) =>
      fieldsToSearch.some((field) => field.includes(keyword))
    );
  });
}
