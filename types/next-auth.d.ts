import 'next-auth';
import type { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      creditBalance: number;
      planTier: string | null;
      planExpiresAt: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id?: string;
    creditBalance?: number;
    planTier?: string | null;
    planExpiresAt?: string | null;
  }
}
