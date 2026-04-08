'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Award, BookOpen, ChevronRight, FileText, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/language-context';
import {
  formatTestDateEn,
  formatTestDateJa,
  type JlptResultBreakdown,
} from '@/lib/mock-test/jlpt-result-breakdown';
import { cn } from '@/lib/utils';

function sectionIcon(name: string) {
  const n = name.toLowerCase();
  if (/listen|聴|nghe|リスニング/i.test(n)) return Headphones;
  if (/read|読|đọc|リーディング/i.test(n)) return BookOpen;
  return FileText;
}

function ScoreRing({ percent, failed }: { percent: number; failed: boolean }) {
  const p = Number.isFinite(percent) ? Math.min(100, Math.max(0, Math.round(percent))) : 0;
  const stroke = failed ? '#dc2626' : '#059669';
  const r = 44;
  const c = 2 * Math.PI * r;
  const dash = (p / 100) * c;

  return (
    <div className="relative mx-auto flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="8"
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
          className="transition-[stroke-dasharray] duration-500"
        />
      </svg>
      <span
        className={cn(
          'absolute text-lg font-bold tabular-nums sm:text-xl',
          failed ? 'text-red-600' : 'text-emerald-600'
        )}
      >
        {p}%
      </span>
    </div>
  );
}

export type SectionScoreRow = {
  id: string;
  name: string;
  score: number;
  max: number;
  /** First question id in this section — used to jump to that block in the answer review modal. */
  questionIds: string[];
};

export type JlptMockTestResultViewProps = {
  mockTestId: string;
  /** Used for the “get certificate” link when the attempt passed. */
  attemptId: string;
  userName: string;
  testTitle: string;
  completedAt: Date;
  level: string;
  breakdown: JlptResultBreakdown;
  totalScore: number;
  totalMax: number;
  passed: boolean;
  sectionRows: SectionScoreRow[];
  /** Opens the answer review popup (replaces anchor to inline review). */
  onViewAnswers?: () => void;
  /** Jump to first question of a section inside the review popup. */
  onSectionNavigate?: (firstQuestionId: string) => void;
  /** Right column content (e.g. Top learners leaderboard). */
  asideFooter?: ReactNode;
};

