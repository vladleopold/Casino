import { ImportedSourcePage, buildImportedMetadata } from "../components/imported-source-page";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildImportedMetadata("/promotions");
}

export default async function PromotionsPage() {
  return <ImportedSourcePage sourcePath="/promotions" route="promotions" />;
}
