'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '@/components/auth/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Missing reset token. Open the link from your email.');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Could not reset password');
        setLoading(false);
        return;
      }

      router.push('/login?reset=success');
      router.refresh();
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout type="login">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="font-orbitron text-3xl font-bold tracking-wide text-white md:text-4xl">
            NEW PASSWORD
          </h1>
          <p className="mt-2 text-sm text-white/70">Choose a strong password for your account.</p>
        </div>

        {!token && (
          <div className="rounded-full border border-amber-400/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Invalid or missing link. Request a new reset from the login page.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-full border border-red-400/50 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm text-white/90">
              New password
            </Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-full border-white/40 bg-white/5 pl-12 pr-12 text-white placeholder:italic placeholder:text-white/40 focus:border-cyan-400 focus:ring-cyan-400/50"
                required
                minLength={8}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-sm text-white/90">
              Confirm password
            </Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
              <Input
                id="confirm"
                type={showPassword ? 'text' : 'password'}
                placeholder="Repeat password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="h-12 rounded-full border-white/40 bg-white/5 pl-12 text-white placeholder:italic placeholder:text-white/40 focus:border-cyan-400 focus:ring-cyan-400/50"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !token}
            className="h-12 w-full rounded-full border-0 bg-white text-lg font-bold text-slate-900 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:bg-white/90 hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]"
          >
            {loading ? 'Saving…' : 'Update password'}
          </Button>
        </form>

        <Link
          href="/login"
          className="inline-block text-cyan-400 hover:text-cyan-300 hover:underline"
        >
          ← Back to Login
        </Link>
      </div>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout type="login">
          <div className="space-y-8 animate-pulse">
            <div className="h-10 w-64 rounded bg-white/10" />
            <div className="h-4 w-48 rounded bg-white/10" />
            <div className="h-12 w-full rounded-full bg-white/10" />
          </div>
        </AuthLayout>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
