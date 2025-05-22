
import {
  Controller,
  Post,
  Body,
  UseGuards,
  INestApplication,
  Get,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { PassportModule } from '@nestjs/passport';

import { LocalAuthGuard } from './local-auth.guard';
import { LocalStrategy } from '../strategies/local.strategy';
import { AuthService } from '../service/auth.service';
import { AuthController } from '../controller/auth.controller';

class LoginDto {
  email!: string;
  password!: string;
}

describe('LocalAuthGuard (Integration)', () => {

  let app: INestApplication;
  let authService: AuthService;
  let mockAuthService: { validateUser: jest.Mock };

  beforeEach(async () => {
    mockAuthService = {
      validateUser: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule,
      ],
      controllers: [AuthController],
      providers: [
        LocalAuthGuard,
        LocalStrategy,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: 'WINSTON_MODULE_PROVIDER',
          useValue: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    authService = moduleFixture.get<AuthService>(AuthService);
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  it('should allow access to a public route', async () => {
    await request(app.getHttpServer())
      .get('/auth/test/public')
      .expect(200)
      .expect({ message: 'Public route accessed' });
  });

  it('should deny access to login route with invalid credentials', async () => {
    mockAuthService.validateUser.mockResolvedValue(null);

    await request(app.getHttpServer())
      .post('/auth/test/jwt')
      .send({ email: 'test@example.com', password: 'wrongpassword' })
      .expect(401);
  });

  it('should allow access to login route with valid credentials', async () => {
    const user = { id: 1, email: 'test@example.com', name: 'Test User' };
    mockAuthService.validateUser.mockResolvedValue(user);

    await request(app.getHttpServer())
      .post('/auth/test/jwt')
      .send({ email: 'test@example.com', password: 'correctpassword' })
      .expect(201)
      .expect({ message: 'Login successful' });

    expect(authService.validateUser).toHaveBeenCalledWith('test@example.com', 'correctpassword');
  });
});