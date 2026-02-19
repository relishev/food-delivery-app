import { z } from "zod";

// Login Scheme
export const loginScheme = (t: (arg: string) => string) =>
  z.object({
    email: z.string().email({
      message: t("Zod.invalidEmail"),
    }),
    password: z.string().min(8, {
      message: t("Zod.invalidPassLength"),
    }),
  });

// Register Scheme
export const registerScheme = (t: (arg: string) => string) =>
  z.object({
    name: z.string().min(4, {
      message: t("Zod.invalidUsername"),
    }),
    email: z.string().min(2, {
      message: t("Zod.invalidEmail"),
    }),
    password: z.string().min(8, {
      message: t("Zod.invalidPassLength"),
    }),
    phone: z
      .string()
      .max(8)
      .min(8, {
        message: t("Zod.invalidPhone"),
      }),
  });

// Bucket form scheme (OrderForm type)
export const bucketFormScheme = (t: (arg: string) => string) =>
  z.object({
    district: z.string(),
    houseNumber: z.string(),
    apartment: z.string(),
    entrance: z.string(),
    phoneNumber: z
      .string()
      .max(8)
      .min(8, {
        message: t("Zod.invalidPhone"),
      }),
    commentToCourier: z.string(),
    commentToRestaurant: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    fullAddress: z.string().optional(),
  });

// Profile scheme

export const profileFormScheme = (t: (arg: string) => string) =>
  z.object({
    name: z.string().min(2, { message: t("Zod.invalidUsername") }),
    email: z
      .string()
      .min(3, { message: t("Zod.invalidEmail") })
      .email(t("Zod.invalidEmail")),
    phoneNumber: z
      .string()
      .max(8)
      .min(8, {
        message: t("Zod.invalidPhone"),
      })
      .length(8, { message: "Zod.invalidPhone" }),
    address: z.string().optional(),
  });

export const addressFormScheme = (t: (arg: string) => string) =>
  z.object({
    city: z.string().min(4, {
      message: t("Zod.invalidAddress"),
    }),
    district: z.string().min(4, {
      message: t("Zod.invalidDistrict"),
    }),
    houseNumber: z.string().min(1, {
      message: t("Zod.invalidHome"),
    }),
    apartment: z.string().min(1, {
      message: t("Zod.invalidApartment"),
    }),
  });

// Kakao Address Scheme (for Korean address search integration)
export const kakaoAddressScheme = (t: (arg: string) => string) =>
  z.object({
    alias: z.string().max(20).optional(),
    isDefault: z.boolean().optional(),
    fullAddress: z.string().min(5, {
      message: t("Zod.invalidAddress"),
    }),
    addressDetail: z.string().max(50).optional(),
    latitude: z.number(),
    longitude: z.number(),
  });
