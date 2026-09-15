import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Contract, ContractSchema } from './contract.schema';
import { ContractsService } from './contracts.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Contract.name, schema: ContractSchema }])],
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractsModule {}
