import { notFound } from "next/navigation";

import { getStorefrontGamePage } from "@slotcity/cms-sdk";

export const dynamic = "force-dynamic";

export default async function GameDemoFramePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getStorefrontGamePage(slug);

  if (!page?.launch.demoSourceUrl) {
    notFound();
  }

  return (
    <main className="slotcity-game-demo-frame">
      <iframe
        src={page.launch.demoSourceUrl}
        title={`${page.name} demo`}
        loading="eager"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </main>
  );
}
