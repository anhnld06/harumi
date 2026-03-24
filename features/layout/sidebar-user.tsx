'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/language-context';
import { cn } from '@/lib/utils';
import { SidebarSubscription } from './sidebar-subscription';

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

interface SidebarUserProps {
  collapsed?: boolean;
}

export function SidebarUser({ collapsed = false }: SidebarUserProps) {
  const { data: session, status } = useSession();
  const { t } = useLanguage();

  if (status === 'loading' || !session?.user) {
    return (
      <div className="border-t">
        {!collapsed && (
          <div className="space-y-2 px-3 pt-3">
            <div className="h-24 animate-pulse rounded-lg border bg-muted/40" />
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center px-2 pb-2 pt-3">
            <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-muted" />
          </div>
        )}
        <div className={cn('flex items-center gap-3 p-3', collapsed && 'flex-col justify-center px-2')}>
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-muted" />
          {!collapsed && (
            <div className="flex-1 space-y-1">
              <div className="h-4 w-12 animate-pulse rounded bg-muted" />
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            </div>
          )}
        </div>
      </div>
    );
  }

  const { name, email, image } = session.user;
  const initials = getInitials(name, email ?? undefined);
  const avatarColor = getAvatarColor(name ?? email ?? '');

  return (
    <div className="border-t">
      <SidebarSubscription collapsed={collapsed} embedded />
      <div
        className={cn(
          'flex items-center p-3',
          collapsed ? 'flex-col gap-2 px-2' : 'gap-3'
        )}
      >
        <Link
          href="/account"
          className={cn(
            'flex min-w-0 items-center gap-3 rounded-lg transition-colors hover:bg-accent/50',
            !collapsed && 'flex-1'
          )}
        >
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
            {image ? (
              <Image
                src={image}
                alt={name ?? 'User'}
                fill
                className="object-cover"
                sizes="36px"
              />
            ) : (
              <div
                className={cn(
                  'flex h-full w-full items-center justify-center text-sm font-medium text-white',
                  avatarColor
                )}
              >
                {initials}
              </div>
            )}
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium" title={name ?? undefined}>
                {name || 'User'}
              </p>
              <p className="truncate text-xs text-muted-foreground" title={email ?? undefined}>
                {email || ''}
              </p>
            </div>
          )}
        </Link>

        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground hover:text-foreground"
          title={t('nav.signOut')}
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
