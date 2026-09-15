import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserRole = 'shipowner' | 'shipper' | 'org_admin' | 'internal_admin';
export type UserDocument = User & Document;

// DESIGN.md §2 Role Model. Mongo's _id (ObjectId) is the primary key —
// no separate uuid column needed.
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class User {
  @Prop()
  org_id?: string; // extended scope

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password_hash: string;

  @Prop({ required: true, type: String })
  role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
