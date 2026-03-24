'use client';

import { useState } from 'react';
import { Receipt, Star } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AccountHeader } from '@/features/account/account-header';
import { AccountOverview } from '@/features/account/account-overview';
import { AccountPackageHistory } from '@/features/account/account-package-history';
import { AccountBookmarks } from '@/features/account/account-bookmarks';
import { useLanguage } from '@/lib/i18n/language-context';
import { cn } from '@/lib/utils';

type AccountTab = 'overview' | 'packageHistory' | 'bookmarks';

interface AccountPageContentProps {
  name: string | null;
  email: string | null;
  image: string | null;
  initials: string;
  avatarColor: string;
  userId: string;
}

export function AccountPageContent({
  name,
  email,
  image,
  initials,
  avatarColor,
  userId,
}: AccountPageContentProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<AccountTab>('overview');

  return (
    <div className="-m-4 md:-m-8 min-h-screen">
      <div className="min-h-full w-full rounded-lg bg-zinc-100 dark:bg-zinc-800/40">
        <div className="mx-auto max-w-5xl p-4 md:p-5">
          <div className="space-y-6">
      {/* Block 1: Header */}
      <Card>
        <CardHeader>
          <AccountHeader
            name={name}
            email={email}
            image={image}
            initials={initials}
            avatarColor={avatarColor}
          />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex w-fit items-center rounded-full bg-muted p-1">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={cn(
                'rounded-full px-5 py-2 text-sm font-medium transition',
                activeTab === 'overview'
                  ? 'bg-background text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t('account.overview')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('packageHistory')}
              className={cn(
                'flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition',
                activeTab === 'packageHistory'
                  ? 'bg-background text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Receipt className="h-4 w-4" />
              {t('account.packageHistory')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bookmarks')}
              className={cn(
                'flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition',
                activeTab === 'bookmarks'
                  ? 'bg-background text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Star className="h-4 w-4" />
              {t('account.bookmarks')}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Block 2+: Tab content - each section is its own card(s) */}
      {activeTab === 'overview' && (
        <div
          key="overview"
          className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300"
        >
          <AccountOverview />
        </div>
      )}
      {activeTab === 'packageHistory' && (
        <div
          key="packageHistory"
          className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300"
        >
          <AccountPackageHistory />
        </div>
      )}
      {activeTab === 'bookmarks' && (
        <div
          key="bookmarks"
          className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300"
        >
          <AccountBookmarks userId={userId} />
        </div>
      )}
          </div>
        </div>
      </div>
    </div>
  );
}
