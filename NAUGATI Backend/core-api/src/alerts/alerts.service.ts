import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Alert, AlertDocument } from './alert.schema';

@Injectable()
export class AlertsService {
  constructor(@InjectModel(Alert.name) private model: Model<AlertDocument>) {}

  // DESIGN.md §8 — event-driven off data changes, consumed from Redis Streams
  create(data: Partial<Alert>) {
    return this.model.create(data);
  }

  findForUser(userId: string) {
    return this.model.find({ user_id: userId }).sort({ created_at: -1 }).exec();
  }

  markRead(id: string) {
    return this.model.updateOne({ _id: id }, { read_bool: true }).exec();
  }
}
