import { Module } from '@nestjs/common';
import { AlphaVantageService } from './alpha-vantage.service';
import { AisStreamService } from './aisstream.service';
import { FredService } from './fred.service';
import { WeatherService } from './weather.service';

import { MarketController } from './market.controller';
import { EconomicController } from './economic.controller';

@Module({
  controllers: [MarketController, EconomicController],
  providers: [AlphaVantageService, AisStreamService, FredService, WeatherService],
  exports: [AlphaVantageService, AisStreamService, FredService, WeatherService],
})
export class IntegrationsModule {}

