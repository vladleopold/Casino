import { ImportedSourcePage, buildImportedMetadata } from "../../components/imported-source-page";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return buildImportedMetadata(`/promotions/${slug}`);
}

export default async function PromotionDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <ImportedSourcePage sourcePath={`/promotions/${slug}`} route="promotions" />;
}
