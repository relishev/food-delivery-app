import { usePathname, useRouter } from "@/i18n/routing";
import atoms from "@/app/(pages)/_providers/jotai";
import { useAtom } from "jotai";
import { useLocale } from "next-intl";
import { useEffect } from "react";

const useChangeLanguage = () => {
  const [selectedLanguage, setSelectedLanguage] = useAtom(atoms.selectedLanguage);
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale() as I18N;

  const handleChange = (locale: I18N) => {
    if (locale !== selectedLanguage) {
      setSelectedLanguage(locale);
      router.replace(pathname, { locale });
    }
  };

  useEffect(() => {
    handleChange(locale);
  }, []);

  const languageTitle = (() => {
    switch (selectedLanguage) {
      case "en":
        return "English";
      case "ko":
        return "한국어";
      case "zh":
        return "中文";
      case "ja":
        return "日本語";
      default:
        return "Русский";
    }
  })();

  return { handleChange, languageTitle };
};

export default useChangeLanguage;
