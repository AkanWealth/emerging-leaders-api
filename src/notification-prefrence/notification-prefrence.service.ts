import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationPreferenceDto } from './dto/create-preference.dto';
import { UpdateNotificationPreferenceDto } from './dto/update-preference.dto';
import { NOTIFICATION_TYPES, NOTIFICATION_CHANNELS } from './constants/notification-preference.constants';

@Injectable()
export class NotificationPreferencesService {
  constructor(private readonly prisma: PrismaService) {}


async initializePreferencesForUser(userId: string) {
  // explicitly define the array type
  const preferences: {
    userId: string;
    type: (typeof NOTIFICATION_TYPES)[number];
    channel: (typeof NOTIFICATION_CHANNELS)[number];
    enabled: boolean;
  }[] = [];

  for (const type of NOTIFICATION_TYPES) {
    for (const channel of NOTIFICATION_CHANNELS) {
      preferences.push({
        userId,
        type,
        channel,
        enabled: true,
      });
    }
  }

  await this.prisma.notificationPreference.createMany({
    data: preferences,
    skipDuplicates: true,
  });

  return preferences.length;
}

  /**
   * Get all preferences for a user
   */
  async getPreferences(userId: string) {
    return this.prisma.notificationPreference.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Create or update a specific notification preference
   */
  async upsertPreference(userId: string, dto: CreateNotificationPreferenceDto) {
    return this.prisma.notificationPreference.upsert({
      where: {
        userId_type_channel: {
          userId,
          type: dto.type,
          channel: dto.channel,
        },
      },
      update: { enabled: dto.enabled ?? true },
      create: {
        userId,
        type: dto.type,
        channel: dto.channel,
        enabled: dto.enabled ?? true,
      },
    });
  }

  /**
   * Update existing preference (e.g., toggle on/off)
   */
  async updatePreference(userId: string, dto: UpdateNotificationPreferenceDto) {
    return this.prisma.notificationPreference.update({
      where: {
        userId_type_channel: {
          userId,
          type: dto.type,
          channel: dto.channel,
        },
      },
      data: { enabled: dto.enabled },
    });
  }

  /**
   * Reset user preferences to defaults — all enabled
   */
  async setDefaultPreferences(userId: string) {
    const defaults = [
      { userId, type: 'ALL', channel: 'IN_APP', enabled: true },
      { userId, type: 'ALL', channel: 'PUSH', enabled: true },
      { userId, type: 'ALL', channel: 'EMAIL', enabled: true },
    ];

    await this.prisma.notificationPreference.createMany({
      data: defaults,
      skipDuplicates: true,
    });

    return this.getPreferences(userId);
  }
}
