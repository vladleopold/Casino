import { ImportedSourcePage, buildImportedMetadata } from "../components/imported-source-page";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;

  return buildImportedMetadata(`/${slug.join("/")}`);
}

export default async function CatchAllPage({
  params
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;

  return <ImportedSourcePage sourcePath={`/${slug.join("/")}`} />;
}
