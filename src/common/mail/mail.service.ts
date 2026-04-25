import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('MAIL_HOST'),
      port: Number(this.config.get<string>('MAIL_PORT')),
      secure: false,
      auth: {
        user: this.config.get<string>('MAIL_USER'),
        pass: this.config.get<string>('MAIL_PASS'),
      },
    });
  }

async sendOtp(email: string, otp: string, subject: string) {
  await this.transporter.sendMail({
    from: this.config.get<string>("MAIL_FROM"),
    to: email,
    subject,
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>

<body style="margin:0; padding:0; background-color:#f8fafc; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc; padding:48px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px; background-color:#ffffff; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.03);">
          
          <tr>
            <td style="padding:40px 40px 20px; text-align:left;">
              <div style="width:40px; height:40px; background:#4f46e5; border-radius:10px; margin-bottom:24px;"></div>
              <h1 style="margin:0; color:#1e293b; font-size:24px; font-weight:700; letter-spacing:-0.02em;">
                Verify your identity
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px 30px; text-align:left;">
              <p style="margin:0 0 24px; color:#475569; font-size:16px; line-height:26px;">
                Hello, <br><br>
                To secure your account and complete the request for <strong>${subject}</strong>, please use the following one-time password (OTP):
              </p>

              <div style="background-color:#f1f5f9; border-radius:12px; padding:24px; text-align:center; border:1px solid #e2e8f0;">
                <span style="letter-spacing:10px; color:#1e293b; font-size:36px; font-weight:800; font-family: 'Courier New', Courier, monospace; margin-left:10px;">
                  ${otp}
                </span>
              </div>

              <p style="margin:24px 0 0; color:#64748b; font-size:14px; line-height:22px;">
                This code is valid for <strong>10 minutes</strong>. If you didn't make this request, you can safely ignore this message.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f1f5f9; padding-top:24px;">
                <tr>
                  <td>
                    <p style="margin:0; color:#94a3b8; font-size:12px; line-height:18px;">
                      <strong>Security Tip:</strong> Our team will never ask for your password or OTP via email, phone, or chat.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background-color:#f8fafc; padding:24px 40px; text-align:center;">
              <p style="margin:0; color:#94a3b8; font-size:12px; font-weight:500;">
                © ${new Date().getFullYear()} Your Brand Inc.
              </p>
              <p style="margin:4px 0 0; color:#cbd5e1; font-size:11px;">
                123 Business Ave, Suite 100, San Francisco, CA
              </p>
            </td>
          </tr>

        </table>
        
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px; margin-top:20px;">
          <tr>
            <td style="text-align:center;">
              <a href="#" style="color:#94a3b8; text-decoration:underline; font-size:12px;">Help Center</a>
              <span style="color:#cbd5e1; margin:0 8px;">•</span>
              <a href="#" style="color:#94a3b8; text-decoration:underline; font-size:12px;">Privacy Policy</a>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
    `,
  });
}
}