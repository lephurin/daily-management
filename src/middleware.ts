import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { auth } from "@/lib/auth";

const intlMiddleware = createMiddleware(routing);

export default auth((req) => {
  // The i18n middleware handles redirects and locale detection
  return intlMiddleware(req);
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - privacy-policy (public page)
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|privacy-policy|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
