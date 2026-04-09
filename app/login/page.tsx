'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout } from '@/components/auth/auth-layout';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { useLanguage } from '@/lib/i18n/language-context';

function LoginForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';
  const passwordResetOk = searchParams.get('reset') === 'success';
  const emailVerifiedOk = searchParams.get('verified') === '1';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.url) {
        router.push(res.url);
        router.refresh();
        setLoading(false);
        return;
      }

      if (res?.error) {
        setError(res.error === 'CredentialsSignin' ? 'Invalid email or password' : res.error);
        setLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError('Something went wrong');
      setLoading(false);
    }
  }

  return (
    <AuthLayout type="login">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="font-orbitron text-3xl font-bold tracking-wide text-white md:text-4xl">
            WELCOME BACK!
          </h1>
          <p className="mt-2 text-sm text-white/70">Login to your account</p>
        </div>

        {passwordResetOk && (
          <div className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
            Your password was updated. You can sign in with your new password.
          </div>
        )}

        {emailVerifiedOk && (
          <div className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
            Your email is verified. You can sign in now.
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full border-white/40 bg-white/5 text-white hover:bg-white/10 hover:text-white disabled:opacity-70"
          disabled={oauthLoading || loading}
          onClick={() => {
            setOauthLoading(true);
            void signIn('google', { callbackUrl }).catch(() => setOauthLoading(false));
          }}
        >
          {oauthLoading ? (
            <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden />
          ) : (
            <FcGoogle className="h-5 w-5 shrink-0" />
          )}
          {oauthLoading ? t('auth.oauthRedirecting') : 'Continue with Google'}
        </Button>

        <div className="flex items-center gap-4 py-1">
          <div className="flex-1 border-t border-white/30" />
          <span className="text-sm text-white/70">OR</span>
          <div className="flex-1 border-t border-white/30" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-full border border-red-400/50 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-white/90">
              Email Address
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
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm text-white/90">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-full border-white/40 bg-white/5 pl-12 pr-12 text-white placeholder:italic placeholder:text-white/40 focus:border-cyan-400 focus:ring-cyan-400/50"
                required
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

          <Link
            href="/forgot-password"
            className="block text-center text-sm text-cyan-400 hover:text-cyan-300 hover:underline"
          >
            Forgot Password?
          </Link>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="h-12 rounded-full border-0 bg-white text-lg font-bold text-slate-900 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:bg-white/90 hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]"
            >
              {loading ? 'Signing in...' : 'Login'}
            </Button>
            <Link href="/register" className="block">
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full rounded-full border-2 border-white bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                Sign Up
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout type="login">
          <div className="space-y-8 animate-pulse">
            <div className="h-10 w-64 rounded bg-white/10" />
            <div className="h-4 w-48 rounded bg-white/10" />
            <div className="h-12 w-full rounded-full bg-white/10" />
            <div className="h-12 w-full rounded-full bg-white/10" />
          </div>
        </AuthLayout>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
