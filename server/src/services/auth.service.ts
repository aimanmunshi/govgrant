import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { prisma } from '../config/db';
import { generateAccessToken, generateRefreshToken, parseDurationMs } from '../utils/jwt.utils';
import { RegisterInput, LoginInput, UpdateProfileInput } from '../schemas/auth.schema';
import { env } from '../config/env';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/mailer';

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1h

const createVerificationToken = async (userId: number) => {
  const token = crypto.randomBytes(32).toString('hex');
  await prisma.emailVerificationToken.create({
    data: { token, userId, expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS) },
  });
  return token;
};

export const registerUser = async (data: RegisterInput) => {
  // check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // hash password
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // create user — role is never taken from client input; all self-registrations
  // are APPLICANT, promotion to REVIEWER/ADMIN happens via the admin-only role endpoint
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      organization: data.organization,
      role: 'APPLICANT',
      emailVerified: false,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      organization: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  const token = await createVerificationToken(user.id);
  const link = `${env.CLIENT_URL}/verify-email?token=${token}`;
  await sendVerificationEmail(user.email, user.name, link);

  return user;
};

export const verifyEmail = async (token: string) => {
  const record = await prisma.emailVerificationToken.findUnique({ where: { token } });

  if (!record || record.expiresAt < new Date()) {
    throw new Error('Invalid or expired verification link');
  }

  await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerified: true },
  });

  await prisma.emailVerificationToken.deleteMany({ where: { userId: record.userId } });
};

export const resendVerificationEmail = async (userId: number) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  if (user.emailVerified) throw new Error('Email is already verified');

  await prisma.emailVerificationToken.deleteMany({ where: { userId } });
  const token = await createVerificationToken(userId);
  const link = `${env.CLIENT_URL}/verify-email?token=${token}`;
  await sendVerificationEmail(user.email, user.name, link);
};

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  // don't reveal whether the email exists
  if (!user) return;

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });

  const token = crypto.randomBytes(32).toString('hex');
  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
  });

  const link = `${env.CLIENT_URL}/reset-password?token=${token}`;
  await sendPasswordResetEmail(user.email, user.name, link);
};

export const resetPassword = async (token: string, newPassword: string) => {
  const record = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw new Error('Invalid or expired reset link');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { password: hashedPassword } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    // invalidate all existing sessions so a leaked password can't keep a session alive
    prisma.refreshToken.deleteMany({ where: { userId: record.userId } }),
  ]);
};

export const loginUser = async (data: LoginInput) => {
  // find user
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // verify password
  const isPasswordValid = await bcrypt.compare(data.password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // generate tokens
  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  // save refresh token in DB
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + parseDurationMs(env.REFRESH_TOKEN_EXPIRY)),
    },
  });

  const userWithoutPassword = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    organization: user.organization,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
  };

  return { user: userWithoutPassword, accessToken, refreshToken };
};

export const refreshAccessToken = async (refreshToken: string) => {
  // check if refresh token exists in DB
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw new Error('Invalid or expired refresh token');
  }

  // generate new access token
  const accessToken = generateAccessToken(
    storedToken.user.id,
    storedToken.user.role
  );

  return { accessToken };
};

export const logoutUser = async (refreshToken: string) => {
  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });
};

export const updateProfile = async (userId: number, data: UpdateProfileInput) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      organization: data.organization,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      organization: true,
      emailVerified: true,
      createdAt: true,
    },
  });
};