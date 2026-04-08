import { ImportedSourcePage, buildImportedMetadata } from "../components/imported-source-page";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildImportedMetadata("/casino");
}

export default async function CasinoPage() {
  return <ImportedSourcePage sourcePath="/casino" route="catalog" />;
}
