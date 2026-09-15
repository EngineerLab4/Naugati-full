import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VesselsService } from './vessels.service';
import { Roles, RolesGuard } from '../auth/roles.guard';

@Controller('vessels')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class VesselsController {
  constructor(private vessels: VesselsService) {}

  @Post(':id/availability')
  @Roles('shipowner')
  declareAvailability(@Param('id') id: string, @Body() body: any) {
    return this.vessels.declareAvailability(id, body);
  }

  @Get(':id/deadheading')
  @Roles('shipowner')
  getDeadheading(@Param('id') id: string, @Query('loading_port_id') loadingPortId: string) {
    return this.vessels.getDeadheading(id, loadingPortId);
  }

  @Get(':id/alternative-employment')
  @Roles('shipowner')
  getAlternativeEmployment(@Param('id') id: string) {
    return this.vessels.getAlternativeEmployment(id);
  }

  // Common Feature — either role
  @Get(':id/eta')
  getEta(@Param('id') id: string, @Query() query: any) {
    return this.vessels.getEta(id, query);
  }
}
