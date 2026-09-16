import { Body, Controller, Get, NotFoundException, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { VesselsService } from './vessels.service';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { AisStreamService } from '../integrations/aisstream.service';

@ApiTags('Vessels')
@Controller('vessels')
export class VesselsController {
  constructor(
    private readonly vessels: VesselsService,
    private readonly aisStream: AisStreamService,
  ) {}

  @ApiOperation({ summary: 'Get all live AIS-tracked vessels' })
  @Get('live')
  getLiveVessels() {
    return this.aisStream.getLiveVessels();
  }

  @ApiOperation({ summary: 'Get vessel by MMSI or ID (checks live AIS stream, then database)' })
  @Get(':id')
  async getVessel(@Param('id') id: string) {
    // 1. Check live AIS stream by MMSI
    const live = this.aisStream.getVesselByMmsi(id);
    if (live) {
      return live;
    }

    // 2. Fall back to database vessel
    const dbVessel = await this.vessels.findByIdOrMmsi(id);
    if (dbVessel) {
      return dbVessel;
    }

    throw new NotFoundException(`Vessel with MMSI or ID '${id}' not found`);
  }

  @ApiOperation({ summary: 'Declare vessel availability (Shipowner portal)' })
  @Post(':id/availability')
  declareAvailability(@Param('id') id: string, @Body() body: any) {
    return this.vessels.declareAvailability(id, body);
  }

  @ApiOperation({ summary: 'Calculate vessel deadheading' })
  @Get(':id/deadheading')
  getDeadheading(@Param('id') id: string, @Query('loading_port_id') loadingPortId: string) {
    return this.vessels.getDeadheading(id, loadingPortId);
  }

  @ApiOperation({ summary: 'Calculate alternative employment options' })
  @Get(':id/alternative-employment')
  getAlternativeEmployment(@Param('id') id: string) {
    return this.vessels.getAlternativeEmployment(id);
  }

  @ApiOperation({ summary: 'Calculate vessel voyage ETA' })
  @Get(':id/eta')
  getEta(@Param('id') id: string, @Query() query: any) {
    return this.vessels.getEta(id, query);
  }
}
