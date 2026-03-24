import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: ['/dashboard/:path*', '/vocab/:path*', '/kanji/:path*', '/grammar/:path*', '/reading/:path*', '/listening/:path*', '/mock-test/:path*'],
};
