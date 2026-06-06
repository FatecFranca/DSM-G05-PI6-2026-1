import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserInternalDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';
import { AuthMessageDto } from 'src/auth/dto/auth-response.dto';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  // ─── Seed ────────────────────────────────────────────────────────────────────

  async onModuleInit() {
    const adminEmail =
      this.config.get<string>('ADMIN_EMAIL') ?? 'admin@commodities.com';
    const adminPassword = this.config.get<string>('ADMIN_PASSWORD');

    if (!adminPassword) {
      this.logger.warn(
        'ADMIN_PASSWORD env var not set — skipping default admin seed.',
      );
      return;
    }

    const existingAdmin = await this.findByEmail(adminEmail);
    if (!existingAdmin) {
      await this.prisma.usuario.create({
        data: {
          nome: 'Administrador',
          email: adminEmail,
          senha_hash: await bcrypt.hash(adminPassword, BCRYPT_ROUNDS),
          telefone_opcional: this.config.get<string>('ADMIN_PHONE') ?? '',
        },
      });
      this.logger.log(`[Seed] Default admin user created: ${adminEmail}`);
    }
  }

  // ─── Queries ─────────────────────────────────────────────────────────────────

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.usuario.findUnique({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.usuario.findUnique({ where: { id_usuario: id } });
  }

  /**
   * Finds a user by ID and returns only the public fields.
   * Throws NotFoundException if the user does not exist.
   */
  async findOneOrThrow(id: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id_usuario: id },
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        telefone_opcional: true,
        criado_em: true,
      },
    });

    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return user;
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.usuario.findMany({
        skip,
        take: limit,
        orderBy: { criado_em: 'desc' },
        select: {
          id_usuario: true,
          nome: true,
          email: true,
          criado_em: true,
        },
      }),
      this.prisma.usuario.count(),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── Mutations ────────────────────────────────────────────────────────────────

  async create(user: CreateUserInternalDto): Promise<AuthMessageDto> {
    const emailInUse = await this.findByEmail(user.email);
    if (emailInUse) {
      throw new ConflictException('Email already in use');
    }

    await this.prisma.usuario.create({
      data: {
        nome: user.name,
        email: user.email,
        senha_hash: user.passwordHash,
        telefone_opcional: user.phone,
      },
    });

    return { message: 'User created successfully' };
  }

  async update(
    id: number,
    requesterId: number,
    updateUserDto: UpdateUserDto,
  ) {
    if (requesterId !== id) {
      throw new ForbiddenException('You cannot modify another user\'s account');
    }

    // Ensure the target user exists before trying to update
    await this.findOneOrThrow(id);

    const data: Prisma.usuarioUpdateInput = {};

    if (updateUserDto.name) data.nome = updateUserDto.name;
    if (updateUserDto.email) data.email = updateUserDto.email;
    if (updateUserDto.phone) data.telefone_opcional = updateUserDto.phone;
    if (updateUserDto.password) {
      data.senha_hash = await bcrypt.hash(updateUserDto.password, BCRYPT_ROUNDS);
    }

    return this.prisma.usuario.update({
      where: { id_usuario: id },
      data,
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        telefone_opcional: true,
      },
    });
  }

  async remove(id: number, requesterId: number) {
    if (requesterId !== id) {
      throw new ForbiddenException('You cannot delete another user\'s account');
    }

    // Ensure the target user exists before trying to delete
    await this.findOneOrThrow(id);

    return this.prisma.usuario.delete({
      where: { id_usuario: id },
      select: { id_usuario: true },
    });
  }
}
