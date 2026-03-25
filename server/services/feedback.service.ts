import { prisma } from '@/lib/db';

const MAX_MESSAGE_LENGTH = 10_000;

export function validateFeedbackInput(params: {
  name: string;
  email: string;
  message: string;
}): { ok: true } | { ok: false; error: string } {
  const name = params.name.trim();
  const email = params.email.trim().toLowerCase();
  const message = params.message.trim();

  if (name.length < 1 || name.length > 200) {
    return { ok: false, error: 'Invalid name' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'Invalid email' };
  }
  if (message.length < 1 || message.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, error: 'Invalid description' };
  }

  return { ok: true };
}

export async function createFeedbackRecord(params: {
  userId?: string | null;
  name: string;
  email: string;
  message: string;
}) {
  return prisma.feedback.create({
    data: {
      userId: params.userId ?? null,
      name: params.name.trim(),
      email: params.email.trim().toLowerCase(),
      message: params.message.trim(),
      screenshotDataUrl: null,
    },
    select: { id: true },
  });
}
