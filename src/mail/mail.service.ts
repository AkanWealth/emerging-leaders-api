import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as postmark from 'postmark';
import * as fs from 'fs';
import * as path from 'path';

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
      this.configService.get<string>('MAIL_FROM') || '"Support" <office@emerging-leaders.net>';

    this.logger.log(`MailService initialized. Sender Email: ${this.senderEmail}`);
  }


  async sendEmailWithTemplate(to: string, templateId: number, templateModel: any) {
    try {
      await this.client.sendEmailWithTemplate({
        From: this.senderEmail,
        To: to,
        TemplateId: templateId,
        TemplateModel: templateModel,
      });

      this.logger.log(`Template email sent to: ${to}`);
    } catch (error) {
      this.logger.error(`Postmark failed to send email to ${to}:`, error);
      throw new Error(`Could not send email to ${to}: ${error.message}`);
    }
  }

  async sendAdminInviteWithCode(email: string, fullName: string, code: string) {
  const link = `${this.configService.get<string>('APP_URL')}/verify?email=${encodeURIComponent(
    email,
  )}&code=${code}`;

  try {
    await this.sendEmailWithTemplate(email, 41443194, { 
      title: "You're invited as an Admin",
      fullName: fullName || '',
      body: "You’ve been invited to join as an admin. Use the link or code below to verify your account.",
      verificationLink: link,
      code,
      alertMessage: "This code and link will expire in 7 days and can only be used once.",
    });

    this.logger.log(`Admin invite with code sent to ${email}`);
  } catch (error) {
    this.logger.error(`Failed to send admin invite with code to ${email}:`, error);
    throw new Error(`Could not send admin invite to ${email}: ${error.message}`);
  }
}


  /**
   * Send OTP Email (for verification or login)
   */
  async sendOtpEmail(email: string, otp: string) {
    try {
      await this.sendEmailWithTemplate(email, 40266285, { otp }); // Replace with your Postmark OTP template ID
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
    throw new Error(`Could not send welcome email to ${email}: ${error.message}`);
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
    throw new Error(`Could not send admin invite to ${email}: ${error.message}`);
  }
}

async sendTicketStatusUpdateEmail(to: string, fullName: string, subject: string, status: string) {
  try {
    await this.sendEmailWithTemplate(to, 41132332, {
      title: 'Ticket Status Update',
      fullName: fullName || '',
      body: `Your ticket "<strong>${subject}</strong>" is now marked as <strong>${status}</strong>.`,
      alertMessage: `Status: ${status}`,
    });

    this.logger.log(`Ticket status update template email sent to ${to}`);
  } catch (error) {
    this.logger.error(`Failed to send ticket status email to ${to}:`, error);
    throw new Error(`Could not send ticket status update email to ${to}: ${error.message}`);
  }
}


}
