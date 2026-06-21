import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  username!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ enum: ['admin', 'user'], default: 'user' })
  role!: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Band' }], default: [] })
  favoritBands!: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
