import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FredService } from './fred.service';

@ApiTags('Economic Indicators')
@Controller('economic')
export class EconomicController {
  constructor(private readonly fred: FredService) {}

  @ApiOperation({ summary: 'Get Federal Funds Rate (FEDFUNDS) from FRED' })
  @Get('fedfunds')
  async getFedFunds() {
    return this.fred.getFedFunds();
  }

  @ApiOperation({ summary: 'Get Macroeconomic indicators overview' })
  @Get('overview')
  async getOverview() {
    return this.fred.getAllMacroIndicators();
  }

  @ApiOperation({ summary: 'Get FRED economic series observations by series ID' })
  @Get('series/:seriesId')
  async getSeries(@Param('seriesId') seriesId: string) {
    return this.fred.getEconomicSeries(seriesId);
  }
}
