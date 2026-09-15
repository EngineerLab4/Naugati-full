import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Port, PortDocument } from './port.schema';
import { PortStatus, PortStatusDocument } from './port-status.schema';

@Injectable()
export class PortsService {
  constructor(
    @InjectModel(Port.name) private ports: Model<PortDocument>,
    @InjectModel(PortStatus.name) private status: Model<PortStatusDocument>,
  ) {}

  async getDetails(id: string) {
    const port = await this.ports.findById(id).exec();
    const status = await this.status.findOne({ port_id: id }).exec();
    return { ...port?.toObject(), status };
  }

  // Nearby-ports lookup using the 2dsphere index — replaces a PostGIS
  // ST_DWithin query.
  async findNear(lng: number, lat: number, maxDistanceMeters = 50000) {
    return this.ports
      .find({
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [lng, lat] },
            $maxDistance: maxDistanceMeters,
          },
        },
      })
      .exec();
  }
}
