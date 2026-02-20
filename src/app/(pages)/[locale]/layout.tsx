import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Provider as JotaiProvider } from "jotai";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import { routing } from "@/i18n/routing";
import dynamic from "next/dynamic";
import Script from "next/script";

//widgets
import TailwindIndicator from "@/app/components/tailwind-indicator/tailwind-indicator";
import Footer from "@/app/widgets/Footer";
const Header = dynamic(() => import("@/app/widgets/Navigation"), { ssr: true });
const Sidebar = dynamic(() => import("@/app/widgets/Sidebar"), { ssr: true });

import { siteConfig } from "@/app/shared/site";
import { constructMetadata } from "@/app/shared/lib/utils";

import TanstackQueryProvider from "@/app/(pages)/_providers/tanstack-query";

import "@/app/shared/styles/globals.scss";

const inter = Inter({ subsets: ["cyrillic"] });

export const metadata: Metadata = constructMetadata({
  title: siteConfig.name,
  description: siteConfig.description,
  image: siteConfig.ogImage,
});

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
  const messages = await getMessages();

  return (
    <html lang={locale || "en"}>
      <head>
        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Viewport: cover fills the full screen including notch/home indicator areas */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

        {/* Android / Chrome PWA */}
        <meta name="theme-color" content="#f5821f" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* iOS Safari PWA (standalone mode) */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Foody7" />

        {/* iOS icons */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-167.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

        {/* iOS PWA splash screens */}
        <link rel="apple-touch-startup-image" href="/splash/splash-750x1334.png"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/splash-1170x2532.png"
          media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/splash-1179x2556.png"
          media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/splash-1284x2778.png"
          media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/splash-2048x2732.png"
          media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/splash-1620x2160.png"
          media="(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2)" />

        {process.env.NEXT_PUBLIC_KAKAO_JS_KEY && (
          <Script
            src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JS_KEY}&libraries=services&autoload=false`}
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body className={`${inter.className} antialiased`}>
        <JotaiProvider>
          <NextIntlClientProvider messages={messages}>
            <TanstackQueryProvider>
              <Header />
              <Sidebar />
              <NextTopLoader
                color="#f5821f"
                showSpinner={false}
                speed={300}
                zIndex={3000}
                initialPosition={0.3}
                crawlSpeed={400}
                height={6}
                easing="ease"
                crawl={true}
              />
              <div className="mt-20 w-full md:mt-16 lg:mt-[calc(5rem+2.25rem)]" style={{ paddingTop: "env(safe-area-inset-top)" }}>{children}</div>
              <Footer />
              <TailwindIndicator />
            </TanstackQueryProvider>
          </NextIntlClientProvider>

          <Toaster duration={3000} richColors visibleToasts={2} theme="light" position="bottom-left" />
        </JotaiProvider>
      </body>
    </html>
  );
}
