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
   * Send a verification email using Postmark TemplateId
   */
  async sendVerificationEmail(email: string, otpCode: string) {
    await this.sendWithTemplate({
      to: email,
      templateId: 1234567, // replace with your actual verification template ID
      templateModel: {
        product_name: 'Emerging Leaders',
        otp_code: otpCode,
        support_email: 'charity@emerging-leaders.net',
      },
    });
  }

  /**
   * Send OTP email using Postmark TemplateId
   */
  async sendOtpToEmail(email: string, otp: string) {
    await this.sendWithTemplate({
      to: email,
      templateId: 40266285, 
      templateModel: {
        product_name: 'Emerging Leaders',
        otp_code: otp,
        support_email: 'charity@emerging-leaders.net',
      },
    });
  }

  /**
   * Send a password reset email using Postmark TemplateId
   */
  async sendResetPasswordEmail(email: string, resetUrl: string) {
    await this.sendWithTemplate({
      to: email,
      templateId: 2345678, // replace with your actual reset password template ID
      templateModel: {
        product_name: 'Your App Name',
        reset_link: resetUrl,
        support_email: 'support@yourapp.com',
      },
    });
  }

  /**
   * Send admin credentials email using Postmark TemplateId
   */
  async sendAdminCredentials(email: string, firstname: string, password: string) {
    await this.sendWithTemplate({
      to: email,
      templateId: 3456789, // replace with your actual admin credentials template ID
      templateModel: {
        firstname,
        email,
        password,
        login_url: 'https://yourapp.com/login',
      },
    });
  }

  /**
   * Reusable wrapper for sending emails using Postmark TemplateId
   */
  private async sendWithTemplate({
    to,
    templateId,
    templateModel,
  }: {
    to: string;
    templateId: number;
    templateModel: Record<string, unknown>;
  }) {
    await this.client.sendEmailWithTemplate({
      From: process.env.MAIL_FROM || 'charity@emerging-leaders.net',
      To: to,
      TemplateId: templateId,
      TemplateModel: templateModel,
    });
  }
}
