// src/auth/service/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsuariosService } from '../../usuarios/service/usuarios.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs'; // Importa bcryptjs aquí
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Usuario } from 'src/usuarios/model/usuario.model'; // Importa el modelo Usuario

// Mock de bcryptjs
jest.mock('bcryptjs', () => ({
  compare: jest.fn(), // Solo necesitamos mockear la función 'compare'
}));

describe('AuthService', () => {
  let service: AuthService;
  let mockUsuariosService: Partial<UsuariosService>;
  let mockJwtService: Partial<JwtService>;
  let mockLogger: Partial<Logger>;

  // Casta a jest.Mock para poder usar métodos como .toHaveBeenCalledWith
  let bcryptCompareMock: jest.Mock;

  beforeEach(async () => {
    // Inicializa el mock de bcrypt.compare antes de cada test
    // y asegúrate de que bcryptCompareMock apunte a él
    bcryptCompareMock = bcrypt.compare as jest.Mock;
    bcryptCompareMock.mockClear(); // Limpia llamadas anteriores
    // Por defecto, mockea para que la comparación sea exitosa, a menos que un test lo sobrescriba
    bcryptCompareMock.mockResolvedValue(true);

    mockUsuariosService = {
      findByEmail: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(), // Incluye error por si lo usas en el futuro
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsuariosService,
          useValue: mockUsuariosService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Limpia mocks después de la inicialización de cada test
    jest.clearAllMocks();
    // Vuelve a configurar bcrypt.compare después de clearAllMocks si es necesario
    bcryptCompareMock.mockResolvedValue(true); // Restablece el valor predeterminado
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    const mockPlainUser = {
      id: 1,
      email: 'test@example.com',
      passwordHash: 'hashedPassword123',
      nombre: 'Test User',
      get: jest.fn().mockReturnValue({ id: 1, email: 'test@example.com', nombre: 'Test User' }), // Simula el .get({ plain: true })
    } as unknown as Usuario; // Casteo para que TypeScript no se queje demasiado

    it('should return user data without passwordHash if credentials are valid', async () => {
      (mockUsuariosService.findByEmail as jest.Mock).mockResolvedValue(mockPlainUser);
      // bcryptCompareMock ya está mockeado para devolver true por defecto en beforeEach

      const result = await service.validateUser('test@example.com', 'plainPassword');

      expect(mockUsuariosService.findByEmail).toHaveBeenCalledWith('test@example.com', true);
      expect(bcryptCompareMock).toHaveBeenCalledWith('plainPassword', mockPlainUser.passwordHash);
      expect(mockLogger.info).toHaveBeenCalledWith('Usuario validado correctamente', expect.any(Object));
      // Esperamos el objeto de usuario sin passwordHash
      expect(result).toEqual({ id: 1, email: 'test@example.com', nombre: 'Test User' });
    });

    it('should return null and log warning if user not found', async () => {
      (mockUsuariosService.findByEmail as jest.Mock).mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'anyPassword');

      expect(mockUsuariosService.findByEmail).toHaveBeenCalledWith('nonexistent@example.com', true);
      expect(bcryptCompareMock).not.toHaveBeenCalled(); // No debe intentar comparar
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Validación fallida: usuario no encontrado o sin hash de contraseña',
        expect.objectContaining({ email: 'nonexistent@example.com' }),
      );
      expect(result).toBeNull();
    });

    it('should return null and log warning if user found but no passwordHash', async () => {
      // Simula un usuario sin passwordHash (ej. solo con email)
      const userWithoutHash = {
        id: 2,
        email: 'user_no_hash@example.com',
        passwordHash: null, // O undefined
        nombre: 'No Hash User',
        get: jest.fn().mockReturnValue({ id: 2, email: 'user_no_hash@example.com', nombre: 'No Hash User' }),
      } as unknown as Usuario;
      (mockUsuariosService.findByEmail as jest.Mock).mockResolvedValue(userWithoutHash);

      const result = await service.validateUser('user_no_hash@example.com', 'anyPassword');

      expect(mockUsuariosService.findByEmail).toHaveBeenCalledWith('user_no_hash@example.com', true);
      expect(bcryptCompareMock).not.toHaveBeenCalled(); // No debe intentar comparar
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Validación fallida: usuario no encontrado o sin hash de contraseña',
        expect.objectContaining({ email: 'user_no_hash@example.com' }),
      );
      expect(result).toBeNull();
    });


    it('should return null and log warning if password is incorrect', async () => {
      (mockUsuariosService.findByEmail as jest.Mock).mockResolvedValue(mockPlainUser);
      bcryptCompareMock.mockResolvedValue(false); // Simula contraseña incorrecta

      const result = await service.validateUser('test@example.com', 'wrongPassword');

      expect(mockUsuariosService.findByEmail).toHaveBeenCalledWith('test@example.com', true);
      expect(bcryptCompareMock).toHaveBeenCalledWith('wrongPassword', mockPlainUser.passwordHash);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Validación fallida: contraseña incorrecta',
        expect.objectContaining({ email: 'test@example.com' }),
      );
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should generate a JWT token and return it with user details', async () => {
      const userPayload = { id: 1, email: 'test@example.com', nombre: 'Test User' };
      const expectedToken = 'mocked-jwt-token-abc';
      (mockJwtService.sign as jest.Mock).mockReturnValue(expectedToken);

      const result = await service.login(userPayload as Usuario);

      expect(mockJwtService.sign).toHaveBeenCalledWith({ sub: userPayload.id, email: userPayload.email });
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Usuario autenticado y token generado',
        expect.objectContaining({ id: userPayload.id, email: userPayload.email }),
      );
      expect(result).toEqual({ access_token: expectedToken });
    });
  });
});