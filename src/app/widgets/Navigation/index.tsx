"use client";
import { FC, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

//hooks
import useChangeLanguage from "@/app/hooks/useChangeLanguage";
import { useLoginMe } from "@/app/services/useAuthentication";
import { useGetCities } from "@/app/services/useCities";

import { cn } from "@/app/shared/lib/utils";

//components
import { MenuIcon } from "lucide-react";
import Authorization from "@/app/components/authorization-ui/Authorization";
import Regions from "@/app/components/navigation-ui/Cities";
import Language from "@/app/components/navigation-ui/Language";
import MiniBucket from "@/app/components/navigation-ui/MiniBucket";
import MiniBucketMobile from "@/app/components/navigation-ui/MiniBucketMobile";
import Profile from "@/app/components/navigation-ui/Profile";
import Search from "@/app/components/navigation-ui/Search";
import SidebarTrigger from "@/app/components/navigation-ui/SidebarItems";
import { BackIcon, LogoIcon } from "@/app/icons";

//jotai
import { useAtom, useSetAtom } from "jotai";
import atoms from "@/app/(pages)/_providers/jotai";

interface Props {}

const Index: FC<Props> = ({}) => {
  const { back } = useRouter();

  const t = useTranslations();
  const pathName = usePathname();

  const { handleChange, languageTitle } = useChangeLanguage();

  const [isAuth, setAuth] = useAtom(atoms.isAuth);
  const setUserProfile = useSetAtom(atoms.userProfile);
  const handleQuery = useSetAtom(atoms.query);
  const [selectedCity, setSelectedCity] = useAtom(atoms.selectedCity);

  const { currentUser } = useLoginMe();

  const { cities } = useGetCities();

  useEffect(() => {
    setAuth(Boolean(currentUser));
    if (currentUser) {
      setUserProfile(currentUser);
    }
  }, [currentUser]);

  // Auto-detect city from geolocation on first visit
  useEffect(() => {
    if (selectedCity && selectedCity !== "Turkmenabat") return;
    if (!cities?.length) return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`,
            { headers: { "User-Agent": "foody7.com food delivery app" } }
          );
          const data = await res.json();
          const detected = data.address?.city || data.address?.town || data.address?.state;
          if (detected && cities.some((c: City) => c.title.toLowerCase() === detected.toLowerCase())) {
            setSelectedCity(detected);
          }
        } catch {
          // fallback: keep Seoul
        }
      },
      () => {
        // permission denied or error: keep Seoul
      },
      { timeout: 5000 }
    );
  }, [cities]);

  const isBucketPage = pathName.includes("bucket");
  return (
    <header style={{ paddingTop: "env(safe-area-inset-top)" }} className="fixed top-0 z-20 flex h-20 w-screen items-center justify-between space-x-6 bg-bg-1 py-4 pl-3 pr-6 shadow-md xl:space-x-6 xl:pl-2 xl:pr-4 lg:space-x-4 md:h-16 md:space-x-2 md:px-3 md:py-2">
      {isBucketPage && (
        <button className="flex items-center space-x-2 text-text-3 md:hidden" onClick={back}>
          <BackIcon fill="text-text-3" />
          <p>{t("Index.back")}</p>
        </button>
      )}
      <div className="flex items-center justify-center space-x-3 xl:space-x-2 md:w-full md:justify-start">
        <SidebarTrigger>
          <MenuIcon className="h-6 w-6" />
        </SidebarTrigger>

        <Link href={"/"} className={cn("flex items-center", isBucketPage && "md:flex-1 md:justify-center")} type="button">
          <LogoIcon width={130} />
        </Link>

        {!isBucketPage && (
          <Search
            handleQuery={handleQuery}
            searchTitle={t("Index.search")}
            searchPlaceholder={t("Index.searchPlaceholder")}
            disabled={pathName.length > 3}
          />
        )}

        {!isBucketPage && (
          <Regions cities={cities} regionsTitle={t("Index.chooseCity")} regionTitle={t("Index.city")} />
        )}
      </div>
      <div className="flex items-center space-x-4 md:space-x-3">
        <Language languageTitle={languageTitle} handleChange={handleChange} />
        <MiniBucket t={t} />

        <MiniBucketMobile t={t} />
        {isAuth ? <Profile t={t} /> : <Authorization t={t} />}
      </div>
    </header>
  );
};
export default Index;
