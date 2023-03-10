import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UserGuard } from 'src/user/guard/user.guard';

@UseGuards(UserGuard)
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionService.create(createTransactionDto);
  }

  @Get('receive')
  getReceivedTransaction(@Query('account') account: string) {
    return this.transactionService.inflow(account);
  }

  @Get('sent')
  getSentTransaction(@Query('account') account: string) {
    return this.transactionService.outflow(account);
  }
}
