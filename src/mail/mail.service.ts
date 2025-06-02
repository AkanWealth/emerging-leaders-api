import { Injectable } from '@nestjs/common';
import { Client } from 'postmark';

@Injectable()
export class MailService {
  private client: Client;

  constructor() {
    const postmarkApiKey = process.env.POSTMARK_API_KEY;
    if (!postmarkApiKey) {
      throw new Error('POSTMARK_API_KEY is not defined in the environment');
    }

    this.client = new Client(postmarkApiKey);
  }

  /**
   * Send a verification email with Postmark template
   */
  async sendVerificationEmail(email: string, otpCode: string) {
    await this.sendWithTemplate({
      to: email,
      templateAlias: 'verify-otp', // Match this with your Postmark template alias
      templateModel: {
        product_name: 'Emerging Leaders',
        otp_code: otpCode,
        support_email: 'charity@emerging-leaders.net',
      },
    });
  }

   async sendOtpToEmail(email: string, otp: string) {
    await this.sendWithTemplate({
      to: email,
      templateAlias: 'verify-otp', // Match this with your Postmark template alias
      templateModel: {
        product_name: 'Emerging Leaders',
        otp_code: otp,
        support_email: 'charity@emerging-leaders.net',
      },
    });
  }

  /**
   * Send a password reset email with Postmark template
   */
  async sendResetPasswordEmail(email: string, resetUrl: string) {
    await this.sendWithTemplate({
      to: email,
      templateAlias: 'reset-password', // Match with your Postmark template alias
      templateModel: {
        product_name: 'Your App Name',
        reset_link: resetUrl,
        support_email: 'support@yourapp.com',
      },
    });
  }

  /**
   * Send credentials email to admin
   */
  async sendAdminCredentials(email: string, firstname: string, password: string) {
    await this.sendWithTemplate({
      to: email,
      templateAlias: 'admin-credentials',
      templateModel: {
        firstname,
        email,
        password,
        login_url: 'https://yourapp.com/login',
      },
    });
  }

  /**
   * Reusable wrapper for sending email using Postmark templates
   */
  private async sendWithTemplate({
    to,
    templateAlias,
    templateModel,
  }: {
    to: string;
    templateAlias: string;
    templateModel: Record<string, unknown>;
  }) {
    await this.client.sendEmailWithTemplate({
      From: process.env.MAIL_FROM || 'charity@emerging-leaders.net',
      To: to,
      TemplateAlias: templateAlias,
      TemplateModel: templateModel,
    });
  }
}
