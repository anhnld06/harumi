'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeftRight, Info, Sparkles, Volume2, X } from 'lucide-react';
import { convertVietnameseNameToKatakana, normalizeNameInput } from '@/lib/vietnamese-name-katakana';
import { speakKatakana } from '@/lib/speak-katakana';
import { useLanguage } from '@/lib/i18n/language-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function VietnameseNameConverter() {
  const { t } = useLanguage();
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.getVoices();
    const id = requestAnimationFrame(() => {
      window.speechSynthesis.getVoices();
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const result = useMemo(() => convertVietnameseNameToKatakana(query), [query]);

  const rows = useMemo(() => {
    const out: Array<{
      segment: string;
      katakana: string;
      romaji: string;
    }> = [];
    for (const seg of result.segments) {
      for (const v of seg.variants) {
        if (!v.katakana && v.romaji === '') continue;
        out.push({
          segment: seg.display,
          katakana: v.katakana,
          romaji: v.romaji,
        });
      }
    }
    return out;
  }, [result.segments]);

  const onConvert = useCallback(() => {
    setQuery(normalizeNameInput(draft));
  }, [draft]);

  const hasResult = query.length > 0 && result.segments.length > 0;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-violet-500/[0.07] via-background to-sky-500/[0.08] p-6 shadow-sm dark:from-violet-500/10 dark:to-sky-500/10 md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              JLPT
            </div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {t('nameConverter.title')}
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground md:text-base">
              {t('nameConverter.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden border-border/60 shadow-lg shadow-primary/5">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-lg">{t('nameConverter.inputLabel')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="relative min-w-0 flex-1 space-y-2">
              <Label htmlFor="vi-name" className="sr-only">
                {t('nameConverter.inputLabel')}
              </Label>
              <div className="relative">
                <Input
                  id="vi-name"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onConvert();
                  }}
                  placeholder={t('nameConverter.placeholder')}
                  className="h-12 rounded-xl border-primary/20 bg-background/80 pr-10 text-base shadow-inner transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
                  autoComplete="name"
                />
                {draft.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setDraft('');
                      setQuery('');
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    aria-label={t('nameConverter.clear')}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <Button
              type="button"
              size="lg"
              className="h-12 shrink-0 gap-2 rounded-xl px-6 shadow-md shadow-primary/20 transition hover:shadow-lg hover:shadow-primary/25"
              onClick={onConvert}
            >
              {t('nameConverter.convert')}
              <ArrowLeftRight className="h-4 w-4 opacity-90" />
            </Button>
          </div>

          <div
            className="flex gap-3 rounded-xl border border-sky-500/20 bg-sky-500/[0.06] px-4 py-3 text-sm leading-relaxed text-sky-950 dark:border-sky-400/20 dark:bg-sky-500/10 dark:text-sky-50/90"
            role="note"
          >
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-300" />
            <span>{t('nameConverter.hint')}</span>
          </div>
        </CardContent>
      </Card>

      <Card
        className={cn(
          'overflow-hidden border-border/60 shadow-lg transition-shadow',
          hasResult && 'ring-1 ring-primary/10'
        )}
      >
        <CardHeader className="border-b border-border/40 bg-muted/30 pb-4">
          <CardTitle className="text-lg">{t('nameConverter.result')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!hasResult ? (
            <div className="flex min-h-[12rem] flex-col items-center justify-center gap-3 px-6 py-12 text-center">
              <div className="rounded-2xl border border-dashed border-muted-foreground/25 bg-muted/20 px-6 py-8">
                <p className="max-w-md text-sm text-muted-foreground">{t('nameConverter.emptyHint')}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 p-4 md:p-6">
              {result.fullKatakana ? (
                <div className="rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/8 via-violet-500/5 to-sky-500/5 px-4 py-3 md:px-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t('nameConverter.fullName')}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <p className="font-['Yu_Gothic',YuGothic,'Hiragino_Sans',sans-serif] text-xl font-semibold tracking-wide text-primary md:text-2xl">
                      {result.fullKatakana}
                    </p>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="h-9 w-9 shrink-0 rounded-full"
                      onClick={() => speakKatakana(result.fullKatakana)}
                      aria-label={t('nameConverter.playAudio')}
                      title={t('nameConverter.playAudio')}
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {result.fullRomaji ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground/80">{t('nameConverter.romajiLabel')}</span>{' '}
                      {result.fullRomaji}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className="overflow-x-auto rounded-xl border border-border/50">
                <table className="w-full min-w-[320px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/40">
                      <th className="px-4 py-3 font-semibold">{t('nameConverter.colName')}</th>
                      <th className="px-4 py-3 font-semibold">{t('nameConverter.colKatakana')}</th>
                      <th className="px-4 py-3 font-semibold">{t('nameConverter.colRomaji')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr
                        key={`${row.segment}-${row.katakana}-${row.romaji}-${i}`}
                        className="border-b border-border/40 last:border-0 hover:bg-muted/20"
                      >
                        <td className="px-4 py-3 font-medium text-foreground">{row.segment}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-['Yu_Gothic',YuGothic,'Hiragino_Sans',sans-serif] text-base font-medium tracking-wide">
                              {row.katakana}
                            </span>
                            {row.katakana && row.katakana !== '—' ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                onClick={() => speakKatakana(row.katakana)}
                                aria-label={t('nameConverter.playAudio')}
                                title={t('nameConverter.playAudio')}
                              >
                                <Volume2 className="h-3.5 w-3.5" />
                              </Button>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-[13px] text-muted-foreground">{row.romaji}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
