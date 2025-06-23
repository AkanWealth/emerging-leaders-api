import {
  Controller,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  Get
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';
import { User } from '@prisma/client'; // or use a custom UserDto for response typing

@ApiTags('User Profile')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  /**
   * Update the authenticated user's profile after OTP verification.
   */
  @Patch('profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Update user profile and optionally set currency/salary' })
@ApiResponse({
  status: 200,
  description: 'User profile updated successfully',
  schema: {
    example: {
      message: 'Profile updated successfully'
    }
  }
})
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 404, description: 'User not found' })
async updateProfile(
  @Req() req: any,
  @Body() updateDto: UpdateProfileDto
): Promise<{ message: string }> {
  const userId = req.user.id;
  return this.userService.updateProfile(userId, updateDto);
}


  /**
   * Get all users (Admin access).
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users returned successfully', type: [UpdateProfileDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  /**
   * Get all verified users.
   * (Assuming this is a placeholder — implement logic later)
   */
  @Get('verified')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all verified users (To be implemented)' })
  @ApiResponse({ status: 200, description: 'List of verified users returned successfully', type: [UpdateProfileDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async  getAllVerifiedUsers(): Promise<User[]> {
    return this.userService.getAllUsers(); // Replace with actual logic for "verified"
  }

  /**
   * Get a user by ID.
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found', type: UpdateProfileDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserById(@Param('id') id: string): Promise<User> {
    return this.userService.getUserById(id);
  }
}
