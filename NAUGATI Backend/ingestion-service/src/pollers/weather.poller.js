const { createPoller, axios } = require('../lib/pollerFactory');

// ARCHITECTURE.md §2 — provider TBD; swap WEATHER_API_URL/KEY when confirmed.
module.exports = createPoller({
  source: 'weather_api',
  eventName: 'weather.updated',
  fetchFn: async () => {
    const { data } = await axios.get(process.env.WEATHER_API_URL, {
      headers: { Authorization: `Bearer ${process.env.WEATHER_API_KEY}` },
    });
    return data;
  },
  transformFn: (raw) => ({ source: 'weather_api', received_at: new Date().toISOString(), raw }),
});
