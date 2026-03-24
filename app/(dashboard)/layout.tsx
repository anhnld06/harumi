import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { DashboardLayout } from '@/features/layout/dashboard-layout';

/** Avoid Prisma/session work during `next build` when env (e.g. DATABASE_URL) is absent on CI. */
export const dynamic = 'force-dynamic';

export default async function AppDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/dashboard');
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
