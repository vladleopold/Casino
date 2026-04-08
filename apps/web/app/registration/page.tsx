import { ImportedSourcePage, buildImportedMetadata } from "../components/imported-source-page";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildImportedMetadata("/registration");
}

export default async function RegistrationPage() {
  return <ImportedSourcePage sourcePath="/registration" route="registration" />;
}
