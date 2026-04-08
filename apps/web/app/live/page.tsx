import { ImportedSourcePage, buildImportedMetadata } from "../components/imported-source-page";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildImportedMetadata("/live");
}

export default async function LivePage() {
  return <ImportedSourcePage sourcePath="/live" route="live" />;
}
