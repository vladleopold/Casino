import createMiddleware from "next-intl/middleware";
import { routing } from "./apps/web/src/i18n";

export default createMiddleware(routing);

export const config = {
  matcher: [
    "/",
    "/(uk|en|ru|it)/:path*",
    "/((?!_next|_vercel|.*\\..*).*)",
  ],
};
