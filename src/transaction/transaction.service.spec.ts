import { BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { AccountService } from '../account/account.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { TransactionService } from './transaction.service';

describe('TransactionService', () => {
  let transactionService: TransactionService;
  let accountService: AccountService;
  let transactionModel: Model<TransactionDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: AccountService,
          useValue: {
            findAccount: jest.fn(),
            debit: jest.fn(),
            credit: jest.fn(),
          },
        },
        {
          provide: getModelToken(Transaction.name),
          useValue: {},
        },
      ],
    }).compile();

    transactionService = module.get<TransactionService>(TransactionService);
    accountService = module.get<AccountService>(AccountService);
    transactionModel = module.get<Model<TransactionDocument>>(
      getModelToken(Transaction.name),
    );
  });

  describe('create', () => {
    it('should create a transaction', async () => {
      const sender = 'sender_id';
      const receiver = 'receiver_id';
      const amount = 100;
      const createTransactionDto: CreateTransactionDto = {
        sender,
        receiver,
        amount,
      };
      const senderAccount = { _id: 'sender_account_id', balance: 200 };
      const receiverAccount = { _id: 'receiver_account_id', balance: 0 };
      const transaction = { sender, receiver, amount };

      jest
        .spyOn(accountService, 'findAccount')
        .mockResolvedValueOnce([senderAccount] as any)
        .mockResolvedValueOnce([receiverAccount] as any);

      jest
        .spyOn(transactionModel, 'create')
        .mockResolvedValueOnce(transaction as any);

      await expect(
        transactionService.create(createTransactionDto),
      ).resolves.toEqual(transaction);

      expect(accountService.debit).toHaveBeenCalledWith(
        senderAccount._id,
        amount,
      );
      expect(accountService.credit).toHaveBeenCalledWith(
        receiverAccount._id,
        amount,
      );
    });

    it('should throw a BadRequestException when sender has insufficient balance', async () => {
      const sender = 'sender_id';
      const receiver = 'receiver_id';
      const amount = 100;
      const createTransactionDto: CreateTransactionDto = {
        sender,
        receiver,
        amount,
      };
      const senderAccount = { _id: 'sender_account_id', balance: 50 };
      const receiverAccount = { _id: 'receiver_account_id', balance: 0 };

      jest
        .spyOn(accountService, 'findAccount')
        .mockResolvedValueOnce([senderAccount] as any)
        .mockResolvedValueOnce([receiverAccount] as any);

      await expect(
        transactionService.create(createTransactionDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('outflow', () => {
    const senderAccount = 'senderAccount';

    it('should return an array of transactions with the given sender account', async () => {
      const transactions = [
        { id: '1', sender: senderAccount, amount: 10 },
        { id: '2', sender: senderAccount, amount: 20 },
      ];
      jest
        .spyOn(transactionModel, 'find')
        .mockReturnValueOnce(Promise.resolve(transactions) as any);

      expect(await transactionService.outflow(senderAccount)).toEqual(
        transactions,
      );
    });

    it('should throw a BadRequestException if there is no transaction with the given sender account', async () => {
      jest
        .spyOn(transactionModel, 'find')
        .mockReturnValueOnce(Promise.resolve([]) as any);

      await expect(transactionService.outflow(senderAccount)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw a BadRequestException if there is an error while fetching the transaction', async () => {
      jest.spyOn(transactionModel, 'find').mockImplementationOnce(() => {
        throw new Error();
      });

      await expect(transactionService.outflow(senderAccount)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
