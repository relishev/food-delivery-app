import type { CollectionConfig } from "payload";

import { admins } from "../utils/access/admins";
import { checkRole } from "../utils/access/checkRole";

const Users: CollectionConfig = {
  access: {
    admin: () => false,
    create: () => true,
    delete: admins,
    read: ({ req: { user } }) => {
      if (checkRole(["admin", "guest"], user)) {
        return true;
      }
      if (checkRole(["user"], user)) {
        return {
          id: {
            equals: user?.id,
          },
        };
      }
      return false;
    },
    update: ({ req: { user } }) => {
      if (checkRole(["user"], user)) {
        return true;
      }
      return false;
    },
  },

  admin: {
    defaultColumns: ["name", "email"],
    useAsTitle: "name",
  },

  auth: {
    depth: 0,
    tokenExpiration: 604800,
    verify: false,
    maxLoginAttempts: 10,
  },
  fields: [
    {
      name: "name",
      label: "Username",
      required: true,
      type: "text",
    },

    {
      name: "phone",
      label: "Phone number",
      required: true,
      type: "text",
    },
    {
      name: "addresses",
      fields: [
        {
          name: "city",
          label: "City",
          required: false,
          type: "text",
        },
        {
          name: "district",
          label: "District",
          required: true,
          type: "text",
        },
        {
          name: "apartment",
          label: "Apartment",
          required: true,
          type: "text",
        },
        {
          name: "houseNumber",
          label: "House number",
          required: true,
          type: "text",
        },
        {
          name: "entrance",
          label: "Entrance",
          required: false,
          type: "text",
        },
        // Kakao address fields
        {
          name: "alias",
          label: "Address alias",
          type: "text",
          required: false,
        },
        {
          name: "isDefault",
          label: "Default address",
          type: "checkbox",
          defaultValue: false,
        },
        {
          name: "fullAddress",
          label: "Full address",
          type: "text",
          required: false,
        },
        {
          name: "roadAddress",
          label: "Road address",
          type: "text",
          required: false,
        },
        {
          name: "jibunAddress",
          label: "Jibun address",
          type: "text",
          required: false,
        },
        {
          name: "zonecode",
          label: "Postal code",
          type: "text",
          required: false,
        },
        {
          name: "latitude",
          label: "Latitude",
          type: "number",
          required: false,
        },
        {
          name: "longitude",
          label: "Longitude",
          type: "number",
          required: false,
        },
        {
          name: "buildingName",
          label: "Building name",
          type: "text",
          required: false,
        },
        {
          name: "addressDetail",
          label: "Detail address",
          type: "text",
          required: false,
        },
      ],
      label: "Adresses",
      required: false,
      type: "array",
    },

    {
      name: "roles",
      defaultValue: "user",
      hasMany: true,
      options: [
        {
          label: "User",
          value: "user",
        },
      ],
      type: "select",
    },
  ],
  labels: { plural: "Users", singular: "User" },
  slug: "users",
  timestamps: true,
};

export default Users;
