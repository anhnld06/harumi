'use client';

import { useMemo, useState } from 'react';
import {
  BookMarked,
  BookOpen,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Languages,
  ListOrdered,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ReadingPassage, Question } from '@/lib/db-types';
import { useLanguage } from '@/lib/i18n/language-context';
import { cn } from '@/lib/utils';
import { SpeakButton } from '@/components/speak-button';

interface ReadingPracticeProps {
  passage: ReadingPassage;
  questions: Question[];
  readingVocabAudioSrc?: Array<string | undefined>;
}

type FootnoteRow = {
  id?: number;
  label?: string;
  displayLine?: string;
  headword?: string;
  reading?: string;
  definitionJp?: string;
  definitionVi?: string;
};

type GrammarRow = {
  pattern?: string;
  meaningVi?: string;
  snippetFromPassage?: string;
};

type VocabRow = {
  word?: string;
  kanji?: string;
  pos?: string;
  hanViet?: string;
  meaningVi?: string;
};

function parseJsonArray<T>(raw: unknown): T[] {
  if (!Array.isArray(raw)) return [];
  return raw as T[];
}

/** Render 注１ / (注1) as ※ (komejirushi) like printed textbooks — no JSON rewrite needed. */
function displayChuAsKome(s: string): string {
  if (!s) return s;
  let out = s.replace(/([（(])注([０-９0-9]+)/g, '$1※$2');
  out = out.replaceAll('（注）', '（※）');
  out = out.replaceAll('(注)', '(※)');
  out = out.replaceAll('(注）', '(※）');
  out = out.replaceAll('（注)', '（※)');
  return out;
}

function optionsRecord(q: Question, lang: 'jp' | 'vi'): Record<string, string> | null {
  const raw = lang === 'vi' && q.optionsVi != null ? q.optionsVi : q.options;
  if (raw == null || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(o)) {
    if (typeof v === 'string') out[k] = v;
  }
  return Object.keys(out).length ? out : null;
}

function questionStem(q: Question, lang: 'jp' | 'vi'): string {
  if (lang === 'vi' && q.contentVi?.trim()) return q.contentVi;
  return q.content;
}

export function ReadingPractice({
  passage,
  questions,
  readingVocabAudioSrc = [],
}: ReadingPracticeProps) {
  const { t } = useLanguage();
  const [showTranslation, setShowTranslation] = useState(false);
  const [supplement, setSupplement] = useState<'grammar' | 'vocabulary' | null>(null);
  const [questionLang, setQuestionLang] = useState<'jp' | 'vi'>('jp');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);

  const footnotes = useMemo(
    () => parseJsonArray<FootnoteRow>(passage.footnotes),
    [passage.footnotes]
  );
  const grammarRows = useMemo(
    () => parseJsonArray<GrammarRow>(passage.grammarInPassage),
    [passage.grammarInPassage]
  );
  const vocabRows = useMemo(
    () => parseJsonArray<VocabRow>(passage.vocabulary),
    [passage.vocabulary]
  );

  const hasTranslation = Boolean(passage.contentVi?.trim());

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-primary/15 shadow-sm">
        <CardHeader className="border-b bg-muted/30 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">{t('reading.passage')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          {/* Inner frame: textbook-style body */}
          <div className="border border-foreground/25 bg-background px-4 py-5 dark:border-foreground/35 md:px-6 md:py-6">
            <div className="whitespace-pre-wrap font-serif text-base leading-[1.9] tracking-wide text-foreground md:text-[1.0625rem]">
              {displayChuAsKome(passage.content)}
            </div>
          </div>

          {/* Notes under inner frame — no section title; smaller type */}
          {footnotes.length > 0 ? (
            <div className="border-t border-border/60 pt-4">
              <ul className="space-y-2 text-[0.8125rem] leading-relaxed text-foreground/90 md:text-sm">
                {footnotes.map((fn, i) => {
                  const raw =
                    fn.displayLine?.trim() ||
                    [fn.label, fn.headword, fn.reading ? `(${fn.reading})` : '', fn.definitionJp]
                      .filter(Boolean)
                      .join(' ');
                  const line = displayChuAsKome(raw);
                  if (!line) return null;
                  return (
                    <li key={fn.id ?? fn.label ?? i} className="list-none">
                      <span>{line}</span>
                      {fn.definitionVi ? (
                        <span className="mt-0.5 block text-[0.75rem] text-muted-foreground md:text-[0.8125rem]">
                          {fn.definitionVi}
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          {hasTranslation && (
            <div className={cn(footnotes.length > 0 ? 'border-t border-border/60 pt-4' : '')}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-full"
                onClick={() => setShowTranslation((v) => !v)}
              >
                <Languages className="h-4 w-4" />
                {showTranslation ? t('reading.hideTranslation') : t('reading.showTranslation')}
                {showTranslation ? (
                  <ChevronUp className="h-4 w-4 opacity-60" />
                ) : (
                  <ChevronDown className="h-4 w-4 opacity-60" />
                )}
              </Button>
              {showTranslation && (
                <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-4 text-sm leading-relaxed text-foreground md:text-base">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                    {t('reading.translation')}
                  </p>
                  <div className="whitespace-pre-wrap">{passage.contentVi}</div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {(grammarRows.length > 0 || vocabRows.length > 0) && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {grammarRows.length > 0 ? (
              <Button
                type="button"
                variant={supplement === 'grammar' ? 'default' : 'outline'}
                className="gap-2 rounded-full"
                onClick={() =>
                  setSupplement((s) => (s === 'grammar' ? null : 'grammar'))
                }
              >
                <GraduationCap className="h-4 w-4" />
                {t('reading.grammar')}
              </Button>
            ) : null}
            {vocabRows.length > 0 ? (
              <Button
                type="button"
                variant={supplement === 'vocabulary' ? 'default' : 'outline'}
                className="gap-2 rounded-full"
                onClick={() =>
                  setSupplement((s) => (s === 'vocabulary' ? null : 'vocabulary'))
                }
              >
                <BookMarked className="h-4 w-4" />
                {t('reading.vocabulary')}
              </Button>
            ) : null}
          </div>

          {supplement === 'grammar' && grammarRows.length > 0 ? (
            <Card className="overflow-hidden border-violet-500/20 shadow-sm">
              <CardContent className="divide-y divide-border/60 p-0">
                {grammarRows.map((g, i) => (
                  <div key={i} className="space-y-1 px-4 py-3.5">
                    <p className="font-mono text-sm font-medium leading-snug text-foreground md:text-[0.95rem]">
                      ► {displayChuAsKome(g.pattern ?? '')}
                    </p>
                    {g.meaningVi ? (
                      <p className="text-sm text-muted-foreground">{g.meaningVi}</p>
                    ) : null}
                    {g.snippetFromPassage ? (
                      <p className="border-l-2 border-violet-400/50 pl-3 text-xs italic text-muted-foreground md:text-sm">
                        {displayChuAsKome(g.snippetFromPassage)}
                      </p>
                    ) : null}
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {supplement === 'vocabulary' && vocabRows.length > 0 ? (
            <Card className="overflow-hidden shadow-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <th className="px-4 py-3">{t('reading.colWord')}</th>
                        <th className="px-4 py-3">{t('reading.colKanji')}</th>
                        <th className="px-4 py-3 w-20">{t('reading.colPos')}</th>
                        <th className="px-4 py-3">{t('reading.colHanViet')}</th>
                        <th className="px-4 py-3">{t('reading.colMeaning')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vocabRows.map((row, i) => (
                        <tr
                          key={`${row.word}-${i}`}
                          className="border-b border-border/60 transition-colors hover:bg-muted/25"
                        >
                          <td className="px-4 py-2.5 font-medium">
                            <div className="flex items-center gap-2">
                              {row.word?.trim() ? (
                                <SpeakButton
                                  text={row.word}
                                  audioSrc={readingVocabAudioSrc[i]}
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 shrink-0"
                                />
                              ) : null}
                              <span>{displayChuAsKome(row.word ?? '—')}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">
                            {row.kanji?.trim() ? displayChuAsKome(row.kanji.trim()) : '—'}
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">{row.pos?.trim() || '—'}</td>
                          <td className="px-4 py-2.5 text-xs text-muted-foreground">
                            {row.hanViet?.trim() || '—'}
                          </td>
                          <td className="px-4 py-2.5">{row.meaningVi ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}

      <Card className="overflow-hidden border-primary/20 shadow-md">
        <CardHeader className="flex flex-col gap-4 border-b bg-muted/20 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <ListOrdered className="h-5 w-5 shrink-0 text-primary" />
            <CardTitle className="text-lg">{t('reading.questions')}</CardTitle>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={questionLang === 'jp' ? 'default' : 'outline'}
              className="rounded-full"
              onClick={() => setQuestionLang('jp')}
            >
              {t('reading.questionLangJp')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={questionLang === 'vi' ? 'default' : 'outline'}
              className="rounded-full"
              onClick={() => setQuestionLang('vi')}
            >
              {t('reading.questionLangVi')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          {questions.length === 0 ? (
            <p className="text-center text-muted-foreground">{t('reading.noQuestions')}</p>
          ) : (
            questions.map((q, i) => {
                const stem = questionStem(q, questionLang);
                const options = optionsRecord(q, questionLang);
                const selected = answers[q.id];
                const isCorrect = checked && selected === q.correctAnswer;
                const isWrong = checked && selected && selected !== q.correctAnswer;

              return (
                <div
                  key={q.id}
                  className={cn(
                    'rounded-xl border p-4 md:p-5',
                    checked && isCorrect && 'border-green-500/40 bg-green-500/5',
                    checked && isWrong && 'border-red-500/35 bg-red-500/5'
                  )}
                >
                  <p className="font-medium leading-relaxed">
                    <span className="mr-2 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {i + 1}
                    </span>
                    {displayChuAsKome(stem)}
                  </p>
                  {options && (
                    <div className="mt-4 space-y-2">
                      {Object.entries(options).map(([key, value]) => {
                        const picked = selected === key;
                        const showAsCorrect = checked && key === q.correctAnswer;
                        const showAsWrong = checked && picked && key !== q.correctAnswer;
                        return (
                          <label
                            key={key}
                            className={cn(
                              'flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors',
                              !checked && 'hover:bg-muted/50',
                              showAsCorrect && 'border-green-600/50 bg-green-500/10',
                              showAsWrong && 'border-red-600/50 bg-red-500/10',
                              !checked && picked && 'border-primary/50 bg-primary/5'
                            )}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              value={key}
                              disabled={checked}
                              checked={picked}
                              onChange={(e) =>
                                setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                              }
                              className="mt-1"
                            />
                            <span className="text-sm leading-relaxed md:text-[0.95rem]">
                              <span className="font-semibold text-primary">{key}.</span>{' '}
                              {displayChuAsKome(value)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                  {checked && (
                    <div className="mt-4 space-y-2 text-sm">
                      <p
                        className={cn(
                          'font-semibold',
                          isCorrect && 'text-green-700 dark:text-green-400',
                          isWrong && 'text-red-700 dark:text-red-400',
                          !selected && 'text-amber-700 dark:text-amber-400'
                        )}
                      >
                        {!selected
                          ? `${t('reading.incorrect')} — ${t('reading.correct')}: ${q.correctAnswer}`
                          : isCorrect
                            ? t('reading.correct')
                            : `${t('reading.incorrect')} — ${t('reading.correct')}: ${q.correctAnswer}`}
                      </p>
                      {(q.explanation || q.explanationVi) && (
                        <div className="rounded-lg bg-muted/50 px-3 py-2 text-muted-foreground">
                          <p className="text-xs font-semibold uppercase text-foreground/70">
                            {t('reading.explanation')}
                          </p>
                          {q.explanation ? (
                            <p className="mt-1">{displayChuAsKome(q.explanation)}</p>
                          ) : null}
                          {q.explanationVi ? (
                            <p className={cn('mt-1', q.explanation && 'text-xs md:text-sm')}>
                              {q.explanationVi}
                            </p>
                          ) : null}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {questions.length > 0 && (
            <div className="flex flex-wrap gap-3 border-t pt-4">
              {!checked ? (
                <Button
                  type="button"
                  className="rounded-full"
                  onClick={() => setChecked(true)}
                >
                  {t('reading.checkAnswers')}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => {
                    setChecked(false);
                    setAnswers({});
                  }}
                >
                  {t('reading.resetAnswers')}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
