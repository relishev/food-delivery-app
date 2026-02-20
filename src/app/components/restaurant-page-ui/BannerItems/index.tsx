"use client";
import { FC, useState, useRef, useEffect } from "react";

//components
import { ClockIcon, StarIcon, InfoIcon } from "@/app/icons";
import InfoItem from "./InfoItem";

interface Props {
  bannerInfo: BannerInfo;
  t: any;
}

const Index: FC<Props> = ({ bannerInfo, t }) => {
  const { title, deliveryTime, address, workingHours } = bannerInfo;
  const [infoOpen, setInfoOpen] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);

  const convertTimeFormat = (timeString: string | null | undefined) => {
    if (!timeString) return "--:--";
    return timeString.slice(1, 3) + ":" + timeString.slice(3);
  };

  useEffect(() => {
    if (!infoOpen) return;
    const handler = (e: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(e.target as Node)) {
        setInfoOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [infoOpen]);

  const items = [
    {
      icon: <ClockIcon className="md:h-5 md:w-5" />,
      title: `${deliveryTime?.slice(1) ?? "?"} ${t("Index.min")}`,
      subtitle: t("Index.delivery"),
    },
    {
      icon: <StarIcon className="md:h-5 md:w-5" />,
      title: t("Index.noReview"),
      //length of reviews
      subtitle: undefined,
    },
  ];

  return (
    <div className="">
      <h3 className="mb-3 text-5xl font-medium leading-10 tracking-tight text-white lg:text-4xl md:text-3xl">
        {title}
      </h3>

      <div className="flex space-x-2.5">
        {items.map((item) => (
          <InfoItem key={item.title} item={item} />
        ))}
        <div ref={infoRef} className="relative">
          <button
            type="button"
            aria-label="Info"
            onClick={() => setInfoOpen((o) => !o)}
            className="rounded-[14px] bg-bg-1/85 px-3 py-3"
          >
            <InfoIcon />
          </button>
          {infoOpen && (
            <div className="absolute bottom-full left-1/2 z-50 mb-2 w-72 -translate-x-1/2 rounded-md bg-bg-1 px-5 py-3 text-sm font-medium tracking-wide text-text-1 shadow-md">
              <div>
                {t("MainPage.workingHours")}:{" "}
                <span className="font-normal">
                  {convertTimeFormat(workingHours?.openTime)} - {convertTimeFormat(workingHours?.closeTime)}
                </span>
              </div>
              <div className="line-clamp-[10]">
                {t("MainPage.address")}: <span className="font-normal">{address}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Index;
