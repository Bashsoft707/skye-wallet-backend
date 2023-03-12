import { Test, TestingModule } from '@nestjs/testing';
import { UserGuard } from 'src/user/guard/user.guard';
import { UserDocument } from 'src/user/schemas/user.schema';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

describe('AccountController', () => {
  let controller: AccountController;
  let service: AccountService;

  const mockUser: UserDocument = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'password',
    phoneNumber: '1234567890',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as UserDocument;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: AccountService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
          },
        },
        UserGuard,
      ],
    }).compile();

    controller = module.get<AccountController>(AccountController);
    service = module.get<AccountService>(AccountService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an account for the user', async () => {
      jest.spyOn(controller, 'create').mockResolvedValueOnce({ '_id': '123' });

      const result = await controller.create(mockUser);

      expect(service.create).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of accounts', async () => {
      const mockAccounts = [{ id: '1' }, { id: '2' }];

      jest.spyOn(service, 'findAll').mockResolvedValueOnce(mockAccounts);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockAccounts);
    });
  });
});
