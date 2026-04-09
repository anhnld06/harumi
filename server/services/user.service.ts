import { prisma } from '@/lib/db';

export type UserPlanSnapshot = {
  creditBalance: number;
  planTier: string | null;
  planExpiresAt: Date | null;
};

export async function getUserPlanSnapshot(userId: string): Promise<UserPlanSnapshot | null> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { creditBalance: true, planTier: true, planExpiresAt: true },
  });
  return u;
}

/** Same shape as client session user plan fields (ISO string for expiry). */
export async function getSessionPlanFields(userId: string): Promise<{
  creditBalance: number;
  planTier: string | null;
  planExpiresAt: string | null;
}> {
  const u = await getUserPlanSnapshot(userId);
  return {
    creditBalance: u?.creditBalance ?? 0,
    planTier: u?.planTier ?? null,
    planExpiresAt: u?.planExpiresAt?.toISOString() ?? null,
  };
}

export async function userExistsById(userId: string): Promise<boolean> {
  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  return !!row;
}

export async function getUserIdByEmail(email: string): Promise<string | null> {
  const u = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true },
  });
  return u?.id ?? null;
}

export async function getCertificateRecipientName(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });
  return user?.name?.trim() || user?.email?.split('@')[0] || 'Student';
}

export type RegisteredUserSummary = {
  id: string;
  email: string;
  name: string | null;
};

export async function createUserWithCredentials(params: {
  email: string;
  hashedPassword: string;
  name: string | null;
}): Promise<RegisteredUserSummary> {
  return prisma.user.create({
    data: {
      email: params.email,
      password: params.hashedPassword,
      name: params.name,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function getVerifiedUserProfileForSession(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      emailVerified: true,
    },
  });
}
