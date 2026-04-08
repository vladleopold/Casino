import { ImportedSourcePage, buildImportedMetadata } from "../components/imported-source-page";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildImportedMetadata("/all-games");
}

export default async function CatalogPage() {
  return <ImportedSourcePage sourcePath="/all-games" route="catalog" />;
}
