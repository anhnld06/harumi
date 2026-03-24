'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Languages,
  BookMarked,
  FileText,
  Headphones,
  ClipboardList,
  User,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/language-context';

const mainNavItems = [
  { href: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { href: '/vocab', labelKey: 'nav.vocabulary', icon: BookOpen },
  { href: '/kanji', labelKey: 'nav.kanji', icon: Languages },
  { href: '/grammar', labelKey: 'nav.grammar', icon: BookMarked },
  { href: '/reading', labelKey: 'nav.reading', icon: FileText },
  { href: '/listening', labelKey: 'nav.listening', icon: Headphones },
  { href: '/mock-test', labelKey: 'nav.mockTest', icon: ClipboardList },
];

const aiNavItems = [
  { href: '/ai-assistant', labelKey: 'nav.aiAssistant', icon: Sparkles },
];

const accountLinkItems = [
  { href: '/account', labelKey: 'nav.account', icon: User },
];

const accountActionItems = [
  { labelKey: 'nav.sendFeedback', icon: MessageSquare },
];

interface SidebarNavProps {
  collapsed?: boolean;
  onSendFeedback?: () => void;
}

export function SidebarNav({ collapsed = false, onSendFeedback }: SidebarNavProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <nav className={cn('flex-1 space-y-4 overflow-hidden', collapsed ? 'p-2' : 'p-4')}>
      <div className="space-y-1">
        {mainNavItems.map(({ href, labelKey, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            title={collapsed ? t(labelKey) : undefined}
            className={cn(
              'flex items-center rounded-lg text-sm font-semibold transition',
              collapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2',
              pathname.startsWith(href)
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="truncate">{t(labelKey)}</span>}
          </Link>
        ))}
      </div>

      <div className="space-y-1">
        {!collapsed && (
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t('nav.aiSection')}
          </p>
        )}
        {aiNavItems.map(({ href, labelKey, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            title={collapsed ? t(labelKey) : undefined}
            className={cn(
              'flex items-center rounded-lg text-sm font-semibold transition',
              collapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2',
              pathname.startsWith(href)
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="truncate">{t(labelKey)}</span>}
          </Link>
        ))}
      </div>

      <div className="space-y-1">
        {!collapsed && (
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t('nav.account')}
          </p>
        )}
        {accountLinkItems.map(({ href, labelKey, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            title={collapsed ? t(labelKey) : undefined}
            className={cn(
              'flex items-center rounded-lg text-sm font-semibold transition',
              collapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2',
              pathname.startsWith(href)
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="truncate">{t(labelKey)}</span>}
          </Link>
        ))}
        {accountActionItems.map(({ labelKey, icon: Icon }) => (
          <button
            key={labelKey}
            type="button"
            title={collapsed ? t(labelKey) : undefined}
            onClick={() => onSendFeedback?.()}
            className={cn(
              'flex w-full items-center rounded-lg text-sm font-semibold transition',
              collapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2',
              'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="truncate">{t(labelKey)}</span>}
          </button>
        ))}
      </div>
    </nav>
  );
}
