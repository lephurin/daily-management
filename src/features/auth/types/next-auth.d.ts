import "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
  }

  interface Session {
    user: User & {
      id: string;
      role: string;
      provider?: string;
      accessToken?: string;
      hasConsented?: boolean;
      error?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    provider?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    hasConsented?: boolean;
    error?: string;
  }
}
