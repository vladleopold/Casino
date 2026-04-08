import { ImportedSourcePage, buildImportedMetadata } from "../components/imported-source-page";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildImportedMetadata("/tournaments");
}

export default async function TournamentsPage() {
  return <ImportedSourcePage sourcePath="/tournaments" route="tournaments" />;
}
