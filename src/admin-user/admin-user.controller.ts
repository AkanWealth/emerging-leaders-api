import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { AdminUserService } from './admin-user.service';
import { CreateUserByAdminDto } from './dto/create-user.dto';
import { EditUserDto } from './dto/edit-user.dto';
import { InviteAdminDto } from './dto/invite-admin.dto';
import { AdminGuard } from '../common/decorators/guards/admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiQuery
} from '@nestjs/swagger';

@ApiTags('Admin Users')
@ApiBearerAuth()
@Controller('admin/users')
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}

// @UseGuards(JwtAuthGuard, AdminGuard)
//   @Get()
//   @ApiOperation({ summary: 'Get all users' })
//   @ApiResponse({ status: 200, description: 'List of all users returned successfully.' })
//   @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default 1)' })
//   @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default 10)' })
//   @ApiQuery({ name: 'email', required: false, type: String, description: 'Filter by email' })
//   @ApiQuery({ name: 'name', required: false, type: String, description: 'Filter by name' })
//   @ApiQuery({ name: 'role', required: false, type: String, description: 'Filter by role' })
//   @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by status' })
//   async getAllUsers(
//     @Query('page') page?: string,
//     @Query('limit') limit?: string,
//     @Query('email') email?: string,
//     @Query('name') name?: string,
//     @Query('role') role?: string,
//     @Query('status') status?: string,
//   ) {
//     return this.adminUserService.getAllUsers({
//       page: page ? parseInt(page, 10) : 1,
//       limit: limit ? parseInt(limit, 10) : 10,
//       email,
//       name,
//       role,
//       status,
//     });
//   }

@UseGuards(JwtAuthGuard, AdminGuard)
@Get()
@ApiOperation({ summary: 'Get all users' })
@ApiResponse({ status: 200, description: 'List of all users returned successfully.' })
@ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default 1)' })
@ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default 10)' })
@ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name, email, or date (last joined / last active)' })
@ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by user status' })
async getAllUsers(
  @Query('page') page?: string,
  @Query('limit') limit?: string,
  @Query('search') search?: string,
  @Query('status') status?: string,
) {
  return this.adminUserService.getAllUsers({
    page: page ? parseInt(page, 10) : 1,
    limit: limit ? parseInt(limit, 10) : 10,
    search,
  });
}


  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get logged-in user details' })
  @ApiResponse({ status: 200, description: 'Returns the logged-in user details.' })
  async getMe(@Req() req) {
    const userId = req.user.id; // comes from JWT payload
    return this.adminUserService.getUserById(userId);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new user and send temporary password via email' })
  @ApiResponse({ status: 201, description: 'User created successfully, password sent via email.' })
  @ApiBody({ type: CreateUserByAdminDto })
  createUser(@Body() dto: CreateUserByAdminDto) {
    return this.adminUserService.createUser(dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Edit user details' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @ApiBody({ type: EditUserDto })
  editUser(@Param('id') id: string, @Body() dto: EditUserDto) {
    return this.adminUserService.editUser(id, dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  deleteUser(@Param('id') id: string) {
    return this.adminUserService.deleteUser(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post(':id/activate-admin')
  @ApiOperation({ summary: 'Activate user as admin' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User promoted to admin successfully.' })
  makeAdmin(@Param('id') id: string) {
    return this.adminUserService.activateAdmin(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post(':id/deactivate-admin')
  @ApiOperation({ summary: 'Deactivate admin privileges' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Admin rights revoked successfully.' })
  revokeAdmin(@Param('id') id: string) {
    return this.adminUserService.deactivateAdmin(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('invite-admin')
  @ApiOperation({ summary: 'Invite a user to become admin via email' })
  @ApiBody({ type: InviteAdminDto })
  @ApiResponse({ status: 200, description: 'Admin invitation sent.' })
  inviteAdmin(@Body() dto: InviteAdminDto) {
    return this.adminUserService.inviteUserToBeAdmin(dto.email);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('resend-invite')
  @ApiOperation({ summary: 'Resend admin invitation email' })
  @ApiBody({ type: InviteAdminDto })
  @ApiResponse({ status: 200, description: 'Admin invitation resent.' })
  resendInvite(@Body() dto: InviteAdminDto) {
    return this.adminUserService.resendAdminInvite(dto.email);
  }
}
