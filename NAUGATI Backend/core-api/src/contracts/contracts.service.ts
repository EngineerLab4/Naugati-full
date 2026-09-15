import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contract, ContractDocument } from './contract.schema';

@Injectable()
export class ContractsService {
  constructor(@InjectModel(Contract.name) private model: Model<ContractDocument>) {}

  // persists the result row after recommendation-service responds
  persistFromRecommendation(shipmentId: string, freightPredictionId: string, data: Partial<Contract>) {
    return this.model.create({
      ...data,
      shipment_id: shipmentId,
      freight_prediction_id: freightPredictionId,
    });
  }
}
