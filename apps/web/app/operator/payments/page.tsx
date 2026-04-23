import { redirect, notFound } from "next/navigation";

import { isOpsApp } from "../../../lib/app-kind";
import { getOpsAdminSession } from "../../../lib/auth/ops-session";
import { PaymentsDashboard } from "../../components/payments-dashboard";

export default async function OperatorPaymentsPage() {
  if (!isOpsApp()) {
    notFound();
  }

  const session = await getOpsAdminSession();

  if (!session?.email) {
    redirect("/login");
  }

  return (
    <PaymentsDashboard
      operator={{
        email: session.email,
        role: session.role
      }}
    />
  );
}
