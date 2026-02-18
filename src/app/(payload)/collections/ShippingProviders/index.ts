import type { CollectionConfig } from "payload";

import { admins } from "../utils/access/admins";
import { checkRole } from "../utils/access/checkRole";

const ShippingProviders: CollectionConfig = {
  access: {
    create: admins,
    delete: admins,
    read: ({ req: { user } }) => {
      // Admins can see all providers
      if (checkRole(["admin"], user)) return true;
      // Authors can see providers for their restaurants
      if (user && checkRole(["author"], user) && "restaurant" in user && user.restaurant) {
        const restaurantIds = Array.isArray(user.restaurant) ? user.restaurant : [user.restaurant];
        return {
          restaurantId: {
            in: restaurantIds.map((r) => (typeof r === "string" ? r : r.id)),
          },
        };
      }
      // CN-01: Don't expose to public
      return false;
    },
    update: admins, // Only admins can modify provider configs
  },

  admin: {
    defaultColumns: ["providerType", "isEnabled", "priority"],
    useAsTitle: "providerType",
  },

  fields: [
    {
      name: "restaurantId",
      label: "Restaurant",
      relationTo: "restaurants",
      required: true,
      type: "relationship",
    },
    {
      name: "providerType",
      label: "Provider Type",
      options: [
        { label: "Distance Based", value: "distance" },
        { label: "Manual Pricing", value: "manual" },
        { label: "Baemin", value: "baemin" },
        { label: "Coupang Eats", value: "coupang" },
        { label: "Yogiyo", value: "yogiyo" },
      ],
      required: true,
      type: "select",
    },
    {
      name: "isEnabled",
      admin: {
        position: "sidebar",
      },
      defaultValue: true,
      label: "Enabled",
      type: "checkbox",
    },
    {
      name: "priority",
      admin: {
        position: "sidebar",
      },
      defaultValue: 10,
      label: "Priority (lower = higher priority)",
      required: true,
      type: "number",
    },
    {
      name: "config",
      access: {
        // CN-01: Never expose config to non-admins (contains API credentials)
        read: ({ req: { user } }) => checkRole(["admin"], user),
        update: ({ req: { user } }) => checkRole(["admin"], user),
      },
      admin: {
        // CN-01: Only admins see this field in admin UI
        condition: (data, siblingData, { user }) => checkRole(["admin"], user),
        description: "API keys and settings (admins only)",
      },
      label: "Provider Configuration",
      type: "json",
    },
  ],

  labels: { plural: "Shipping Providers", singular: "Shipping Provider" },
  slug: "shipping-providers",
};

export default ShippingProviders;
