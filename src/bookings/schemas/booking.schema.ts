import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BookingDocument = HydratedDocument<Booking>;

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Concert', required: true })
  concert_id!: Types.ObjectId;

  @Prop({ required: true, unique: true })
  qrCode!: string;

  created_at!: Date;
  updated_at!: Date;
  // @Prop({ required: true, min: 1 })
  // ticketCount!: number;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
