import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VesselAvailabilityDeclarationDocument = VesselAvailabilityDeclaration & Document;

// DESIGN.md §4 — shipowner's Yes/No confirmation, entry point for deadheading
@Schema({ timestamps: { createdAt: 'declared_at', updatedAt: false } })
export class VesselAvailabilityDeclaration {
  @Prop({ required: true, index: true })
  vessel_id: string;

  @Prop({ required: true })
  shipowner_user_id: string;

  @Prop({ required: true })
  available_bool: boolean;

  @Prop({ required: true })
  loading_port_id: string;
}

export const VesselAvailabilityDeclarationSchema = SchemaFactory.createForClass(
  VesselAvailabilityDeclaration,
);
