import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface CommodityMarketQuote {
  commodity: string;
  name?: string;
  price_usd: number;
  unit: string;
  interval?: string;
  source: 'alpha_vantage' | 'cached_baseline';
  last_updated: string;
  history?: Array<{ date: string; value: number }>;
}

@Injectable()
export class AlphaVantageService {
  private readonly logger = new Logger(AlphaVantageService.name);
  private readonly baseUrl = 'https://www.alphavantage.co/query';
  private readonly cache = new Map<string, { data: CommodityMarketQuote; expiresAt: number }>();
  private readonly cacheTtlMs = 60 * 60 * 1000; // 1 hour TTL
  private lastRequestTime = 0;
  private readonly minRequestIntervalMs = 2000; // Safe spacing between requests

  private getApiKey(): string | undefined {
    return process.env.ALPHA_VANTAGE_API_KEY;
  }

  /**
   * Primary commodity data fetcher using Alpha Vantage REST API
   */
  async getCommodityData(functionName: string, interval: string = 'daily'): Promise<CommodityMarketQuote> {
    const cacheKey = `${functionName}_${interval}`.toUpperCase();
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const apiKey = this.getApiKey();
    if (!apiKey) {
      this.logger.warn(`No ALPHA_VANTAGE_API_KEY configured. Serving benchmark baseline for '${functionName}'.`);
      return this.getBaselineQuote(functionName);
    }

    // Rate pacing
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.minRequestIntervalMs) {
      await new Promise((resolve) => setTimeout(resolve, this.minRequestIntervalMs - elapsed));
    }
    this.lastRequestTime = Date.now();

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          function: functionName,
          interval: interval,
          apikey: apiKey,
        },
        timeout: 10000,
      });

      const data = response.data;

      // Handle Alpha Vantage messages, limits, and errors
      if (data && !data['Note'] && !data['Error Message'] && !data['Information']) {
        let price = 0;
        let history: Array<{ date: string; value: number }> = [];

        if (Array.isArray(data['data']) && data['data'].length > 0) {
          const valid = data['data'].find((d: any) => d.value && d.value !== '.');
          price = valid ? parseFloat(valid.value) : 0;
          history = data['data'].slice(0, 10).map((d: any) => ({
            date: d.date,
            value: parseFloat(d.value) || 0,
          }));
        } else if (data['Global Quote']) {
          price = parseFloat(data['Global Quote']['05. price']) || 0;
        }

        if (price > 0) {
          const quote: CommodityMarketQuote = {
            commodity: functionName,
            name: data['name'] || functionName,
            price_usd: price,
            unit: data['unit'] || 'USD',
            interval: interval,
            source: 'alpha_vantage',
            last_updated: new Date().toISOString(),
            history: history,
          };

          this.cache.set(cacheKey, { data: quote, expiresAt: Date.now() + this.cacheTtlMs });
          return quote;
        }
      }

      if (data?.['Note']) {
        this.logger.warn(`Alpha Vantage API rate limit notice reached: ${data['Note'].slice(0, 120)}`);
      }
    } catch (error: any) {
      this.logger.error(`Alpha Vantage API error for '${functionName}': ${error.message}`);
    }

    // Fallback if rate-limited or error
    return this.getBaselineQuote(functionName);
  }

  // Official individual commodity endpoints defined in NAUGATI documentation
  async getWTI(): Promise<CommodityMarketQuote> {
    return this.getCommodityData('WTI', 'daily');
  }

  async getBrent(): Promise<CommodityMarketQuote> {
    return this.getCommodityData('BRENT', 'daily');
  }

  async getNaturalGas(): Promise<CommodityMarketQuote> {
    return this.getCommodityData('NATURAL_GAS', 'daily');
  }

  async getCopper(): Promise<CommodityMarketQuote> {
    return this.getCommodityData('COPPER', 'monthly');
  }

  async getAluminum(): Promise<CommodityMarketQuote> {
    return this.getCommodityData('ALUMINUM', 'monthly');
  }

  async getWheat(): Promise<CommodityMarketQuote> {
    return this.getCommodityData('WHEAT', 'monthly');
  }

  /**
   * General commodity price lookup supporting mapping from cargo / commodity names
   */
  async getCommodityPrice(commodity: string): Promise<CommodityMarketQuote> {
    const key = commodity.toLowerCase().trim();

    if (key.includes('wti')) {
      return this.getWTI();
    } else if (key.includes('oil') || key.includes('brent')) {
      return this.getBrent();
    } else if (key.includes('gas')) {
      return this.getNaturalGas();
    } else if (key.includes('copper')) {
      return this.getCopper();
    } else if (key.includes('aluminum')) {
      return this.getAluminum();
    } else if (key.includes('wheat')) {
      return this.getWheat();
    }

    // Check cached baseline for commodities without direct Alpha Vantage commodity endpoints (e.g. Iron Ore)
    return this.getBaselineQuote(commodity);
  }

  private getBaselineQuote(commodity: string): CommodityMarketQuote {
    const baselines: Record<string, { price: number; unit: string; name: string }> = {
      wti: { price: 74.2, unit: 'dollars per barrel', name: 'Crude Oil Prices: WTI' },
      brent: { price: 78.5, unit: 'dollars per barrel', name: 'Crude Oil Prices: Brent' },
      natural_gas: { price: 2.15, unit: 'dollars per million BTU', name: 'Henry Hub Natural Gas Spot Price' },
      copper: { price: 9240.0, unit: 'dollars per metric ton', name: 'Global Copper Prices' },
      aluminum: { price: 2420.0, unit: 'dollars per metric ton', name: 'Global Aluminum Prices' },
      wheat: { price: 225.0, unit: 'dollars per metric ton', name: 'Global Wheat Prices' },
      'iron ore fines': { price: 112.5, unit: 'dollars per dry metric ton', name: 'Iron Ore Fines 62% FE CFR China' },
      'thermal coal, australian': { price: 138.4, unit: 'dollars per metric ton', name: 'Thermal Coal (Australian Newcastle)' },
      'thermal coal, south african': { price: 110.2, unit: 'dollars per metric ton', name: 'Thermal Coal (Richards Bay)' },
      'wheat, us hard red winter': { price: 225.0, unit: 'dollars per metric ton', name: 'US Hard Red Winter Wheat' },
      maize: { price: 178.0, unit: 'dollars per metric ton', name: 'Maize / Corn' },
      soybeans: { price: 420.0, unit: 'dollars per metric ton', name: 'Soybeans US Gulf' },
      'dap fertilizer': { price: 580.0, unit: 'dollars per metric ton', name: 'Diammonium Phosphate (DAP)' },
    };

    const cleanKey = commodity.toLowerCase().trim();
    let match = baselines[cleanKey];

    if (!match) {
      for (const [k, v] of Object.entries(baselines)) {
        if (cleanKey.includes(k) || k.includes(cleanKey)) {
          match = v;
          break;
        }
      }
    }

    const price = match?.price ?? 110.5;
    const unit = match?.unit ?? 'USD';
    const name = match?.name ?? commodity;

    const quote: CommodityMarketQuote = {
      commodity,
      name,
      price_usd: price,
      unit,
      source: 'cached_baseline',
      last_updated: new Date().toISOString(),
    };

    this.cache.set(cleanKey, { data: quote, expiresAt: Date.now() + 15 * 60 * 1000 });
    return quote;
  }
}
