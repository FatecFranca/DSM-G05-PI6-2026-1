import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthMessageDto, AuthResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtPayload } from './strategies/jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /api/v1/auth/register
  @Post('register')
  register(@Body() user: CreateUserDto): Promise<AuthMessageDto> {
    return this.authService.register(user);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  login(@Request() req: { user: any }, @Body() _dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(req.user);
  }
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Request() req: { user: JwtPayload }) {
    return req.user;
  }
}
