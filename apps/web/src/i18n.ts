import { getRequestConfig } from "next-intl/server";

export const routing = {
  locales: ["uk", "en", "ru", "it"],
  defaultLocale: "uk"
};

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = locale || routing.defaultLocale;

  return {
    locale: resolvedLocale,
    messages: (await import(`./messages/${resolvedLocale}.json`)).default
  };
});
