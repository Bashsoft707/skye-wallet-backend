import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccountService } from 'src/account/account.service';
import { UserDocument } from 'src/user/schemas/user.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './entities/transaction.entity';
import { TransactionDocument } from './schemas/transaction.schema';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    private accountService: AccountService,
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {
    const { amount, sender, receiver } = createTransactionDto;

    try {
      const senderAccount = await this.accountService.findAccount(sender);
      const receiverAccount = await this.accountService.findAccount(receiver);

      console.log('receiver', receiver);

      if (!receiver) {
        throw new Error('Receiver caanot be found');
      }
      const transaction = await this.transactionModel.create({
        sender,
        receiver,
        amount,
      });

      if (transaction) {
        await this.accountService.debit(
          senderAccount[0]._id.toString(),
          amount,
        );
        await this.accountService.credit(
          receiverAccount[0]._id.toString(),
          amount,
        );
      }

      return transaction;
    } catch (error) {
      throw new BadRequestException();
    }
  }

  findAll() {
    return `This action returns all transaction`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
