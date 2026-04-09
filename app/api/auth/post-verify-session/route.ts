import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { encode } from 'next-auth/jwt';
import type { User } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  deletePostVerifyHandoff,
  resolvePostVerifyHandoff,
} from '@/server/services/post-verify-handoff.service';
import { getVerifiedUserProfileForSession } from '@/server/services/user.service';

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const token = typeof json?.token === 'string' ? json.token : '';
    if (!token.trim()) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    const userId = await resolvePostVerifyHandoff(token);
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    const user = await getVerifiedUserProfileForSession(userId);

    if (!user?.email || !user.emailVerified) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: 'Server misconfiguration' },
        { status: 500 }
      );
    }

    const defaultToken = {
      name: user.name,
      email: user.email,
      picture: user.image,
      sub: user.id,
    };

    const jwtCallback = authOptions.callbacks?.jwt;
    const jwtPayload = jwtCallback
      ? await jwtCallback({
          token: defaultToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          } as User,
          account: {
            providerAccountId: user.id,
            type: 'credentials',
            provider: 'credentials',
          },
          profile: undefined,
          isNewUser: false,
          trigger: 'signIn',
        })
      : { ...defaultToken, id: user.id };

    const maxAge = authOptions.session?.maxAge ?? 30 * 24 * 60 * 60;

    const sessionToken = await encode({
      secret,
      token: jwtPayload,
      maxAge,
    });

    const useSecure =
      process.env.NEXTAUTH_URL?.startsWith('https://') ?? !!process.env.VERCEL;
    const cookieName = useSecure
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token';

    cookies().set(cookieName, sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: useSecure,
      maxAge,
    });

    await deletePostVerifyHandoff(token);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('post-verify-session error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
