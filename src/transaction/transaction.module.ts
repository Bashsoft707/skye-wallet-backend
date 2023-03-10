import { forwardRef, Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from 'src/user/user.module';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { AccountModule } from 'src/account/account.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Transaction.name,
        schema: TransactionSchema,
      },
    ]),
    forwardRef(() => UserModule),
    forwardRef(() => AccountModule),
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
