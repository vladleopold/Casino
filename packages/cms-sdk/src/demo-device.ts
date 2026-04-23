import type { StorefrontGameLaunchContent } from "./types";

export type DemoDeviceKind = "desktop" | "mobile";

export function inferDemoDeviceKind(userAgent?: string | null): DemoDeviceKind {
  if (!userAgent) {
    return "desktop";
  }

  return /android|iphone|ipad|ipod|mobile|iemobile|opera mini/i.test(userAgent)
    ? "mobile"
    : "desktop";
}

function replaceDeviceValue(value: string, device: DemoDeviceKind) {
  const isUppercase = value === value.toUpperCase();

  if (device === "mobile") {
    return isUppercase ? "MOBILE" : "mobile";
  }

  return isUppercase ? "DESKTOP" : "desktop";
}

export function adaptDemoUrlForDevice(
  url?: string,
  device: DemoDeviceKind = "desktop"
) {
  if (!url) {
    return undefined;
  }

  if (device === "desktop") {
    return url;
  }

  try {
    const parsed = new URL(url);

    for (const key of ["platform", "device", "ClientType", "clientType", "view"]) {
      const current = parsed.searchParams.get(key);

      if (current && /desktop/i.test(current)) {
        parsed.searchParams.set(key, replaceDeviceValue(current, device));
      }
    }

    return parsed.toString();
  } catch {
    return url
      .replace(/([?&]platform=)desktop\b/i, "$1mobile")
      .replace(/([?&]device=)DESKTOP\b/g, "$1MOBILE")
      .replace(/([?&]device=)desktop\b/g, "$1mobile")
      .replace(/([?&]ClientType=)desktop\b/g, "$1mobile")
      .replace(/([?&]clientType=)desktop\b/g, "$1mobile")
      .replace(/([?&]view=)desktop\b/g, "$1mobile");
  }
}

export function adaptGameLaunchForDevice(
  launch: StorefrontGameLaunchContent,
  device: DemoDeviceKind = "desktop"
): StorefrontGameLaunchContent {
  if (device === "desktop") {
    return launch;
  }

  return {
    ...launch,
    launchUrl: adaptDemoUrlForDevice(launch.launchUrl, device),
    demoSourceUrl: adaptDemoUrlForDevice(launch.demoSourceUrl, device)
  };
}
