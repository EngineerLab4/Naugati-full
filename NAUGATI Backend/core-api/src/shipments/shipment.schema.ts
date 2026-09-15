import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ShipmentDocument = Shipment & Document;

// DESIGN.md §5 — single entry powering freight/vessel-type/contract outputs
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Shipment {
  @Prop({ required: true, index: true })
  user_id: string;

  @Prop({ required: true })
  cargo_type: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  unit: string;

  @Prop({ required: true })
  origin: string;

  @Prop({ required: true })
  destination: string;

  @Prop({ required: true })
  loading_port_id: string;

  @Prop({ required: true })
  discharge_port_id: string;

  @Prop({ required: true })
  preferred_loading_date: string;

  @Prop({ required: true })
  required_delivery_date: string;

  @Prop()
  priority?: string;
}

export const ShipmentSchema = SchemaFactory.createForClass(Shipment);
