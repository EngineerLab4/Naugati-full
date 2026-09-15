import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { Shipment, ShipmentSchema } from './shipment.schema';
import { ShipmentsService } from './shipments.service';
import { ShipmentsController } from './shipments.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Shipment.name, schema: ShipmentSchema }]), HttpModule],
  controllers: [ShipmentsController],
  providers: [ShipmentsService],
})
export class ShipmentsModule {}
