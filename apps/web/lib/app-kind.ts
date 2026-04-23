export type SlotCityAppKind = "public" | "ops";

const APP_KIND: SlotCityAppKind =
  process.env.NEXT_PUBLIC_APP_KIND?.trim().toLowerCase() === "ops" ? "ops" : "public";

export function getAppKind() {
  return APP_KIND;
}

export function isOpsApp() {
  return APP_KIND === "ops";
}

export function isPublicApp() {
  return APP_KIND === "public";
}
