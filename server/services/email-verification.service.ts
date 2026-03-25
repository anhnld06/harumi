import bcrypt from 'bcryptjs';
import { randomInt } from 'crypto';
import { sendEmailVerificationCode } from '@/lib/mail';
import { prisma } from '@/lib/db';

export const EMAIL_VERIFY_PREFIX = 'emailverify:' as const;

const CODE_TTL_MS = 15 * 60 * 1000; // 15 minutes

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function emailVerifyIdentifier(email: string) {
  return `${EMAIL_VERIFY_PREFIX}${normalizeEmail(email)}`;
}

function generateSixDigitCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

/**
 * Replaces any prior code, stores bcrypt hash in VerificationToken.token.
 * Returns plaintext code for emailing, or null if verification is not applicable.
 */
export async function createEmailVerificationCode(
  email: string
): Promise<string | null> {
  const normalized = normalizeEmail(email);
  const user = await prisma.user.findUnique({
    where: { email: normalized },
    select: { password: true, emailVerified: true },
  });

  if (!user?.password || user.emailVerified) {
    return null;
  }

  const identifier = emailVerifyIdentifier(normalized);
  await prisma.verificationToken.deleteMany({ where: { identifier } });

  const code = generateSixDigitCode();
  const token = await bcrypt.hash(code, 10);
  const expires = new Date(Date.now() + CODE_TTL_MS);

  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  return code;
}

export async function clearEmailVerificationCodes(email: string) {
  const identifier = emailVerifyIdentifier(email);
  await prisma.verificationToken.deleteMany({ where: { identifier } });
}

/** Validates code, sets emailVerified, removes token. */
export async function verifyEmailWithCode(
  email: string,
  code: string
): Promise<'ok' | 'invalid' | 'expired' | 'not_applicable'> {
  const normalized = normalizeEmail(email);
  const digits = code.replace(/\D/g, '');
  if (digits.length !== 6) {
    return 'invalid';
  }

  const user = await prisma.user.findUnique({
    where: { email: normalized },
    select: { password: true, emailVerified: true },
  });

  if (!user?.password || user.emailVerified) {
    return 'not_applicable';
  }

  const identifier = emailVerifyIdentifier(normalized);
  const row = await prisma.verificationToken.findFirst({
    where: { identifier },
  });

  if (!row) {
    return 'invalid';
  }

  if (row.expires.getTime() < Date.now()) {
    await prisma.verificationToken.delete({ where: { token: row.token } });
    return 'expired';
  }

  const match = await bcrypt.compare(digits, row.token);
  if (!match) {
    return 'invalid';
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { email: normalized },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({ where: { token: row.token } }),
  ]);

  return 'ok';
}

/** Create code, send email; roll back token if SMTP fails. */
export async function issueAndSendEmailVerification(
  email: string
): Promise<'sent' | 'skipped' | 'failed'> {
  const code = await createEmailVerificationCode(email);
  if (!code) {
    return 'skipped';
  }
  const mail = await sendEmailVerificationCode(email, code);
  if (!mail.ok) {
    await clearEmailVerificationCodes(email);
    return 'failed';
  }
  return 'sent';
}
