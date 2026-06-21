import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ConcertDocument = HydratedDocument<Concert>;

@Schema({ timestamps: true })
export class Concert {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ type: Types.ObjectId, ref: 'Band', required: true })
  band_id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Genre', required: true })
  genre_id!: Types.ObjectId;

  @Prop({ required: true })
  date!: Date;

  @Prop({ required: true })
  location!: string;

  @Prop({ required: true, min: 0 })
  price!: number;

  @Prop({ required: true, min: 0 })
  availableTickets!: number;

  @Prop({ required: true })
  image!: string;
}

export const ConcertSchema = SchemaFactory.createForClass(Concert);
