import { writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  mockCatalogRouteContent,
  mockHomeRouteContent,
  mockLiveRouteContent,
  mockPromotionsRouteContent,
  mockTournamentsRouteContent,
  mockVipRouteContent
} from "../../../packages/cms-sdk/src/route-content.ts";

const currentDir = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(currentDir, "../seed/route-payloads.json");

const payload = {
  storefront_route_payloads: [
    { slug: "home", payload: mockHomeRouteContent },
    { slug: "catalog", payload: mockCatalogRouteContent },
    { slug: "live", payload: mockLiveRouteContent },
    { slug: "promotions", payload: mockPromotionsRouteContent },
    { slug: "vip", payload: mockVipRouteContent },
    { slug: "tournaments", payload: mockTournamentsRouteContent }
  ]
};

await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

console.log(`Route payload seed written to ${outputPath}`);
