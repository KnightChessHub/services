import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string, text?: string) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    throw new Error(`Email send failed: ${error.message}`);
  }
};

export const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    return false;
  }
};

