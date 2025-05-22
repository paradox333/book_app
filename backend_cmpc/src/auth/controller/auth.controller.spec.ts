import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../service/auth.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const expectedUser = {
    id: 1,
    email: 'test@example.com',
    nombre: 'Test User',
  };

  const mockAuthService = {
    login: jest.fn(),
    validateUser: jest.fn(), 
  };

  const mockLocalAuthGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.user = expectedUser;
      return true;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(LocalAuthGuard)
      .useValue(mockLocalAuthGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();

    (mockLocalAuthGuard.canActivate as jest.Mock).mockImplementation((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.user = expectedUser;
      return true;
    });

    (mockAuthService.validateUser as jest.Mock).mockResolvedValue(expectedUser);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login with the user provided by the mock guard and return the access token and user', async () => {
      const expectedLoginResult = {
        access_token: 'mock-jwt-token',
        user: expectedUser,
      };
      (mockAuthService.login as jest.Mock).mockResolvedValue(expectedLoginResult);

      const mockRequestWithUser = { user: expectedUser };

      const result = await controller.login(mockRequestWithUser);

      expect(mockAuthService.login).toHaveBeenCalledTimes(1); 
      expect(mockAuthService.login).toHaveBeenCalledWith(expectedUser);

      expect(result).toEqual(expectedLoginResult);
    });
  });
});