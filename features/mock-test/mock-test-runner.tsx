'use client';

import { Fragment, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, BookOpen, Clock, Headphones, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/language-context';
import { toast } from '@/lib/toast-store';
import type { Question } from '@/lib/db-types';
import type {
  ListeningPassageLite,
  QuestionInTest,
  ReadingPassageLite,
  TestWithSections,
} from '@/lib/mock-test/test-types';

function passageVisibilityFlags(
  rows: Array<{ question: QuestionInTest }>
): Array<{
  showReading: boolean;
  showListening: boolean;
  reading: ReadingPassageLite | null;
  listening: ListeningPassageLite | null;
}> {
  let lastReadingId: string | null = null;
  let lastListeningId: string | null = null;
  return rows.map(({ question: q }) => {
    let showReading = false;
    let showListening = false;
    let reading: ReadingPassageLite | null = null;
    let listening: ListeningPassageLite | null = null;

    if (q.readingPassageId && q.readingPassage) {
      if (q.readingPassageId !== lastReadingId) {
        showReading = true;
        reading = q.readingPassage;
        lastReadingId = q.readingPassageId;
      }
    } else {
      lastReadingId = null;
    }

    if (q.listeningPassageId && q.listeningPassage) {
      if (q.listeningPassageId !== lastListeningId) {
        showListening = true;
        listening = q.listeningPassage;
        lastListeningId = q.listeningPassageId;
      }
    } else {
      lastListeningId = null;
    }

    return { showReading, showListening, reading, listening };
  });
}

interface MockTestRunnerProps {
  test: TestWithSections;
  attemptId: string;
}

const DRAFT_PREFIX = 'mock-test-answers-';

function formatTimeHms(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

function hasMcqOptions(question: Question): boolean {
  const options = question.options as Record<string, string> | null;
  return Boolean(options && Object.keys(options).length > 0);
}

function scrollToQuestion(questionId: string) {
  const el = document.getElementById(`mock-q-${questionId}`);
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

export function MockTestRunner({ test, attemptId }: MockTestRunnerProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const totalSeconds = test.duration * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const submitRef = useRef<(opts?: { timeUp?: boolean }) => Promise<void>>();

  const requiredQuestionIds = useMemo(() => {
    const ids: string[] = [];
    for (const sec of test.sections) {
      for (const { question } of sec.questions) {
        if (hasMcqOptions(question)) ids.push(question.id);
      }
    }
    return ids;
  }, [test.sections]);

  const answeredCount = useMemo(
    () => requiredQuestionIds.filter((id) => Boolean(answers[id]?.trim())).length,
    [answers, requiredQuestionIds]
  );

  const unansweredCount = requiredQuestionIds.length - answeredCount;

  const draftKey = attemptId ? `${DRAFT_PREFIX}${attemptId}` : null;

  useEffect(() => {
    if (!draftKey || typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, string>;
      if (parsed && typeof parsed === 'object') {
        setAnswers((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      /* ignore */
    }
  }, [draftKey]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 360);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const saveDraft = useCallback(() => {
    if (!draftKey || typeof window === 'undefined') return;
    try {
      localStorage.setItem(draftKey, JSON.stringify(answers));
      toast(t('mockTest.savedDraft'));
    } catch {
      /* ignore */
    }
  }, [answers, draftKey, t]);

  const performSubmit = useCallback(
    async (opts?: { timeUp?: boolean }) => {
      const timeUp = opts?.timeUp ?? false;
      if (submittingRef.current || submitted) return;
      if (!attemptId) {
        toast(t('mockTest.noAttempt'));
        return;
      }

      submittingRef.current = true;
      if (timeUp) toast(t('mockTest.timesUp'));
      setSubmitted(true);
      setIsSubmitting(true);

      const answerList = Object.entries(answers).map(([questionId, userAnswer]) => ({
        questionId,
        userAnswer,
      }));

      try {
        const res = await fetch('/api/mock-test/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attemptId, answers: answerList }),
        });
        const payload = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) {
          console.error('Submit failed:', payload.error ?? res.status);
          toast(t('mockTest.submitFailed'));
          setSubmitted(false);
          setIsSubmitting(false);
          return;
        }
        if (draftKey && typeof window !== 'undefined') {
          try {
            localStorage.removeItem(draftKey);
          } catch {
            /* ignore */
          }
        }
        router.push(`/mock-test/${test.id}/result?attempt=${attemptId}`);
      } catch {
        setSubmitted(false);
        setIsSubmitting(false);
        toast(t('mockTest.submitFailed'));
      } finally {
        submittingRef.current = false;
      }
    },
    [answers, attemptId, draftKey, router, submitted, t, test.id]
  );

  const openSubmitConfirm = useCallback(() => {
    if (!attemptId) {
      toast(t('mockTest.noAttempt'));
      return;
    }
    if (submitted) return;
    setConfirmSubmitOpen(true);
  }, [attemptId, submitted, t]);

  useEffect(() => {
    submitRef.current = (opts) => performSubmit(opts);
  }, [performSubmit]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 0) return 0;
        if (s === 1) {
          queueMicrotask(() => void submitRef.current?.({ timeUp: true }));
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const progressLabel = t('mockTest.progress')
    .replace('{{answered}}', String(answeredCount))
    .replace('{{total}}', String(requiredQuestionIds.length));

  return (
    <div className="relative">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        {/* Main column */}
        <div className="min-w-0 flex-1 space-y-6">
          <header className="rounded-2xl border border-slate-200/80 bg-white/90 px-5 py-4 shadow-sm ring-1 ring-slate-900/5 dark:border-slate-800 dark:bg-slate-950/80">
            <h1 className="font-orbitron text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-2xl">
              {test.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {progressLabel}
            </p>
          </header>

          {test.sections.map((section, sectionIndex) => {
            const pvFlags = passageVisibilityFlags(section.questions);
            return (
              <section
                key={section.id}
                className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_2px_24px_-8px_rgba(15,23,42,0.12)] dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
                  <h2 className="font-orbitron text-lg font-bold text-slate-900 dark:text-slate-100">
                    {sectionIndex + 1}. {section.name}
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {section.questionCount} · {section.duration} min
                  </p>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {section.questions.map(({ question }, qi) => {
                    const options = question.options as Record<string, string> | null;
                    const numLabel = `${sectionIndex + 1}.${qi + 1}`;
                    const answered = Boolean(answers[question.id]);
                    const { showReading, showListening, reading, listening } = pvFlags[qi] ?? {
                      showReading: false,
                      showListening: false,
                      reading: null,
                      listening: null,
                    };

                    return (
                      <Fragment key={question.id}>
                        {showReading && reading ? (
                          <div className="scroll-mt-28 bg-slate-50/90 px-5 py-5 dark:bg-slate-900/40">
                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                              <BookOpen className="h-4 w-4 shrink-0 text-sky-600" aria-hidden />
                              <span>{t('mockTest.passageHeading')}</span>
                              <span className="font-normal text-muted-foreground">— {reading.title}</span>
                            </div>
                            <div className="whitespace-pre-wrap rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-[15px] leading-relaxed text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                              {reading.content}
                            </div>
                            {reading.contentVi ? (
                              <p className="mt-3 border-t border-slate-200/80 pt-3 text-sm leading-relaxed text-muted-foreground dark:border-slate-700">
                                {reading.contentVi}
                              </p>
                            ) : null}
                          </div>
                        ) : null}
                        {showListening && listening ? (
                          <div className="scroll-mt-28 bg-violet-50/50 px-5 py-5 dark:bg-violet-950/20">
                            <div className="mb-3 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                              <Headphones className="h-4 w-4 shrink-0 text-violet-600" aria-hidden />
                              <span>{t('mockTest.listeningHeading')}</span>
                              <span className="font-normal text-muted-foreground">— {listening.title}</span>
                              {listening.duration != null ? (
                                <span className="text-xs font-normal tabular-nums text-muted-foreground">
                                  ({t('mockTest.listeningDurationSec').replace('{{sec}}', String(listening.duration))})
                                </span>
                              ) : null}
                            </div>
                            <audio
                              controls
                              preload="metadata"
                              className="h-10 w-full max-w-xl"
                              src={listening.audioUrl}
                            >
                              {t('mockTest.audioUnsupported')}
                            </audio>
                            {listening.transcript?.trim() ? (
                              <details className="mt-3 rounded-lg border border-violet-200/80 bg-white/80 px-3 py-2 text-sm dark:border-violet-900/50 dark:bg-slate-950/60">
                                <summary className="cursor-pointer font-medium text-violet-800 dark:text-violet-300">
                                  {t('mockTest.listeningTranscriptToggle')}
                                </summary>
                                <p className="mt-2 whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                                  {listening.transcript}
                                </p>
                              </details>
                            ) : null}
                          </div>
                        ) : null}
                        <div
                          id={`mock-q-${question.id}`}
                          className={cn(
                            'scroll-mt-28 px-5 py-5 transition-colors',
                            answered && 'bg-emerald-50/40 dark:bg-emerald-950/15'
                          )}
                        >
                          <div className="flex gap-3">
                            <span
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600 text-sm font-bold text-white shadow-sm"
                              aria-hidden
                            >
                              {numLabel}
                            </span>
                            <div className="min-w-0 flex-1 space-y-3">
                              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-900 dark:text-slate-100">
                                {question.content}
                              </p>
                              {options && Object.keys(options).length > 0 ? (
                                <ul className="space-y-2.5 pl-0 sm:pl-1">
                                  {Object.entries(options).map(([key, value]) => {
                                    const selected = answers[question.id] === key;
                                    return (
                                      <li key={key}>
                                        <label
                                          className={cn(
                                            'flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition',
                                            selected
                                              ? 'border-sky-500 bg-sky-50 ring-1 ring-sky-500/30 dark:bg-sky-950/40'
                                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-900/50'
                                          )}
                                        >
                                          <input
                                            type="radio"
                                            name={question.id}
                                            value={key}
                                            checked={selected}
                                            className="mt-1 h-4 w-4 shrink-0 border-slate-300 text-sky-600 focus:ring-sky-500"
                                            onChange={(e) =>
                                              setAnswers((a) => ({
                                                ...a,
                                                [question.id]: e.target.value,
                                              }))
                                            }
                                          />
                                          <span className="text-[15px] leading-snug text-slate-800 dark:text-slate-200">
                                            <span className="font-semibold text-sky-700 dark:text-sky-300">
                                              {key}.
                                            </span>{' '}
                                            {value}
                                          </span>
                                        </label>
                                      </li>
                                    );
                                  })}
                                </ul>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </Fragment>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* Sidebar */}
        <aside className="w-full shrink-0 lg:sticky lg:top-4 lg:w-[280px] xl:w-[300px]">
          <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-lg shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-950">
            <div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-900/80">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t('mockTest.timeRemaining')}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <Clock className="h-5 w-5 text-rose-500" aria-hidden />
                <span
                  className="font-mono text-2xl font-bold tabular-nums text-rose-600 dark:text-rose-400"
                  suppressHydrationWarning
                >
                  {formatTimeHms(secondsLeft)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                className="h-11 w-full rounded-xl bg-rose-600 text-base font-semibold text-white shadow-md hover:bg-rose-700"
                disabled={submitted || !attemptId || isSubmitting}
                onClick={openSubmitConfirm}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
                    {t('mockTest.submitting')}
                  </>
                ) : (
                  t('mockTest.submit')
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full rounded-xl border-slate-300 font-semibold"
                disabled={submitted || !attemptId || isSubmitting}
                onClick={saveDraft}
              >
                <Save className="mr-2 h-4 w-4" aria-hidden />
                {t('mockTest.save')}
              </Button>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('mockTest.questionMap')}
              </p>
              <div className="max-h-[min(52vh,28rem)] space-y-4 overflow-y-auto pr-1">
                {test.sections.map((section, si) => (
                  <div key={section.id}>
                    <p className="mb-2 truncate text-xs font-medium text-slate-700 dark:text-slate-300">
                      {section.name}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {section.questions.map(({ question }, qi) => {
                        if (!hasMcqOptions(question)) return null;
                        const label = `${si + 1}.${qi + 1}`;
                        const done = Boolean(answers[question.id]?.trim());
                        return (
                          <button
                            key={question.id}
                            type="button"
                            className={cn(
                              'min-h-[2rem] min-w-[2.5rem] rounded-md border px-2 py-1 text-center text-xs font-semibold tabular-nums transition',
                              done
                                ? 'border-emerald-400/80 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-100'
                                : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-sky-400 hover:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                            )}
                            onClick={() => scrollToQuestion(question.id)}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <Dialog open={confirmSubmitOpen} onOpenChange={setConfirmSubmitOpen}>
        <DialogContent className="gap-6 rounded-2xl border-0 bg-white p-6 shadow-xl sm:max-w-md dark:bg-slate-950">
          <DialogHeader className="space-y-4 text-center sm:text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300">
              <AlertCircle className="h-11 w-11" strokeWidth={2} aria-hidden />
            </div>
            <DialogTitle className="text-balance text-center text-lg font-bold text-foreground">
              {unansweredCount > 0
                ? t('mockTest.confirmUnanswered').replace('{{count}}', String(unansweredCount))
                : t('mockTest.confirmSubmitTitle')}
            </DialogTitle>
            <DialogDescription className="text-center text-base text-muted-foreground">
              {t('mockTest.confirmSubmitPrompt')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-stretch sm:gap-3">
            <Button
              type="button"
              variant="secondary"
              className="h-11 flex-1 rounded-xl border-0 bg-slate-200 font-semibold text-slate-900 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              onClick={() => setConfirmSubmitOpen(false)}
            >
              {t('mockTest.reviewExam')}
            </Button>
            <Button
              type="button"
              className="h-11 flex-1 rounded-xl bg-violet-600 font-semibold text-white hover:bg-violet-700"
              onClick={() => {
                setConfirmSubmitOpen(false);
                void performSubmit({ timeUp: false });
              }}
            >
              {t('mockTest.submitExamConfirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isSubmitting && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
          role="status"
          aria-live="polite"
          aria-labelledby="mock-submit-loading-title"
        >
          <div className="mx-4 flex max-w-sm flex-col items-center gap-4 rounded-2xl border bg-card px-8 py-8 text-center shadow-xl">
            <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
            <p id="mock-submit-loading-title" className="text-base font-semibold text-foreground">
              {t('mockTest.submitting')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
