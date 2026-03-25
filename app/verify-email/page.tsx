'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '@/components/auth/auth-layout';
import { Button } from '@/components/ui/button';

const OTP_LEN = 6;

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email')?.trim().toLowerCase() ?? '';
  const needsCode = searchParams.get('needsCode') === '1';
  const warnEmail = searchParams.get('warn') === 'email';

  const [digits, setDigits] = useState<string[]>(() => Array(OTP_LEN).fill(''));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const sentOnceRef = useRef(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendBusy, setResendBusy] = useState(false);

  const requestCode = useCallback(async () => {
    if (!emailParam) return;
    setResendBusy(true);
    setError('');
    try {
      const res = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailParam }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not send code');
        return;
      }
      setResendCooldown(60);
    } catch {
      setError('Something went wrong');
    } finally {
      setResendBusy(false);
    }
  }, [emailParam]);

  useEffect(() => {
    if (needsCode && emailParam && !sentOnceRef.current) {
      sentOnceRef.current = true;
      void requestCode();
    }
  }, [needsCode, emailParam, requestCode]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => {
      setResendCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const setDigitAt = (index: number, value: string) => {
    const d = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = d;
    setDigits(next);
    if (d && index < OTP_LEN - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const onKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LEN);
    if (!text) return;
    const next = [...digits];
    for (let i = 0; i < OTP_LEN; i++) {
      next[i] = text[i] ?? '';
    }
    setDigits(next);
    const last = Math.min(text.length, OTP_LEN) - 1;
    if (last >= 0) inputsRef.current[last]?.focus();
  };

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const code = digits.join('');
    if (code.length !== OTP_LEN) {
      setError('Enter the 6-digit code');
      return;
    }
    if (!emailParam) {
      setError('Missing email. Go back to register.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailParam, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Verification failed');
        setLoading(false);
        return;
      }

      if (typeof data.handoffToken === 'string' && data.handoffToken) {
        const sessionRes = await fetch('/api/auth/post-verify-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: data.handoffToken }),
        });
        if (sessionRes.ok) {
          router.push('/dashboard');
          router.refresh();
          setLoading(false);
          return;
        }
      }

      router.push('/login?verified=1');
      router.refresh();
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (!emailParam) {
    return (
      <div className="space-y-6 text-center">
        <p className="text-white/80">No email provided.</p>
        <Link
          href="/register"
          className="text-cyan-400 hover:text-cyan-300 hover:underline"
        >
          ← Back to Sign Up
        </Link>
      </div>
    );
  }

  const codeComplete = digits.every((c) => c.length === 1);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-orbitron text-3xl font-bold tracking-wide text-white md:text-4xl">
          VERIFY EMAIL
        </h1>
        <p className="mt-2 text-sm text-white/70">
          Check your email and enter the confirmation code
        </p>
      </div>

      <div className="rounded-2xl border border-emerald-400/35 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
        <div className="flex gap-2">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
          <span>
            {warnEmail
              ? 'We could not send the email automatically. Use Resend below after checking SMTP settings, or check the server console in development.'
              : needsCode
                ? 'A new confirmation code is being sent to your inbox. Check spam as well.'
                : 'A confirmation code has been sent to your email. Please check your inbox (including spam folder).'}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/15 ring-2 ring-cyan-400/30">
          <Mail className="h-8 w-8 text-cyan-300" aria-hidden />
        </div>
        <p className="text-center text-sm text-white/85">
          Enter the 6-digit code sent to{' '}
          <span className="font-semibold text-cyan-300">{emailParam}</span>
        </p>

        <form onSubmit={handleVerify} className="w-full space-y-6">
          {error && (
            <div className="rounded-full border border-red-400/50 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="flex justify-center gap-2 sm:gap-3" onPaste={onPaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputsRef.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={d}
                onChange={(e) => setDigitAt(i, e.target.value)}
                onKeyDown={(e) => onKeyDown(i, e)}
                className="h-12 w-11 rounded-full border-2 border-white/35 bg-white/5 text-center text-lg font-semibold text-white shadow-inner focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 sm:h-14 sm:w-12 sm:text-xl"
                aria-label={`Digit ${i + 1}`}
              />
            ))}
          </div>

          <Button
            type="submit"
            disabled={loading || !codeComplete}
            className="h-12 w-full rounded-full border-0 bg-white text-lg font-bold text-slate-900 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:bg-white/90 disabled:opacity-50"
          >
            {loading ? 'Verifying…' : 'Verify'}
          </Button>
        </form>

        <p className="text-sm text-white/70">
          Didn&apos;t receive a code?{' '}
          <button
            type="button"
            disabled={resendBusy || resendCooldown > 0}
            onClick={() => void requestCode()}
            className="font-medium text-cyan-400 underline-offset-2 hover:text-cyan-300 hover:underline disabled:pointer-events-none disabled:opacity-40"
          >
            {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend'}
          </button>
        </p>
      </div>

      <Link
        href="/login"
        className="inline-block text-sm text-white/80 hover:text-cyan-300 hover:underline"
      >
        ← Go back
      </Link>
    </div>
  );
}

function VerifyEmailFallback() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-10 w-56 rounded bg-white/10" />
      <div className="h-16 w-full rounded-2xl bg-white/10" />
      <div className="mx-auto flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 w-11 rounded-full bg-white/10 sm:h-14 sm:w-12" />
        ))}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthLayout type="signup">
      <Suspense fallback={<VerifyEmailFallback />}>
        <VerifyEmailForm />
      </Suspense>
    </AuthLayout>
  );
}
