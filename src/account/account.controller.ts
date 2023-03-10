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
import { UserGuard } from 'src/user/guard/user.guard';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Controller(':userId/account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  create(@Param('userId') userId: string) {
    return this.accountService.create(userId);
  }

  @UseGuards(UserGuard)
  @Get()
  findAll(@Query('paymentId') paymentId: string) {
    return this.accountService.findAll(paymentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountService.update(+id, updateAccountDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountService.remove(id);
  }

  @Get()
  @UseGuards(UserGuard)
  search() {}
}
