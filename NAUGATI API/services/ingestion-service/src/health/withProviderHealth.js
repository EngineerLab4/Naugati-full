import {
  PROVIDER_STATUS,
  markProviderSuccess,
  markProviderFailure,
  markCredentialPending,
  markRateLimited
} from "./providerHealth.js";
import {
  getProviderHealth,
  setProviderHealth
} from "./providerHealthRegistry.js";

function isCredentialPendingError(error) {
  const msg = String(error?.message || error || "").toLowerCase();
  return (
    msg.includes("api key is missing") ||
    msg.includes("credential is missing") ||
    msg.includes("credential is not configured") ||
    msg.includes("userkey is missing")
  );
}

function isRateLimitError(error) {
  if (error?.status === 429 || error?.response?.status === 429) {
    return true;
  }
  const msg = String(error?.message || error || "").toLowerCase();
  return (
    msg.includes("429") ||
    msg.includes("rate limit") ||
    msg.includes("rate limited") ||
    msg.includes("throttling")
  );
}

function extractRetryAfter(error) {
  return (
    error?.retryAfter ??
    error?.retry_after ??
    error?.response?.headers?.["retry-after"] ??
    error?.response?.headers?.["Retry-After"] ??
    null
  );
}

export async function withProviderHealth(provider, operation) {
  if (typeof provider !== "string" || !provider.trim()) {
    throw new Error("Invalid input: 'provider' must be a non-empty string.");
  }

  if (typeof operation !== "function") {
    throw new Error("Invalid input: 'operation' must be a function.");
  }

  // Ensure provider exists in registry before executing operation
  getProviderHealth(provider);
  const startedAt = Date.now();

  try {
    const result = await operation();
    const latencyMs = Date.now() - startedAt;

    const currentRecord = getProviderHealth(provider);
    const updated = markProviderSuccess(currentRecord, latencyMs);
    setProviderHealth(provider, updated);

    return result;
  } catch (error) {
    if (isCredentialPendingError(error)) {
      const currentRecord = getProviderHealth(provider);
      const updated = markCredentialPending(currentRecord);
      setProviderHealth(provider, updated);
      throw error;
    }

    if (isRateLimitError(error)) {
      const retryAfter = extractRetryAfter(error);
      const currentRecord = getProviderHealth(provider);
      const updated = markRateLimited(currentRecord, {
        error,
        retryAfter
      });
      setProviderHealth(provider, updated);
      throw error;
    }

    // Generic failure
    const latencyMs = Date.now() - startedAt;
    const currentRecord = getProviderHealth(provider);
    const updated = markProviderFailure(currentRecord, {
      error,
      status: PROVIDER_STATUS.DOWN,
      latencyMs
    });
    setProviderHealth(provider, updated);

    throw error;
  }
}
