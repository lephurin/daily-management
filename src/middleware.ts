export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - privacy-policy (public page)
     */
    "/((?!_next/static|_next/image|favicon.ico|privacy-policy|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
