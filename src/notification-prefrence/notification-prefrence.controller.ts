import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Patch,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { NotificationPreferencesService } from './notification-prefrence.service';
import { CreateNotificationPreferenceDto } from './dto/create-preference.dto';
import { UpdateNotificationPreferenceDto } from './dto/update-preference.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Notification Preferences')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notification-preferences')
export class NotificationPreferencesController {
  constructor(private readonly notificationPreferencesService: NotificationPreferencesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notification preferences for the logged-in user' })
  @ApiResponse({ status: 200, description: 'Returns the list of preferences' })
  async getPreferences(@Req() req) {
    return this.notificationPreferencesService.getPreferences(req.user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create or update a user notification preference' })
  @ApiResponse({ status: 201, description: 'Preference created or updated successfully' })
  @ApiBody({ type: CreateNotificationPreferenceDto })
  async createOrUpdatePreference(
    @Req() req,
    @Body() dto: CreateNotificationPreferenceDto,
  ) {
    return this.notificationPreferencesService.upsertPreference(req.user.id, dto);
  }

  @Patch()
  @ApiOperation({ summary: 'Update an existing preference (e.g., enable/disable channel)' })
  @ApiResponse({ status: 200, description: 'Preference updated successfully' })
  @ApiBody({ type: UpdateNotificationPreferenceDto })
  async updatePreference(
    @Req() req,
    @Body() dto: UpdateNotificationPreferenceDto,
  ) {
    return this.notificationPreferencesService.updatePreference(req.user.id, dto);
  }

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset all preferences to system defaults' })
  @ApiResponse({ status: 200, description: 'Preferences reset to defaults' })
  async resetPreferences(@Req() req) {
    await this.notificationPreferencesService.setDefaultPreferences(req.user.id);
    return { message: 'Preferences reset to defaults' };
  }
}
