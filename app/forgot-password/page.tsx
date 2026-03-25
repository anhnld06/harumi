'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { AuthLayout } from '@/components/auth/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong');
        setLoading(false);
        return;
      }

      setMessage(
        data.message ??
          'If an account exists for this email, you will receive password reset instructions shortly.'
      );
      setEmail('');
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout type="login">
      <div className="space-y-8">
        <div>
          <h1 className="font-orbitron text-3xl font-bold tracking-wide text-white md:text-4xl">
            FORGOT PASSWORD?
          </h1>
          <p className="mt-2 text-sm text-white/70">
            Enter your email and we will send you a link to reset your password.
          </p>
        </div>

        {message && (
          <div className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-full border border-red-400/50 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-white/90">
              Email address
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-full border-white/40 bg-white/5 pl-12 text-white placeholder:italic placeholder:text-white/40 focus:border-cyan-400 focus:ring-cyan-400/50"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-full border-0 bg-white text-lg font-bold text-slate-900 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:bg-white/90 hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]"
          >
            {loading ? 'Sending…' : 'Send reset link'}
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
