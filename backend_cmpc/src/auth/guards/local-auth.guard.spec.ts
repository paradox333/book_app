// src/auth/guards/local-auth.guard.integration.spec.ts

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

// Import your actual application components
import { LocalAuthGuard } from './local-auth.guard';
import { LocalStrategy } from '../strategies/local.strategy';
import { AuthService } from '../service/auth.service'; // Adjust path if different
import { AuthController } from '../controller/auth.controller';

// A simple DTO for login requests
class LoginDto {
  email!: string;
  password!: string;
}

describe('LocalAuthGuard (Integration)', () => {
  // ----------------------------------------------------
  // DECLARE THESE VARIABLES HERE, OUTSIDE beforeEach
  // ----------------------------------------------------
  let app: INestApplication;
  let authService: AuthService; // To access the mock of AuthService
  let mockAuthService: { validateUser: jest.Mock }; // Declare the type of your mock
                                                // so you can access it in `it` blocks if needed
  // ----------------------------------------------------

  beforeEach(async () => {
    // Initialize the mock inside beforeEach to ensure it's fresh for each test
    mockAuthService = {
      validateUser: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule,
        // If your LocalStrategy also has JwtModule dependencies (e.g., from JwtModule.register()),
        // you might need to import JwtModule.register() here as well,
        // mocked with a simple secret for testing.
      ],
      controllers: [AuthController],
      providers: [
        LocalAuthGuard,
        LocalStrategy,
        {
          provide: AuthService, // Provide the mock for the AuthService dependency
          useValue: mockAuthService, // Use the initialized mock
        },
        {
          provide: 'WINSTON_MODULE_PROVIDER',
          useValue: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    // Get the *mocked* service instance from the testing module
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
    // Access mockAuthService directly now that it's in scope
    mockAuthService.validateUser.mockResolvedValue(null);

    await request(app.getHttpServer())
      .post('/auth/test/jwt')
      .send({ email: 'test@example.com', password: 'wrongpassword' })
      .expect(401);
  });

  it('should allow access to login route with valid credentials', async () => {
    const user = { id: 1, email: 'test@example.com', name: 'Test User' };
    // Access mockAuthService directly now that it's in scope
    mockAuthService.validateUser.mockResolvedValue(user);

    await request(app.getHttpServer())
      .post('/auth/test/jwt')
      .send({ email: 'test@example.com', password: 'correctpassword' })
      .expect(201)
      .expect({ message: 'Login successful' });

    expect(authService.validateUser).toHaveBeenCalledWith('test@example.com', 'correctpassword');
  });
});