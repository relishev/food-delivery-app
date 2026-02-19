"use client";
import { FC } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";

//components
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/app/components/shared-ui/Collapsible";
import { ChevronDown } from "lucide-react";
import InnerTable from "./InnerTable";
import EmptyBucket from "@/app/components/shared-ui/EmptyBucket";

import { getLocaleDate } from "@/app/hooks/getLocaleData";

import { PROFILE_OUTER_HEAD, ORDER_STATUSES, STATUS_CLASSES } from "@/app/data";

interface Props {
  userOrders?: UserOrder[];
  t: any;
}

const EmptyState: FC<{ t: any }> = ({ t }) => (
  <div className="py-4 text-center">
    <EmptyBucket title={t("ProfilePage.emptyHistory")} classes="bg-white text-base" />
    <Link href={"/"} className="mt-1 rounded-full bg-gray-2 px-4 py-2 text-sm font-medium text-black/80">
      {t("BucketPage.menuReturn")}
    </Link>
  </div>
);

const OrdersTable: FC<Props> = ({ userOrders, t }) => {
  const locale = useLocale();

  return (
    <section className="w-full">
      <h1 className="mb-4 pt-2 text-2xl font-semibold md:text-xl">{t("ProfilePage.history")}</h1>
      <p className="w-[75%] text-balance text-lg leading-6 xl:w-full md:text-base">{t("ProfilePage.info")}</p>

      {/* Desktop table — hidden on mobile */}
      <div className="mt-4 w-full overflow-auto md:hidden">
        <div className="min-w-[800px] border border-black/15 shadow-xl">
          <ul className="flex w-full items-center bg-gray-2/70 text-base font-bold text-black/80 xl:text-sm [&>*]:p-4 xl:[&>*]:p-2.5">
            <li className="w-[5%]"></li>
            {PROFILE_OUTER_HEAD.map(({ title, className }) => (
              <li className={className} key={title}>{t(title)}</li>
            ))}
            <li className="flex w-[16%] items-center space-x-4">
              <p>{t("ProfilePage.status")}</p>
            </li>
          </ul>
          <div className="w-full">
            {userOrders?.map(({ restaurantName, district, apartment, totalAmount, createdAt, deliveryPrice, orderStatus, dishes }) => (
              <Collapsible key={createdAt}>
                <div className="flex flex-col">
                  <ul className="flex items-center break-words border-b border-black/20 xl:text-sm [&>*]:p-4 xl:[&>*]:p-2.5">
                    <li className="w-[5%]">
                      <CollapsibleTrigger asChild>
                        <button className="justify-center rounded-full p-2 duration-150 hover:bg-gray-2">
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </CollapsibleTrigger>
                    </li>
                    <li className="w-[20%]">{restaurantName}</li>
                    <li className="w-[15%]">{district} / {apartment}</li>
                    <li className="w-[11%]">{totalAmount + +deliveryPrice} $</li>
                    <li className="w-[16%] text-success">{t("Index.delivery")}</li>
                    <li className="w-[17%]">{getLocaleDate(createdAt, locale)}</li>
                    <li className={`flex w-[16%] items-center space-x-2 ${STATUS_CLASSES[orderStatus]}`}>
                      <p>{t(ORDER_STATUSES[orderStatus])}</p>
                      {orderStatus !== "delivered" && orderStatus !== "rejected" && (
                        <div className="relative flex h-2.5 w-2.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[currentColor] opacity-75"></span>
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[currentColor]"></span>
                        </div>
                      )}
                    </li>
                  </ul>
                  <CollapsibleContent asChild className="w-full">
                    <InnerTable deliveryPrice={deliveryPrice} dishes={dishes} t={t} />
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
            {userOrders && !userOrders.length && <EmptyState t={t} />}
          </div>
        </div>
      </div>

      {/* Mobile accordion — visible only on mobile */}
      <div className="mt-4 hidden divide-y divide-black/10 rounded-xl border border-black/15 shadow-sm md:block">
        {userOrders?.map(({ restaurantName, district, apartment, totalAmount, createdAt, deliveryPrice, orderStatus, dishes }) => {
          const totalPrice = dishes?.reduce((acc, { dish: { price }, quantity }) => acc + price * quantity, 0);
          return (
            <Collapsible key={createdAt}>
              <CollapsibleTrigger asChild>
                <button className="group flex w-full items-center justify-between px-4 py-3.5 text-left">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-base font-semibold">{restaurantName}</span>
                    <span className="truncate text-sm text-text-3">{district}{apartment ? ` / ${apartment}` : ""}</span>
                    <div className="mt-1 flex items-center gap-3">
                      <span className="text-sm font-medium">{totalAmount + +deliveryPrice} $</span>
                      <span className={`flex items-center gap-1 text-xs font-medium ${STATUS_CLASSES[orderStatus]}`}>
                        {t(ORDER_STATUSES[orderStatus])}
                        {orderStatus !== "delivered" && orderStatus !== "rejected" && (
                          <span className="inline-block h-1.5 w-1.5 animate-ping rounded-full bg-[currentColor]" />
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3 flex shrink-0 flex-col items-end gap-2">
                    <span className="text-xs text-text-3">{getLocaleDate(createdAt, locale)}</span>
                    <ChevronDown className="h-4 w-4 text-text-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </div>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border-t border-black/10 bg-gray-3/40 px-4 pb-4 pt-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-3">{t("Index.dishes")}</p>
                  <div className="flex flex-col divide-y divide-black/10">
                    {dishes?.map(({ dish: { price, title }, quantity }, i) => (
                      <div key={i} className="flex items-center justify-between py-2 text-sm">
                        <span className="flex-1 truncate pr-2">{title}</span>
                        <span className="text-text-3 mr-3">{price} $</span>
                        <span className="text-text-3">× {quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-between border-t border-black/10 pt-2 text-sm font-medium">
                    {Boolean(+deliveryPrice) ? (
                      <span className="text-text-3">{t("Index.deliveryPrice")}: {deliveryPrice} $</span>
                    ) : (
                      <span className="text-success">{t("Index.freeDelivery")}</span>
                    )}
                    <span className="text-info">{t("BucketPage.totalPrice")}: {totalPrice + +deliveryPrice} $</span>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
        {userOrders && !userOrders.length && <EmptyState t={t} />}
      </div>
    </section>
  );
};

export default OrdersTable;
