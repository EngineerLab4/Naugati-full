import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PredictionsService } from './predictions.service';

@ApiTags('Predictions')
@Controller('predictions')
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @ApiOperation({ summary: '1. Multi-horizon Freight Rate Forecast (1M, 3M, 6M)' })
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
}
