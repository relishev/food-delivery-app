"use client";
import { useAtom } from "jotai";

import atoms from "@/app/(pages)/_providers/jotai";
import { CURRENCIES } from "@/app/data";
import { formatPrice } from "@/app/shared/lib/formatPrice";

const useCurrency = () => {
  const [selectedCurrency, setSelectedCurrency] = useAtom(atoms.selectedCurrency);
  const [rates] = useAtom(atoms.exchangeRates);

  const currency = CURRENCIES.find((c) => c.code === selectedCurrency) ?? CURRENCIES[0];

  const fmt = (amount: number) =>
    formatPrice(amount, selectedCurrency, rates, currency.symbol);

  const handleChange = (code: CurrencyCode) => setSelectedCurrency(code);

  return { currency, handleChange, fmt };
};

export default useCurrency;
