import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import { Model } from 'mongoose';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account, AccountDocument } from './schemas/account.schema';

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
  ) {}

  async create(userId: string) {
    try {
      const accounts = await this.accountModel.find();

      const userAccounts = accounts.filter(
        (account) => account.userId === userId,
      );

      if (userAccounts.length < 5) {
        const account = await this.accountModel.create({
          userId,
          paymentID: randomBytes(8).toString('hex').substring(0, 7),
          balance: 5000,
        });

        return account;
      }

      throw new BadRequestException('User cannot have more than 5 accounts');
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  findAll(paymentID: string) {
    return this.accountModel.find({ paymentID });
  }

  async findOne(id: string) {
    try {
      const account = await this.accountModel.findById(id);

      if (!account) {
        throw new NotFoundException('Account not found');
      }

      return account;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  update(id: number, updateAccountDto: UpdateAccountDto) {
    return `This action updates a #${id} account`;
  }

  async remove(id: string) {
    try {
      const account = await this.findOne(id);

      await this.accountModel.findByIdAndDelete(id);
      return {
        message: 'Account Deleted',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async search(paymentId: string) {
    try {
      const account = await this.accountModel.findOne({ paymentID: paymentId });

      if (!account) {
        throw new NotFoundException('Account not found');
      }

      return account;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
