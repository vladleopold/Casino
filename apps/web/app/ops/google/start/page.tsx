import { notFound } from "next/navigation";

import { isOpsApp } from "../../../../lib/app-kind";
import { getPublicSiteUrl, sanitizeRelativePath } from "../../../../lib/site-urls";
import { OpsGoogleBridgeStart } from "../../../components/ops-google-bridge-start";

type OpsGoogleStartPageProps = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

export default async function OpsGoogleStartPage({ searchParams }: OpsGoogleStartPageProps) {
  if (isOpsApp()) {
    notFound();
  }

  const params = searchParams ? await searchParams : undefined;
  const nextPath = sanitizeRelativePath(params?.next, "/operator/payments");
  const callbackUrl = `${getPublicSiteUrl()}/api/ops/google/bridge?next=${encodeURIComponent(nextPath)}`;

  return <OpsGoogleBridgeStart callbackUrl={callbackUrl} />;
}
