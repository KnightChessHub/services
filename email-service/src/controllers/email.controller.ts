import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Email } from '../models/email.model';
import { sendEmail as sendEmailUtil } from '../utils/emailClient';
import { getWelcomeEmailTemplate, getPasswordResetTemplate, getGameInviteTemplate } from '../utils/emailTemplates';

export const sendWelcomeEmail = async (email: string, username: string) => {
  const template = getWelcomeEmailTemplate(username);
  
  const emailRecord = new Email({
    to: email,
    subject: template.subject,
    type: 'welcome',
    html: template.html,
    text: template.text,
    status: 'pending',
  });

  await emailRecord.save();

  try {
    await sendEmailUtil(email, template.subject, template.html, template.text);
    emailRecord.status = 'sent';
    emailRecord.sentAt = new Date();
  } catch (error: any) {
    emailRecord.status = 'failed';
    emailRecord.error = error.message;
  }

  await emailRecord.save();
  return emailRecord;
};

export const sendPasswordResetEmail = async (email: string, username: string, resetToken: string) => {
  const template = getPasswordResetTemplate(username, resetToken);
  
  const emailRecord = new Email({
    to: email,
    subject: template.subject,
    type: 'password_reset',
    html: template.html,
    text: template.text,
    status: 'pending',
  });

  await emailRecord.save();

  try {
    await sendEmailUtil(email, template.subject, template.html, template.text);
    emailRecord.status = 'sent';
    emailRecord.sentAt = new Date();
  } catch (error: any) {
    emailRecord.status = 'failed';
    emailRecord.error = error.message;
  }

  await emailRecord.save();
  return emailRecord;
};

export const sendGameInviteEmail = async (email: string, username: string, opponentName: string) => {
  const template = getGameInviteTemplate(username, opponentName);
  
  const emailRecord = new Email({
    to: email,
    subject: template.subject,
    type: 'game_invite',
    html: template.html,
    text: template.text,
    status: 'pending',
  });

  await emailRecord.save();

  try {
    await sendEmailUtil(email, template.subject, template.html, template.text);
    emailRecord.status = 'sent';
    emailRecord.sentAt = new Date();
  } catch (error: any) {
    emailRecord.status = 'failed';
    emailRecord.error = error.message;
  }

  await emailRecord.save();
  return emailRecord;
};

export const sendEmail = async (req: AuthRequest, res: Response) => {
  try {
    const { to, subject, html, text, type = 'custom' } = req.body;

    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const emailRecord = new Email({
      to,
      subject,
      type,
      html,
      text,
      status: 'pending',
    });

    await emailRecord.save();

    try {
      await sendEmailUtil(to, subject, html || '', text);
      emailRecord.status = 'sent';
      emailRecord.sentAt = new Date();
    } catch (error: any) {
      emailRecord.status = 'failed';
      emailRecord.error = error.message;
    }

    await emailRecord.save();

    res.json({
      success: true,
      data: {
        id: emailRecord._id.toString(),
        to: emailRecord.to,
        subject: emailRecord.subject,
        type: emailRecord.type,
        status: emailRecord.status,
        sentAt: emailRecord.sentAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getEmails = async (req: AuthRequest, res: Response) => {
  try {
    const { status, type, limit = 50 } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const emails = await Email.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      data: emails.map((email) => ({
        id: email._id.toString(),
        to: email.to,
        subject: email.subject,
        type: email.type,
        status: email.status,
        sentAt: email.sentAt,
        error: email.error,
        createdAt: email.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

