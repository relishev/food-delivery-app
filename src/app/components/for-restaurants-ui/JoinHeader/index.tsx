"use client";
import { useParams } from "next/navigation";
import { LogoIcon } from "@/app/icons";
import Language from "@/app/components/navigation-ui/Language";

const LOCALE_TITLES: Record<string, string> = {
  en: "English",
  ko: "한국어",
  zh: "中文",
  ja: "日本語",
  ru: "Русский",
};

export default function JoinHeader() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const languageTitle = LOCALE_TITLES[locale] ?? "English";

  const handleChange = (newLocale: string) => {
    window.location.href = `/join/${newLocale}`;
  };

  return (
    <header className="flex h-16 w-full items-center justify-between border-b bg-white px-8 md:px-4">
      <a href="https://foody7.com">
        <LogoIcon width={110} />
      </a>
      <Language languageTitle={languageTitle} handleChange={handleChange as any} />
    </header>
  );
}
