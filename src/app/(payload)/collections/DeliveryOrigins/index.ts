import type { CollectionConfig } from "payload";

import { admins } from "../utils/access/admins";
import { checkRole } from "../utils/access/checkRole";

const DeliveryOrigins: CollectionConfig = {
  access: {
    create: admins,
    delete: admins,
    read: () => true,
    update: ({ req: { user } }) => {
      if (user && checkRole(["admin"], user)) {
        return true;
      }
      // Authors can only update origins for restaurants they manage
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
    defaultColumns: ["name", "address", "isActive"],
    useAsTitle: "name",
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
      name: "name",
      admin: {
        description: "e.g., Main Kitchen, Gangnam Branch",
      },
      label: "Origin Name",
      required: true,
      type: "text",
    },
    {
      name: "address",
      label: "Full Address",
      required: true,
      type: "text",
    },
    {
      name: "latitude",
      admin: {
        position: "sidebar",
      },
      label: "Latitude",
      required: true,
      type: "number",
    },
    {
      name: "longitude",
      admin: {
        position: "sidebar",
      },
      label: "Longitude",
      required: true,
      type: "number",
    },
    {
      name: "operatingHours",
      fields: [
        {
          name: "day",
          label: "Day of Week",
          max: 6,
          min: 0,
          required: true,
          type: "number",
        },
        {
          name: "open",
          label: "Open Time",
          required: true,
          type: "text",
        },
        {
          name: "close",
          label: "Close Time",
          required: true,
          type: "text",
        },
      ],
      label: "Operating Hours",
      type: "array",
    },
    {
      name: "maxCapacity",
      defaultValue: 50,
      label: "Max Orders/Hour",
      required: true,
      type: "number",
    },
    {
      name: "currentLoad",
      admin: {
        position: "sidebar",
        readOnly: true,
      },
      defaultValue: 0,
      label: "Current Load",
      type: "number",
    },
    {
      name: "isActive",
      admin: {
        position: "sidebar",
      },
      defaultValue: true,
      label: "Active",
      type: "checkbox",
    },
  ],

  labels: { plural: "Delivery Origins", singular: "Delivery Origin" },
  slug: "delivery-origins",
};

export default DeliveryOrigins;
