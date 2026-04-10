'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Loader2,
  MessageCircleHeart,
  Mic,
  Paperclip,
  Plus,
  RotateCcw,
  Send,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/language-context';
import type { Locale } from '@/lib/i18n/translations';
import { cn } from '@/lib/utils';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

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

function speechLang(locale: Locale): string {
  if (locale === 'ja') return 'ja-JP';
  if (locale === 'vi') return 'vi-VN';
  return 'en-US';
}

function getSpeechRecognitionCtor(): (new () => SpeechRecognition) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function renderInlineBold(text: string, userTone?: boolean) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong
          key={i}
          className={cn(
            'font-semibold',
            userTone ? 'text-primary-foreground' : 'text-foreground'
          )}
        >
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function MessageBody({ content, userTone }: { content: string; userTone?: boolean }) {
  const lines = content.split('\n');
  return (
    <div
      className={cn(
        'space-y-2 text-[15px] leading-relaxed',
        userTone && 'text-primary-foreground'
      )}
    >
      {lines.map((line, li) => (
        <p key={li} className="whitespace-pre-wrap break-words">
          {renderInlineBold(line, userTone)}
        </p>
      ))}
    </div>
  );
}

/** Full-body Harumi mascot — uses transparent PNG; gentle float replaces glossy orb */
function HarumiHero({ alt }: { alt: string }) {
  return (
    <div className="relative mx-auto flex h-[min(11rem,28vh)] w-full max-w-[13rem] shrink-0 items-end justify-center md:h-[min(12rem,30vh)] md:max-w-[15rem]">
      <div
        className="absolute bottom-[6%] left-1/2 h-[32%] w-[78%] -translate-x-1/2 rounded-[100%] bg-sky-400/20 blur-2xl dark:bg-sky-500/25"
        aria-hidden
      />
      <Image
        src="/images/harumi-character.png"
        alt={alt}
        width={512}
        height={683}
        className={cn(
          'relative z-10 h-full w-auto max-h-[min(11rem,28vh)] md:max-h-[min(12rem,30vh)] object-contain object-bottom',
          'motion-safe:animate-harumiHeroFloat motion-reduce:animate-none',
          'drop-shadow-[0_14px_32px_rgba(15,23,42,0.2)] dark:drop-shadow-[0_16px_40px_rgba(0,0,0,0.5)]'
        )}
        priority
        sizes="(max-width: 768px) 176px, 208px"
      />
    </div>
  );
}