export function JlptMockTestResultView({
  mockTestId,
  attemptId,
  userName,
  testTitle,
  completedAt,
  level,
  breakdown,
  totalScore,
  totalMax,
  passed,
  sectionRows,
  onViewAnswers,
  onSectionNavigate,
  asideFooter,
}: JlptMockTestResultViewProps) {
  const { t } = useLanguage();
  const percent = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;
  const dateJa = formatTestDateJa(completedAt);
  const dateEn = formatTestDateEn(completedAt);

  const lang = breakdown.languageKnowledge;
  const read = breakdown.reading;
  const listen = breakdown.listening;

  return (
    <div className="mx-auto w-full max-w-[min(1420px,calc(100vw-1.5rem))] space-y-8 sm:max-w-[min(1420px,calc(100vw-2rem))]">
      <nav className="text-sm text-muted-foreground">
        <Link href="/mock-test" className="hover:text-foreground">
          {t('nav.mockTest')}
        </Link>
        <span className="mx-2">›</span>
        <span className="text-foreground">{testTitle}</span>
        <span className="mx-2">›</span>
        <span>{t('mockTest.result.breadcrumbResult')}</span>
      </nav>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[6fr_4fr] lg:items-stretch lg:gap-8">
        {/* Certificate + actions */}
        <div className="min-w-0">
          <div
            className="jlpt-certificate relative overflow-hidden rounded-md border-2 border-gray-800 text-center dark:border-gray-600"
            style={{
              fontSize: 14,
              backgroundColor: '#f4edd8',
              backgroundImage: 'url(/images/bg_jlpt.webp)',
              backgroundSize: '18px 18px',
              padding: '10px 8px',
              marginTop: 5,
            }}
          >
            <div className="relative p-4 md:p-5">
              <div className="mb-4 text-center">
                <h2 className="mb-1.5 text-sm font-medium tracking-wide text-gray-800 md:text-base">
                  日本語 能力試験　合否　結果通知書
                </h2>
                <h2 className="mb-3 text-xs text-gray-700 md:text-sm">Japanese Language Proficiency Test</h2>
                <h3 className="text-sm font-semibold text-gray-900 md:text-base">Test Result</h3>
              </div>

              <div className="mb-4 space-y-1 text-sm text-gray-800">
                <div>受験日 {dateJa}</div>
                <div className="text-xs text-gray-700">Test Date {dateEn}</div>
              </div>

              <div className="mb-6 space-y-2">
                <div className="flex items-center justify-between border-b border-dotted border-gray-400 pb-2">
                  <span className="text-xs text-gray-800 md:text-sm">受験レベル Level:</span>
                  <span className="text-lg font-bold text-gray-900 md:text-xl">{level}</span>
                </div>
                <div className="flex items-center justify-between border-b border-dotted border-gray-400 pb-2">
                  <span className="text-xs text-gray-800 md:text-sm">氏名 Name:</span>
                  <span className="text-sm font-semibold text-gray-900 md:text-base">{userName}</span>
                </div>
              </div>

              <div className="mb-4 overflow-hidden rounded-lg border-2 border-gray-800">
                <div className="border-b-2 border-gray-800 p-2 text-center md:p-3">
                  <p className="mb-0.5 text-xs font-medium text-gray-800 md:text-sm">得点区分別得点</p>
                  <p className="text-xs text-gray-600">Scores by Scoring Section</p>
                </div>
                <div className="grid grid-cols-5 border-b-2 border-gray-800">
                  <div className="col-span-2 border-r-2 border-gray-800 p-2 text-center md:p-3">
                    <p className="text-[10px] font-medium leading-tight text-gray-800 md:text-xs">言語知識(文字。語彙。文法)</p>
                    <p className="text-[9px] leading-tight text-gray-600 md:text-[10px]">Language Knowledge</p>
                  </div>
                  <div className="border-r-2 border-gray-800 p-2 text-center md:p-3">
                    <p className="text-[10px] font-medium text-gray-800 md:text-xs">読解</p>
                    <p className="text-[9px] text-gray-600 md:text-[10px]">Reading</p>
                  </div>
                  <div className="border-r-2 border-gray-800 p-2 text-center md:p-3">
                    <p className="text-[10px] font-medium text-gray-800 md:text-xs">聴解</p>
                    <p className="text-[9px] text-gray-600 md:text-[10px]">Listening</p>
                  </div>
                  <div className="p-2 text-center md:p-3">
                    <p className="mb-0.5 text-[10px] font-medium text-gray-800 md:text-xs">総合得点</p>
                    <p className="text-[9px] text-gray-600 md:text-[10px]">Total</p>
                  </div>
                </div>
                <div className="grid grid-cols-5">
                  <div className="col-span-2 border-r-2 border-gray-800 p-2 text-center md:p-3">
                    <span className="text-sm font-semibold md:text-base">
                      {lang.score}/{lang.max}
                    </span>
                  </div>
                  <div className="border-r-2 border-gray-800 p-2 text-center md:p-3">
                    <span className="text-sm font-semibold md:text-base">
                      {read.score}/{read.max}
                    </span>
                  </div>
                  <div className="border-r-2 border-gray-800 p-2 text-center md:p-3">
                    <span className="text-sm font-semibold md:text-base">
                      {listen.score}/{listen.max}
                    </span>
                  </div>
                  <div className="p-2 text-center md:p-3">
                    <span className="text-sm font-semibold md:text-base">
                      {totalScore}/{totalMax}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div
                  className={cn(
                    'inline-block rounded-lg border-2 border-dashed p-2 text-center text-sm font-bold md:p-2.5 md:text-base',
                    passed
                      ? 'border-emerald-700 bg-emerald-100 text-emerald-900'
                      : 'border-red-700 bg-red-100 text-red-800'
                  )}
                >
                  <span>
                    {passed ? (
                      <>
                        合　格 <span className="font-normal">Passed</span>
                      </>
                    ) : (
                      <>
                        不 合 格 <span className="font-normal">Not Passed</span>
                      </>
                    )}
                  </span>
                </div>
                <div className="relative h-12 w-12 shrink-0 md:h-14 md:w-14" aria-hidden>
                  <Image
                    src="/images/ic_mazii_certificate.png"
                    alt=""
                    width={48}
                    height={48}
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ring | sections | buttons  */}
          <div
            className={cn(
              'mt-6 grid gap-4',
              sectionRows.length > 0
                ? 'grid-cols-1 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)_auto] lg:items-start lg:gap-4 xl:gap-5'
                : 'grid-cols-1 sm:grid-cols-2 sm:items-center sm:gap-6'
            )}
          >
            <div
              className={cn(
                'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-5',
                sectionRows.length === 0 && 'w-full sm:max-w-[min(100%,280px)]'
              )}
            >
              <ScoreRing percent={percent} failed={!passed} />
              <p className="mt-3 text-center text-xs text-muted-foreground sm:text-sm">
                {t('mockTest.result.encouragement')}
              </p>
            </div>

            {sectionRows.length > 0 ? (
              <div className="min-h-0 min-w-0 space-y-2 lg:max-h-[min(100%,22 rem)] lg:overflow-y-auto lg:pr-1">
                {sectionRows.map((row) => {
                  const Icon = sectionIcon(row.name);
                  const firstQ = row.questionIds[0];
                  return (
                    <button
                      key={row.id}
                      type="button"
                      disabled={!firstQ || !onSectionNavigate}
                      onClick={() => firstQ && onSectionNavigate?.(firstQ)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left shadow-sm transition hover:border-violet-300 hover:bg-violet-50/50 disabled:cursor-default disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-violet-700 dark:hover:bg-violet-950/20',
                        onSectionNavigate && firstQ && 'cursor-pointer'
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <Icon className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                        <div className="min-w-0 text-left">
                          <p className="truncate text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
                            {row.name}
                          </p>
                          <p className="text-[11px] tabular-nums text-muted-foreground">
                            {row.score}/{row.max}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                    </button>
                  );
                })}
              </div>
            ) : null}

            <div
              className={cn(
                'flex flex-col gap-2',
                'mx-auto w-full max-w-[10.5rem] sm:mx-0 sm:w-fit',
                sectionRows.length > 0 ? 'justify-self-end' : 'sm:justify-self-end'
              )}
            >
              {passed ? (
                <Button asChild variant="outline" size="sm" className="h-9 w-full shrink-0 rounded-lg sm:w-[10.5rem]">
                  <Link href={`/certificate/select?attempt=${attemptId}`} className="gap-1.5">
                    <Award className="h-3.5 w-3.5" />
                    {t('mockTest.result.getCertificate')}
                  </Link>
                </Button>
              ) : null}
              <Button
                asChild
                variant="secondary"
                size="sm"
                className="h-9 w-full shrink-0 rounded-lg bg-slate-200 text-sm font-semibold text-slate-900 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 sm:w-[10.5rem]"
              >
                <Link href={`/mock-test/${mockTestId}`}>{t('mockTest.result.retake')}</Link>
              </Button>
              {onViewAnswers ? (
                <Button
                  type="button"
                  size="sm"
                  className="h-9 w-full shrink-0 rounded-lg bg-violet-600 text-sm font-semibold hover:bg-violet-700 sm:w-[10.5rem]"
                  onClick={onViewAnswers}
                >
                  {t('mockTest.result.viewAnswers')}
                </Button>
              ) : (
                <Button
                  asChild
                  size="sm"
                  className="h-9 w-full shrink-0 rounded-lg bg-violet-600 text-sm font-semibold hover:bg-violet-700 sm:w-[10.5rem]"
                >
                  <a href="#mock-test-answer-review">{t('mockTest.result.viewAnswers')}</a>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Top learners */}
        <aside className="flex min-h-0 min-w-0 w-full flex-col lg:h-full">
          {asideFooter ? <div className="min-h-0 w-full flex-1">{asideFooter}</div> : null}
        </aside>
      </div>
    </div>
  );
}
