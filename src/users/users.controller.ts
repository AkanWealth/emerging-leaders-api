import {
  Controller,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@ApiTags('User Profile')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  /**
   * Update the authenticated user's profile after OTP verification.
   * 
   * @param userId - ID of the user (usually retrieved from the JWT token)
   * @param updateDto - Partial user profile data to update
   * @returns Updated user profile object
   */
  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile after OTP verification' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    // Optionally, specify the schema or type of the returned user profile here
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(@Req() req, @Body() updateDto: UpdateProfileDto) {
    const userId = req.user.id;  // Assuming req.user is set by JwtAuthGuard.validate
    return this.userService.updateProfile(userId, updateDto);
  }
}
