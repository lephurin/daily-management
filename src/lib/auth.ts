import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/gmail.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
    // Dev-only Credentials provider for testing without OAuth
    ...(process.env.NODE_ENV !== "production"
      ? [
          Credentials({
            name: "Dev Login",
            credentials: {
              email: { label: "Email", type: "email" },
              password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
              if (
                credentials?.email === "dev@localhost" &&
                credentials?.password === "dev"
              ) {
                return {
                  id: "dev-user-id",
                  name: "Dev User",
                  email: "dev@localhost",
                  role: "super_admin",
                };
              }
              return null;
            },
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account) {
        token.id = user.id;
        token.provider = account.provider;
        token.role = (user as Record<string, unknown>).role || "user";
        // Persist Google OAuth tokens for API calls
        if (account.provider === "google") {
          token.accessToken = account.access_token;
          token.refreshToken = account.refresh_token;
          token.expiresAt = account.expires_at;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as unknown as Record<string, unknown>).role =
          token.role as string;
        (session.user as unknown as Record<string, unknown>).accessToken =
          token.accessToken as string;
        (session.user as unknown as Record<string, unknown>).provider =
          token.provider as string;
      }
      return session;
    },
    async authorized({ request, auth }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      // Public routes that don't require auth
      const publicRoutes = ["/login", "/consent", "/api/auth"];
      const isPublicRoute = publicRoutes.some((route) =>
        pathname.startsWith(route),
      );

      // If on public route and logged in, redirect /login → /dashboard
      if (isPublicRoute) {
        if (isLoggedIn && pathname === "/login") {
          return Response.redirect(new URL("/dashboard", request.nextUrl));
        }
        return true;
      }

      // Root path: redirect to /dashboard if logged in, /login if not
      if (pathname === "/") {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", request.nextUrl));
        }
        return Response.redirect(new URL("/login", request.nextUrl));
      }

      // All other routes require authentication
      if (!isLoggedIn) {
        return Response.redirect(new URL("/login", request.nextUrl));
      }

      // RBAC: block non-super_admin from /dashboard/members
      const role = (auth?.user as unknown as Record<string, unknown>)
        ?.role as string;
      if (pathname.startsWith("/dashboard/members") && role !== "super_admin") {
        return Response.redirect(new URL("/dashboard", request.nextUrl));
      }

      return true;
    },
  },
});
