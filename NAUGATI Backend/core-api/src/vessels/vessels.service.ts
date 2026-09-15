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

const RECOMMENDATION_URL = process.env.RECOMMENDATION_SERVICE_URL || 'http://recommendation-service:8001';
const PREDICTION_URL = process.env.PREDICTION_SERVICE_URL || 'http://prediction-service:8000';

@Injectable()
export class VesselsService {
  constructor(
    @InjectModel(Vessel.name) private vessels: Model<VesselDocument>,
    @InjectModel(VesselAvailabilityDeclaration.name)
    private declarations: Model<VesselAvailabilityDeclarationDocument>,
    private http: HttpService,
  ) {}

  declareAvailability(vesselId: string, data: Partial<VesselAvailabilityDeclaration>) {
    return this.declarations.create({ ...data, vessel_id: vesselId });
  }

  // DESIGN.md §4 — shipowner-initiated, never a background scan
  async getDeadheading(vesselId: string, loadingPortId: string) {
    const res = await firstValueFrom(
      this.http.post(`${RECOMMENDATION_URL}/internal/optimize/deadheading`, {
        vessel_id: vesselId,
        loading_port_id: loadingPortId,
      }),
    );
    return res.data;
  }

  async getAlternativeEmployment(vesselId: string) {
    const res = await firstValueFrom(
      this.http.post(`${PREDICTION_URL}/internal/recommend/alternative-employment`, {
        vessel_id: vesselId,
      }),
    );
    return res.data;
  }

  async getEta(vesselId: string, body: any) {
    const res = await firstValueFrom(
      this.http.post(`${RECOMMENDATION_URL}/internal/predict/eta`, { vessel_id: vesselId, ...body }),
    );
    return res.data;
  }
}
