export const INGESTION_SCHEDULES = Object.freeze({
  "open-meteo": Object.freeze({
    enabled: true,
    interval_ms: 30 * 60 * 1000
  }),
  "searoutes": Object.freeze({
    enabled: false,
    interval_ms: 6 * 60 * 60 * 1000
  }),
  "vesselfinder": Object.freeze({
    enabled: false,
    interval_ms: 15 * 60 * 1000
  }),
  "gdelt": Object.freeze({
    enabled: false,
    interval_ms: 60 * 60 * 1000
  }),
  "trading-economics": Object.freeze({
    enabled: false,
    interval_ms: 60 * 60 * 1000
  })
});
