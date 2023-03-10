import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { GetUser } from 'src/user/decorator/user.decorator';
import { UserGuard } from 'src/user/guard/user.guard';
import { UserDocument } from 'src/user/schemas/user.schema';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

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

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
  //   return this.accountService.update(id, updateAccountDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountService.remove(id);
  }

  @Get()
  @UseGuards(UserGuard)
  search() {}
}
