
import {
  Controller,
  Get,
  UseGuards,
  INestApplication,
  UnauthorizedException
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from '../strategies/jwt.strategy';

@Controller('test-jwt')
class TestJwtController {
  @Get('protected')
  @UseGuards(JwtAuthGuard)
  getProtectedData() {
    return { message: 'This is protected data!' };
  }

  @Get('unprotected')
  getUnprotectedData() {
    return { message: 'This is public data!' };
  }
}

describe('JwtAuthGuard (Integration)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule,
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => ({ JWT_SECRET: 'superSecretKeyForTesting' })],
        }),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET'),
            signOptions: { expiresIn: '60s' },
          }),
          inject: [ConfigService],
        }),
      ],
      controllers: [TestJwtController],
      providers: [
        JwtAuthGuard,
        JwtStrategy, 
        {
          provide: 'WINSTON_MODULE_PROVIDER',
          useValue: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  it('should allow access to an unprotected route', async () => {
    await request(app.getHttpServer())
      .get('/test-jwt/unprotected')
      .expect(200)
      .expect({ message: 'This is public data!' });
  });

  it('should deny access to a protected route without a token', async () => {
    await request(app.getHttpServer())
      .get('/test-jwt/protected')
      .expect(401)
      .expect({
        statusCode: 401,
        message: 'Unauthorized',
      });
  });

  it('should deny access to a protected route with an invalid token', async () => {
    await request(app.getHttpServer())
      .get('/test-jwt/protected')
      .set('Authorization', 'Bearer invalid.jwt.token')
      .expect(401)
      .expect({
        statusCode: 401,
        message: 'Unauthorized',
      });
  });

  it('should allow access to a protected route with a valid token', async () => {
    const payload = { sub: 1, email: 'user@example.com' };
    const token = jwtService.sign(payload);

    await request(app.getHttpServer())
      .get('/test-jwt/protected')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect({ message: 'This is protected data!' });
  });

  it('should allow access to a protected route with a valid token and valid user', async () => {
    const user = { id: 1, email: 'user@example.com', name: 'Test User' };
    const payload = { sub: user.id, email: user.email };
    const token = jwtService.sign(payload);

    await request(app.getHttpServer())
      .get('/test-jwt/protected')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect({ message: 'This is protected data!' });
  });
});