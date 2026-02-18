import dynamic from "next/dynamic";
import React, { FC, useState } from "react";

import { useAtom } from "jotai";
import atoms from "@/app/(pages)/_providers/jotai";

//components
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/app/components/shared-ui/Popover";
const CreateNewAddress = dynamic(() => import("./CreateNewAddress"), { ssr: false });
const GuestAddressEntry = dynamic(() => import("./GuestAddressEntry"), { ssr: false });
import { ChevronDown } from "lucide-react";
import { HomeIcon } from "@/app/icons";

interface Props {
  onChange: (address: AddressData) => void;
  t: any;
}
const Index: FC<Props> = ({ onChange, t }) => {
  const [userProfile, setUserProfile] = useAtom(atoms.userProfile);

  const [selected, setSelected] = useState("");
  const [open, setOpen] = useState(false);

  const handleChange = (address: AddressData) => {
    // Display alias if available, otherwise fall back to legacy format
    if (address.alias) {
      setSelected(address.alias);
    } else {
      const { district, houseNumber, apartment } = address;
      setSelected(`${district}, ${houseNumber}/${apartment}`);
    }
    onChange(address);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="relative z-10 flex rounded-xl">
        <div className="relative flex items-center space-x-2.5">
          <HomeIcon />
          <p className="line-clamp-1 text-base font-bold sm:text-sm">{selected || t("BucketForm.chooseAddress")}</p>
          <ChevronDown width={20} height={20} className="duration-200 peer-checked:rotate-180" />
        </div>
      </PopoverTrigger>

      <PopoverContent align="center" className="overflow-hidden rounded-[14px] p-0 shadow-xl">
        <ul className="cursor-pointer">
          {/* Logged-in users: Show CreateNewAddress with save functionality */}
          {userProfile ? (
            <li>
              <CreateNewAddress t={t} userProfile={userProfile} setUserProfile={setUserProfile} />
            </li>
          ) : (
            /* Guests: Show GuestAddressEntry - address entry without saving */
            <li>
              <GuestAddressEntry t={t} onAddressSelect={handleChange} />
            </li>
          )}

          {/* Only show saved addresses for logged-in users */}
          {userProfile?.addresses?.map((address, i) => (
            <PopoverClose
              className="line-clamp-2 w-full px-4 py-[14px] text-start hover:bg-onHover md:px-5 md:py-4 sm:px-4 sm:py-3"
              key={i}
              onClick={() => handleChange(address)}
            >
              {address.alias ? (
                <React.Fragment>
                  <span className="font-bold">{address.alias}</span>
                  <span className="text-gray-600"> - {address.district}{address.buildingName ? `, ${address.buildingName}` : ''}</span>
                </React.Fragment>
              ) : (
                `${address.district}, ${address.houseNumber}/${address.apartment}`
              )}
            </PopoverClose>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
};
export default Index;
