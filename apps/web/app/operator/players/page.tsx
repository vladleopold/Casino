import { notFound, redirect } from "next/navigation";

import { FinancePlayersPanel } from "../../components/finance-players-panel";
import { isOpsApp } from "../../../lib/app-kind";
import { getOpsAdminSession } from "../../../lib/auth/ops-session";

export default async function OperatorPlayersPage() {
  if (!isOpsApp()) {
    notFound();
  }

  const session = await getOpsAdminSession();

  if (!session?.email) {
    redirect("/login");
  }

  return (
    <FinancePlayersPanel
      operator={{
        email: session.email,
        role: session.role
      }}
    />
  );
}
