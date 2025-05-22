// src/auth/controller/auth.controller.spec.ts
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
    validateUser: jest.fn(), // Añadido para simular AuthService completo
  };

  // El mock del guard se mantiene para que el controlador tenga un req.user
  // pero ya no lo espiaremos directamente.
  const mockLocalAuthGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.user = expectedUser;
      return true; // Siempre permite el acceso
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
      .useValue(mockLocalAuthGuard) // Todavía sobrescribimos el guard para que el test funcione
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();

    // Re-implementar canActivate después de clearAllMocks
    (mockLocalAuthGuard.canActivate as jest.Mock).mockImplementation((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.user = expectedUser;
      return true;
    });

    // Configurar validateUser del AuthService por si el guard lo usara (aunque aquí el mock de guard lo evita)
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

      // Creamos un mock del objeto Request que se pasaría al controlador.
      // Crucialmente, necesitamos asegurarnos de que `req.user` esté definido aquí,
      // ya que el controlador lo espera. En un escenario real, el guard lo pondría.
      // Aquí lo hacemos explícito para el test, asumiendo que el guard hizo su trabajo.
      const mockRequestWithUser = { user: expectedUser };

      // Llamamos al método del controlador
      const result = await controller.login(mockRequestWithUser); // Pasamos el request con el usuario ya "adjunto"

      // 1. Verificar que AuthService.login fue llamado con el usuario correcto.
      expect(mockAuthService.login).toHaveBeenCalledTimes(1); // Añadido para rigor
      expect(mockAuthService.login).toHaveBeenCalledWith(expectedUser);

      // 2. Verificar que el controlador devuelve el resultado esperado.
      expect(result).toEqual(expectedLoginResult);
    });
  });
});