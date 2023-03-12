/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { User, UserDocument } from './schemas/user.schema';
import { AccountService } from '../account/account.service';
import { signToken } from '../utils/jwt.utils';
import { checkPassword, hashPassword } from '../utils/hash-password.utils';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Model } from 'mongoose';

describe('UserService', () => {
  let userService: UserService;
  let userModel: Model<UserDocument>;
  let accountService: AccountService;

  const mockUserModel = {
    create: jest.fn(),
    findOne: jest.fn(),
  };

  const mockAccountService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: AccountService, useValue: mockAccountService },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    accountService = module.get<AccountService>(AccountService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    // it('should create a user, create an account and return a token', async () => {
    //   const createUserDto: CreateUserDto = {
    //     name: 'John Doe',
    //     email: 'johndoe@example.com',
    //     password: 'password',
    //     phoneNumber: '+1234567890',
    //   };

    //   const user: UserDocument = new userModel({
    //     _id: 'user_id',
    //     ...createUserDto,
    //     password: await hashPassword(createUserDto.password),
    //   });

    //   mockUserModel.create.mockReturnValue(user);
    //   mockAccountService.create.mockResolvedValue(undefined);

    //   const token = signToken(String(user.id));

    //   const result = await userService.signup(createUserDto);

    //   expect(mockUserModel.create).toHaveBeenCalledWith({
    //     ...createUserDto,
    //     password: expect.any(String),
    //   });
    //   expect(mockAccountService.create).toHaveBeenCalledWith(user);
    //   expect(result).toEqual({ user, token });
    // });

    it('should throw a BadRequestException if any field is missing', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'password',
        phoneNumber: '',
      };

      await expect(userService.signup(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockUserModel.create).not.toHaveBeenCalled();
      expect(mockAccountService.create).not.toHaveBeenCalled();
    });

    it('should throw a BadRequestException if userModel.create() throws an error', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'password',
        phoneNumber: '+1234567890',
      };

      mockUserModel.create.mockRejectedValue(new Error('MongoDB error'));

      await expect(userService.signup(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockUserModel.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: expect.any(String),
      });
      expect(mockAccountService.create).not.toHaveBeenCalled();
    });
  });

  describe('signin', () => {
    it('should sign in a user with valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'testpassword';

      const mockedUser = {
        _id: '606e121e2498b17f07b1410d',
        email,
        password: await hashPassword(password),
      };

      jest.spyOn(userModel, 'findOne').mockResolvedValue(mockedUser);
      jest.spyOn(checkPassword, 'checkPassword').mockResolvedValue(true);
      jest.spyOn(signToken, 'signToken').mockReturnValue('testtoken');

      const result = await userService.signin(email, password);

      expect(userModel.findOne).toBeCalledWith({ email });
      expect(checkPassword).toBeCalledWith(password, mockedUser.password);
      expect(signToken).toBeCalledWith(mockedUser._id);

      expect(result.user).toEqual(mockedUser);
      expect(result.token).toEqual('testtoken');
    });

    it('should throw an exception if user is not found', async () => {
      const email = 'test@example.com';
      const password = 'testpassword';

      jest.spyOn(userModel, 'findOne').mockResolvedValue(null);

      await expect(userService.signin(email, password)).rejects.toThrowError(
        new NotFoundException(`User with ${email} email do not exist`),
      );

      expect(userModel.findOne).toBeCalledWith({ email });
    });

    it('should throw an exception if password is incorrect', async () => {
      const email = 'test@example.com';
      const password = 'testpassword';

      const mockedUser = {
        _id: '606e121e2498b17f07b1410d',
        email,
        password: await hashPassword('wrongpassword'),
      };

      jest.spyOn(userModel, 'findOne').mockResolvedValue(mockedUser);
      jest.spyOn(checkPassword, 'userPassword').mockResolvedValue(false);

      await expect(userService.signin(email, password)).rejects.toThrowError(
        new BadRequestException('Invalid Credentials, Passowrd is not correct'),
      );

      expect(userModel.findOne).toBeCalledWith({ email });
      expect(checkPassword).toBeCalledWith(password, mockedUser.password);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
      ];
      jest
        .spyOn(userModel, 'find')
        .mockReturnValueOnce(Promise.resolve(users as UserDocument[]) as any);

      expect(await userService.findAll()).toEqual(users);
    });
  });

  describe('findOne', () => {
    const id = '1';

    it('should return the user with the given id', async () => {
      const user = { id, name: 'Alice' };
      jest
        .spyOn(userModel, 'findById')
        .mockReturnValueOnce(Promise.resolve(user as unknown) as any);

      expect(await userService.findOne(id)).toEqual(user);
    });

    it('should throw a NotFoundException if user is not found', async () => {
      jest
        .spyOn(userModel, 'findById')
        .mockReturnValueOnce(Promise.resolve(null) as any);

      await expect(userService.findOne(id)).rejects.toThrow(NotFoundException);
    });

    it('should throw a BadRequestException if id is invalid', async () => {
      jest.spyOn(userModel, 'findById').mockImplementationOnce(() => {
        throw new Error();
      });

      await expect(userService.findOne('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
