import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

/** Align with `app/(dashboard)/*` URL paths (route group does not appear in the path). */
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/vocab/:path*',
    '/kanji/:path*',
    '/grammar/:path*',
    '/reading/:path*',
    '/listening/:path*',
    '/conversation/:path*',
    '/mock-test/:path*',
    '/ai-assistant/:path*',
    '/account/:path*',
    '/certificate/:path*',
    '/name-converter/:path*',
  ],
};
