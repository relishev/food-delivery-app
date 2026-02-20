"use client";
import { LogoIcon } from "@/app/icons";
import useChangeLanguage from "@/app/hooks/useChangeLanguage";
import Language from "@/app/components/navigation-ui/Language";

export default function JoinHeader() {
  const { handleChange, languageTitle } = useChangeLanguage();

  return (
    <header className="flex h-16 w-full items-center justify-between border-b bg-white px-8 md:px-4">
      <a href="https://foody7.com">
        <LogoIcon width={110} />
      </a>
      <Language languageTitle={languageTitle} handleChange={handleChange} />
    </header>
  );
}
