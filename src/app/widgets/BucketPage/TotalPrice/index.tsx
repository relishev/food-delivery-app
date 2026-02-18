'use client';

import Link from "next/link";
import { FC, useState } from "react";
import { cn } from "@/app/shared/lib/utils";
import { ShippingOptionsSelector } from "@/app/components/shipping";
import type { ShippingQuote } from "@/app/shipping/types";

interface Props {
  totalPrice: string;
  deliveryPrice: number;
  restaurantTitle: string;
  restaurantId: string;
  disabled: boolean;
  t: any;
  customerAddress?: {
    lat: number;
    lng: number;
    fullAddress?: string;
  };
  onShippingQuoteSelect?: (quote: ShippingQuote | null) => void;
}

const Index: FC<Props> = ({
  totalPrice,
  deliveryPrice,
  restaurantTitle,
  restaurantId,
  disabled,
  t,
  customerAddress,
  onShippingQuoteSelect,
}) => {
  const [selectedQuote, setSelectedQuote] = useState<ShippingQuote | null>(null);

  const handleQuoteSelect = (quote: ShippingQuote) => {
    setSelectedQuote(quote);
    onShippingQuoteSelect?.(quote);
  };

  // Use selected quote price if available, otherwise fallback to restaurant default
  const deliveryDisplayPrice = selectedQuote
    ? (selectedQuote.price === -1 ? null : selectedQuote.price)
    : deliveryPrice;

  // Calculate final total
  const finalDeliveryPrice = deliveryDisplayPrice ?? 0;
  const finalTotal = Number(totalPrice) + finalDeliveryPrice;

  return (
    <div className="w-full rounded-[32px] bg-bg-1 p-8 md:rounded-3xl md:p-6 sm:p-4">
      <h5 className="mb-2.5 border-b border-gray-1 pb-2.5 text-xl font-medium leading-6 sm:text-lg">
        {t("BucketPage.summary")}
      </h5>
      <Link
        href={`/restaurant/${restaurantId}`}
        className={cn(
          "mb-1 inline-block border-b border-[transparent] pb-1 pt-2 text-lg font-medium leading-[1] transition hover:border-[currentColor]",
        )}
      >
        {restaurantTitle}
      </Link>

      {/* Show shipping options if customer address is available */}
      {customerAddress && customerAddress.lat && customerAddress.lng && (
        <div className="my-4">
          <ShippingOptionsSelector
            restaurantId={restaurantId}
            address={{
              lat: customerAddress.lat,
              lng: customerAddress.lng,
              fullAddress: customerAddress.fullAddress,
            }}
            orderTotal={Number(totalPrice)}
            onSelect={handleQuoteSelect}
          />
        </div>
      )}

      <ul className="mb-3 space-y-3">
        <li className="flex justify-between sm:text-sm">
          {t("BucketPage.price")}
          <span>{totalPrice}$</span>
        </li>
        <li className="flex justify-between sm:text-sm">
          {t("Index.delivery")}
          <span className={cn(
            deliveryDisplayPrice === 0 && "text-success",
            selectedQuote?.price === -1 && "text-warning"
          )}>
            {selectedQuote?.price === -1
              ? t("BucketPage.pricePending") || "Price Pending"
              : deliveryDisplayPrice === 0
                ? t("Index.freeDelivery")
                : `${deliveryDisplayPrice}$`}
          </span>
        </li>

        <li className="flex justify-between py-2.5 font-medium">
          {t("BucketPage.totalPrice")}
          <span className="rounded-[14px] border border-primary bg-onHover px-2.5 py-1 leading-4 sm:text-sm">
            {selectedQuote?.price === -1
              ? `${totalPrice}$ + ?`
              : `${finalTotal} $`}
          </span>
        </li>
      </ul>

      <button
        type="submit"
        disabled={disabled || (selectedQuote?.price === -1)}
        className="h-12 w-full rounded-[14px] bg-primary px-3 text-center font-medium leading-[48px] hover:bg-accent disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-black/50 sm:h-10 sm:leading-[40px]"
      >
        {t("BucketPage.submit")}
      </button>
    </div>
  );
};
export default Index;
