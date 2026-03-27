'use client';

import Link from 'next/link';
import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n/language-context';
import { cn } from '@/lib/utils';

export type ReadingListItem = {
  id: string;
  title: string;
  content: string;
  wordCount: number | null;
  level: string;
  contentVi: string | null;
};

export function ReadingListView({ items }: { items: ReadingListItem[] }) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{t('nav.reading')}</h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">{t('reading.listSubtitle')}</p>
      </div>

      <Card className="overflow-hidden border-primary/10 shadow-sm">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>{t('reading.listTitle')}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <ul className="grid gap-3 sm:grid-cols-1">
            {items.map((p) => (
              <li key={p.id}>
                <Link href={`/reading/${p.id}`} className="block">
                  <article
                    className={cn(
                      'group rounded-xl border border-border/80 bg-card p-4 transition-all',
                      'hover:border-primary/30 hover:bg-muted/30 hover:shadow-md'
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h2 className="font-semibold leading-snug text-foreground group-hover:text-primary md:text-lg">
                        {p.title}
                      </h2>
                      <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                        {p.level}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {p.content}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        {p.wordCount != null ? `${p.wordCount.toLocaleString()} ${t('reading.words')}` : '—'}
                      </span>
                      {p.contentVi ? (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-700 dark:text-emerald-400">
                          VI
                        </span>
                      ) : null}
                    </div>
                  </article>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
