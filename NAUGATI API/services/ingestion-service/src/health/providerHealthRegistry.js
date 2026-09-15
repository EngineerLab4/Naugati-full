import { createProviderHealthRecord } from "./providerHealth.js";

const registry = new Map();

function validateProviderName(provider) {
  if (typeof provider !== "string" || !provider.trim()) {
    throw new Error("Invalid input: 'provider' must be a non-empty string.");
  }
  return provider.trim();
}

export function getProviderHealth(provider) {
  const key = validateProviderName(provider);
  if (!registry.has(key)) {
    registry.set(key, createProviderHealthRecord(key));
  }
  return registry.get(key);
}

export function setProviderHealth(provider, record) {
  const key = validateProviderName(provider);
  if (!record || typeof record !== "object") {
    throw new Error(
      "Invalid input: 'record' must be a valid health record object."
    );
  }
  registry.set(key, record);
  return record;
}

export function getAllProviderHealth() {
  return Array.from(registry.values());
}

export function resetProviderHealth(provider) {
  const key = validateProviderName(provider);
  return registry.delete(key);
}

export function resetAllProviderHealth() {
  registry.clear();
}
