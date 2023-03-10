import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  name: string;

  @Prop({
    type: String,
    unique: true,
    trim: true,
    index: true,
  })
  email: string;

  @Prop()
  phoneNumber: string;

  @Prop()
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
