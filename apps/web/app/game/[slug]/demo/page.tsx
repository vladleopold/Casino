import { headers } from "next/headers";
import { notFound } from "next/navigation";

import {
  adaptDemoUrlForDevice,
  getStorefrontGamePage,
  inferDemoDeviceKind
} from "@slotcity/cms-sdk";

export const dynamic = "force-dynamic";

export default async function GameDemoFramePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getStorefrontGamePage(slug);
  const deviceKind = inferDemoDeviceKind((await headers()).get("user-agent"));
  const demoSourceUrl = adaptDemoUrlForDevice(page?.launch.demoSourceUrl, deviceKind);

  if (!page?.launch.demoSourceUrl || !demoSourceUrl) {
    notFound();
  }

  return (
    <main className="slotcity-game-demo-frame">
      <iframe
        src={demoSourceUrl}
        title={`${page.name} demo`}
        loading="eager"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </main>
  );
}
