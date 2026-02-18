import type { CollectionConfig } from "payload";
import { getPayload } from "payload";
import config from "@payload-config";

import { admins } from "../utils/access/admins";
import { checkRole } from "../utils/access/checkRole";

const Orders: CollectionConfig = {
  access: {
    create: ({ req: { user } }) => checkRole(["user"], user),
    delete: admins,
    read: ({ req }): any => {
      if (!req.user) return false;
      if (req.user) {
        if (checkRole(["admin", "guest"], req.user)) {
          return true;
        }
        if (checkRole(["author"], req.user)) {
          return {
            restaurantID: {
              // @ts-expect-error
              in: req.user.restaurant,
            },
          };
        }
      }
      if (checkRole(["user"], req.user)) {
        return {
          orderedByUser: {
            equals: req.user.id,
          },
        };
      }
      return false;
    },
    update: ({ req }) => {
      if (checkRole(["admin", "author"], req.user)) {
        return true;
      }
      return false;
    },
  },

  admin: {
    defaultColumns: ["dishes", "district", "phoneNumber", "apartment", "houseNumber", "orderStatus", "createdAt"],
    useAsTitle: "id",
  },
  fields: [
    {
      name: "city",
      label: "City",
      required: false,
      type: "text",
      admin: {
        readOnly: true,
      },
    },
    {
      name: "district",
      label: "District",
      required: true,
      type: "text",
      admin: {
        readOnly: true,
      },
    },
    {
      name: "apartment",
      label: "Apartment",
      required: true,
      type: "text",
      admin: {
        readOnly: true,
      },
    },
    {
      name: "houseNumber",
      label: "House number",
      required: true,
      type: "text",
      admin: {
        readOnly: true,
      },
    },
    {
      name: "entrance",
      label: "Entrance",
      required: false,
      type: "text",
      admin: {
        readOnly: true,
      },
    },
    {
      name: "latitude",
      label: "Latitude",
      type: "number",
      admin: {
        readOnly: true,
        position: "sidebar",
      },
    },
    {
      name: "longitude",
      label: "Longitude",
      type: "number",
      admin: {
        readOnly: true,
        position: "sidebar",
      },
    },
    {
      name: "fullAddress",
      label: "Full address",
      type: "text",
      admin: {
        readOnly: true,
      },
    },
    {
      name: "phoneNumber",
      label: "Phone number",
      required: true,
      type: "number",
      admin: {
        readOnly: true,
      },
    },

    {
      name: "orderStatus",
      admin: {
        position: "sidebar",
      },
      access: {
        update: ({ req: { user } }) => {
          if (checkRole(["admin", "author"], user)) {
            return true;
          }
          return false;
        },
      },
      defaultValue: "pending",
      label: "Status ",
      options: [
        {
          label: "Pending",
          value: "pending",
        },
        {
          label: "Recieved",
          value: "recieved",
        },
        {
          label: "Sended",
          value: "sended",
        },
        {
          label: "Delivered",
          value: "delivered",
        },
        {
          label: "Rejected",
          value: "rejected",
        },
      ],
      required: false,
      type: "select",
    },

    {
      name: "totalAmount",
      type: "number",
      label: "Total amount",
      admin: {
        position: "sidebar",
        readOnly: true,
      },
    },
    {
      name: "deliveryPrice",
      label: "Delivery price",
      required: false,
      type: "text",
      admin: {
        position: "sidebar",
        readOnly: true,
      },
    },
    // Shipping integration fields
    {
      name: "shippingQuoteId",
      type: "text",
      admin: {
        description: "Selected shipping quote ID",
      },
    },
    {
      name: "shippingProvider",
      type: "text",
      admin: {
        description: "Provider type (distance, manual, external)",
      },
    },
    {
      name: "shippingBookingId",
      type: "text",
      admin: {
        description: "Booking ID for external providers",
      },
    },
    {
      name: "shippingStatus",
      type: "select",
      defaultValue: "pending",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Quote Selected", value: "quoted" },
        { label: "Pending Manual Price", value: "pending_manual" },
        { label: "Awaiting Customer Response", value: "awaiting_customer_response" },
        { label: "Confirmed", value: "confirmed" },
        { label: "Cancelled (Timeout)", value: "cancelled_timeout" },
        { label: "Cancelled by Customer", value: "cancelled_by_customer" },
        { label: "In Progress", value: "in_progress" },
        { label: "Delivered", value: "delivered" },
      ],
      admin: {
        description: "Shipping lifecycle status",
      },
    },
    {
      name: "scheduledDeliveryTime",
      type: "date",
      admin: {
        date: { pickerAppearance: "dayAndTime" },
        description: "Scheduled delivery time (if not ASAP)",
      },
    },
    {
      name: "deliveryOriginId",
      type: "text",
      admin: {
        description: "Which delivery origin fulfilled this order",
      },
    },
    {
      name: "restaurantName",
      type: "text",
      label: "Restaurant name",
      admin: {
        position: "sidebar",
        readOnly: true,
      },
    },
    {
      name: "commentToCourier",
      label: "Comment to courier",
      required: false,
      type: "text",
      admin: {
        position: "sidebar",
        readOnly: true,
      },
    },
    {
      name: "commentToRestaurant",
      label: "Comment to restaurant",
      required: false,
      type: "text",
      admin: {
        position: "sidebar",
        readOnly: true,
      },
    },
    {
      name: "isDelivery",
      label: "Is delivery available? ",
      required: true,
      admin: {
        position: "sidebar",
        readOnly: true,
      },
      type: "checkbox",
    },
    {
      name: "dishes",
      fields: [
        {
          name: "dish",
          label: "Dish",
          relationTo: "dishes",
          type: "relationship",
        },
        {
          name: "quantity",
          type: "number",
        },
      ],
      label: "Order",
      type: "array",
      admin: {
        readOnly: true,
      },
    },
    {
      name: "restaurantID",
      label: "Restaurant ID ",
      required: true,
      type: "text",
      admin: {
        readOnly: true,
      },
    },
    {
      name: "orderedByUser",
      label: "User ID",
      required: true,
      type: "text",
      admin: {
        readOnly: true,
      },
    },
  ],
  labels: { plural: "Orders", singular: "Order" },
  slug: "orders",
  timestamps: true,
  hooks: {
    beforeChange: [
      async ({ data, req, originalDoc, operation }) => {
        const { restaurantID, dishes } = data;

        if (operation === "create") {
          const now = new Date();
          const hourAgo = new Date(now.getTime() - 60 * 1000);

          const recentOrders = await req.payload.find({
            collection: "orders",
            where: {
              orderedByUser: { equals: req.user?.id },
              createdAt: { greater_than: hourAgo },
            },
            limit: 0,
            depth: 0,
          });
          // user cannot order more than 3 orders per hour
          if (recentOrders.totalDocs >= 3) {
            throw new Error("You are ordering to much. Please wait...");
          }
        }

        //if changes appear in admin panel, change only orderStatus, and return data
        if (checkRole(["author", "admin"], req.user)) {
          if (originalDoc.orderStatus === "delivered") {
            return originalDoc;
          }
          return data;
        }

        if (!restaurantID || !dishes || dishes.length === 0) {
          return data;
        }

        // The user can change the values in localStorage so we need validate order (by id) to show the right amount information
        const [restaurantResult, foundDishes] = await Promise.all([
          req.payload.find({
            collection: "restaurants",
            where: { _id: { equals: restaurantID } },
          }),
          req.payload.find({
            collection: "dishes",
            where: {
              _id: { in: dishes.map((d: any) => d.id) },
              restaurant: { equals: restaurantID },
            },
          }),
        ]);

        const restaurant = restaurantResult.docs[0];
        if (!restaurant) {
          throw new Error("Something went wrong. Restaurant not found.");
        }

        if (!foundDishes.docs.length) {
          throw new Error("Something went wrong. The selected dishes were not found.");
        }

        let totalAmount = 0;

        //Even if user changes the data in localStorage and sends the incorrect data, we validate it here by dishes id
        const findAndCountDishes = foundDishes.docs.map((dish) => {
          const quantity = dishes.find((d: any) => d.id === dish.id)?.quantity || 1;
          totalAmount += dish.price * quantity;
          return { dish: dish.id, quantity };
        });

        // Default delivery price calculation (backward compatibility)
        const defaultDeliveryPrice = totalAmount > (restaurant.freeAfterAmount || 0) ? 0 : restaurant.deliveryPrice;

        data.dishes = findAndCountDishes;
        data.totalAmount = totalAmount;
        data.restaurantName = restaurant.title || "Restaurant name not found...";

        // If shippingQuoteId is provided, validate and use quote price
        if (data.shippingQuoteId) {
          const payload = await getPayload({ config });
          const quote = await payload.find({
            collection: "shipping-quotes",
            where: { quoteId: { equals: data.shippingQuoteId } },
            limit: 1,
          });

          if (quote.docs.length > 0) {
            const quoteData = quote.docs[0];

            // Check quote not expired
            if (new Date(quoteData.validUntil) < new Date()) {
              throw new Error("Shipping quote has expired");
            }

            // Use quote price (unless it's manual pending with -1)
            if (quoteData.price >= 0) {
              data.deliveryPrice = quoteData.price;
            } else {
              // Manual pending - keep default or set to null
              data.deliveryPrice = null;
            }

            // Set shipping status based on provider type
            if (quoteData.providerId === "manual" || quoteData.providerType === "manual") {
              data.shippingStatus = quoteData.price === -1 ? "pending_manual" : "quoted";
            } else {
              data.shippingStatus = "quoted";
            }

            data.shippingProvider = quoteData.providerId;
          } else {
            // Quote not found - use default pricing
            data.deliveryPrice = defaultDeliveryPrice;
          }
        } else {
          // No shipping quote - use default pricing (backward compatibility)
          data.deliveryPrice = defaultDeliveryPrice;
        }
      },
    ],
  },
};

export default Orders;
