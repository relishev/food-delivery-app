import { withPayload } from "@payloadcms/next/withPayload";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Transpile @turf packages for server-side usage
  transpilePackages: ['@turf/turf', '@turf/distance', '@turf/helpers'],
};

export default withNextIntl(withPayload(nextConfig));
