import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/user/schemas/user.schema';

export type AccountDocument = HydratedDocument<Account>;

@Schema()
export class Account {
  @ApiProperty()
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
  })
  profile: User;

  @ApiProperty()
  @Prop()
  paymentID: string;

  @ApiProperty()
  @Prop()
  balance: number;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
