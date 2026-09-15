import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ShipmentsService } from './shipments.service';
import { Roles, RolesGuard } from '../auth/roles.guard';

@Controller('shipments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ShipmentsController {
  constructor(private shipments: ShipmentsService) {}

  // DESIGN.md §6 — POST /shipments (single cargo entry)
  @Post()
  @Roles('shipper')
  async create(@Body() body: any) {
    // TODO: pull user_id from req.user once request-scoped decorator is added
    const shipment = await this.shipments.create(body.user_id, body);
    const result = await this.shipments.runShipmentFlow(shipment.id);
    return result;
  }

  @Get(':id/freight-prediction')
  getFreight(@Param('id') id: string) {
    return this.shipments.runShipmentFlow(id).then((r) => r.freight_prediction);
  }

  @Get(':id/vessel-recommendation')
  getVesselRec(@Param('id') id: string) {
    return this.shipments.runShipmentFlow(id).then((r) => r.vessel_recommendation);
  }

  @Get(':id/contract-recommendation')
  getContractRec(@Param('id') id: string) {
    return this.shipments.runShipmentFlow(id).then((r) => r.contract_recommendation);
  }
}
