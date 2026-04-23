import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { isOpsApp } from "../../lib/app-kind";
import { authOptions } from "../../lib/auth/options";
import { FinanceOpsLogin } from "../components/finance-ops-login";

export default async function LoginPage() {
  if (!isOpsApp()) {
    redirect("/registration?mode=login");
  }

  const session = await getServerSession(authOptions);

  if (session?.user?.email) {
    redirect("/operator/payments");
  }

  return <FinanceOpsLogin />;
}
