import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AlertType =
  | 'freight_change'
  | 'vessel_availability'
  | 'eta_change'
  | 'congestion'
  | 'weather'
  | 'geopolitical'
  | 'contract_expiry'
  | 'better_match';

export type AlertDocument = Alert & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Alert {
  @Prop({ required: true, index: true })
  user_id: string;

  @Prop({ required: true, type: String })
  type: AlertType;

  @Prop({ required: true })
  severity: string;

  @Prop({ required: true })
  message: string;

  @Prop()
  recommended_action?: string;

  @Prop({ type: Object })
  related_entity_json?: Record<string, unknown>;

  @Prop({ default: false })
  read_bool: boolean;
}

export const AlertSchema = SchemaFactory.createForClass(Alert);
