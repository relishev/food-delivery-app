import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Provider as JotaiProvider } from "jotai";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { routing } from "@/i18n/routing";
import TanstackQueryProvider from "@/app/(pages)/_providers/tanstack-query";
import "@/app/shared/styles/globals.join.scss";

const inter = Inter({ subsets: ["cyrillic"] });

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: "Join Foody7 — For Restaurants",
  description: "Partner with Foody7. Fair 7% commission. Your branded app included.",
};

export default async function JoinLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) notFound();
  const messages = await getMessages({ locale });

  return (
    <html lang={locale || "en"}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#f5821f" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <JotaiProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <TanstackQueryProvider>
              {children}
            </TanstackQueryProvider>
          </NextIntlClientProvider>
          <Toaster duration={3000} richColors visibleToasts={2} theme="light" position="bottom-left" />
        </JotaiProvider>
      </body>
    </html>
  );
}
