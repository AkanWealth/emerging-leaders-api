import { Injectable } from '@nestjs/common';
import { firebaseAdmin } from '../firebase/firebase.init';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Main notification sending function
   */
  async sendNotification(
    userIds: string[],
    title: string,
    body: string,
    data?: Record<string, any>,
    type?: string
  ) {
    // Store in-app notifications
    await this.prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        title,
        body,
        data,
        type,
      })),
    });

    // Get all FCM tokens for the users
    const tokens = await this.prisma.fcmToken.findMany({
      where: { userId: { in: userIds } },
      select: { token: true },
    });

    const pushTokens = tokens.map((t) => t.token);

    // Send push notifications if tokens exist
    if (pushTokens.length) {
      const messages = pushTokens.map((token) => ({
        token,
        notification: { title, body },
        data: { ...data, click_action: 'FLUTTER_NOTIFICATION_CLICK' },
      }));

      try {
        const responses = await Promise.all(
          messages.map((msg) => firebaseAdmin.messaging().send(msg))
        );
        return { success: true, messageIds: responses };
      } catch (error) {
        console.error('Push Notification Error:', error);
        return { success: false, error };
      }
    }

    return { success: true, message: 'Stored without push' };
  }

  /**
   * Send to one user
   */
  async sendToUser(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, any>,
    type?: string
  ) {
    return this.sendNotification([userId], title, body, data, type);
  }

  /**
   * Broadcast to all users
   */
  async broadcastNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
    type?: string
  ) {
    const users = await this.prisma.user.findMany({
      select: { id: true },
    });

    const userIds = users.map((u) => u.id);

    return this.sendNotification(userIds, title, body, data, type);
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // In NotificationsService
async getUnreadNotifications(userId: string) {
  return this.prisma.notification.findMany({
    where: { userId, read: false },
    orderBy: { createdAt: 'desc' },
  });
}

  /**
   * Get unread count for frontend bell icon
   */
  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, read: false },
    });
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  /**
   * Delete a single notification
   */
  async deleteNotification(notificationId: string) {
    return this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }
}
