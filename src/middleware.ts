import createMiddleware from "next-intl/middleware";
import { routing, locales } from "@/i18n/routing";
import { NextResponse } from "next/server";

import { USER_TOKEN } from "@/app/shared/constants";

// Custom middleware
const middleware = createMiddleware(routing);

export default async function (req: any) {
  const { pathname } = req.nextUrl;

  // Handle join.foody7.com subdomain → rewrite to /join/* internal routes
  const host = req.headers.get('host') ?? '';
  if (host.startsWith('join.')) {
    const url = req.nextUrl.clone();
    url.pathname = `/join${url.pathname === '/' ? '' : url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Pass through /join/* paths — served by join/ route, locale already in segment
  if (pathname.startsWith("/join/")) {
    return NextResponse.next();
  }

  if (pathname.includes("/admin")) {
    return NextResponse.next();
  }
  if (pathname.includes("/profile")) {
    const cookie = req.cookies.get(USER_TOKEN);
    if (!cookie) {
      const redirectUrl = new URL("/", req.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Handle branded restaurant routes — locale is at the END: /r/[slug]/[locale]
  // Must intercept BEFORE next-intl middleware to prevent locale-prefix injection
  if (pathname.startsWith("/r/")) {
    const segments = pathname.split("/"); // ["", "r", "slug", "locale?", ...]
    const slug = segments[2];
    const localeSegment = segments[3] as string | undefined;

    if (!slug) return NextResponse.next();

    // If locale segment is present and valid → serve the page directly (no redirect)
    if (localeSegment && (locales as readonly string[]).includes(localeSegment)) {
      return NextResponse.next();
    }

    // AC-05-2: cookie → Accept-Language → "en"
    const cookieLocale = req.cookies.get("NEXT_LOCALE")?.value ?? "";
    let detectedLocale: string;
    if ((locales as readonly string[]).includes(cookieLocale)) {
      detectedLocale = cookieLocale;
    } else {
      // Parse first token from Accept-Language header (e.g. "ko-KR,ko;q=0.9,en;q=0.8" → "ko")
      const acceptLang = req.headers.get("accept-language") ?? "";
      const preferredLang = acceptLang.split(",")[0]?.split(";")[0]?.trim().slice(0, 2) ?? "";
      detectedLocale = (locales as readonly string[]).includes(preferredLang) ? preferredLang : "en";
    }
    return NextResponse.redirect(new URL(`/r/${slug}/${detectedLocale}`, req.url));
  }

  return middleware(req);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/public|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|json|webmanifest)$).*)",
    "/(ko|zh|ja|ru|en)/:path*",
  ],
};
