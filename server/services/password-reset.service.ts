import { randomBytes } from 'crypto';
import { prisma } from '@/lib/db';

export const PASSWORD_RESET_PREFIX = 'pwreset:' as const;

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function passwordResetIdentifier(email: string) {
  return `${PASSWORD_RESET_PREFIX}${normalizeEmail(email)}`;
}

/** Create a new reset token for credential users. Returns plaintext token for the URL, or null if user cannot reset. */
export async function createPasswordResetToken(email: string): Promise<string | null> {
  const normalized = normalizeEmail(email);
  const user = await prisma.user.findUnique({
    where: { email: normalized },
    select: { password: true },
  });

  if (!user?.password) {
    return null;
  }

  const identifier = passwordResetIdentifier(normalized);
  await prisma.verificationToken.deleteMany({ where: { identifier } });

  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  return token;
}

/** Remove pending reset tokens after failed email delivery (same identifier as create). */
export async function deletePasswordResetTokensForEmail(email: string): Promise<void> {
  const identifier = passwordResetIdentifier(email);
  await prisma.verificationToken.deleteMany({ where: { identifier } });
}

/** Validates token and returns email, or null if invalid/expired. Does not delete the token. */
export async function peekPasswordResetEmail(
  token: string
): Promise<string | null> {
  const row = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!row || !row.identifier.startsWith(PASSWORD_RESET_PREFIX)) {
    return null;
  }

  if (row.expires.getTime() < Date.now()) {
    return null;
  }

  return row.identifier.slice(PASSWORD_RESET_PREFIX.length);
}

/** Apply new password and invalidate token. */
export async function completePasswordReset(token: string, hashedPassword: string) {
  const email = await peekPasswordResetEmail(token);
  if (!email) {
    return { ok: false as const, error: 'invalid_or_expired_token' };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, password: true },
  });

  if (!user?.password) {
    await prisma.verificationToken.delete({ where: { token } });
    return { ok: false as const, error: 'invalid_or_expired_token' };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    }),
    prisma.verificationToken.delete({ where: { token } }),
  ]);

  return { ok: true as const };
}