export function HarumiChat() {
  const { data: session } = useSession();
  const { t, locale } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [voiceUnsupported, setVoiceUnsupported] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recogRef = useRef<SpeechRecognition | null>(null);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streaming, loading, scrollToBottom]);

  useEffect(() => {
    return () => {
      if (recogRef.current) {
        try {
          recogRef.current.stop();
        } catch {
          /* noop */
        }
        recogRef.current = null;
      }
    };
  }, []);

  const stopListening = useCallback(() => {
    if (recogRef.current) {
      try {
        recogRef.current.stop();
      } catch {
        /* noop */
      }
      recogRef.current = null;
    }
    setListening(false);
  }, []);

  const toggleVoice = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setVoiceUnsupported(true);
      return;
    }
    setVoiceUnsupported(false);

    if (listening) {
      stopListening();
      return;
    }

    const r = new Ctor();
    recogRef.current = r;
    r.lang = speechLang(locale);
    r.continuous = true;
    r.interimResults = true;

    r.onresult = (event: SpeechRecognitionEvent) => {
      let chunk = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) chunk += res[0]?.transcript ?? '';
      }
      if (chunk) {
        setInput((prev) => {
          const add = chunk.trim();
          if (!add) return prev;
          if (!prev) return add;
          const join = /[。．.!?？\s]$/.test(prev) ? '' : ' ';
          return `${prev}${join}${add}`;
        });
      }
    };

    r.onerror = () => {
      setListening(false);
      recogRef.current = null;
    };

    r.onend = () => {
      setListening(false);
      recogRef.current = null;
    };

    try {
      r.start();
      setListening(true);
    } catch {
      setListening(false);
      recogRef.current = null;
    }
  }, [listening, locale, stopListening]);

  const sendMessages = async (nextMessages: ChatMessage[]) => {
    setError(null);
    setLoading(true);
    setStreaming('');
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok) {
        let msg = t('ai.errorGeneric');
        try {
          const data = (await res.json()) as { error?: string };
          if (res.status === 401) msg = t('ai.errorUnauthorized');
          else if (res.status === 403) msg = t('ai.errorPremium');
          else if (res.status === 503) msg = t('ai.errorConfig');
          else if (data.error === 'AI request failed') msg = t('ai.errorGeneric');
        } catch {
          /* use default */
        }
        setError(msg);
        return;
      }

      if (!res.body) {
        setError(t('ai.errorGeneric'));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setStreaming(acc);
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: acc }]);
      setStreaming('');
    } catch {
      setError(t('ai.errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    const userMsg: ChatMessage = { role: 'user', content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await sendMessages(next);
  };

  const handleSuggestion = (text: string) => {
    setInput(text);
    textareaRef.current?.focus();
  };

  const handleNewChat = () => {
    setMessages([]);
    setStreaming('');
    setError(null);
    setInput('');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const suggestions = [t('ai.suggest1'), t('ai.suggest2'), t('ai.suggest3'), t('ai.suggest4')];

  return (
    <div
      className={cn(
        'relative -mx-4 min-h-[calc(100dvh-5.5rem)] overflow-hidden px-4 pt-1 md:-mx-8 md:px-8',
        'bg-[radial-gradient(ellipse_90%_60%_at_0%_-10%,rgba(191,219,254,0.95),transparent_55%),radial-gradient(ellipse_70%_50%_at_100%_0%,rgba(254,215,220,0.88),transparent_50%),radial-gradient(ellipse_120%_80%_at_50%_100%,rgba(255,255,255,0.97),rgb(241,245,249))]',
        'dark:bg-[radial-gradient(ellipse_90%_60%_at_0%_-10%,rgba(30,58,138,0.35),transparent_55%),radial-gradient(ellipse_70%_50%_at_100%_0%,rgba(127,29,29,0.2),transparent_50%),radial-gradient(ellipse_120%_80%_at_50%_100%,rgba(15,23,42,0.92),rgb(15,23,42))]'
      )}
    >
      <div className="relative mx-auto flex w-full max-w-3xl flex-col">
        {/* Hero */}
        <div className="flex flex-col items-center gap-3 pt-2 text-center">
          <HarumiHero alt={t('ai.harumiName')} />
          <HeroTitle t={t} />
          <p className="max-w-md text-sm text-slate-600 dark:text-slate-400 md:text-base">
            {t('ai.welcomeSub')}
          </p>
          <div className="flex w-full flex-wrap items-center justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="gap-2 rounded-full bg-white/80 shadow-sm backdrop-blur-sm dark:bg-slate-800/80"
              onClick={handleNewChat}
              disabled={loading}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t('ai.newChat')}
            </Button>
          </div>
        </div>

        {/* Chat panel — no border, soft glass */}
        <div>
          <div
            ref={scrollRef}
            className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5 md:px-6"
          >
            {messages.length === 0 && !streaming && !loading && (
              <div className="flex flex-col items-center gap-5">
                <div className="grid w-full max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSuggestion(s)}
                      className="group flex items-center justify-between gap-3 rounded-2xl bg-white/90 px-4 py-3.5 text-left text-sm text-slate-700 shadow-[0_8px_30px_-8px_rgba(15,23,42,0.12)] transition hover:shadow-[0_12px_36px_-8px_rgba(15,23,42,0.18)] dark:bg-slate-800/90 dark:text-slate-200"
                    >
                      <span className="flex min-w-0 items-start gap-2">
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-primary">
                          <Sparkles className="h-3.5 w-3.5" />
                        </span>
                        <span className="leading-snug">{s}</span>
                      </span>
                      <Plus className="h-4 w-4 shrink-0 text-slate-400 opacity-70 transition group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
                <div className="flex max-w-md flex-col items-center gap-2 text-center">
                  <MessageCircleHeart className="h-8 w-8 text-primary/80" />
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t('ai.harumiWelcome')}
                  </p>
                  <p className="text-xs text-muted-foreground">{t('ai.tryAsking')}</p>
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  'flex gap-3',
                  m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                <div
                  className={cn(
                    'relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-sm',
                    m.role === 'user'
                      ? session?.user?.image
                        ? 'ring-1 ring-primary/25'
                        : cn(
                            getAvatarColor(session?.user?.name ?? session?.user?.email ?? ''),
                            'text-white'
                          )
                      : 'bg-gradient-to-br from-primary/25 to-violet-500/25'
                  )}
                >
                  {m.role === 'user' ? (
                    session?.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name ?? 'User'}
                        fill
                        className="object-cover"
                        sizes="36px"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-xs font-semibold">
                        {getInitials(session?.user?.name, session?.user?.email)}
                      </span>
                    )
                  ) : (
                    <Image
                      src="/images/AI.png"
                      alt={t('ai.harumiName')}
                      width={36}
                      height={36}
                      className="h-full w-full object-cover"
                      sizes="36px"
                    />
                  )}
                </div>
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-3 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.08)]',
                    m.role === 'user'
                      ? 'rounded-br-md bg-primary text-primary-foreground'
                      : 'rounded-bl-md bg-white/90 dark:bg-slate-800/90'
                  )}
                >
                  <MessageBody content={m.content} userTone={m.role === 'user'} />
                </div>
              </div>
            ))}

            {(streaming || (loading && messages[messages.length - 1]?.role === 'user')) && (
              <div className="flex gap-3">
                <div className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-primary/25 to-violet-500/25 shadow-sm">
                  <Image
                    src="/images/AI.png"
                    alt={t('ai.harumiName')}
                    width={36}
                    height={36}
                    className="h-full w-full object-cover"
                    sizes="36px"
                  />
                </div>
                <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white/90 px-4 py-3 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.08)] dark:bg-slate-800/90">
                  {streaming ? (
                    <MessageBody content={streaming} />
                  ) : (
                    <div className="flex items-center gap-1.5 py-1">
                      <span className="sr-only">{t('ai.thinking')}</span>
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary/70 [animation-delay:-0.2s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary/70 [animation-delay:-0.1s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary/70" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-destructive/10 px-4 py-2.5 text-center text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Composer — shadow only, no border */}
          <div className="p-3 pt-0 md:p-4 md:pt-0">
            <div
              className={cn(
                'overflow-hidden rounded-[1.35rem] bg-white/95 shadow-[0_12px_40px_-8px_rgba(15,23,42,0.14),0_4px_12px_-4px_rgba(15,23,42,0.06)] dark:bg-slate-900/95',
                listening && 'ring-2 ring-primary/30'
              )}
            >
              <div className="flex gap-2 px-4 pb-2 pt-4">
                <Sparkles className="mt-1 h-5 w-5 shrink-0 text-primary/70" aria-hidden />
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                  }}
                  onKeyDown={onKeyDown}
                  placeholder={t('ai.placeholder')}
                  rows={1}
                  disabled={loading}
                  className={cn(
                    'max-h-[200px] min-h-[2.5rem] w-full resize-none bg-transparent text-sm text-slate-800 placeholder:text-slate-400',
                    'focus-visible:outline-none disabled:opacity-60 dark:text-slate-100 dark:placeholder:text-slate-500'
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 border-t border-slate-200/60 px-3 py-2.5 dark:border-slate-700/60 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 gap-1.5 rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                    disabled
                    title={t('common.comingSoon')}
                  >
                    <Paperclip className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('ai.attachFile')}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 gap-1.5 rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                    disabled
                    title={t('common.comingSoon')}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('ai.tools')}</span>
                  </Button>
                </div>

                <div className="flex justify-center sm:justify-center">
                  <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200">
                    {t('ai.harumiBadge')}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-11 w-11 shrink-0 rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                      listening && 'bg-primary/15 text-primary ring-2 ring-primary/40'
                    )}
                    onClick={() => toggleVoice()}
                    disabled={loading}
                    aria-pressed={listening}
                    title={listening ? t('ai.voiceListening') : 'Voice'}
                  >
                    <Mic className={cn('h-5 w-5', listening && 'animate-pulse')} />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    className="h-11 w-11 shrink-0 rounded-xl bg-slate-900 text-white shadow-md hover:bg-slate-800 dark:bg-primary dark:hover:bg-primary/90"
                    onClick={() => void handleSend()}
                    disabled={loading || !input.trim()}
                    aria-label={t('ai.send')}
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <p className="mt-2 text-center text-xs text-muted-foreground">{t('ai.disclaimer')}</p>
            {(voiceUnsupported || listening) && (
              <p className="mt-1 text-center text-xs text-primary/90">
                {voiceUnsupported ? t('ai.voiceUnsupported') : t('ai.voiceListening')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Highlight Harumi name inside localized headline */
function HeroTitle({ t }: { t: (k: string) => string }) {
  const headline = t('ai.welcomeHeadline');
  const name = t('ai.harumiName');
  const idx = headline.indexOf(name);
  if (idx === -1) {
    return (
      <h1 className="max-w-lg text-balance text-center text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 md:text-3xl">
        {headline}
      </h1>
    );
  }
  const before = headline.slice(0, idx);
  const after = headline.slice(idx + name.length);
  return (
    <h1 className="max-w-lg text-balance text-center text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 md:text-3xl">
      {before}
      <span className="text-primary">{name}</span>
      {after}
    </h1>
  );
}
