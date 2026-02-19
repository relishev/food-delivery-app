"use client";
import { FC } from "react";

//components
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/shared-ui/Popover";
import { CheckIcon, EarthIcon } from "@/app/icons";
import { LANGUAGES } from "@/app/data";
import FitText from "@/app/components/shared-ui/FitText";

interface Props {
  languageTitle: string;
  handleChange: (locale: I18N) => void;
}

const Index: FC<Props> = ({ languageTitle, handleChange }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex min-w-14 cursor-pointer flex-col items-center space-y-1 rounded-md text-sm text-text-2 md:hidden">
          <EarthIcon width={20} height={20} />
          <FitText className="w-full text-center">{languageTitle}</FitText>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-36 px-6 shadow-xl ">
        <ul className="rounded-[18px] text-sm">
          {LANGUAGES.map(({ title, value }) => (
            <li
              key={title}
              onClick={() => handleChange(value as I18N)}
              className="flex cursor-pointer items-center justify-between space-x-3  border-b border-gray-1 py-2  last:border-none hover:text-text-3"
            >
              <p>{title}</p>
              {languageTitle === title && <CheckIcon width={16} height={16} />}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
};
export default Index;
