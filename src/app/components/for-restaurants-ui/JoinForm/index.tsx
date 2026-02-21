"use client";
import { useState } from "react";
import { useCreateFeedbackOrCoop } from "@/app/services/useFeedbackAndCoop";
import Input from "@/app/components/shared-ui/Input";
import Button from "@/app/components/shared-ui/Button";
import { Textarea } from "@/app/components/shared-ui/Textarea";

interface Props { t: any }

interface JoinFormState {
  restaurantName: string;
  ownerName: string;
  phone: string;
  email: string;
  city: string;
  cuisine: string;
  monthlyOrders: string;
  interestedTier: string;
  message: string;
}

const defaultForm: JoinFormState = {
  restaurantName: "",
  ownerName: "",
  phone: "",
  email: "",
  city: "",
  cuisine: "",
  monthlyOrders: "",
  interestedTier: "",
  message: "",
};

function buildDescription(f: JoinFormState): string {
  return [
    `[restaurant: ${f.restaurantName}]`,
    `[email: ${f.email}]`,
    `[city: ${f.city}]`,
    f.cuisine        ? `[cuisine: ${f.cuisine}]`               : null,
    f.monthlyOrders  ? `[monthly_orders: ${f.monthlyOrders}]`  : null,
    f.interestedTier ? `[tier: ${f.interestedTier}]`           : null,
    f.message        ? `[message: ${f.message}]`               : null,
  ].filter(Boolean).join("\n");
}

export default function ForRestaurantsJoinForm({ t }: Props) {
  const [form, setForm] = useState<JoinFormState>(defaultForm);
  const [submitted, setSubmitted] = useState(false);
  const { createFeedbackOrCoop, isPending } = useCreateFeedbackOrCoop();

  const update = (field: keyof JoinFormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createFeedbackOrCoop({
      name: form.ownerName,
      phoneNumber: form.phone,
      description: buildDescription(form),
      type: "cooperation",
    });
    if (res?.id) setSubmitted(true);
  };

  if (submitted) {
    return (
      <section id="join-form" className="mx-auto max-w-2xl px-8 py-20 text-center md:px-4 md:py-12">
        <p className="text-xl font-semibold text-primary">
          {t("ForRestaurantsPage.formSuccess")}
        </p>
      </section>
    );
  }

  return (
    <section id="join-form" className="mx-auto max-w-2xl px-8 py-16 md:px-4 md:py-10">
      <h2 className="mb-2 text-center text-3xl font-bold md:text-2xl">
        {t("ForRestaurantsPage.formHeading")}
      </h2>
      <p className="mb-8 text-center text-text-2 md:text-sm md:mb-5">
        {t("ForRestaurantsPage.formSubheading")}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Restaurant name + Owner name */}
        <div className="flex gap-4 md:flex-col md:gap-4">
          <Input
            label={t("ForRestaurantsPage.formRestaurantName") + " *"}
            value={form.restaurantName}
            onChange={(e) => update("restaurantName", e.target.value)}
            required
          />
          <Input
            label={t("ForRestaurantsPage.formOwnerName") + " *"}
            value={form.ownerName}
            onChange={(e) => update("ownerName", e.target.value)}
            required
          />
        </div>

        {/* Row 2: Phone + Email */}
        <div className="flex gap-4 md:flex-col md:gap-4">
          <Input
            label={t("ForRestaurantsPage.formPhone") + " *"}
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            type="tel"
            required
          />
          <Input
            label={t("ForRestaurantsPage.formEmail") + " *"}
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            type="email"
            required
          />
        </div>

        {/* City */}
        <Input
          label={t("ForRestaurantsPage.formCity") + " *"}
          value={form.city}
          onChange={(e) => update("city", e.target.value)}
          required
        />

        {/* Row 3: Cuisine + Monthly orders */}
        <div className="flex gap-4 md:flex-col md:gap-4">
          <div className="flex w-full flex-col items-baseline">
            <h3 className="pb-2 text-sm md:pb-1.5 md:text-xs">{t("ForRestaurantsPage.formCuisine")}</h3>
            <select
              className="h-10 w-full rounded-md border border-gray-1 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#94A3B8]"
              value={form.cuisine}
              onChange={(e) => update("cuisine", e.target.value)}
            >
              <option value="">—</option>
              {(["Korean","Japanese","Chinese","Western","Cafe","Other"] as const).map((k) => (
                <option key={k} value={k}>{t(`ForRestaurantsPage.formCuisine${k}`)}</option>
              ))}
            </select>
          </div>

          <div className="flex w-full flex-col items-baseline">
            <h3 className="pb-2 text-sm md:pb-1.5 md:text-xs">{t("ForRestaurantsPage.formMonthlyOrders")}</h3>
            <select
              className="h-10 w-full rounded-md border border-gray-1 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#94A3B8]"
              value={form.monthlyOrders}
              onChange={(e) => update("monthlyOrders", e.target.value)}
            >
              <option value="">—</option>
              <option value="under50">{t("ForRestaurantsPage.formMonthlyOrdersUnder50")}</option>
              <option value="50to150">{t("ForRestaurantsPage.formMonthlyOrders50to150")}</option>
              <option value="150to400">{t("ForRestaurantsPage.formMonthlyOrders150to400")}</option>
              <option value="over400">{t("ForRestaurantsPage.formMonthlyOrdersOver400")}</option>
            </select>
          </div>
        </div>

        {/* Interested tier */}
        <div className="flex flex-col items-baseline">
          <h3 className="pb-2 text-sm md:pb-1.5 md:text-xs">{t("ForRestaurantsPage.formInterestedTier")}</h3>
          <select
            className="h-10 w-full rounded-md border border-gray-1 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#94A3B8]"
            value={form.interestedTier}
            onChange={(e) => update("interestedTier", e.target.value)}
          >
            <option value="">{t("ForRestaurantsPage.formTierNotSure")}</option>
            {["Starter","F70","F170","F350","F700","Enterprise"].map((tier) => (
              <option key={tier} value={tier}>{tier}</option>
            ))}
          </select>
        </div>

        {/* Message */}
        <Textarea
          label={t("ForRestaurantsPage.formMessage")}
          className="h-24 resize-none"
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
        />

        <div className="pt-2">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full py-3 text-base text-white disabled:bg-bg-2 disabled:text-text-1/70"
          >
            {t("ForRestaurantsPage.formSubmit")}
          </Button>
        </div>

        <p className="mt-4 text-center text-xs leading-relaxed text-text-3">
          {t("ForRestaurantsPage.legalDisclaimer")}
        </p>
      </form>
    </section>
  );
}
