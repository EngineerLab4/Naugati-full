import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PredictionsController } from './predictions.controller';
import { PredictionsService } from './predictions.service';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [HttpModule, IntegrationsModule],
  controllers: [PredictionsController],
  providers: [PredictionsService],
  exports: [PredictionsService],
})
export class PredictionsModule {}
