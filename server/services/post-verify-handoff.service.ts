import { createHash, randomBytes } from 'crypto';
import { prisma } from '@/lib/db';

export const POST_VERIFY_PREFIX = 'postverify:' as const;

const HANDOFF_TTL_MS = 5 * 60 * 1000; // 5 minutes

function identifierForUser(userId: string) {
  return `${POST_VERIFY_PREFIX}${userId}`;
}

function hashToken(plaintext: string) {
  return createHash('sha256').update(plaintext, 'utf8').digest('hex');
}

/** Single-use token returned to client once; DB stores SHA-256 only. */
export async function createPostVerifyHandoff(userId: string): Promise<string> {
  const identifier = identifierForUser(userId);
  await prisma.verificationToken.deleteMany({ where: { identifier } });

  const plaintext = randomBytes(32).toString('hex');
  const token = hashToken(plaintext);
  const expires = new Date(Date.now() + HANDOFF_TTL_MS);

  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  return plaintext;
}

/** Validates handoff; does not delete (delete after session is set). */
export async function resolvePostVerifyHandoff(
  plaintext: string
): Promise<string | null> {
  const trimmed = plaintext.trim();
  if (!trimmed) return null;

  const token = hashToken(trimmed);
  const row = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!row || !row.identifier.startsWith(POST_VERIFY_PREFIX)) {
    return null;
  }

  if (row.expires.getTime() < Date.now()) {
    await prisma.verificationToken.delete({ where: { token } });
    return null;
  }

  return row.identifier.slice(POST_VERIFY_PREFIX.length);
}

export async function deletePostVerifyHandoff(plaintext: string): Promise<void> {
  const trimmed = plaintext.trim();
  if (!trimmed) return;
  const token = hashToken(trimmed);
  await prisma.verificationToken.deleteMany({ where: { token } });
}
