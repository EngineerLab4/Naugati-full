import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VesselDocument = Vessel & Document;

@Schema()
export class Vessel {
  @Prop({ required: true, unique: true })
  imo: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: String })
  vessel_type: 'handysize' | 'supramax' | 'panamax' | 'capesize';

  @Prop({ required: true })
  dwt: number;

  @Prop({ type: Object })
  dimensions_json?: Record<string, unknown>;

  @Prop()
  draft?: number;

  @Prop()
  built_year?: number;

  @Prop({ required: true })
  owner_user_id: string;
}

export const VesselSchema = SchemaFactory.createForClass(Vessel);
