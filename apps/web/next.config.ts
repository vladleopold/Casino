import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  transpilePackages: [
    "@slotcity/analytics-schema",
    "@slotcity/cms-sdk",
    "@slotcity/config",
    "@slotcity/flags-sdk",
    "@slotcity/theme",
    "@slotcity/tracking",
    "@slotcity/ui"
  ]
};

export default withNextIntl(nextConfig);
