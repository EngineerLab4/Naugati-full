// Centralized API client connecting the React frontend to the real NAUGATI backend gateway (core-api :3000)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.warn(`[ApiClient] Request to ${endpoint} failed (${err.message}). Using local fallback.`);
      throw err;
    }
  }

  // ==========================================
  // 1. ML PREDICTION ENGINE ENDPOINTS
  // ==========================================

  // 1. Freight Rate Multi-Horizon Prediction (1M, 3M, 6M)
  async getFreightForecast(params) {
    return this.request('/predictions/freight-rate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // 2. 7-Day Market Direction (UP, DOWN, STABLE)
  async getMarketDirection(params) {
    return this.request('/predictions/market-direction', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // 3. Port Congestion & Waiting Hours
  async getPortCongestion(params) {
    return this.request('/predictions/port-congestion', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // 4. Voyage Duration & ETA
  async getVoyageEta(params) {
    return this.request('/predictions/voyage-eta', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // 5. Maritime Weather Risk Assessment
  async getWeatherRisk(params) {
    return this.request('/predictions/weather-risk', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // 6. Next-Day Wave Height Model (ExtraTrees ML Model - Experimental)
  async getWaveHeight(params) {
    return this.request('/predictions/weather/wave-height', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // 7. Charter Optimization Engine (OR / Multi-Vessel)
  async optimizeCharter(params) {
    return this.request('/predictions/charter/optimize', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // 8. Bunker Fuel 7-Day Forecast (Persistence Baseline)
  async getBunkerForecast(params) {
    return this.request('/predictions/bunker/forecast', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // 9. Commodity 1-Month Forecast (Persistence Baseline)
  async getCommodityForecast(params) {
    return this.request('/predictions/commodity/forecast', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // 10. ML Models Health Status
  async getModelsHealth() {
    return this.request('/predictions/health/models', {
      method: 'GET',
    });
  }

  // Real-time Market Overview (Commodities + Macro Benchmarks combined)
  async getMarketOverview() {
    return this.request('/predictions/market-overview', {
      method: 'GET',
    });
  }

  // ==========================================
  // 2. REAL-TIME DATA TELEMETRY INTEGRATIONS
  // ==========================================

  // Live AIS Vessels
  async getLiveVessels() {
    return this.request('/vessels/live', {
      method: 'GET',
    });
  }

  // Single Vessel lookup by MMSI
  async getVesselByMmsi(mmsi) {
    return this.request(`/vessels/${mmsi}`, {
      method: 'GET',
    });
  }

  // Real-Time Commodity Prices
  async getBrent() {
    return this.request('/market/brent', { method: 'GET' });
  }

  async getWTI() {
    return this.request('/market/wti', { method: 'GET' });
  }

  async getNaturalGas() {
    return this.request('/market/natural-gas', { method: 'GET' });
  }

  async getCopper() {
    return this.request('/market/copper', { method: 'GET' });
  }

  async getAluminum() {
    return this.request('/market/aluminum', { method: 'GET' });
  }

  async getWheat() {
    return this.request('/market/wheat', { method: 'GET' });
  }

  // Real Economic Indicators
  async getFedFunds() {
    return this.request('/economic/fedfunds', { method: 'GET' });
  }

  async getEconomicSeries(seriesId) {
    return this.request(`/economic/series/${seriesId}`, { method: 'GET' });
  }

  async getEconomicOverview() {
    return this.request('/economic/overview', { method: 'GET' });
  }

  // Shipowner Operations
  async getDeadheading(vesselId, loadingPortId) {
    return this.request(`/vessels/${vesselId}/deadheading?loading_port_id=${encodeURIComponent(loadingPortId)}`, {
      method: 'GET',
    });
  }

  async getAlternativeEmployment(vesselId) {
    return this.request(`/vessels/${vesselId}/alternative-employment`, {
      method: 'GET',
    });
  }

  async declareAvailability(vesselId, data) {
    return this.request(`/vessels/${vesselId}/availability`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Health check
  async checkBackendHealth() {
    return this.request('/predictions/health', {
      method: 'GET',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
