const { createPoller, axios } = require('../lib/pollerFactory');

module.exports = createPoller({
  source: 'global_market_api',
  eventName: 'freight.factor.updated',
  fetchFn: async () => {
    const { data } = await axios.get(process.env.GLOBAL_MARKET_API_URL, {
      headers: { Authorization: `Bearer ${process.env.GLOBAL_MARKET_API_KEY}` },
    });
    return data;
  },
  transformFn: (raw) => ({ source: 'global_market_api', received_at: new Date().toISOString(), raw }),
});
