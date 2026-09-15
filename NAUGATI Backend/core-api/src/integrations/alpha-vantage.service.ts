import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface CommodityMarketQuote {
  commodity: string;
  price_usd: number;
  unit: string;
  source: 'alpha_vantage' | 'cached_baseline';
  last_updated: string;
}

@Injectable()
export class AlphaVantageService {
  private readonly logger = new Logger(AlphaVantageService.name);
  private readonly baseUrl = 'https://www.alphavantage.co/query';
  private readonly cache = new Map<string, { data: CommodityMarketQuote; expiresAt: number }>();
  private readonly cacheTtlMs = 60 * 60 * 1000; // 1 hour TTL
  private lastRequestTime = 0;
  private readonly minRequestIntervalMs = 12000; // Rate limit: ~5 req/min

  private getApiKey(): string | undefined {
    return process.env.ALPHA_VANTAGE_API_KEY;
  }

  /**
   * Fetches latest commodity quote or market index from Alpha Vantage
   * with rate limiting, timeouts, exponential backoff, and caching.
   */
  async getCommodityPrice(commodity: string): Promise<CommodityMarketQuote> {
    const key = commodity.toLowerCase().trim();
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const apiKey = this.getApiKey();
    if (!apiKey) {
      this.logger.warn(`No ALPHA_VANTAGE_API_KEY configured. Serving benchmark baseline for '${commodity}'.`);
      return this.getBaselineQuote(commodity);
    }

    // Map commodity to Alpha Vantage function
    let avFunction = 'GLOBAL_QUOTE';
    let symbol = 'BDI';
    if (key.includes('oil') || key.includes('brent')) {
      avFunction = 'BRENT';
    } else if (key.includes('gas')) {
      avFunction = 'NATURAL_GAS';
    } else if (key.includes('copper')) {
      avFunction = 'COPPER';
    } else if (key.includes('aluminum')) {
      avFunction = 'ALUMINUM';
    } else if (key.includes('wheat')) {
      avFunction = 'WHEAT';
    } else if (key.includes('corn') || key.includes('maize')) {
      avFunction = 'CORN';
    }

    // Rate limiter throttle
    const now = Date.now();
    const timeSinceLast = now - this.lastRequestTime;
    if (timeSinceLast < this.minRequestIntervalMs) {
      await new Promise((r) => setTimeout(r, this.minRequestIntervalMs - timeSinceLast));
    }
    this.lastRequestTime = Date.now();

    // Exponential backoff retry loop
    const maxRetries = 2;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios.get(this.baseUrl, {
          params: {
            function: avFunction,
            symbol: symbol,
            apikey: apiKey,
          },
          timeout: 8000,
        });

        const data = response.data;
        if (data && !data['Note'] && !data['Error Message'] && !data['Information']) {
          let price = 110.5;
          if (data['data'] && Array.isArray(data['data']) && data['data'].length > 0) {
            price = parseFloat(data['data'][0].value) || price;
          } else if (data['Global Quote']) {
            price = parseFloat(data['Global Quote']['05. price']) || price;
          }

          const quote: CommodityMarketQuote = {
            commodity,
            price_usd: price,
            unit: 'USD',
            source: 'alpha_vantage',
            last_updated: new Date().toISOString(),
          };
          this.cache.set(key, { data: quote, expiresAt: Date.now() + this.cacheTtlMs });
          return quote;
        }
        this.logger.warn(`Alpha Vantage API note/limit reached on attempt ${attempt}: ${JSON.stringify(data).slice(0, 100)}`);
      } catch (err: any) {
        this.logger.error(`Alpha Vantage request failed (attempt ${attempt}/${maxRetries}): ${err.message}`);
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
        }
      }
    }

    return this.getBaselineQuote(commodity);
  }

  private getBaselineQuote(commodity: string): CommodityMarketQuote {
    const baselines: Record<string, number> = {
      'iron ore fines': 112.5,
      aluminum: 2420.0,
      'thermal coal, australian': 138.4,
      'thermal coal, south african': 110.2,
      'wheat, us hard red winter': 225.0,
      maize: 178.0,
      soybeans: 420.0,
      'dap fertilizer': 580.0,
      'brent crude': 78.5,
    };
    const cleanKey = commodity.toLowerCase();
    let price = 110.5;
    for (const [k, v] of Object.entries(baselines)) {
      if (cleanKey.includes(k) || k.includes(cleanKey)) {
        price = v;
        break;
      }
    }
    const quote: CommodityMarketQuote = {
      commodity,
      price_usd: price,
      unit: 'USD',
      source: 'cached_baseline',
      last_updated: new Date().toISOString(),
    };
    this.cache.set(cleanKey, { data: quote, expiresAt: Date.now() + 10 * 60 * 1000 });
    return quote;
  }
}
