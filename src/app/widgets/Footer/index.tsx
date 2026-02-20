"use client";
import dynamic from "next/dynamic";
import { useTranslations, useLocale } from "next-intl";
import { FC, useState } from "react";

import { LocationIcon, MessageIcon, PhoneIcon } from "@/app/icons";

import { useCreateFeedbackOrCoop } from "@/app/services/useFeedbackAndCoop";

//components
import Spinner from "@/app/components/shared-ui/Spinner";
const CooperationModal = dynamic(() => import("@/app/components/footer-ui/CooperationModal"), {
  loading: () => <Spinner />,
});

const FeedbackModal = dynamic(() => import("@/app/components/footer-ui/FeedbackModal"), {
  loading: () => <Spinner />,
});

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

interface Props {}

const contacts = [
  {
    icon: <PhoneIcon className="h-6 w-6 text-primary" />,
    title: "MainPage.phone",
    subtitle: "+82 2-1234-5678",
    href: null,
  },
  {
    icon: <MessageIcon className="h-6 w-6 text-primary" />,
    title: "MainPage.email",
    subtitle: "support@foody7.com",
    href: "mailto:support@foody7.com",
  },
  {
    icon: <LocationIcon className="h-6 w-6 text-primary" />,
    title: "MainPage.address",
    subtitle: "Seoul, South Korea",
    href: null,
  },
  {
    icon: <TelegramIcon className="h-6 w-6 text-primary" />,
    title: "MainPage.telegram",
    subtitle: "@relishev",
    href: "https://t.me/relishev",
  },
];

const defaultStates = { cooperationModal: false, feedbackModal: false };

const Index: FC<Props> = () => {
  const t = useTranslations();
  const locale = useLocale();

  const [modals, setModals] = useState(defaultStates);

  const { createFeedbackOrCoop, isPending } = useCreateFeedbackOrCoop();

  const links = [
    { title: "MainPage.about" },
    { title: "MainPage.advertisement" },
    { title: "MainPage.collab", fn: () => { window.location.href = `/join/${locale}`; } },
    { title: "MainPage.feedback", fn: () => setModals((prev) => ({ ...prev, feedbackModal: true })) },
  ];

  return (
    <footer className="z-[2000] w-full bg-gray-3 shadow-2xl">
      {/* Under-construction notice — full width, both layouts */}
      <div className="w-full bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-center gap-2">
        <span className="text-amber-500 text-base leading-none">🚧</span>
        <p className="text-xs text-amber-700 text-center">{t("Footer.earlyAccess")}</p>
      </div>

      {/* Desktop layout */}
      <div className="md:hidden px-40 py-10 2xl:px-20 xl:px-10 lg:px-6">
        <div className="mx-auto max-w-[1440px]">
          {/* Top: contacts */}
          <div className="flex justify-between gap-6 lg:gap-4">
            {contacts.map(({ icon, title, subtitle, href }) => {
              const inner = (
                <>
                  <span className="shrink-0">{icon}</span>
                  <div>
                    <p className="text-xs font-medium text-text-4 uppercase tracking-wide">{t(title as any)}</p>
                    <p className="mt-0.5 text-sm font-semibold">{subtitle}</p>
                  </div>
                </>
              );
              return href ? (
                <a
                  key={title}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-3 rounded-xl bg-white/60 px-5 py-4 flex-1 shadow-sm transition hover:bg-white"
                >
                  {inner}
                </a>
              ) : (
                <div key={title} className="flex items-center gap-3 rounded-xl bg-white/60 px-5 py-4 flex-1 shadow-sm">
                  {inner}
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div className="my-6 border-t border-gray-2" />

          {/* Bottom: links + copyright */}
          <div className="flex items-center justify-between gap-4">
            <ul className="flex gap-6 lg:gap-4">
              {links.map(({ title, fn }) => (
                <li
                  aria-label="button"
                  onClick={fn}
                  className="cursor-pointer text-sm text-text-4 transition hover:text-black"
                  key={title}
                >
                  {t(title)}
                </li>
              ))}
            </ul>
            <p className="text-sm text-text-4">© 2024-2025 Foody7. {t("MainPage.rights")}</p>
          </div>
        </div>
      </div>

      {/* Mobile layout — prettified, PWA-safe area ready */}
      <div
        className="hidden md:block border-t border-gray-2 px-5 pt-5"
        style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
      >
        {/* Brand mark */}
        <div className="flex justify-center mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/foody7-icon.png" alt="Foody7" width={36} height={36} />
        </div>

        {/* Links — 2×2 grid */}
        <ul className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4">
          {links.map(({ title, fn }) => (
            <li
              aria-label="button"
              onClick={fn}
              className="cursor-pointer text-xs text-text-4 text-center py-1 transition hover:text-black"
              key={title}
            >
              {t(title)}
            </li>
          ))}
        </ul>

        {/* Telegram contact */}
        <div className="flex justify-center mb-3">
          <a
            href="https://t.me/relishev"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-text-4 hover:text-primary transition"
          >
            <TelegramIcon className="h-4 w-4" />
            <span>@relishev</span>
          </a>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-2 pt-3">
          <p className="text-center text-xs text-text-4">© 2025 Foody7</p>
        </div>
      </div>

      {(modals.cooperationModal || modals.feedbackModal) && (
        <div className="fixed left-0 top-0 z-50 flex h-screen w-full items-center justify-center bg-bg-cover">
          {modals.cooperationModal && (
            <CooperationModal
              submit={createFeedbackOrCoop}
              handleClose={() => setModals(defaultStates)}
              disabled={isPending}
              t={t}
            />
          )}
          {modals.feedbackModal && (
            <FeedbackModal
              submit={createFeedbackOrCoop}
              handleClose={() => setModals(defaultStates)}
              disabled={isPending}
              t={t}
            />
          )}
        </div>
      )}
    </footer>
  );
};
export default Index;
