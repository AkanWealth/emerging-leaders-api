import {
  Injectable,
  Logger,
  UnprocessableEntityException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as postmark from 'postmark';

@Injectable()
export class MailService {
  private client: postmark.ServerClient;
  private senderEmail: string;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    const apiToken = this.configService.get<string>('POSTMARK_API_KEY');

    if (!apiToken) {
      this.logger.error('Postmark API token is missing! Check your .env file.');
      throw new Error('Postmark API token is required but missing.');
    }

    this.client = new postmark.ServerClient(apiToken);
    this.senderEmail =
      this.configService.get<string>('MAIL_FROM') ||
      '"Support" <office@emerging-leaders.net>';

    this.logger.log(
      `MailService initialized. Sender Email: ${this.senderEmail}`,
    );
  }

  async sendEmailWithTemplate(
    to: string,
    templateId: number,
    templateModel: any,
  ) {
    try {
      await this.client.sendEmailWithTemplate({
        From: this.senderEmail,
        To: to,
        TemplateId: templateId,
        TemplateModel: templateModel,
      });

      this.logger.log(`Template email sent to: ${to}`);
    } catch (error: any) {
      this.logger.error(`Postmark failed to send email to ${to}:`, error);

      if (error.code === 406) {
        // InactiveRecipientsError
        throw new UnprocessableEntityException({
          statusCode: 406,
          message: `Email not sent. Recipient ${to} is inactive (hard bounce, spam complaint, or suppressed).`,
          recipients: error.recipients ?? [to],
        });
      }

      throw new InternalServerErrorException({
        statusCode: 500,
        message: `Could not send email to ${to}`,
        error: error.message,
      });
    }
  }

  async sendAdminInviteWithCode(email: string, fullName: string, code: string) {
    const link = `${this.configService.get<string>('APP_URL')}/invite?email=${encodeURIComponent(
      email,
    )}&code=${code}`;

    try {
      await this.sendEmailWithTemplate(email, 41443194, {
        title: "You're invited as an Admin",
        fullName: fullName || '',
        body: 'You’ve been invited to join as an admin. Use the link or code below to verify your account.',
        verificationLink: link,
        code,
        alertMessage:
          'This code and link will expire in 7 days and can only be used once.',
      });

      this.logger.log(`Admin invite with code sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send admin invite with code to ${email}:`,
        error,
      );
      throw new Error(
        `Could not send admin invite to ${email}: ${error.message}`,
      );
    }
  }

  private getAppUrl() {
    return this.configService.get<string>('APP_URL') || 'https://your-app.com';
  }
  // async sendChangePasswordOtp(email: string, fullName: string, code: string) {
  //   const link = `${this.configService.get<string>('APP_URL')}/change-password?email=${encodeURIComponent(
  //     email,
  //   )}&code=${code}`;

  //   try {
  //     await this.sendEmailWithTemplate(email, 41525962, { // <-- create/use a template in Postmark
  //       title: "Confirm Password Change",
  //       fullName: fullName || '',
  //       body: "You requested to change your password. Use the link or code below to verify this action.",
  //       verificationLink: link,
  //       code,
  //       alertMessage: "This code and link will expire in 10 minutes and can only be used once.",
  //     });

  //     this.logger.log(`Password change OTP sent to ${email}`);
  //   } catch (error) {
  //     this.logger.error(`Failed to send password change OTP to ${email}:`, error);
  //     throw new Error(`Could not send password change OTP to ${email}: ${error.message}`);
  //   }
  // }
  async sendInactivityWarning(email: string, message: string) {
    const appUrl = this.getAppUrl();

    await this.sendEmailWithTemplate(email, 41527693, {
      title: 'Inactivity Warning',
      body: message,
      loginLink: `${appUrl}/login`,
      alertMessage: 'Please log in to keep your account active.',
    });
  }

  async sendInactivityNotice(email: string, message: string) {
    const appUrl = this.getAppUrl();

    await this.sendEmailWithTemplate(email, 41527744, {
      title: 'Account Inactivated',
      body: message,
      loginLink: `${appUrl}/login`,
      alertMessage: 'You can reactivate your account anytime by logging in.',
    });
  }

  async sendAdminPasswordResetLink(
    email: string,
    fullName: string,
    resetLink: string,
    code: string,
  ) {
    try {
      await this.sendEmailWithTemplate(email, 41501059, {
        title: 'Password Reset Request',
        fullName: fullName || '',
        body: 'We received a request to reset your admin account password. Use the link below to reset it.',
        resetLink, //  MUST match {{resetLink}} in the Postmark template
        code,
        alertMessage: 'This link and code will expire in 15 minutes.',
      });

      this.logger.log(`Password reset email sent to admin: ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send admin password reset email:`, error);
      throw new Error(
        `Could not send reset email to ${email}: ${error.message}`,
      );
    }
  }

  /**
   * Send OTP Email (for verification or login)
   */
  async sendOtpEmail(email: string, otp: string) {
    try {
      await this.sendEmailWithTemplate(email, 40266285, { otp });
      this.logger.log(`OTP email sent to: ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}:`, error);
    }
  }

  async sendWelcomeEmailWithPassword(email: string, tempPassword: string) {
    try {
      await this.client.sendEmail({
        From: this.senderEmail,
        To: email,
        Subject: 'Welcome to the Platform',
        TextBody: `Welcome! Your temporary password is: ${tempPassword}`,
        HtmlBody: `<p>Welcome!</p><p>Your temporary password is: <strong>${tempPassword}</strong></p>`,
        MessageStream: 'outbound',
      });

      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error);
      throw new Error(
        `Could not send welcome email to ${email}: ${error.message}`,
      );
    }
  }

  async sendAdminInvite(email: string, token: string) {
    const link = `${this.configService.get<string>('APP_URL')}/admin/invite/${token}`;

    try {
      await this.client.sendEmail({
        From: this.senderEmail,
        To: email,
        Subject: 'You’ve been invited to become an admin',
        TextBody: `Click this link to accept the invite: ${link}`,
        HtmlBody: `<p>You’ve been invited to become an admin.</p><p><a href="${link}">Click here to accept the invite</a></p>`,
        MessageStream: 'outbound',
      });

      this.logger.log(`Admin invite sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send admin invite to ${email}:`, error);
      throw new Error(
        `Could not send admin invite to ${email}: ${error.message}`,
      );
    }
  }

  async sendTicketStatusUpdateEmail(
    to: string,
    fullName: string,
    subject: string,
    status: string,
  ) {
    try {
      await this.sendEmailWithTemplate(to, 41132332, {
        title: 'Ticket Status Update',
        fullName: fullName || '',
        body: `Your ticket "${subject}" is now marked as ${status}.`,
        alertMessage: `Status: ${status}`,
      });

      this.logger.log(`Ticket status update template email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send ticket status email to ${to}:`, error);
      throw new Error(
        `Could not send ticket status update email to ${to}: ${error.message}`,
      );
    }
  }
}
