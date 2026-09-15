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

  // Real-time Market Overview (Alpha Vantage + FRED)
  async getMarketOverview() {
    return this.request('/predictions/market-overview', {
      method: 'GET',
    });
  }

  // Live AIS Vessels (AISStream)
  async getLiveVessels() {
    return this.request('/predictions/vessels/live', {
      method: 'GET',
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
