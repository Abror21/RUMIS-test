// export { default as middleware  } from 'next-auth/middleware';
import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      if (!token?.profileToken && req.nextUrl.pathname !== '/profile') {
        // If profile is not selected allow to open only /profile page
        return false
      }
      
      return !!token
    },
  },
})

export const config = {
  matcher: '/admin/:path*',
};
