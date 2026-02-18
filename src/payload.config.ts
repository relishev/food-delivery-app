// storage-adapter-import-placeholder
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { payloadCloudPlugin } from "@payloadcms/payload-cloud";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

import Categories from "./app/(payload)/collections/Categories";
import Cities from "./app/(payload)/collections/Cities";
import Customers from "./app/(payload)/collections/Customers";
import Dishes from "./app/(payload)/collections/Dishes";
import FeedbackAndCooperations from "./app/(payload)/collections/FeedbackAndCooperations";
import Media from "./app/(payload)/collections/Media";
import Orders from "./app/(payload)/collections/Orders";
import Restaurants from "./app/(payload)/collections/Restaurants";
import Users from "./app/(payload)/collections/Users";
import DeliveryOrigins from "./app/(payload)/collections/DeliveryOrigins";
import DistanceTiers from "./app/(payload)/collections/DistanceTiers";
import ShippingProviders from "./app/(payload)/collections/ShippingProviders";
import ShippingQuotes from "./app/(payload)/collections/ShippingQuotes";
import ShippingBookings from "./app/(payload)/collections/ShippingBookings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Customers.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  cookiePrefix: "foody7",
  collections: [
    Restaurants,
    Orders,
    Dishes,
    Cities,
    Users,
    Customers,
    Media,
    Categories,
    FeedbackAndCooperations,
    // Shipping collections
    DeliveryOrigins,
    DistanceTiers,
    ShippingProviders,
    ShippingQuotes,
    ShippingBookings,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || "",
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
});
