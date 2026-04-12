import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";

const { auth } = NextAuth(authConfig);

// All routes accessible without a session
const publicRoutes = ["/", "/about-project"];

// Only these specific routes redirect AWAY when user is already logged in
// (login/register pages don't make sense when authenticated)
const loginOnlyRoutes = ["/auth/login", "/auth/register"];

// NextAuth internal API — always passthrough
const apiAuthPrefix = "/api/auth";

const DEFAULT_LOGIN_REDIRECT = "/dashboard";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  // /auth/* routes: all are accessible without login (login, register, onboarding, error…)
  const isAuthRoute = nextUrl.pathname.startsWith("/auth");
  // Only login/register specifically redirect logged-in users away
  const isLoginOnlyRoute = loginOnlyRoutes.includes(nextUrl.pathname);

  // 1. Always allow NextAuth API routes
  if (isApiAuthRoute) {
    return;
  }

  // 2. Login / Register: logged-in users have no reason to be here
  if (isLoginOnlyRoute && isLoggedIn) {
    return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
  }

  // 3. All other /auth/* routes (onboarding, error, etc.) — allow regardless of login state
  if (isAuthRoute) {
    return;
  }

  // 4. Public marketing routes — allow
  if (isPublicRoute) {
    return;
  }

  // 5. Everything else is protected — must be logged in
  if (!isLoggedIn) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    return Response.redirect(
      new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl)
    );
  }

  return;
});

// Run middleware on app routes only (exclude static files and _next internals)
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)"],
};
