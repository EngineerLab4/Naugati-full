import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PortsService } from './ports.service';

@Controller('ports')
@UseGuards(AuthGuard('jwt'))
export class PortsController {
  constructor(private ports: PortsService) {}

  @Get(':id')
  getDetails(@Param('id') id: string) {
    return this.ports.getDetails(id);
  }
}
