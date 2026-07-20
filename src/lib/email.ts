import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOtpEmail(
  to: string,
  otp: string,
  name: string
): Promise<void> {
  const fromName = process.env.EMAIL_FROM_NAME || 'ZAAM Store';
  const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@zaamstore.com';

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: 'Your ZAAM Account Verification Code',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Georgia', serif; background: #faf9f7; margin: 0; padding: 0; }
          .container { max-width: 520px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
          .header { background: #0a0a0a; padding: 32px 40px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 400; letter-spacing: 4px; color: #d97706; }
          .body { padding: 40px; }
          .greeting { font-size: 16px; color: #1a1a1a; margin: 0 0 8px; }
          .message { font-size: 14px; color: #666; line-height: 1.6; margin: 0 0 24px; }
          .otp-box { background: #f5f5f0; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #e8e4df; }
          .otp-code { font-family: 'Courier New', monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1a1a1a; margin: 8px 0; }
          .otp-label { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #999; margin: 0; }
          .expiry { font-size: 12px; color: #999; text-align: center; margin-top: 16px; }
          .footer { padding: 24px 40px; text-align: center; border-top: 1px solid #f0eee9; }
          .footer p { font-size: 11px; color: #bbb; margin: 0; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ZAAM</h1>
          </div>
          <div class="body">
            <p class="greeting">Dear ${name},</p>
            <p class="message">
              Thank you for creating a ZAAM account. Use the verification code below to complete your registration. This code expires in <strong>10 minutes</strong>.
            </p>
            <div class="otp-box">
              <p class="otp-label">Verification Code</p>
              <div class="otp-code">${otp}</div>
            </div>
            <p class="expiry">
              If you did not request this code, please ignore this email.
            </p>
          </div>
          <div class="footer">
            <p>ZAAM — Luxury Lifestyle Store</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
  name: string
): Promise<void> {
  const fromName = process.env.EMAIL_FROM_NAME || 'ZAAM Store';
  const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@zaamstore.com';
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(to)}`;

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: 'Reset Your ZAAM Account Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Georgia', serif; background: #faf9f7; margin: 0; padding: 0; }
          .container { max-width: 520px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
          .header { background: #0a0a0a; padding: 32px 40px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 400; letter-spacing: 4px; color: #d97706; }
          .body { padding: 40px; }
          .greeting { font-size: 16px; color: #1a1a1a; margin: 0 0 8px; }
          .message { font-size: 14px; color: #666; line-height: 1.6; margin: 0 0 24px; }
          .button-box { text-align: center; margin: 32px 0; }
          .reset-button { display: inline-block; background: #0a0a0a; color: #d97706; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 14px; font-weight: 600; letter-spacing: 1px; }
          .fallback { font-size: 12px; color: #999; text-align: center; margin-top: 16px; word-break: break-all; }
          .footer { padding: 24px 40px; text-align: center; border-top: 1px solid #f0eee9; }
          .footer p { font-size: 11px; color: #bbb; margin: 0; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ZAAM</h1>
          </div>
          <div class="body">
            <p class="greeting">Dear ${name},</p>
            <p class="message">
              We received a request to reset the password for your ZAAM account. Click the button below to create a new password. This link expires in <strong>1 hour</strong>.
            </p>
            <div class="button-box">
              <a href="${resetUrl}" class="reset-button">Reset Password</a>
            </div>
            <p class="message">
              If you did not request a password reset, please ignore this email.
            </p>
            <p class="fallback">
              If the button does not work, copy and paste this URL into your browser:<br>
              <a href="${resetUrl}" style="color:#d97706;">${resetUrl}</a>
            </p>
          </div>
          <div class="footer">
            <p>ZAAM — Luxury Lifestyle Store</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

export async function sendOtpResendNotification(
  to: string,
  otp: string,
  name: string
): Promise<void> {
  const fromName = process.env.EMAIL_FROM_NAME || 'ZAAM Store';
  const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@zaamstore.com';

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: 'New Verification Code for ZAAM',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Georgia', serif; background: #faf9f7; margin: 0; padding: 0; }
          .container { max-width: 520px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
          .header { background: #0a0a0a; padding: 32px 40px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 400; letter-spacing: 4px; color: #d97706; }
          .body { padding: 40px; }
          .message { font-size: 14px; color: #666; line-height: 1.6; margin: 0 0 24px; }
          .otp-box { background: #f5f5f0; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #e8e4df; }
          .otp-code { font-family: 'Courier New', monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1a1a1a; margin: 8px 0; }
          .otp-label { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #999; margin: 0; }
          .expiry { font-size: 12px; color: #999; text-align: center; margin-top: 16px; }
          .footer { padding: 24px 40px; text-align: center; border-top: 1px solid #f0eee9; }
          .footer p { font-size: 11px; color: #bbb; margin: 0; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ZAAM</h1>
          </div>
          <div class="body">
            <p class="message">
              Here is your new verification code. This code expires in <strong>10 minutes</strong>.
            </p>
            <div class="otp-box">
              <p class="otp-label">New Verification Code</p>
              <div class="otp-code">${otp}</div>
            </div>
            <p class="expiry">
              If you did not request this code, please ignore this email.
            </p>
          </div>
          <div class="footer">
            <p>ZAAM — Luxury Lifestyle Store</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}
