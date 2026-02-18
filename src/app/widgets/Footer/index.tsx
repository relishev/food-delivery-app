"use client";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
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

interface Props {}

const contacts = [
  {
    icon: <PhoneIcon className="h-6 w-6 text-primary" />,
    title: "MainPage.phone",
    subtitle: "+82 2-1234-5678",
  },
  {
    icon: <MessageIcon className="h-6 w-6 text-primary" />,
    title: "MainPage.email",
    subtitle: "support@foody7.com",
  },
  {
    icon: <LocationIcon className="h-6 w-6 text-primary" />,
    title: "MainPage.address",
    subtitle: "Seoul, South Korea",
  },
];

const defaultStates = { cooperationModal: false, feedbackModal: false };

const Index: FC<Props> = () => {
  const t = useTranslations();

  const [modals, setModals] = useState(defaultStates);

  const { createFeedbackOrCoop, isPending } = useCreateFeedbackOrCoop();

  const links = [
    { title: "MainPage.about" },
    { title: "MainPage.advertisement" },
    { title: "MainPage.collab", fn: () => setModals((prev) => ({ ...prev, cooperationModal: true })) },
    { title: "MainPage.feedback", fn: () => setModals((prev) => ({ ...prev, feedbackModal: true })) },
  ];

  return (
    <footer className="z-[2000] w-full bg-gray-3 shadow-2xl">
      {/* Desktop layout */}
      <div className="md:hidden px-40 py-10 2xl:px-20 xl:px-10 lg:px-6">
        <div className="mx-auto max-w-[1440px]">
          {/* Top: contacts */}
          <div className="flex justify-between gap-6 lg:gap-4">
            {contacts.map(({ icon, title, subtitle }) => (
              <div key={title} className="flex items-center gap-3 rounded-xl bg-white/60 px-5 py-4 flex-1 shadow-sm">
                <span className="shrink-0">{icon}</span>
                <div>
                  <p className="text-xs font-medium text-text-4 uppercase tracking-wide">{t(title as any)}</p>
                  <p className="mt-0.5 text-sm font-semibold">{subtitle}</p>
                </div>
              </div>
            ))}
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

      {/* Mobile layout — ultra-compact */}
      <div className="hidden md:block px-4 py-2">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <ul className="flex flex-wrap gap-x-3 gap-y-1">
            {links.map(({ title, fn }) => (
              <li
                aria-label="button"
                onClick={fn}
                className="cursor-pointer text-xs text-text-4 transition hover:text-black"
                key={title}
              >
                {t(title)}
              </li>
            ))}
          </ul>
          <p className="text-xs text-text-4 whitespace-nowrap">© 2025 Foody7</p>
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
