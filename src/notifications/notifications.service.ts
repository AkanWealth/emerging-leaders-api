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
  receiverIds: string[],
  title: string,
  body: string,
  data?: Record<string, any>,
  type?: string,
  senderId?: string
) {
  // Store in-app notifications
  await this.prisma.notification.createMany({
    data: receiverIds.map((receiverId) => ({
      senderId,
      receiverId,
      title,
      body,
      data,
      type,
    })),
  });

  // Get all FCM tokens for the receivers
  const tokens = await this.prisma.fcmToken.findMany({
    where: { userId: { in: receiverIds } },
    select: { token: true },
  });

  const pushTokens = tokens.map((t) => t.token);

  // Send push notifications if tokens exist
  if (pushTokens.length) {
    const messages = pushTokens.map((token) => ({
      token,
      notification: { title, body },
      data: {
        ...(data ?? {}), // ✅ safe spread
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
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
   * Send a notification to one user
   */
  async sendToUser(
    senderId: string,
    receiverId: string,
    title: string,
    body: string,
    data?: Record<string, any>,
    type?: string
  ) {
    return this.sendNotification([receiverId], title, body, data, type, senderId);
  }

  /**
   * Broadcast to all users
   */
  async broadcastNotification(
    senderId: string,
    title: string,
    body: string,
    data?: Record<string, any>,
    type?: string
  ) {
    const users = await this.prisma.user.findMany({ select: { id: true } });
    const receiverIds = users.map((u) => u.id);

    return this.sendNotification(receiverIds, title, body, data, type, senderId);
  }

  /**
   * Get notifications for a user (as receiver)
   */
  async getUserNotifications(receiverId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where: { receiverId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          sender: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              profilePicture: true,
            },
          },
        },
      }),
      this.prisma.notification.count({ where: { receiverId } }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get unread notifications for a user
   */
  async getUnreadNotifications(receiverId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where: { receiverId, read: false },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          sender: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              profilePicture: true,
            },
          },
        },
      }),
      this.prisma.notification.count({ where: { receiverId, read: false } }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get unread count for frontend bell icon
   */
  async getUnreadCount(receiverId: string) {
    const count = await this.prisma.notification.count({
      where: { receiverId, read: false },
    });

    return { unreadCount: count };
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
  async markAllAsRead(receiverId: string) {
    return this.prisma.notification.updateMany({
      where: { receiverId, read: false },
      data: { read: true },
    });
  }

  /**
   * Delete all notifications for a user
   */
  async deleteAllNotifications(receiverId: string) {
    return this.prisma.notification.deleteMany({
      where: { receiverId },
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
