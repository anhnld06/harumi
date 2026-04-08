'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Headphones, Lightbulb } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/language-context';
import { cn } from '@/lib/utils';
import type { MockTestReviewPayload } from '@/lib/mock-test/mock-test-review.types';
import { accountPlansHref } from '@/lib/payment/checkout-path';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: MockTestReviewPayload;
  /** When opening from a section shortcut, scroll this question into view once. */
  initialScrollQuestionId?: string | null;
  /** Pro / Pro Max — show explanations from DB instead of upgrade paywall */
  canViewExplanations?: boolean;
};

function scrollToQuestion(questionId: string) {
  document
    .getElementById(`mock-review-q-${questionId}`)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function MockTestAnswerReviewModal({
  open,
  onOpenChange,
  review,
  initialScrollQuestionId,
  canViewExplanations = false,
}: Props) {
  const { t } = useLanguage();
  /** Per-question: paywall block shown only after "Giải thích" is clicked. */
  const [explanationOpen, setExplanationOpen] = useState<Record<string, boolean>>({});

  const durationSec = Math.max(0, Math.floor(review.durationMs / 1000));
  const dm = Math.floor(durationSec / 60);
  const ds = durationSec % 60;

  useEffect(() => {
    if (!open || !initialScrollQuestionId) return;
    const id = initialScrollQuestionId;
    const tmr = window.setTimeout(() => scrollToQuestion(id), 150);
    return () => window.clearTimeout(tmr);
  }, [open, initialScrollQuestionId]);

  useEffect(() => {
    if (!open) setExplanationOpen({});
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92vh,880px)] w-[min(100vw-1rem,1120px)] max-w-[min(100vw-1rem,1120px)] flex-col gap-0 overflow-hidden rounded-2xl p-0 shadow-2xl sm:max-w-[min(100vw-1rem,1120px)]">
        <DialogHeader className="shrink-0 space-y-3 border-b border-slate-200 bg-white px-5 py-4 text-center dark:border-slate-800 dark:bg-slate-950 sm:px-8 sm:text-left">
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-50">
            {t('mockTest.result.viewResultsTitle')}
          </DialogTitle>
          <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
            <p>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {t('mockTest.result.scoreLineLabel')}
              </span>{' '}
              <span className="tabular-nums font-semibold text-violet-700 dark:text-violet-400">
                {review.totalScore}/{review.totalMax} {t('mockTest.result.pointsSuffix')}
              </span>
            </p>
            <p>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {t('mockTest.result.timeTakenLabel')}
              </span>{' '}
              <span className="tabular-nums">
                {t('mockTest.result.timeTakenValue')
                  .replace('{{minutes}}', String(dm))
                  .replace('{{seconds}}', String(ds))}
              </span>
            </p>
          </div>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_min(280px,32vw)]">
          <div className="order-2 min-h-0 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 lg:order-1">
            <div className="space-y-8 pb-4">
              {review.sections.map((section) =>
                section.questions.map((q) => {
                  const opts = q.options;
                  const keys = opts ? Object.keys(opts).sort() : [];

                  return (
                    <article
                      key={q.questionId}
                      id={`mock-review-q-${q.questionId}`}
                      className="scroll-mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-5"
                    >
                      <div className="flex gap-3">
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-600 text-sm font-bold text-white shadow-sm"
                          aria-hidden
                        >
                          {q.label}
                        </span>
                        <div className="min-w-0 flex-1 space-y-4">
                          {q.readingBlock ? (
                            <div className="rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-3 dark:border-slate-700 dark:bg-slate-900/50">
                              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                                <BookOpen className="h-3.5 w-3.5 text-sky-600" aria-hidden />
                                {t('mockTest.passageHeading')} — {q.readingBlock.title}
                              </div>
                              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-900 dark:text-slate-100">
                                {q.readingBlock.content}
                              </p>
                              {q.readingBlock.contentVi ? (
                                <p className="mt-2 border-t border-slate-200 pt-2 text-xs text-muted-foreground dark:border-slate-600">
                                  {q.readingBlock.contentVi}
                                </p>
                              ) : null}
                            </div>
                          ) : null}
                          {q.listeningBlock ? (
                            <div className="rounded-xl border border-violet-200/80 bg-violet-50/50 px-3 py-3 dark:border-violet-900/40 dark:bg-violet-950/25">
                              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-100">
                                <Headphones className="h-3.5 w-3.5 text-violet-600" aria-hidden />
                                {t('mockTest.listeningHeading')} — {q.listeningBlock.title}
                              </div>
                              <audio
                                controls
                                preload="metadata"
                                className="h-9 w-full max-w-md"
                                src={q.listeningBlock.audioUrl}
                              >
                                {t('mockTest.audioUnsupported')}
                              </audio>
                              {q.listeningBlock.transcript?.trim() ? (
                                <details className="mt-2 text-sm">
                                  <summary className="cursor-pointer text-violet-800 dark:text-violet-300">
                                    {t('mockTest.listeningTranscriptToggle')}
                                  </summary>
                                  <p className="mt-2 whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                                    {q.listeningBlock.transcript}
                                  </p>
                                </details>
                              ) : null}
                            </div>
                          ) : null}
                          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-900 dark:text-slate-100">
                            {q.content}
                          </p>

                          {keys.length > 0 ? (
                            <ul className="space-y-2">
                              {keys.map((key) => {
                                const isCorrect =
                                  String(q.correctAnswer).trim() === key.trim();
                                const isUser = String(q.userAnswer ?? '').trim() === key.trim();
                                return (
                                  <li key={key}>
                                    <div
                                      className={cn(
                                        'flex cursor-default items-start gap-3 rounded-xl border px-3 py-2.5',
                                        isCorrect &&
                                          'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/40',
                                        !isCorrect &&
                                          isUser &&
                                          'border-red-300 bg-red-50/80 dark:border-red-800 dark:bg-red-950/30'
                                      )}
                                    >
                                      <input
                                        type="radio"
                                        checked={isUser}
                                        readOnly
                                        className="mt-1 h-4 w-4 shrink-0 border-slate-300 accent-sky-600"
                                        aria-label={`${key}`}
                                      />
                                      <span className="text-[15px] leading-snug text-slate-800 dark:text-slate-200">
                                        <span className="font-semibold text-sky-700 dark:text-sky-300">
                                          {key}.
                                        </span>{' '}
                                        {opts![key]}
                                      </span>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              {t('mockTest.result.yourAnswer')}:{' '}
                              <span className="font-medium text-foreground">
                                {q.userAnswer?.trim() ? q.userAnswer : '—'}
                              </span>
                            </p>
                          )}

                          <div className="mt-1">
                            {!explanationOpen[q.questionId] ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setExplanationOpen((p) => ({
                                    ...p,
                                    [q.questionId]: true,
                                  }))
                                }
                                className="inline-flex items-center gap-2 rounded-lg border-2 border-amber-400 bg-white px-4 py-2.5 text-sm font-semibold text-amber-600 shadow-sm transition hover:bg-amber-50 dark:border-amber-600 dark:bg-slate-950 dark:text-amber-400 dark:hover:bg-amber-950/30"
                              >
                                {t('mockTest.result.explanation')}
                                <Lightbulb
                                  className="h-4 w-4 shrink-0 text-amber-500 dark:text-amber-400"
                                  aria-hidden
                                />
                              </button>
                            ) : canViewExplanations ? (
                              <div className="rounded-xl border border-emerald-200/90 bg-emerald-50/90 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                                <div className="flex gap-2">
                                  <Lightbulb
                                    className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400"
                                    aria-hidden
                                  />
                                  <div className="min-w-0 flex-1 space-y-2">
                                    <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                                      {t('mockTest.result.explanation')}
                                    </p>
                                    {q.explanation?.trim() ? (
                                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-900 dark:text-slate-100">
                                        {q.explanation}
                                      </p>
                                    ) : null}
                                    {q.explanationVi?.trim() ? (
                                      <p className="whitespace-pre-wrap border-t border-emerald-200/80 pt-2 text-sm leading-relaxed text-slate-600 dark:border-emerald-900/60 dark:text-slate-400">
                                        {q.explanationVi}
                                      </p>
                                    ) : null}
                                    {!q.explanation?.trim() && !q.explanationVi?.trim() ? (
                                      <p className="text-sm text-muted-foreground">
                                        {t('mockTest.result.explanationEmpty')}
                                      </p>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-3 dark:border-amber-900/60 dark:bg-amber-950/25">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="flex gap-2">
                                    <Lightbulb
                                      className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400"
                                      aria-hidden
                                    />
                                    <div>
                                      <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                                        {t('mockTest.result.explanation')}
                                      </p>
                                      <p className="mt-1 text-sm text-amber-900/90 dark:text-amber-100/90">
                                        {t('mockTest.result.explanationPaywall')}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    asChild
                                    size="sm"
                                    className="shrink-0 rounded-lg bg-orange-500 font-semibold text-white hover:bg-orange-600"
                                  >
                                    <Link href={accountPlansHref}>
                                      {t('mockTest.result.upgradeNow')}
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>

          <aside className="order-1 flex max-h-44 min-h-0 flex-col border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 lg:order-2 lg:max-h-none lg:border-b-0 lg:border-l lg:border-t-0">
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('mockTest.result.questionMapTitle')}
              </p>
              <div className="space-y-4">
                {review.sections.map((section) => (
                  <div key={section.id}>
                    <p className="mb-2 truncate text-xs font-medium text-slate-700 dark:text-slate-300">
                      {section.name}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {section.questions.map((q) => (
                        <button
                          key={q.questionId}
                          type="button"
                          onClick={() => scrollToQuestion(q.questionId)}
                          className={cn(
                            'min-h-[2rem] min-w-[2.5rem] rounded-md border px-2 py-1 text-center text-xs font-semibold tabular-nums transition hover:opacity-90',
                            q.isCorrect
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-100'
                              : 'border-red-400 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950/40 dark:text-red-100'
                          )}
                        >
                          {q.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <div className="flex shrink-0 justify-end border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/80 sm:px-6">
          <Button
            type="button"
            variant="secondary"
            className="rounded-xl bg-slate-200 font-semibold text-slate-900 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            onClick={() => onOpenChange(false)}
          >
            {t('mockTest.result.closeReview')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
