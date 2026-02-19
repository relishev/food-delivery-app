import dynamic from "next/dynamic";
import { FC } from "react";

//components
const BucketFormComponent = dynamic(() => import("@/app/components/bucket-page-ui/BucketForm/Form"), { ssr: false });
import DeliveryItem from "@/app/components/shared-ui/DeliveryItem";
import Link from "next/link";
import { LocationIcon } from "@/app/icons";

type DeliveryMode = "delivery" | "selfPickup";

interface Props {
  form: any;
  deliveryTime: string | number;
  isDelivery: boolean;
  deliveryMode: DeliveryMode;
  setDeliveryMode: (mode: DeliveryMode) => void;
  availableModes: DeliveryMode[];
  restaurantAddress?: string;
  clearLocalStorage: () => void;
  t: any;
}

const Index: FC<Props> = ({
  form,
  deliveryTime,
  isDelivery,
  deliveryMode,
  setDeliveryMode,
  availableModes,
  restaurantAddress,
  clearLocalStorage,
  t,
}) => {
  const isSelfPickup = deliveryMode === "selfPickup";
  const showTabs = availableModes.length > 1;

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold leading-6 md:text-base">{t("BucketForm.fillForm")}</h2>

      {/* Delivery mode tabs — only when restaurant supports multiple modes */}
      {showTabs && (
        <div className="mb-5 flex space-x-2 rounded-xl bg-bg-2 p-1">
          {availableModes.includes("delivery") && (
            <button
              type="button"
              onClick={() => setDeliveryMode("delivery")}
              className={`flex-1 rounded-[10px] py-2 text-sm font-medium transition ${
                deliveryMode === "delivery"
                  ? "bg-bg-1 shadow-sm text-text-1"
                  : "text-text-4 hover:text-text-2"
              }`}
            >
              {t("Index.delivery")}
            </button>
          )}
          {availableModes.includes("selfPickup") && (
            <button
              type="button"
              onClick={() => setDeliveryMode("selfPickup")}
              className={`flex-1 rounded-[10px] py-2 text-sm font-medium transition ${
                deliveryMode === "selfPickup"
                  ? "bg-bg-1 shadow-sm text-text-1"
                  : "text-text-4 hover:text-text-2"
              }`}
            >
              {t("Index.selfCare")}
            </button>
          )}
        </div>
      )}

      {/* Only show order type label when there's a single mode (no tabs) */}
      {!showTabs && (
        <h3 className="mb-2.5 text-base font-medium leading-5 md:text-sm">
          {t("Index.orderType")}: &nbsp;
          <span className={isDelivery ? "text-success" : "text-warning"}>
            {isDelivery ? t("Index.delivery") : t("Index.selfCare")}
          </span>
        </h3>
      )}

      {/* Self-pickup: show pickup address only */}
      {isSelfPickup ? (
        <div className="mt-2 rounded-xl border border-gray-1 px-4 py-3">
          <div className="flex items-start space-x-2.5">
            <LocationIcon className="mt-0.5 h-5 w-5 shrink-0 text-text-3" />
            <div>
              <p className="text-sm font-medium text-text-2">{t("Index.pickupAt") || "Pickup at"}</p>
              <p className="mt-0.5 text-sm text-text-1">{restaurantAddress || "—"}</p>
            </div>
          </div>
        </div>
      ) : (
        /* Delivery: full address form */
        <BucketFormComponent form={form} t={t} />
      )}

      <div className="mt-8">
        <h4 className="mb-2.5 text-2xl font-medium leading-7">
          {t(isSelfPickup ? "Index.selfCare" : "BucketForm.deliveryTime")}
        </h4>
        <div className="flex items-center space-x-2.5">
          {!isNaN(+deliveryTime) ? (
            <DeliveryItem
              t={t}
              isDelivery={isDelivery}
              deliveryTime={+deliveryTime}
              deliveryTitle={isSelfPickup ? t("Index.selfCareDetailed") : t("BucketForm.deliveryTime")}
            />
          ) : (
            <Link
              href="/"
              onClick={clearLocalStorage}
              className="border-b border-[transparent] text-sm font-medium text-text-3 transition hover:border-[currentColor]"
            >
              {t("Actions.chooseRestaurant")}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
export default Index;
