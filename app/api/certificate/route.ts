import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { issueOrUpdateCertificate, listUserCertificates } from '@/server/services/certificate.service';

const postSchema = z.object({
  attemptId: z.string().min(1),
  template: z.enum(['HERITAGE', 'SAKURA', 'MIDNIGHT']),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const certificates = await listUserCertificates(userId);
  return NextResponse.json({ certificates });
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const parsed = postSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    const recipientName =
      user?.name?.trim() ||
      user?.email?.split('@')[0] ||
      'Student';

    const certificate = await issueOrUpdateCertificate({
      userId,
      attemptId: parsed.data.attemptId,
      template: parsed.data.template,
      recipientName,
    });

    return NextResponse.json({ certificate });
  } catch (e) {
    if (e instanceof Error && e.message === 'CERT_INELIGIBLE') {
      return NextResponse.json({ error: 'Not eligible for a certificate' }, { status: 403 });
    }
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
