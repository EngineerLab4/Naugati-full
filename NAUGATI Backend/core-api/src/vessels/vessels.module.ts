import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { Vessel, VesselSchema } from './vessel.schema';
import {
  VesselAvailabilityDeclaration,
  VesselAvailabilityDeclarationSchema,
} from './vessel-availability.schema';
import { VesselsService } from './vessels.service';
import { VesselsController } from './vessels.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Vessel.name, schema: VesselSchema },
      { name: VesselAvailabilityDeclaration.name, schema: VesselAvailabilityDeclarationSchema },
    ]),
    HttpModule,
  ],
  controllers: [VesselsController],
  providers: [VesselsService],
})
export class VesselsModule {}
