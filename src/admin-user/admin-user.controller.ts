import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AdminUserService } from './admin-user.service';
import { CreateUserByAdminDto } from './dto/create-user.dto';
import { EditUserDto } from './dto/edit-user.dto';
import { InviteAdminDto } from './dto/invite-admin.dto';
import { AdminGuard } from '../common/decorators/guards/admin.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Admin Users')
@UseGuards(AdminGuard)
@Controller('admin/users')
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of all users returned successfully.' })
  getAllUsers() {
    return this.adminUserService.getAllUsers();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user and send temporary password via email' })
  @ApiResponse({ status: 201, description: 'User created successfully, password sent via email.' })
  @ApiBody({ type: CreateUserByAdminDto })
  createUser(@Body() dto: CreateUserByAdminDto) {
    return this.adminUserService.createUser(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit user details' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @ApiBody({ type: EditUserDto })
  editUser(@Param('id') id: string, @Body() dto: EditUserDto) {
    return this.adminUserService.editUser(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  deleteUser(@Param('id') id: string) {
    return this.adminUserService.deleteUser(id);
  }

  @Post(':id/activate-admin')
  @ApiOperation({ summary: 'Activate user as admin' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User promoted to admin successfully.' })
  makeAdmin(@Param('id') id: string) {
    return this.adminUserService.activateAdmin(id);
  }

  @Post(':id/deactivate-admin')
  @ApiOperation({ summary: 'Deactivate admin privileges' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Admin rights revoked successfully.' })
  revokeAdmin(@Param('id') id: string) {
    return this.adminUserService.deactivateAdmin(id);
  }

  @Post('invite-admin')
  @ApiOperation({ summary: 'Invite a user to become admin via email' })
  @ApiBody({ type: InviteAdminDto })
  @ApiResponse({ status: 200, description: 'Admin invitation sent.' })
  inviteAdmin(@Body() dto: InviteAdminDto) {
    return this.adminUserService.inviteUserToBeAdmin(dto.email);
  }

  @Post('resend-invite')
  @ApiOperation({ summary: 'Resend admin invitation email' })
  @ApiBody({ type: InviteAdminDto })
  @ApiResponse({ status: 200, description: 'Admin invitation resent.' })
  resendInvite(@Body() dto: InviteAdminDto) {
    return this.adminUserService.resendAdminInvite(dto.email);
  }
}
