'use client';

import Image from 'next/image';
import { Mail } from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useLanguage } from '@/lib/i18n/language-context';
import { cn } from '@/lib/utils';

interface AccountHeaderProps {
  name: string | null;
  email: string | null;
  image: string | null;
  initials: string;
  avatarColor: string;
}

export function AccountHeader({
  name,
  email,
  image,
  initials,
  avatarColor,
}: AccountHeaderProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-center gap-6">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full">
          {image ? (
            <Image
              src={image}
              alt={name ?? 'User'}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div
              className={cn(
                'flex h-full w-full items-center justify-center text-2xl font-medium text-white',
                avatarColor
              )}
            >
              {initials}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t('account.management')}
          </p>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{name || 'User'}</h1>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {t('account.free')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{email || ''}</span>
          </div>
        </div>
      </div>
      <div className="shrink-0">
        <LanguageSwitcher />
      </div>
    </div>
  );
}
