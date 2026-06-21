import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BandDocument = HydratedDocument<Band>;

@Schema()
export class Band {
  @Prop({ required: true })
  name!: string;
}

export const BandSchema = SchemaFactory.createForClass(Band);
