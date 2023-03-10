import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema()
export class Transaction {
  @Prop()
  sender: string;

  @Prop()
  receiver: string;

  @Prop()
  amount: number;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
