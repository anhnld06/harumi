'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout } from '@/components/auth/auth-layout';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!agreeTerms) {
      setError('Please agree to the Terms & Conditions');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: name || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Registration failed');
        setLoading(false);
        return;
      }

      const q = new URLSearchParams({ email: data.user.email });
      if (data.verificationSent === false) {
        q.set('warn', 'email');
      }
      router.push(`/verify-email?${q.toString()}`);
      router.refresh();
    } catch {
      setError('Something went wrong');
      setLoading(false);
    }
  }

  return (
    <AuthLayout type="signup">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="font-orbitron text-3xl font-bold tracking-wide text-white md:text-4xl">
            CREATE ACCOUNT
          </h1>
          <p className="mt-2 text-sm text-white/70">Start your JLPT N2 journey</p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full border-white/40 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
        >
          <FcGoogle className="h-5 w-5 shrink-0" />
          Continue with Google
        </Button>

        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 border-t border-white/30" />
          <span className="text-sm text-white/70">OR</span>
          <div className="flex-1 border-t border-white/30" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-full border border-red-400/50 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm text-white/90">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
              <Input
                id="name"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 rounded-full border-white/40 bg-white/5 pl-12 text-white placeholder:italic placeholder:text-white/40 focus:border-cyan-400 focus:ring-cyan-400/50"
              />
            </div>
          </div>

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
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-full border-white/40 bg-white/5 pl-12 pr-12 text-white placeholder:italic placeholder:text-white/40 focus:border-cyan-400 focus:ring-cyan-400/50"
                required
                minLength={8}
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

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="h-4 w-4 rounded border-white/40 bg-white/5 text-cyan-400 focus:ring-cyan-400/50"
            />
            <span className="text-sm text-white/80">
              I agree to the Terms & Conditions
            </span>
          </label>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="h-12 rounded-full border-0 bg-white text-lg font-bold text-slate-900 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:bg-white/90 hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]"
            >
              {loading ? 'Creating...' : 'Sign Up'}
            </Button>
            <Link href="/login" className="block">
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full rounded-full border-2 border-white bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                Login
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
