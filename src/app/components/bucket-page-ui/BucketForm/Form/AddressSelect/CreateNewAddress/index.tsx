'use client';

import { useState } from "react";

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/app/components/shared-ui/Dialog";
import { PlusIcon } from "@/app/icons";
import KakaoAddressPicker from "@/app/components/shared-ui/KakaoAddressPicker";
import { KakaoAddress } from "@/app/components/shared-ui/KakaoAddressPicker/types";

import { useCreateAddress } from "@/app/services/useCreateAddress";
import useToast from "@/app/hooks/useToast";

interface Props {
  userProfile: UserData;
  setUserProfile: (user: UserData) => void;
  t: any;
}

export default function CreateNewAddress({ userProfile, setUserProfile, t }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { createAddress } = useCreateAddress();
  const toast = useToast();

  const { id, addresses = [] } = userProfile;

  const handleKakaoSelect = async (kakaoAddress: KakaoAddress) => {
    const currentAddresses = addresses || [];

    // CN-04: Max 4 addresses enforcement
    if (currentAddresses.length >= 4) {
      toast("Actions.maxAddressesReached", "error", { duration: 4000 });
      return;
    }

    // CN-06: Generate default alias if not provided
    const alias = kakaoAddress.alias || `Address ${currentAddresses.length + 1}`;

    // DB-05: Parse district from roadAddress for legacy compatibility
    const parseDistrict = (addr: string): string => {
      const parts = addr.split(' ');
      return parts.length >= 2 ? `${parts[0]} ${parts[1]}` : parts[0] || '';
    };

    // Create full address object with Kakao data + legacy fields
    const newAddress: AddressData = {
      alias,
      isDefault: kakaoAddress.isDefault || false,
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

    try {
      const updatedUser = await createAddress({
        id,
        userData: {
          addresses: [newAddress, ...currentAddresses].slice(0, 4)
        }
      });

      setUserProfile(updatedUser);
      setIsDialogOpen(false);
      toast("Actions.successAddress", "success", { duration: 3000 });
    } catch (error) {
      toast("Actions.errorOccurred", "error", { duration: 4000 });
    }
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
      <DialogContent className="max-w-2xl max-h-[90dvh] overflow-y-auto rounded-md bg-bg-1 md:max-w-[92%]">
        <DialogTitle>
          <p className="mb-3 ml-2 mr-6 text-xl font-semibold">{t("BucketForm.addNewAddress")}</p>
        </DialogTitle>
        <div className="px-2 pb-4">
          <KakaoAddressPicker
            onAddressSelect={handleKakaoSelect}
            onCancel={handleCancel}
            showSaveCheckbox={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
