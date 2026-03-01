import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { axios } from "@/lib/axios";
import { GoogleTokenResponse } from "@/features/external-apis/types";

/**
 * Request a new access token from Google using the refresh token
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const refreshedTokens = (await axios.post<GoogleTokenResponse>(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken as string,
      }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
    )) as unknown as GoogleTokenResponse;

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      // expires_in is in seconds, expiresAt expects timestamp in seconds
      expiresAt: Math.floor(Date.now() / 1000) + refreshedTokens.expires_in,
      // Fall back to old refresh token if a new one is not returned
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("RefreshAccessTokenError", error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

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
    async signIn({ user }) {
      if (user.email) {
        try {
          // Ensure a profile exists in Supabase to have a stable UUID
          const { error } = await supabaseAdmin.from("user_profiles").upsert(
            {
              user_id: user.email,
              name: user.name || "",
              avatar_url: user.image || null,
            },
            { onConflict: "user_id" },
          );
          if (error)
            console.error("Error ensuring user profile on signIn:", error);
        } catch (err) {
          console.error("Failed to ensure user profile on signIn:", err);
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      if (user && account) {
        token.id = user.id;
        token.provider = account.provider;
        token.role = user.role || "user";
        // Persist Google OAuth tokens for API calls
        if (account.provider === "google") {
          token.accessToken = account.access_token;
          token.refreshToken = account.refresh_token;
          token.expiresAt = account.expires_at;
        }

        // Fetch user profile to check pdpa consent and role
        try {
          if (user.email) {
            const { data } = await supabaseAdmin
              .from("user_profiles")
              .select("id, pdpa_consented, role")
              .eq("user_id", user.email)
              .single();

            if (data) {
              token.id = data.id; // Use Supabase UUID as the stable ID
              token.hasConsented = data.pdpa_consented || false;
              if (data.role) {
                token.role = data.role;
              }
            } else {
              token.hasConsented = false;
            }
          }
        } catch {
          token.hasConsented = false;
        }
      } else if (
        token.expiresAt &&
        Date.now() / 1000 > (token.expiresAt as number)
      ) {
        // Token has expired, try to refresh it
        token = await refreshAccessToken(token);
      }

      // Handle session update on the client
      if (trigger === "update" && session?.hasConsented !== undefined) {
        token.hasConsented = session.hasConsented;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.accessToken = token.accessToken as string;
        session.user.provider = token.provider as string;
        session.user.hasConsented = token.hasConsented as boolean;

        if (token.error) {
          session.user.error = token.error as string;
        }
      }
      return session;
    },
    async authorized({ request, auth }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      // Extract locale from pathname if present
      const localeMatch = pathname.match(/^\/(en|th)(\/|$)/);
      const locale = localeMatch ? localeMatch[1] : "";
      const pathWithoutLocale = locale
        ? pathname.replace(`/${locale}`, "") || "/"
        : pathname;

      // Public routes that don't require auth
      const publicRoutes = [
        "/login",
        "/consent",
        "/api/auth",
        "/privacy-policy",
        "/",
      ];
      const isPublicRoute = publicRoutes.some(
        (route) =>
          pathWithoutLocale === route ||
          pathWithoutLocale.startsWith("/api/auth") ||
          pathWithoutLocale === "/privacy-policy",
      );

      // If on public route and logged in, redirect /login → /dashboard
      if (isPublicRoute) {
        if (isLoggedIn && pathWithoutLocale === "/login") {
          return Response.redirect(
            new URL(
              locale ? `/${locale}/dashboard` : "/dashboard",
              request.nextUrl,
            ),
          );
        }
        return true;
      }

      // All other routes require authentication
      if (!isLoggedIn) {
        return Response.redirect(
          new URL(locale ? `/${locale}/login` : "/login", request.nextUrl),
        );
      }

      // Consent check
      const hasConsented = auth?.user?.hasConsented;

      if (!hasConsented && pathWithoutLocale !== "/consent") {
        return Response.redirect(
          new URL(locale ? `/${locale}/consent` : "/consent", request.nextUrl),
        );
      }

      // RBAC: block non-super_admin from restricted routes
      const role = auth?.user?.role;
      const isRestrictedRoute =
        pathWithoutLocale.startsWith("/dashboard/members") ||
        pathWithoutLocale.startsWith("/dashboard/chat");

      if (isRestrictedRoute && role !== "super_admin") {
        return Response.redirect(
          new URL(
            locale ? `/${locale}/dashboard` : "/dashboard",
            request.nextUrl,
          ),
        );
      }

      return true;
    },
  },
});
