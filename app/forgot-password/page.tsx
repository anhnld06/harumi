'use client';

import Link from 'next/link';
import { AuthLayout } from '@/components/auth/auth-layout';

export default function ForgotPasswordPage() {
  return (
    <AuthLayout type="login">
      <div className="space-y-8">
        <div>
          <h1 className="font-orbitron text-3xl font-bold tracking-wide text-white md:text-4xl">
            FORGOT PASSWORD?
          </h1>
          <p className="mt-2 text-sm text-white/70">
            Contact admin to reset your password
          </p>
        </div>
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
