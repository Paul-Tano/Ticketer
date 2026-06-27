import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;
@Schema()
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Concert', required: true })
  concert_id!: Types.ObjectId;

  @Prop({ required: true })
  message!: string;

  @Prop({ default: false })
  read!: boolean;

  @Prop({ default: Date.now() })
  created_at!: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
