import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { checkPassword, hashPassword } from 'src/utils/hash-password.utils';
import { AccountService } from 'src/account/account.service';
import { signToken } from 'src/utils/jwt.utils';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly accountService: AccountService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    try {
      const { name, email, password, phoneNumber } = createUserDto;

      if (!name || !email || !password || !phoneNumber) {
        throw new BadRequestException('Fill in missing data');
      }

      const hashedPassword = await hashPassword(password);

      const user = await this.userModel.create({
        name,
        email,
        phoneNumber,
        password: hashedPassword,
      });

      // create account upon user signup
      await this.accountService.create(user?.id);

      // generate token upon user signup
      const token = signToken(String(user.id));

      return { user, token };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async signin(email: string, password: string) {
    try {
      const user = await this.userModel.findOne({ email });

      if (!user) {
        throw new NotFoundException(`User with ${email} email do not exist`);
      }

      const isPasswordCorrect = await checkPassword(password, user.password);

      if (!isPasswordCorrect) {
        throw new BadRequestException(
          'Invalid Credentials, Passowrd is not correct',
        );
      }

      // generate token upon user signin
      const token = signToken(String(user.id));

      return { user, token };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  findAll() {
    return this.userModel.find();
  }

  async findOne(id: string) {
    try {
      const user = await this.userModel.findById(id);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
