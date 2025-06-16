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

  // public getFormattedHtml(template: string, replacements: Record<string, string>): string {
  //   return Object.entries(replacements).reduce((html, [key, value]) => {
  //     const pattern = new RegExp(`\\[${key.toUpperCase()}\\]`, 'g');
  //     return html.replace(pattern, value);
  //   }, template);
  // }

  // async sendCustomHtmlEmail(
  //   to: string,
  //   subject: string,
  //   templateName: string,
  //   replacements: Record<string, string>,
  // ) {
  //   const templatePath = path.join(__dirname, '..', 'templates', templateName);
  //   const rawHtml = fs.readFileSync(templatePath, 'utf8');
  //   const formattedHtml = this.getFormattedHtml(rawHtml, replacements);

  //   try {
  //     await this.client.sendEmail({
  //       From: this.senderEmail,
  //       To: to,
  //       Subject: subject,
  //       HtmlBody: formattedHtml,
  //       TextBody: 'Please view this email in an HTML-compatible email client.',
  //       MessageStream: 'outbound',
  //     });

  //     this.logger.log(`Custom email sent to ${to}`);
  //   } catch (error) {
  //     this.logger.error(`Failed to send email to ${to}`, error.stack || error.message);
  //   }
  // }

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

  // async sendMail(to: string, subject: string, message: string) {
  //   try {
  //     await this.client.sendEmail({
  //       From: this.senderEmail,
  //       To: to,
  //       Subject: subject,
  //       TextBody: message,
  //       MessageStream: 'outbound',
  //     });

  //     this.logger.log(`Notification email sent to: ${to}`);
  //   } catch (error) {
  //     this.logger.error(`Failed to send notification email to ${to}:`, error);
  //   }
  // }

  // async sendVerificationEmail(email: string, token: string) {
  //   try {
  //     const verificationLink = `${this.configService.get<string>('APP_URL')}/ConfirmVerification?token=${token}`;
  //     await this.sendEmailWithTemplate(email, 39584066, {
  //       verification_link: verificationLink,
  //     });
  //   } catch (error) {
  //     this.logger.error(`Failed to send verification email to ${email}:`, error);
  //   }
  // }

  // async sendResetPasswordEmail(email: string, token: string) {
  //   try {
  //     const resetLink = `${this.configService.get<string>('APP_URL')}/auth/reset-password?token=${token}`;
  //     await this.sendEmailWithTemplate(email, 39585799, {
  //       reset_link: resetLink,
  //     });
  //   } catch (error) {
  //     this.logger.error(`Failed to send password reset email to ${email}:`, error);
  //   }
  // }

  // async sendAccountDeletionEmail(email: string, token: string) {
  //   try {
  //     const link = `${this.configService.get<string>('APP_URL')}/confirm-delete?token=${token}`;
  //     await this.sendEmailWithTemplate(email, 39608732, {
  //       name: email,
  //       link,
  //     });
  //   } catch (error) {
  //     this.logger.error(`Failed to send account deletion email to ${email}:`, error);
  //   }
  // }

  // async sendAdminCredentials(email: string, firstname: string, password: string) {
  //   try {
  //     await this.sendEmailWithTemplate(email, 40200331, {
  //       firstname,
  //       email,
  //       password,
  //       login_url: `${this.configService.get<string>('APP_URL')}/login`,
  //     });
  //   } catch (error) {
  //     this.logger.error(`Failed to send admin credentials to ${email}:`, error);
  //   }
  // }

  // async sendResponseEmail(to: string, name: string, response: string) {
  //   try {
  //     await this.sendEmailWithTemplate(to, 39585790, {
  //       firstname: name,
  //       email: to,
  //       response,
  //     });
  //   } catch (error) {
  //     this.logger.error(`Failed to send response email to ${to}:`, error);
  //   }
  // }

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

  // mail/mail.service.ts


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

// async sendWelcomeEmailWithPassword(email: string, tempPassword: string) {
//   await this.sendEmailWithTemplate(email, 12345678, {
//     temp_password: tempPassword,
//     login_url: `${this.configService.get<string>('APP_URL')}/login`,
//   });
// }

// async sendAdminInvite(email: string, token: string) {
//   await this.sendEmailWithTemplate(email, 87654321, {
//     invite_link: `${this.configService.get<string>('APP_URL')}/admin/invite/${token}`,
//   });
// }


}
