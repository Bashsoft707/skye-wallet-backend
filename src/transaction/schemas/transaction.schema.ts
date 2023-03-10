import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Account } from 'src/account/schemas/account.schema';

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema()
export class Transaction {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Account',
  })
  sender: Account;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Account',
  })
  receiver: Account;

  @Prop()
  amount: number;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
