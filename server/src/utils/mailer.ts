import nodemailer from 'nodemailer';
import { env } from '../config/env';

const isConfigured = !!(env.EMAIL_USER && env.EMAIL_APP_PASSWORD);

const transporter = isConfigured
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_APP_PASSWORD,
      },
    })
  : null;

export const sendEmail = async (to: string, subject: string, html: string) => {
  if (!transporter) {
    console.warn(`Email not sent to ${to} ("${subject}") — EMAIL_USER/EMAIL_APP_PASSWORD not configured`);
    return;
  }

  await transporter.sendMail({
    from: `"GovGrant" <${env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

export const sendVerificationEmail = async (to: string, name: string, link: string) => {
  await sendEmail(
    to,
    'Verify your GovGrant email address',
    `
      <p>Hi ${name},</p>
      <p>Welcome to GovGrant. Please verify your email address to confirm your account:</p>
      <p><a href="${link}">${link}</a></p>
      <p>This link expires in 24 hours. If you didn't create this account, you can ignore this email.</p>
    `
  );
};

export const sendPasswordResetEmail = async (to: string, name: string, link: string) => {
  await sendEmail(
    to,
    'Reset your GovGrant password',
    `
      <p>Hi ${name},</p>
      <p>We received a request to reset your GovGrant password. Click the link below to choose a new one:</p>
      <p><a href="${link}">${link}</a></p>
      <p>This link expires in 1 hour and can only be used once. If you didn't request this, you can ignore this email — your password will stay the same.</p>
    `
  );
};
