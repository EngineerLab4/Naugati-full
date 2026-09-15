import {
  PROVIDER_STATUS,
  isProviderDataStale
} from "./providerHealth.js";
import { getProviderHealth } from "./providerHealthRegistry.js";

export const KNOWN_PROVIDERS = Object.freeze([
  "open-meteo",
  "searoutes",
  "vesselfinder",
  "gdelt",
  "trading-economics"
]);

export const PROVIDER_FRESHNESS_CONFIG = Object.freeze({
  "open-meteo": 30 * 60 * 1000,
  "searoutes": 6 * 60 * 60 * 1000,
  "vesselfinder": 15 * 60 * 1000,
  "gdelt": 60 * 60 * 1000,
  "trading-economics": 60 * 60 * 1000
});

export function initializeKnownProviders() {
  return KNOWN_PROVIDERS.map((provider) => getProviderHealth(provider));
}

export function getProviderHealthSummary() {
  const records = initializeKnownProviders();
  const generated_at = new Date().toISOString();

  const totals = {
    total: 0,
    up: 0,
    down: 0,
    degraded: 0,
    rate_limited: 0,
    credential_pending: 0,
    unknown: 0
  };

  const providers = records.map((record) => {
    totals.total += 1;

    switch (record.status) {
      case PROVIDER_STATUS.UP:
        totals.up += 1;
        break;
      case PROVIDER_STATUS.DOWN:
        totals.down += 1;
        break;
      case PROVIDER_STATUS.DEGRADED:
        totals.degraded += 1;
        break;
      case PROVIDER_STATUS.RATE_LIMITED:
        totals.rate_limited += 1;
        break;
      case PROVIDER_STATUS.CREDENTIAL_PENDING:
        totals.credential_pending += 1;
        break;
      case PROVIDER_STATUS.UNKNOWN:
      default:
        totals.unknown += 1;
        break;
    }

    const maxAgeMs =
      PROVIDER_FRESHNESS_CONFIG[record.provider] ?? 60 * 60 * 1000;
    const stale = isProviderDataStale(record, maxAgeMs);

    return {
      provider: record.provider,
      status: record.status,
      last_attempt_at: record.last_attempt_at,
      last_success_at: record.last_success_at,
      latency_ms: record.latency_ms,
      last_error: record.last_error,
      retry_after: record.retry_after,
      consecutive_failures: record.consecutive_failures,
      stale
    };
  });

  return {
    generated_at,
    totals,
    providers
  };
}
