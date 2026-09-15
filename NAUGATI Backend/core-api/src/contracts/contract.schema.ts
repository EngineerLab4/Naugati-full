import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContractDocument = Contract & Document;

// DESIGN.md §5 — freight_prediction_id enforces the "based on predicted
// rate" dependency (required: true is the Mongoose equivalent of the
// Postgres NOT NULL constraint).
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Contract {
  @Prop({ required: true, index: true })
  shipment_id: string;

  @Prop({ required: true })
  freight_prediction_id: string;

  @Prop({ required: true, type: String })
  contract_type: 'spot' | 'short' | 'medium' | 'long';

  @Prop({ type: Object })
  reasons_json?: Record<string, unknown>;

  @Prop({ type: Object })
  comparison_json?: Record<string, unknown>;

  @Prop({ default: 'recommended', type: String })
  status: 'recommended' | 'accepted';
}

export const ContractSchema = SchemaFactory.createForClass(Contract);
