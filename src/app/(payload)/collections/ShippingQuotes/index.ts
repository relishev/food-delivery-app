import type { CollectionConfig } from "payload";

import { admins } from "../utils/access/admins";
import { checkRole } from "../utils/access/checkRole";

const ShippingQuotes: CollectionConfig = {
  access: {
    create: ({ req: { user } }) => !!user, // Authenticated users can create quotes
    delete: admins,
    read: ({ req: { user } }) => {
      if (checkRole(["admin"], user)) return true;
      // Users can only read their own quotes
      if (user) {
        return { customerId: { equals: user.id } };
      }
      return false;
    },
    update: admins,
  },

  admin: {
    defaultColumns: ["quoteId", "providerId", "price", "validUntil"],
    useAsTitle: "quoteId",
  },

  fields: [
    {
      name: "quoteId",
      index: true,
      label: "Quote ID",
      required: true,
      type: "text",
      unique: true,
    },
    {
      name: "providerId",
      label: "Provider ID",
      required: true,
      type: "text",
    },
    {
      name: "providerName",
      label: "Provider Name",
      required: true,
      type: "text",
    },
    {
      name: "providerType",
      label: "Provider Type",
      options: [
        { label: "Distance", value: "distance" },
        { label: "Manual", value: "manual" },
        { label: "External", value: "external" },
      ],
      type: "select",
    },
    {
      name: "price",
      admin: {
        description: "-1 for manual/pending quotes",
      },
      label: "Price",
      required: true,
      type: "number",
    },
    {
      name: "estimatedMinutes",
      label: "Estimated Minutes",
      type: "number",
    },
    {
      name: "validUntil",
      admin: {
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
      index: true, // For TTL cleanup queries
      label: "Valid Until",
      required: true,
      type: "date",
    },
    {
      name: "restaurantId",
      label: "Restaurant ID",
      required: true,
      type: "text",
    },
    {
      name: "customerId",
      index: true,
      label: "Customer ID",
      required: true,
      type: "text",
    },
    {
      name: "request",
      label: "Original Request",
      type: "json",
    },
    {
      name: "metadata",
      label: "Metadata",
      type: "json",
    },
  ],

  labels: { plural: "Shipping Quotes", singular: "Shipping Quote" },
  slug: "shipping-quotes",
};

export default ShippingQuotes;
