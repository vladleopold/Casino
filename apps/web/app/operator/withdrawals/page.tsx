import { notFound, redirect } from "next/navigation";

import { WithdrawalsDashboard } from "../../components/withdrawals-dashboard";
import { isOpsApp } from "../../../lib/app-kind";
import { getOpsAdminSession } from "../../../lib/auth/ops-session";

export default async function OperatorWithdrawalsPage() {
  if (!isOpsApp()) {
    notFound();
  }

  const session = await getOpsAdminSession();

  if (!session?.email) {
    redirect("/login");
  }

  return (
    <WithdrawalsDashboard
      operator={{
        email: session.email,
        role: session.role
      }}
    />
  );
}
