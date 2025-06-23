import { Injectable } from '@nestjs/common';
import { firebaseAdmin } from '../firebase/firebase.init';


@Injectable()
export class NotificationsService {
  async sendPushNotification(token: string, title: string, body: string, data?: Record<string, string>) {
    try {
      const message = {
        token,
        notification: {
          title,
          body,
        },
        data: {
          ...data,
          click_action: 'FLUTTER_NOTIFICATION_CLICK', // useful for Flutter
        },
      };

      const response = await firebaseAdmin.messaging().send(message);
      return { success: true, messageId: response };
    } catch (error) {
      console.error('FCM Error:', error);
      return { success: false, error };
    }
  }
}
