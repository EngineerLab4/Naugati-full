import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Port, PortSchema } from './port.schema';
import { PortStatus, PortStatusSchema } from './port-status.schema';
import { PortsService } from './ports.service';
import { PortsController } from './ports.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Port.name, schema: PortSchema },
      { name: PortStatus.name, schema: PortStatusSchema },
    ]),
  ],
  controllers: [PortsController],
  providers: [PortsService],
})
export class PortsModule {}
