import type { NextConfig } from "next";

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

export default nextConfig;
