import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PredictionsService } from './predictions.service';

@ApiTags('Predictions')
@Controller('predictions')
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @ApiOperation({ summary: '1. Multi-horizon Freight Rate Forecast (Random Forest ML)' })
  @Post('freight-rate')
  async predictFreightRate(@Body() body: any) {
    return this.predictionsService.predictFreightRate(body);
  }

  @ApiOperation({ summary: '2. 7-Day Market Direction Prediction (UP, DOWN, STABLE)' })
  @Post('market-direction')
  async predictMarketDirection(@Body() body: any) {
    return this.predictionsService.predictMarketDirection(body);
  }

  @ApiOperation({ summary: '3. Port Congestion & Waiting Hours Prediction' })
  @Post('port-congestion')
  async predictPortCongestion(@Body() body: any) {
    return this.predictionsService.predictPortCongestion(body);
  }

  @ApiOperation({ summary: '4. Voyage Duration & ETA Prediction' })
  @Post('voyage-eta')
  async predictVoyageEta(@Body() body: any) {
    return this.predictionsService.predictVoyageEta(body);
  }

  @ApiOperation({ summary: '5. Maritime Weather Risk Assessment' })
  @Post('weather-risk')
  async predictWeatherRisk(@Body() body: any) {
    return this.predictionsService.predictWeatherRisk(body);
  }

  @ApiOperation({ summary: '6. Next-Day Wave Height Model (ExtraTrees ML Model - Experimental)' })
  @Post('weather/wave-height')
  async predictWaveHeight(@Body() body: any) {
    return this.predictionsService.predictWaveHeight(body);
  }

  @ApiOperation({ summary: '7. Charter Optimization Engine (OR / Multi-vessel optimizer)' })
  @Post('charter/optimize')
  async optimizeCharter(@Body() body: any) {
    return this.predictionsService.optimizeCharter(body);
  }

  @ApiOperation({ summary: '8. Bunker Fuel Forecast (7-day Persistence Baseline)' })
  @Post('bunker/forecast')
  async forecastBunker(@Body() body: any) {
    return this.predictionsService.forecastBunker(body);
  }

  @ApiOperation({ summary: '9. Commodity Price Forecast (1-month Persistence Baseline)' })
  @Post('commodity/forecast')
  async forecastCommodity(@Body() body: any) {
    return this.predictionsService.forecastCommodity(body);
  }

  @ApiOperation({ summary: 'Live Commodity & Macroeconomic Market Overview' })
  @Get('market-overview')
  async getMarketOverview() {
    return this.predictionsService.getLiveMarketOverview();
  }

  @ApiOperation({ summary: 'Live AIS Vessel Telemetry Stream' })
  @Get('vessels/live')
  async getLiveVessels() {
    return this.predictionsService.getLiveVessels();
  }

  @ApiOperation({ summary: 'Predictions Gateway Health & Model Status' })
  @Get('health')
  async getHealth() {
    return {
      status: 'ok',
      service: 'core-api/predictions',
      external_apis: {
        alpha_vantage: Boolean(process.env.ALPHA_VANTAGE_API_KEY),
        aisstream: Boolean(process.env.AISSTREAM_API_KEY),
        fred: Boolean(process.env.FRED_API_KEY),
        weather: Boolean(process.env.WEATHER_API_KEY || process.env.OPEN_METEO_BASE_URL),
      },
      timestamp: new Date().toISOString(),
    };
  }

  @ApiOperation({ summary: 'ML Models Health Status (from prediction-service)' })
  @Get('health/models')
  async getModelsHealth() {
    return this.predictionsService.getModelsHealth();
  }
}
