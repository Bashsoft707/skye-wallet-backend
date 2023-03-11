import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import { Model } from 'mongoose';
import { UserDocument } from 'src/user/schemas/user.schema';
import { Account, AccountDocument } from './schemas/account.schema';

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
  ) {}

  async create(user: UserDocument) {
    try {
      const accounts = await this.accountModel.find();

      const userAccounts = accounts.filter(
        (account) => account.profile.toString() === user._id?.toString(),
      );

      if (userAccounts.length < 5) {
        const account = await this.accountModel.create({
          profile: user,
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

  findAll() {
    return this.accountModel.find().populate('profile', '-password');
  }

  async findAccount(paymentID: string) {
    try {
      if (!paymentID) {
        throw new BadRequestException('PaymentID not provided');
      }

      const account = await this.accountModel
        .find({ paymentID })
        .populate('profile', '-password');

      if (account.length === 0) {
        throw new NotFoundException('User not found');
      }

      return account;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findUserAccount(user: UserDocument) {
    return this.accountModel
      .find({ profile: user._id })
      .populate('profile', '-password');
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

  async credit(id: string, amount: number) {
    try {
      const account = await this.findOne(id);

      return this.accountModel.findByIdAndUpdate(
        id,
        {
          balance: Number(account.balance) + amount,
        },
        {
          new: true,
        },
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async debit(id: string, amount: number) {
    try {
      const account = await this.findOne(id);

      return this.accountModel.findByIdAndUpdate(
        id,
        {
          balance: account.balance - amount,
        },
        {
          new: true,
        },
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
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
