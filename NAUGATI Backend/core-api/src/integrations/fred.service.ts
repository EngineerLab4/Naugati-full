import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface EconomicIndicatorSeries {
  series_id: string;
  name: string;
  latest_value: number;
  date: string;
  source: 'fred_api' | 'cached_baseline';
}

@Injectable()
export class FredService {
  private readonly logger = new Logger(FredService.name);
  private readonly baseUrl = 'https://api.stlouisfed.org/fred/series/observations';
  private readonly cache = new Map<string, { data: EconomicIndicatorSeries; expiresAt: number }>();
  private readonly cacheTtlMs = 4 * 60 * 60 * 1000; // 4 hours TTL

  private getApiKey(): string | undefined {
    return process.env.FRED_API_KEY;
  }

  /**
   * Fetches latest economic observations from the Federal Reserve Bank of St. Louis (FRED).
   * Key series used for freight & market modeling:
   * - DGS10: 10-Year Treasury Yield (global cost of capital)
   * - CPIAUCSL: Consumer Price Index (macro inflation)
   * - DTWEXBGS: Trade-Weighted U.S. Dollar Index (currency value for USD freight rates)
   * - DCOILBRENTEU: Brent Crude Oil spot price (marine bunker fuel proxy)
   */
  async getEconomicSeries(seriesId: string): Promise<EconomicIndicatorSeries> {
    const key = seriesId.toUpperCase().trim();
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const apiKey = this.getApiKey();
    if (!apiKey) {
      this.logger.warn(`No FRED_API_KEY configured. Serving baseline for '${key}'.`);
      return this.getBaselineSeries(key);
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          series_id: key,
          api_key: apiKey,
          file_type: 'json',
          sort_order: 'desc',
          limit: 5,
        },
        timeout: 8000,
      });

      const observations = response.data?.observations;
      if (Array.isArray(observations) && observations.length > 0) {
        // Find latest non-empty observation
        const validObs = observations.find((o) => o.value && o.value !== '.');
        if (validObs) {
          const val = parseFloat(validObs.value);
          const result: EconomicIndicatorSeries = {
            series_id: key,
            name: this.getSeriesName(key),
            latest_value: isNaN(val) ? 4.25 : val,
            date: validObs.date,
            source: 'fred_api',
          };
          this.cache.set(key, { data: result, expiresAt: Date.now() + this.cacheTtlMs });
          return result;
        }
      }
    } catch (err: any) {
      this.logger.error(`FRED API call failed for '${key}': ${err.message}`);
    }

    return this.getBaselineSeries(key);
  }

  async getAllMacroIndicators(): Promise<Record<string, EconomicIndicatorSeries>> {
    const series = ['DGS10', 'CPIAUCSL', 'DTWEXBGS', 'DCOILBRENTEU'];
    const results: Record<string, EconomicIndicatorSeries> = {};
    for (const s of series) {
      results[s] = await this.getEconomicSeries(s);
    }
    return results;
  }

  private getSeriesName(id: string): string {
    const map: Record<string, string> = {
      DGS10: '10-Year Treasury Constant Maturity Rate',
      CPIAUCSL: 'Consumer Price Index for All Urban Consumers',
      DTWEXBGS: 'Nominal Broad U.S. Dollar Index',
      DCOILBRENTEU: 'Crude Oil Prices: Brent - Europe',
    };
    return map[id] || id;
  }

  private getBaselineSeries(id: string): EconomicIndicatorSeries {
    const baselines: Record<string, number> = {
      DGS10: 4.18,
      CPIAUCSL: 314.8,
      DTWEXBGS: 122.4,
      DCOILBRENTEU: 78.5,
    };
    const val = baselines[id] || 100.0;
    const res: EconomicIndicatorSeries = {
      series_id: id,
      name: this.getSeriesName(id),
      latest_value: val,
      date: new Date().toISOString().slice(0, 10),
      source: 'cached_baseline',
    };
    this.cache.set(id, { data: res, expiresAt: Date.now() + 30 * 60 * 1000 });
    return res;
  }
}
