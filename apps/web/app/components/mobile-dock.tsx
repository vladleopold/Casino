import { Suspense } from "react";

import { getHomeRouteContent } from "@slotcity/cms-sdk";

import { MobileDockClient } from "./mobile-dock-client";

export async function MobileDock() {
  const { mobileDockItems } = await getHomeRouteContent();

  return (
    <Suspense fallback={<div className="slotcity-mobile-dock" />}>
      <MobileDockClient items={mobileDockItems} />
    </Suspense>
  );
}
