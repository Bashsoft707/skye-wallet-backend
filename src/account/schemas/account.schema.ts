import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';

export type AccountDocument = HydratedDocument<Account>;

@Schema()
export class Account {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
  })
  profile: User;

  @Prop()
  paymentID: string;

  @Prop()
  balance: number;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
