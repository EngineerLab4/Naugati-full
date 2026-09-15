const { createPoller, axios } = require('../lib/pollerFactory');

module.exports = createPoller({
  source: 'congestion_api',
  eventName: 'port.congestion.changed',
  fetchFn: async () => {
    const { data } = await axios.get(process.env.CONGESTION_API_URL, {
      headers: { Authorization: `Bearer ${process.env.CONGESTION_API_KEY}` },
    });
    return data;
  },
  transformFn: (raw) => ({ source: 'congestion_api', received_at: new Date().toISOString(), raw }),
});
