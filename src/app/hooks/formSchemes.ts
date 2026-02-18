import { bucketFormScheme, loginScheme, profileFormScheme, registerScheme, addressFormScheme, kakaoAddressScheme } from "../shared/lib/zod";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const useLoginScheme = () => {
  const t = useTranslations();
  const formSchema = loginScheme(t);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return { form };
};

export const useRegisterScheme = () => {
  const t = useTranslations();
  const formSchema = registerScheme(t);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
    },
  });

  return { form };
};

export const useBucketFormScheme = () => {
  const t = useTranslations();
  const formSchema = bucketFormScheme(t);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      district: "",
      houseNumber: "",
      apartment: "",
      entrance: "",
      phoneNumber: "",
      commentToCourier: "",
      commentToRestaurant: "",
    },
  });

  return { form };
};

export const useProfileFormScheme = () => {
  const t = useTranslations();
  const formSchema = profileFormScheme(t);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      address: "",
      email: "",
    },
  });

  return { form };
};

export const useCreateAddressFormScheme = () => {
  const t = useTranslations();
  const formSchema = addressFormScheme(t);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      city: "Turkmenabat",
      district: "",
      houseNumber: "",
      apartment: "",
    },
  });

  return { form };
};

export const useKakaoAddressFormScheme = () => {
  const t = useTranslations();
  const formSchema = kakaoAddressScheme(t);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      alias: "",
      isDefault: false,
      fullAddress: "",
      addressDetail: "",
      latitude: 0,
      longitude: 0,
    },
  });

  return { form, kakaoAddressScheme: formSchema };
};
