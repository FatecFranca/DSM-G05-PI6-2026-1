import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  /**
   * GET /api/v1/users?page=1&limit=20
   * Returns a paginated list of users (public fields only).
   */
  @Get()
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    return this.usersService.findAll(page, limit);
  }

  /**
   * GET /api/v1/users/:id
   * Returns a single user's public profile.
   * Throws 404 if user does not exist.
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOneOrThrow(id);
  }

  /**
   * PATCH /api/v1/users/:id
   * Updates the authenticated user's own account.
   * Throws 403 if trying to modify another user.
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const requesterId = parseInt(req.user.sub, 10);
    return this.usersService.update(id, requesterId, updateUserDto);
  }

  /**
   * DELETE /api/v1/users/:id
   * Deletes the authenticated user's own account.
   * Throws 403 if trying to delete another user.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    const requesterId = parseInt(req.user.sub, 10);
    return this.usersService.remove(id, requesterId);
  }
}
