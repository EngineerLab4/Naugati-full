import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PortDocument = Port & Document;

// dataset load, per ARCHITECTURE.md §2. `location` is a GeoJSON Point with a
// 2dsphere index (see infra/init-mongo.js) — the Mongo replacement for
// PostGIS spatial indexes used in deadheading/port-proximity queries.
@Schema()
export class Port {
  @Prop({ required: true, unique: true })
  unlocode: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  country: string;

  @Prop({
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  })
  location: { type: 'Point'; coordinates: [number, number] };

  @Prop()
  port_type?: string;

  @Prop()
  terminal_type?: string;

  @Prop()
  max_vessel_size?: number;

  @Prop()
  draft_restriction?: number;
}

export const PortSchema = SchemaFactory.createForClass(Port);
PortSchema.index({ location: '2dsphere' });
