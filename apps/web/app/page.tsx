import { ImportedSourcePage, buildImportedMetadata } from "./components/imported-source-page";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildImportedMetadata("/");
}

export default async function HomePage() {
  return <ImportedSourcePage sourcePath="/" route="home" />;
}
