import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get("MAIL_HOST"),
      port: this.configService.get("MAIL_PORT"),
      auth: {
        user: this.configService.get("MAIL_USER"),
        pass: this.configService.get("MAIL_PASS"),
      },
      debug: true,
      logger: true,
    });

    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      this.logger.log("Email service connected successfully");
    } catch (error) {
      this.logger.error("Email service connection failed:", error);
    }
  }

  async sendEmailConfirmation(
    email: string,
    token: string,
    name: string,
  ): Promise<void> {
    const confirmUrl = `${this.configService.get("FRONTEND_URL")}/email-confirmation?token=${token}`;

    const mailOptions = {
      from: this.configService.get("MAIL_FROM"),
      to: email,
      subject: "Подтверждение email адреса",
      html: `
        <h2>Добро пожаловать, ${name}!</h2>
        <p>Спасибо за регистрацию в нашем сервисе.</p>
        <p>Для завершения регистрации, пожалуйста, подтвердите ваш email адрес:</p>
        <a href="${confirmUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
          Подтвердить email
        </a>
        <p>Или скопируйте и вставьте эту ссылку в браузер:</p>
        <p>${confirmUrl}</p>
        <p>Если вы не регистрировались в нашем сервисе, просто проигнорируйте это письмо.</p>
      `,
    };

    try {
      this.logger.log(`Sending confirmation email to: ${email}`);
      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${email}:`, result.messageId);
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}:`, error);
      throw new Error(`Не удалось отправить email: ${error.message}`);
    }
  }

  async sendPasswordReset(
    email: string,
    token: string,
    name: string,
  ): Promise<void> {
    const resetUrl = `${this.configService.get("FRONTEND_URL")}/auth/reset-password?token=${token}`;

    const mailOptions = {
      from: this.configService.get("MAIL_FROM"),
      to: email,
      subject: "Сброс пароля",
      html: `
        <h2>Сброс пароля</h2>
        <p>Здравствуйте, ${name}!</p>
        <p>Вы запросили сброс пароля для вашего аккаунта.</p>
        <p>Нажмите на ссылку ниже, чтобы создать новый пароль:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px;">
          Сбросить пароль
        </a>
        <p>Или скопируйте и вставьте эту ссылку в браузер:</p>
        <p>${resetUrl}</p>
        <p>Эта ссылка действительна в течение 1 часа.</p>
        <p>Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
      `,
    };

    try {
      this.logger.log(`Sending password reset email to: ${email}`);
      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Password reset email sent successfully to ${email}:`,
        result.messageId,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}:`,
        error,
      );
      throw new Error(`Не удалось отправить email: ${error.message}`);
    }
  }
}
