const { createPoller, axios } = require('../lib/pollerFactory');

module.exports = createPoller({
  source: 'global_trade_api',
  eventName: 'trade.risk.updated',
  fetchFn: async () => {
    const { data } = await axios.get(process.env.GLOBAL_TRADE_API_URL, {
      headers: { Authorization: `Bearer ${process.env.GLOBAL_TRADE_API_KEY}` },
    });
    return data;
  },
  transformFn: (raw) => ({ source: 'global_trade_api', received_at: new Date().toISOString(), raw }),
});
