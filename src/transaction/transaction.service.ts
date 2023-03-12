import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccountService } from '../account/account.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';

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

      const transaction = await this.transactionModel.create({
        sender,
        receiver,
        amount,
      });

      if (senderAccount[0].balance < amount) {
        throw new BadRequestException('Insufficient balance');
      }

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
      throw new BadRequestException(error.message);
    }
  }

  async outflow(account: string) {
    try {
      const transaction = await this.transactionModel.find({
        sender: account,
      });

      if (transaction.length === 0) {
        throw new BadRequestException(
          'You dont have any outflow transaction on this account',
        );
      }

      return transaction;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async inflow(account: string) {
    try {
      const transaction = await this.transactionModel.find({
        receiver: account,
      });

      console.log('transactions', transaction);

      if (transaction.length === 0) {
        throw new BadRequestException(
          'You dont have any inflow transaction on this account',
        );
      }

      return transaction;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
