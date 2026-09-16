import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AlphaVantageService } from './alpha-vantage.service';

@ApiTags('Market & Commodities')
@Controller('market')
export class MarketController {
  constructor(private readonly alphaVantage: AlphaVantageService) {}

  @ApiOperation({ summary: 'Get Brent Crude Oil spot price' })
  @Get('brent')
  async getBrent() {
    return this.alphaVantage.getBrent();
  }

  @ApiOperation({ summary: 'Get WTI Crude Oil price' })
  @Get('wti')
  async getWTI() {
    return this.alphaVantage.getWTI();
  }

  @ApiOperation({ summary: 'Get Natural Gas price' })
  @Get('natural-gas')
  async getNaturalGas() {
    return this.alphaVantage.getNaturalGas();
  }

  @ApiOperation({ summary: 'Get Copper global commodity price' })
  @Get('copper')
  async getCopper() {
    return this.alphaVantage.getCopper();
  }

  @ApiOperation({ summary: 'Get Aluminum global commodity price' })
  @Get('aluminum')
  async getAluminum() {
    return this.alphaVantage.getAluminum();
  }

  @ApiOperation({ summary: 'Get Wheat global commodity price' })
  @Get('wheat')
  async getWheat() {
    return this.alphaVantage.getWheat();
  }

  @ApiOperation({ summary: 'Get commodity quote by name or symbol' })
  @Get(':commodity')
  async getCommodity(@Param('commodity') commodity: string) {
    return this.alphaVantage.getCommodityPrice(commodity);
  }
}
