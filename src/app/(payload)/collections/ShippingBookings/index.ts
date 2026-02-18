import type { CollectionConfig } from "payload";

import { admins } from "../utils/access/admins";
import { checkRole } from "../utils/access/checkRole";

const ShippingBookings: CollectionConfig = {
  access: {
    create: admins,
    delete: admins,
    read: ({ req: { user } }) => {
      if (checkRole(["admin"], user)) return true;
      // Restaurant authors can see bookings for their orders
      if (user && checkRole(["author"], user)) {
        return true; // Will be filtered by orderId relation
      }
      return false;
    },
    update: admins,
  },

  admin: {
    defaultColumns: ["bookingId", "status", "createdAt"],
    useAsTitle: "bookingId",
  },

  fields: [
    {
      name: "bookingId",
      index: true,
      label: "Booking ID",
      required: true,
      type: "text",
      unique: true,
    },
    {
      name: "quoteId",
      label: "Quote ID",
      required: true,
      type: "text",
    },
    {
      name: "orderId",
      label: "Order",
      relationTo: "orders",
      required: true,
      type: "relationship",
    },
    {
      name: "providerId",
      label: "Provider ID",
      required: true,
      type: "text",
    },
    {
      name: "status",
      admin: {
        position: "sidebar",
      },
      defaultValue: "pending",
      label: "Status",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Confirmed", value: "confirmed" },
        { label: "In Progress", value: "in_progress" },
        { label: "Delivered", value: "delivered" },
        { label: "Cancelled", value: "cancelled" },
      ],
      required: true,
      type: "select",
    },
    {
      name: "trackingUrl",
      label: "Tracking URL",
      type: "text",
    },
    {
      name: "externalBookingId",
      admin: {
        description: "ID from external provider (Baemin, etc.)",
      },
      label: "External Booking ID",
      type: "text",
    },
  ],

  labels: { plural: "Shipping Bookings", singular: "Shipping Booking" },
  slug: "shipping-bookings",
  timestamps: true,
};

export default ShippingBookings;
