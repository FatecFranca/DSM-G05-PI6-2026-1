import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { AuthResponseDto,AuthMessageDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(password, user.senha_hash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(user: User): Promise<AuthResponseDto> {
    const payload = { sub: user.id_usuario, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id_usuario.toString(),
        name: user.nome,
        email: user.email,
      },
    };
  }

  async register(user: CreateUserDto): Promise<AuthMessageDto> {
    const { password, name, email, phone } = user;
    const SALT_ROUNDS = 10;
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    return await this.usersService.create({
      name,
      email,
      passwordHash,
      phone,
    });
  }

}
