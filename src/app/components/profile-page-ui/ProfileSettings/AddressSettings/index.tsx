"use client";
import { useAtom } from "jotai";
import atoms from "@/app/(pages)/_providers/jotai";
import { TrashIcon } from "@/app/icons";
import CreateNewAddress from "@/app/components/bucket-page-ui/BucketForm/Form/AddressSelect/CreateNewAddress";
import { useCreateAddress } from "@/app/services/useCreateAddress";
import useToast from "@/app/hooks/useToast";

export default function AddressSettings({ t }: { t: any }) {
  const [userProfile, setUserProfile] = useAtom(atoms.userProfile);
  const { createAddress, isPending } = useCreateAddress();
  const toast = useToast();

  if (!userProfile) return null;

  const addresses = userProfile.addresses || [];

  const handleDelete = async (indexToDelete: number) => {
    const updatedAddresses = addresses.filter((_, i) => i !== indexToDelete);
    try {
      await createAddress({ id: userProfile.id, userData: { addresses: updatedAddresses } });
      setUserProfile({ ...userProfile, addresses: updatedAddresses });
    } catch {
      toast("Actions.errorOccurred", "error", { duration: 4000 });
    }
  };

  return (
    <div className="w-full space-y-2">
      <p className="mb-1 text-sm font-medium text-black/70">{t("ProfilePage.deliveryAddress")}</p>

      <div className="space-y-2">
        {addresses.map((address, i) => (
          <div key={i} className="flex items-center justify-between rounded-md bg-gray-3 px-3 py-2.5">
            <div className="min-w-0 flex-1">
              {address.alias && (
                <p className="truncate text-sm font-semibold">{address.alias}</p>
              )}
              <p className="truncate text-xs text-black/50">
                {address.fullAddress || `${address.district}, ${address.houseNumber}${address.apartment ? `/${address.apartment}` : ""}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(i)}
              disabled={isPending}
              className="ml-2 shrink-0 rounded-lg p-1 hover:bg-gray-2 disabled:opacity-50"
            >
              <TrashIcon className="h-5 fill-error" />
            </button>
          </div>
        ))}

        {addresses.length === 0 && (
          <p className="rounded-md bg-gray-3 px-3 py-2.5 text-sm text-black/40">{t("ProfilePage.noAddresses")}</p>
        )}
      </div>

      <CreateNewAddress t={t} userProfile={userProfile} setUserProfile={setUserProfile} />
    </div>
  );
}
