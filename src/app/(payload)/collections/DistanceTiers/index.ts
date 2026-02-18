import type { CollectionConfig } from "payload";

import { admins } from "../utils/access/admins";
import { checkRole } from "../utils/access/checkRole";

const DistanceTiers: CollectionConfig = {
  access: {
    create: admins,
    delete: admins,
    read: () => true,
    update: ({ req: { user } }) => {
      if (user && checkRole(["admin"], user)) {
        return true;
      }
      // Authors can only update tiers for restaurants they manage
      if (user && checkRole(["author"], user) && "restaurant" in user && user.restaurant) {
        const restaurantIds = Array.isArray(user.restaurant) ? user.restaurant : [user.restaurant];
        return {
          restaurantId: {
            in: restaurantIds.map((r) => (typeof r === "string" ? r : r.id)),
          },
        };
      }
      return false;
    },
  },

  admin: {
    defaultColumns: ["minDistanceKm", "maxDistanceKm", "price"],
    useAsTitle: "id",
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
      name: "minDistanceKm",
      label: "Min Distance (km)",
      min: 0,
      required: true,
      type: "number",
    },
    {
      name: "maxDistanceKm",
      label: "Max Distance (km)",
      required: true,
      type: "number",
    },
    {
      name: "price",
      label: "Delivery Price",
      min: 0,
      required: true,
      type: "number",
    },
    {
      name: "estimatedMinutes",
      defaultValue: 30,
      label: "Estimated Minutes",
      required: true,
      type: "number",
    },
    {
      name: "freeAfterAmount",
      admin: {
        description: "Order total for free delivery (optional)",
      },
      label: "Free After Order Amount",
      required: false,
      type: "number",
    },
  ],

  hooks: {
    beforeValidate: [
      async ({ data }) => {
        if (data && data.minDistanceKm >= data.maxDistanceKm) {
          throw new Error("minDistanceKm must be less than maxDistanceKm");
        }
      },
    ],
  },

  labels: { plural: "Distance Tiers", singular: "Distance Tier" },
  slug: "distance-tiers",
};

export default DistanceTiers;
