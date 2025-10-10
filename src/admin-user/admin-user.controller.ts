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
  NotFoundException,
} from '@nestjs/common';
import { AdminUserService } from './admin-user.service';
import { CreateUserByAdminDto } from './dto/create-user.dto';
import { EditUserDto } from './dto/edit-user.dto';
import { EditAdminDto } from './dto/edit-admin.dto';
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

 @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate a user account' })
  @ApiParam({ name: 'id', description: 'User ID', type: String })
  @ApiResponse({ status: 200, description: 'User has been deactivated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deactivateUser(@Param('id') id: string) {
    return this.adminUserService.updateStatus(id, 'DEACTIVATED');
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate a user account' })
  @ApiParam({ name: 'id', description: 'User ID', type: String })
  @ApiResponse({ status: 200, description: 'User has been activated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async activateUser(@Param('id') id: string) {
    return this.adminUserService.updateStatus(id, 'ACTIVE');
  }

@UseGuards(JwtAuthGuard, AdminGuard)
@Get()
@ApiOperation({ summary: 'Get all users' })
@ApiResponse({ status: 200, description: 'List of all users returned successfully.' })
@ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default 1)' })
@ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default 10)' })
@ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name, email, or date (last joined / last active)' })
@ApiQuery({
  name: 'status',
  required: false,
  type: String,
  enum: ['PENDING', 'ACTIVE', 'INACTIVE', 'DEACTIVATED'],
  description: 'Filter by user status (optional)',
})
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
    status,
  });
}

@UseGuards(JwtAuthGuard, AdminGuard)
@Get('admins')
@ApiOperation({ summary: 'Get all admins' })
@ApiResponse({ status: 200, description: 'List of all admins returned successfully.' })
@ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default 1)' })
@ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default 10)' })
@ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name, email, or date (last joined / last active)' })
@ApiQuery({
  name: 'status',
  required: false,
  type: String,
  enum: ['PENDING', 'ACTIVE', 'INACTIVE', 'DEACTIVATED'],
  description: 'Filter by admin status (optional)',
})
async getAllAdmins(
  @Query('page') page?: string,
  @Query('limit') limit?: string,
  @Query('search') search?: string,
  @Query('status') status?: string,
) {
  return this.adminUserService.getAllAdmins({
    page: page ? parseInt(page, 10) : 1,
    limit: limit ? parseInt(limit, 10) : 10,
    search,
    status,
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
@Patch('edit/:id')
@ApiOperation({ summary: 'Edit admin details' })
@ApiParam({ name: 'id', description: 'Admin user ID' })
@ApiResponse({ status: 200, description: 'Admin updated successfully.' })
@ApiBody({ type: EditAdminDto })
editAdmin(@Param('id') id: string, @Body() dto: EditAdminDto) {
  return this.adminUserService.editAdmin(id, dto);
}


@UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id/profile-picture')
  @ApiOperation({ summary: 'Update admin profile picture' })
  @ApiParam({ name: 'id', description: 'Admin user ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        profilePicture: { type: 'string', example: 'https://res.cloudinary.com/demo/image/upload/v12345/sample.jpg' },
      },
      required: ['profilePicture'],
    },
  })
  @ApiResponse({ status: 200, description: 'Profile picture updated successfully' })
  async updateProfilePicture(
    @Param('id') id: string,
    @Body('profilePicture') profilePicture: string,
  ) {
    if (!profilePicture) {
      throw new NotFoundException('Profile picture URL is required');
    }

    return this.adminUserService.updateProfilePicture(id, profilePicture);
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
  
@UseGuards(JwtAuthGuard, AdminGuard)
@Get('assessment/summary')
@ApiOperation({ summary: 'Get summary of all assessments (filterable by title and year range)' })
@ApiQuery({ name: 'title', required: false, description: 'Search assessments by title', example: 'Quarterly Review' })
@ApiQuery({ name: 'startYear', required: false, description: 'Filter from this year (inclusive)', example: 2022 })
@ApiQuery({ name: 'endYear', required: false, description: 'Filter up to this year (inclusive)', example: 2025 })
async getSummary(
  @Query('title') title?: string,
  @Query('startYear') startYear?: number,
  @Query('endYear') endYear?: number,
) {
  return this.adminUserService.getAssessmentSummary(title, startYear, endYear);
}

@UseGuards(JwtAuthGuard, AdminGuard)
@Get('assessments/details')
@ApiOperation({ summary: 'Get filled and not filled users (filterable by title or year range)' })
async getDetails(
  @Query('title') title?: string,
  @Query('startYear') startYear?: string,
  @Query('endYear') endYear?: string,
) {
  return this.adminUserService.getAssessmentDetails(title, startYear, endYear);
}

@Get('assessments/:assessmentId/details')
async getById(@Param('assessmentId') id: string) {
  return this.adminUserService.getSingleAssessmentDetails(id);
}


   @UseGuards(JwtAuthGuard, AdminGuard)
   @Get('assessment/report')
  @ApiOperation({ summary: 'Get user-by-month assessment completion report' })
  @ApiQuery({ name: 'year', required: false, type: Number, description: 'Filter by year (default current year)' })
  async getReport(@Query('year') year?: number) {
    return this.adminUserService.getUserAssessmentReport(year ? +year : undefined);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
@Get('assessment/report/summary')
@ApiOperation({ summary: 'Get all assessments summary for admin (filterable by title and year range)' })
@ApiResponse({ status: 200, description: 'List of filtered assessments summary returned successfully.' })
async getAssessmentsSummary(
  @Query('title') title?: string,
  @Query('startYear') startYear?: string,
  @Query('endYear') endYear?: string,
) {
  return this.adminUserService.getAssessmentsSummary(title, startYear, endYear);
}

}
