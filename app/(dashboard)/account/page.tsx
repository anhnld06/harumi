import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { AccountPageContent } from '@/features/account/account-page-content';

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
];

function getAvatarColor(name: string): string {
  const index = name ? name.charCodeAt(0) % AVATAR_COLORS.length : 0;
  return AVATAR_COLORS[index];
}

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }
  if (email?.trim()) {
    return email[0].toUpperCase();
  }
  return '?';
}

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/account');
  }

  const { name, email, image } = session.user;
  const initials = getInitials(name, email ?? undefined);
  const avatarColor = getAvatarColor(name ?? email ?? '');

  return (
    <AccountPageContent
      name={name ?? null}
      email={email ?? null}
      image={image ?? null}
      initials={initials}
      avatarColor={avatarColor}
      userId={session.user.id}
    />
  );
}
