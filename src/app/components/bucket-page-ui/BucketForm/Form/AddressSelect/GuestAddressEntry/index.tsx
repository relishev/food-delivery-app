'use client';

import { useState } from "react";

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/app/components/shared-ui/Dialog";
import { PlusIcon } from "@/app/icons";
import KakaoAddressPicker from "@/app/components/shared-ui/KakaoAddressPicker";
import { KakaoAddress } from "@/app/components/shared-ui/KakaoAddressPicker/types";

interface Props {
  onAddressSelect: (address: AddressData) => void;
  t: any;
}

/**
 * GuestAddressEntry - Address entry component for guest checkout
 * Allows guests to enter a delivery address without saving to profile
 * Implements AC-04.5: Guest checkout with "Enter new address" option
 */
export default function GuestAddressEntry({ onAddressSelect, t }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleKakaoSelect = (kakaoAddress: KakaoAddress) => {
    // DB-05: Parse district from roadAddress for legacy compatibility
    const parseDistrict = (addr: string): string => {
      const parts = addr.split(' ');
      return parts.length >= 2 ? `${parts[0]} ${parts[1]}` : parts[0] || '';
    };

    // Create address object for form (not saved to profile)
    const newAddress: AddressData = {
      alias: kakaoAddress.alias || '',
      isDefault: false,
      fullAddress: kakaoAddress.fullAddress,
      roadAddress: kakaoAddress.roadAddress,
      jibunAddress: kakaoAddress.jibunAddress,
      zonecode: kakaoAddress.zonecode,
      latitude: kakaoAddress.latitude,
      longitude: kakaoAddress.longitude,
      buildingName: kakaoAddress.buildingName,
      addressDetail: kakaoAddress.addressDetail,
      // Legacy fields auto-populated
      district: parseDistrict(kakaoAddress.roadAddress),
      houseNumber: kakaoAddress.buildingName || '',
      apartment: kakaoAddress.addressDetail || '',
      city: '',
      entrance: '',
    };

    onAddressSelect(newAddress);
    setIsDialogOpen(false);
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger className="flex w-full items-center justify-between space-x-2.5 border-b border-b-gray-2 px-6 py-[18px] text-base font-medium hover:bg-onHover md:px-5 md:py-4 sm:px-4 sm:py-3 sm:text-sm">
        <p>{t("BucketForm.addNewAddress")}</p>
        <PlusIcon />
      </DialogTrigger>
      <DialogContent className="max-w-2xl rounded-md bg-bg-1 md:max-w-[92%]">
        <DialogTitle>
          <p className="mb-3 ml-2 mr-6 text-xl font-semibold">{t("BucketForm.addNewAddress")}</p>
        </DialogTitle>
        <div className="px-2 pb-4">
          <KakaoAddressPicker
            onAddressSelect={handleKakaoSelect}
            onCancel={handleCancel}
            showSaveCheckbox={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
