import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type AccountDocument = HydratedDocument<Account>;

@Schema()
export class Account {
  @Prop(
  //   {
  //   type: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'User',
  //   },
  // }
  )
  userId: string;

  @Prop()
  paymentID: string

  @Prop()
  balance: number
}

export const AccountSchema = SchemaFactory.createForClass(Account);
