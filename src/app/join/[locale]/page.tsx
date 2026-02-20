"use client";
import { useTranslations } from "next-intl";
import JoinHeader            from "@/app/components/for-restaurants-ui/JoinHeader";
import ForRestaurantsHero    from "@/app/components/for-restaurants-ui/Hero";
import ForRestaurantsValueProps from "@/app/components/for-restaurants-ui/ValueProps";
import ForRestaurantsHowItWorks from "@/app/components/for-restaurants-ui/HowItWorks";
import ForRestaurantsPricing from "@/app/components/for-restaurants-ui/Pricing";
import ForRestaurantsPWA     from "@/app/components/for-restaurants-ui/PWA";
import ForRestaurantsFAQ     from "@/app/components/for-restaurants-ui/FAQ";
import ForRestaurantsJoinForm from "@/app/components/for-restaurants-ui/JoinForm";

export default function JoinPage() {
  const t = useTranslations();
  return (
    <div className="min-h-screen bg-white">
      <JoinHeader />
      <ForRestaurantsHero      t={t} />
      <ForRestaurantsValueProps t={t} />
      <ForRestaurantsHowItWorks t={t} />
      <ForRestaurantsPricing   t={t} />
      <ForRestaurantsPWA       t={t} />
      <ForRestaurantsFAQ       t={t} />
      <ForRestaurantsJoinForm  t={t} />
      <footer className="border-t py-6 text-center text-sm text-text-3">
        © {new Date().getFullYear()} Foody7 ·{" "}
        <a href="https://foody7.com" className="hover:underline">
          foody7.com
        </a>
      </footer>
    </div>
  );
}
