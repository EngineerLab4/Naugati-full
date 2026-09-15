const { createPoller, axios } = require('../lib/pollerFactory');

// ARCHITECTURE.md §2 — vendor still being evaluated (AIS or alternative).
// transformFn is the ONLY place that should know the vendor's field names.
module.exports = createPoller({
  source: 'vessel_position_api',
  eventName: 'vessel.position.updated',
  fetchFn: async () => {
    const { data } = await axios.get(process.env.VESSEL_POSITION_API_URL, {
      headers: { Authorization: `Bearer ${process.env.VESSEL_POSITION_API_KEY}` },
    });
    return data;
  },
  transformFn: (raw) => ({ source: 'vessel_position_api', received_at: new Date().toISOString(), raw }),
});
