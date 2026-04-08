import { ImportedSourcePage, buildImportedMetadata } from "../components/imported-source-page";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildImportedMetadata("/bonuses");
}

export default async function BonusesPage() {
  return <ImportedSourcePage sourcePath="/bonuses" route="bonuses" />;
}
