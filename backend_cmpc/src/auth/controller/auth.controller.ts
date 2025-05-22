import { Controller, Post, UseGuards, Request, Get, Body } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(LocalAuthGuard)
    @Post('test/jwt')
    async loginTest(@Body() loginDto: LoginDto) {
      return { message: 'Login successful' };
    }
  
  @Get('test/public')
  async publicRoute() {
    return { message: 'Public route accessed' };
  }

  @Get('test/protected')
  @UseGuards(JwtAuthGuard) // Apply the JwtAuthGuard here
  getProtectedData() {
    return { message: 'This is protected data!' };
  }

  @Get('test/unprotected')
  getUnprotectedData() {
    return { message: 'This is public data!' };
  }
}
