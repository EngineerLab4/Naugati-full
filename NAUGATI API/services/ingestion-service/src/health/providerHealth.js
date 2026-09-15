export const PROVIDER_STATUS = Object.freeze({
  UP: "UP",
  DOWN: "DOWN",
  DEGRADED: "DEGRADED",
  RATE_LIMITED: "RATE_LIMITED",
  CREDENTIAL_PENDING: "CREDENTIAL_PENDING",
  UNKNOWN: "UNKNOWN"
});

export function createProviderHealthRecord(provider) {
  if (typeof provider !== "string" || !provider.trim()) {
    throw new Error("Invalid input: 'provider' must be a non-empty string.");
  }

  const now = new Date().toISOString();

  return {
    provider: provider.trim(),
    status: PROVIDER_STATUS.UNKNOWN,

    last_attempt_at: null,
    last_success_at: null,

    latency_ms: null,

    last_error: null,
    retry_after: null,

    consecutive_failures: 0,

    fetched_at: now
  };
}

export function markProviderSuccess(previousRecord, latencyMs) {
  if (!previousRecord || typeof previousRecord !== "object") {
    throw new Error("Invalid input: 'previousRecord' must be a valid health record object.");
  }

  const now = new Date().toISOString();
  const validLatency =
    typeof latencyMs === "number" && !Number.isNaN(latencyMs) && latencyMs >= 0
      ? latencyMs
      : null;

  return {
    ...previousRecord,
    status: PROVIDER_STATUS.UP,
    last_attempt_at: now,
    last_success_at: now,
    latency_ms: validLatency,
    last_error: null,
    retry_after: null,
    consecutive_failures: 0,
    fetched_at: now
  };
}

export function markProviderFailure(
  previousRecord,
  { error, status = PROVIDER_STATUS.DOWN, latencyMs = null } = {}
) {
  if (!previousRecord || typeof previousRecord !== "object") {
    throw new Error("Invalid input: 'previousRecord' must be a valid health record object.");
  }

  const validStatus = Object.values(PROVIDER_STATUS).includes(status)
    ? status
    : PROVIDER_STATUS.DOWN;

  const now = new Date().toISOString();
  const validLatency =
    typeof latencyMs === "number" && !Number.isNaN(latencyMs) && latencyMs >= 0
      ? latencyMs
      : null;

  const errorString =
    typeof error === "string"
      ? error
      : error?.message || (error ? String(error) : "Unknown provider error");

  return {
    ...previousRecord,
    status: validStatus,
    last_attempt_at: now,
    latency_ms: validLatency,
    last_error: errorString,
    retry_after: null,
    consecutive_failures: (previousRecord.consecutive_failures || 0) + 1,
    fetched_at: now
  };
}

export function markCredentialPending(previousRecord) {
  if (!previousRecord || typeof previousRecord !== "object") {
    throw new Error("Invalid input: 'previousRecord' must be a valid health record object.");
  }

  const now = new Date().toISOString();

  return {
    ...previousRecord,
    status: PROVIDER_STATUS.CREDENTIAL_PENDING,
    last_attempt_at: now,
    latency_ms: null,
    last_error: null,
    retry_after: null,
    fetched_at: now
  };
}

export function markRateLimited(
  previousRecord,
  { error, retryAfter = null } = {}
) {
  if (!previousRecord || typeof previousRecord !== "object") {
    throw new Error("Invalid input: 'previousRecord' must be a valid health record object.");
  }

  const now = new Date().toISOString();
  const errorString =
    typeof error === "string"
      ? error
      : error?.message || (error ? String(error) : "Rate limit reached");

  return {
    ...previousRecord,
    status: PROVIDER_STATUS.RATE_LIMITED,
    last_attempt_at: now,
    last_error: errorString,
    retry_after: retryAfter ?? null,
    consecutive_failures: (previousRecord.consecutive_failures || 0) + 1,
    fetched_at: now
  };
}

export function isProviderDataStale(record, maxAgeMs) {
  if (!record || typeof record !== "object") {
    throw new Error("Invalid input: 'record' must be a valid health record object.");
  }

  if (typeof maxAgeMs !== "number" || Number.isNaN(maxAgeMs) || maxAgeMs <= 0) {
    throw new Error("Invalid input: 'maxAgeMs' must be a positive number.");
  }

  if (!record.last_success_at) {
    return true;
  }

  const lastSuccessTimestamp = new Date(record.last_success_at).getTime();
  if (Number.isNaN(lastSuccessTimestamp)) {
    return true;
  }

  return Date.now() - lastSuccessTimestamp > maxAgeMs;
}
