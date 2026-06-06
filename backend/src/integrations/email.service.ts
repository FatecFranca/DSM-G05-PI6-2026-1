import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter | null = null;
  private readonly from: string;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    this.from = this.configService.get<string>('SMTP_FROM') || '';

    if (!host || !port || !user || !pass) {
      this.logger.warn('SMTP credentials not fully configured. Email service disabled.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: { user, pass },
    });
  }

  async sendMessage(to: string, subject: string, html: string): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn('Email transporter not initialized. Message not sent.');
      return false;
    }

    try {
      await this.transporter.sendMail({ from: this.from, to, subject, html });
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }
}
