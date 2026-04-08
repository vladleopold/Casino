import { ImportedSourcePage, buildImportedMetadata } from "../components/imported-source-page";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildImportedMetadata("/promotions/city-vip");
}

export default async function VipPage() {
  return <ImportedSourcePage sourcePath="/promotions/city-vip" route="vip" />;
}
