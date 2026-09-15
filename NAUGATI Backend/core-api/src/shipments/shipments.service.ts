import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Shipment, ShipmentDocument } from './shipment.schema';

const PREDICTION_URL = process.env.PREDICTION_SERVICE_URL || 'http://prediction-service:8000';
const RECOMMENDATION_URL = process.env.RECOMMENDATION_SERVICE_URL || 'http://recommendation-service:8001';

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectModel(Shipment.name) private model: Model<ShipmentDocument>,
    private http: HttpService,
  ) {}

  create(userId: string, data: Partial<Shipment>) {
    return this.model.create({ ...data, user_id: userId });
  }

  findOne(id: string) {
    return this.model.findById(id).exec();
  }

  // DESIGN.md §3: freight (1) and vessel-type (2) run in parallel;
  // contract (3) is sequenced after (1) — hard dependency on freight_prediction_id.
  async runShipmentFlow(shipmentId: string) {
    const shipment = await this.findOne(shipmentId);
    if (!shipment) throw new Error('Shipment not found');

    const freightPromise = firstValueFrom(
      this.http.post(`${PREDICTION_URL}/internal/predict/freight-rate`, {
        shipment_id: shipment.id,
        origin: shipment.origin,
        destination: shipment.destination,
        cargo_qty: shipment.quantity,
        loading_date: shipment.preferred_loading_date,
      }),
    );
    const vesselTypePromise = firstValueFrom(
      this.http.post(`${RECOMMENDATION_URL}/internal/recommend/vessel-type`, {
        shipment_id: shipment.id,
      }),
    );

    const [freightRes, vesselTypeRes] = await Promise.all([freightPromise, vesselTypePromise]);
    const freight = freightRes.data;

    // step 3 depends on step 1's output — sequenced, not parallel
    const contractRes = await firstValueFrom(
      this.http.post(`${RECOMMENDATION_URL}/internal/recommend/contract`, {
        shipment_id: shipment.id,
        freight_prediction_id: freight.id ?? freight.model_version, // placeholder until persisted row id wired up
      }),
    );

    return {
      shipment_id: shipment.id,
      freight_prediction: freight,
      vessel_recommendation: vesselTypeRes.data,
      contract_recommendation: contractRes.data,
    };
  }
}
