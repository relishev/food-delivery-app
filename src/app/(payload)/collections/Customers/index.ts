import type { CollectionConfig } from "payload";

import { ensureFirstUserIsAdmin } from "./hooks/ensureFirstUserIsAdmin";
import { checkRole } from "../utils/access/checkRole";
import { admins } from "../utils/access/admins";
import { passwordResetEmail, welcomeEmail } from "@/app/email/templates";

const SERVER_URL = process.env.PAYLOAD_PUBLIC_SERVER_URL || "https://foody7.com";

const Customers: CollectionConfig = {
  access: {
    admin: () => true,
    create: admins,
    delete: admins,
    read: ({ req }) => {
      if (checkRole(["admin", "guest"], req.user)) {
        return true;
      }
      // @ts-expect-error
      if (req.user?.isBlocked) {
        return false;
      }

      return {
        id: {
          equals: req.user?.id,
        },
      };
    },
    update: admins,
  },

  admin: {
    defaultColumns: ["name", "phone", "roles"],
    useAsTitle: "name",
  },

  auth: {
    depth: 0,
    maxLoginAttempts: 20,
    tokenExpiration: 604800,
    forgotPassword: {
      generateEmailHTML: ({ token }: { token?: string }) => {
        const url = `${SERVER_URL}/reset-password?token=${token}`;
        return passwordResetEmail(url).html;
      },
      generateEmailSubject: () => "Reset your Foody7 password",
    },
    verify: {
      generateEmailHTML: ({ token }: { token?: string }) => {
        const url = `${SERVER_URL}/verify?token=${token}`;
        return welcomeEmail().html;
      },
      generateEmailSubject: () => "Welcome to Foody7 🍜",
    },
  },

  fields: [
    {
      name: "name",
      label: "Username",
      type: "text",
    },
    {
      name: "phone",
      label: "Phone number",
      required: false,
      type: "text",
    },

    {
      name: "restaurant",
      access: {
        read: () => true,
        update: ({ req }) => checkRole(["admin"], req.user),
      },
      hasMany: true,
      label: "Restaurant",
      relationTo: "restaurants",
      type: "relationship",
    },

    {
      name: "isBlocked",
      access: {
        read: ({ req }) => checkRole(["admin"], req.user),
        update: ({ req }) => checkRole(["admin"], req.user),
      },
      defaultValue: false,
      label: "Is blocked?",
      required: false,
      type: "checkbox",
    },

    {
      name: "roles",
      defaultValue: "author",
      hasMany: true,
      hooks: {
        beforeChange: [ensureFirstUserIsAdmin],
      },
      options: [
        {
          label: "Admin",
          value: "admin",
        },
        {
          label: "Author",
          value: "author",
        },
        {
          label: "Guest",
          value: "guest",
        },
      ],
      type: "select",
    },
  ],

  labels: { plural: "Customers", singular: "Customer" },
  slug: "customers",
  timestamps: true,
};

export default Customers;
