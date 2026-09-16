import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Vessel, VesselDocument } from './vessel.schema';
import {
  VesselAvailabilityDeclaration,
  VesselAvailabilityDeclarationDocument,
} from './vessel-availability.schema';

const getRecommendationUrl = () => process.env.RECOMMENDATION_SERVICE_URL || 'http://localhost:8001';
const getPredictionUrl = () => process.env.PREDICTION_SERVICE_URL || 'http://localhost:8000';

@Injectable()
export class VesselsService {
  constructor(
    @InjectModel(Vessel.name) private vessels: Model<VesselDocument>,
    @InjectModel(VesselAvailabilityDeclaration.name)
    private declarations: Model<VesselAvailabilityDeclarationDocument>,
    private http: HttpService,
  ) {}

  declareAvailability(vesselId: string, data: any) {
    const shipownerId = data.shipowner_user_id || 'carrier_user_01';
    const isAvailable = data.available_bool !== undefined 
      ? Boolean(data.available_bool) 
      : (data.declared_status === 'Available' || data.status === 'Available' || true);
    const portId = data.loading_port_id || data.open_port || 'paradip';

    return this.declarations.create({
      vessel_id: vesselId,
      shipowner_user_id: shipownerId,
      available_bool: isAvailable,
      loading_port_id: portId,
    });
  }

  // DESIGN.md §4 — shipowner-initiated, never a background scan
  async getDeadheading(vesselId: string, loadingPortId: string) {
    const res = await firstValueFrom(
      this.http.post(`${getRecommendationUrl()}/internal/optimize/deadheading`, {
        vessel_id: vesselId,
        loading_port_id: loadingPortId,
      }),
    );
    return res.data;
  }

  async getAlternativeEmployment(vesselId: string) {
    const res = await firstValueFrom(
      this.http.post(`${getPredictionUrl()}/internal/recommend/alternative-employment`, {
        vessel_id: vesselId,
      }),
    );
    return res.data;
  }

  async getEta(vesselId: string, body: any) {
    const res = await firstValueFrom(
      this.http.post(`${getRecommendationUrl()}/internal/predict/eta`, { vessel_id: vesselId, ...body }),
    );
    return res.data;
  }

  async findByIdOrMmsi(idOrMmsi: string) {
    try {
      if (/^[0-9a-fA-F]{24}$/.test(idOrMmsi)) {
        return await this.vessels.findById(idOrMmsi).exec();
      }
      return await this.vessels.findOne({ mmsi: idOrMmsi }).exec();
    } catch {
      return null;
    }
  }
}

