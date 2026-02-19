"use client";
import { useEffect } from "react";
import { useAtom } from "jotai";
import { useMutation } from "@tanstack/react-query";

import { useProfileFormScheme } from "@/app/hooks/formSchemes";
import atoms from "@/app/(pages)/_providers/jotai";
import axios from "@/app/shared/lib/axios";
import useToast from "@/app/hooks/useToast";
import { UPDATE_USER_PROFILE_MUTATION } from "@/app/services/query/addressesQuery";

//components
import Button from "@/app/components/shared-ui/Button";
import Input from "@/app/components/shared-ui/Input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/app/components/shared-ui/Form/form";
import AddressSettings from "./AddressSettings";

const PROFILE_INPUTS = [
  { name: "name", label: "ProfilePage.yourName", placeholder: "Placeholder.name" },
  { name: "phoneNumber", label: "ProfilePage.phoneNumber", placeholder: "Placeholder.phone" },
];

export default function AccountSettings({ t }: { t: any }) {
  const [userProfile, setUserProfile] = useAtom(atoms.userProfile);
  const { form } = useProfileFormScheme();
  const toast = useToast();

  // Pre-populate form from stored user profile
  useEffect(() => {
    if (userProfile) {
      form.reset({
        name: userProfile.name || "",
        phoneNumber: userProfile.phone || "",
        email: userProfile.email || "",
        address: "",
      });
    }
  }, [userProfile]); // eslint-disable-line react-hooks/exhaustive-deps

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (values: { name: string; phoneNumber: string; email: string }) => {
      const { data } = await axios({
        data: {
          query: UPDATE_USER_PROFILE_MUTATION,
          variables: {
            id: userProfile!.id,
            userData: { name: values.name, phone: values.phoneNumber, email: values.email },
          },
        },
      });
      return data.data.updateUser;
    },
    onSuccess: (data) => {
      setUserProfile({ ...userProfile!, ...data });
      toast("Actions.successUpdate", "success", { duration: 3000 });
    },
    onError: () => {
      toast("Actions.errorOccurred", "error", { duration: 4000 });
    },
  });

  return (
    <>
      <h1 className="text-2xl">{t("ProfilePage.yourProfile")}</h1>
      <div className="space-y-8 rounded-2xl border-2 border-gray-1 p-8 lg:p-6 sm:space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutateAsync(v))}>
            <div className="space-y-6">
              <div className="flex w-full space-x-8 md:space-x-6 sm:flex-col sm:space-x-0 sm:space-y-6">
                {PROFILE_INPUTS.map(({ name, label, placeholder }) => (
                  <FormField
                    name={name}
                    key={label}
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Input
                            {...field}
                            label={`${t(label)} *`}
                            className="border-none bg-gray-3"
                            placeholder={t(placeholder)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              <FormField
                name="email"
                render={({ field }) => (
                  <FormItem className="w-full max-w-sm md:max-w-full">
                    <FormControl>
                      <Input
                        {...field}
                        label={t("ProfilePage.yourEmail")}
                        className="border-none bg-gray-3"
                        placeholder={t("Placeholder.email")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={isPending}>{t("Index.save")}</Button>
              </div>
            </div>
          </form>
        </Form>

        {/* Address management lives outside <form> to avoid accidental submit */}
        <div className="border-t border-black/10 pt-6">
          <AddressSettings t={t} />
        </div>
      </div>
    </>
  );
}
