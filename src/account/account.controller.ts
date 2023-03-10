import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { GetUser } from '../user/decorator/user.decorator';
import { UserGuard } from '../user/guard/user.guard';
import { UserDocument } from '../user/schemas/user.schema';
import { AccountService } from './account.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('account')
@UseGuards(UserGuard)
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  create(@GetUser() user: UserDocument) {
    return this.accountService.create(user);
  }

  @Get()
  findAll() {
    return this.accountService.findAll();
  }

  @Get('pay')
  findAccount(@Query('paymentId') paymentId: string) {
    return this.accountService.findAccount(paymentId);
  }

  @Get('user')
  userAccount(@GetUser() user: UserDocument) {
    return this.accountService.findUserAccount(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountService.remove(id);
  }
}
