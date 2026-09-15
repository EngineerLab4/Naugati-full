import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PortStatusDocument = PortStatus & Document;

// API-refreshed layer on top of the Port dataset (congestion, weather)
@Schema()
export class PortStatus {
  @Prop({ required: true, unique: true, index: true })
  port_id: string;

  @Prop()
  congestion_level?: string;

  @Prop({ type: Object })
  weather_json?: Record<string, unknown>;

  @Prop()
  avg_turnaround_hrs?: number;

  @Prop()
  arrivals_count?: number;

  @Prop()
  departures_count?: number;

  @Prop()
  updated_at?: Date;
}

export const PortStatusSchema = SchemaFactory.createForClass(PortStatus);
