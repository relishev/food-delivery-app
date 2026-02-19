"use client";
import { FC } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/shared-ui/Popover";
import { CheckIcon, UsdIcon } from "@/app/icons";
import { CURRENCIES } from "@/app/data";
import useCurrency from "@/app/hooks/useCurrency";

const Index: FC = () => {
  const { currency, handleChange } = useCurrency();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex min-w-14 cursor-pointer flex-col items-center space-y-1 rounded-md text-sm text-text-2 md:hidden">
          <UsdIcon width={20} height={20} />
          <p className="whitespace-nowrap">{currency.code}</p>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-36 px-6 shadow-xl">
        <ul className="rounded-[18px] text-sm">
          {CURRENCIES.map(({ code, title }) => (
            <li
              key={code}
              onClick={() => handleChange(code)}
              className="flex cursor-pointer items-center justify-between space-x-3 border-b border-gray-1 py-2 last:border-none hover:text-text-3"
            >
              <p>{title}</p>
              {currency.code === code && <CheckIcon width={16} height={16} />}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
};
export default Index;
