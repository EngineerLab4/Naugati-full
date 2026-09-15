import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ShipmentsModule } from './shipments/shipments.module';
import { VesselsModule } from './vessels/vessels.module';
import { PortsModule } from './ports/ports.module';
import { ContractsModule } from './contracts/contracts.module';
import { AlertsModule } from './alerts/alerts.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { PredictionsModule } from './predictions/predictions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/naugati', {
      serverSelectionTimeoutMS: 5000,
    }),
    AuthModule,
    UsersModule,
    ShipmentsModule,
    VesselsModule,
    PortsModule,
    ContractsModule,
    AlertsModule,
    IntegrationsModule,
    PredictionsModule,
  ],
})
export class AppModule {}
