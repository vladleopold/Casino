import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";

import { isOpsApp } from "../../../lib/app-kind";
import { authOptions } from "../../../lib/auth/options";
import { hasFinanceAdminAccess } from "../../../lib/auth/finance-admin";
import { FinanceAdminUsersPanel } from "../../components/finance-admin-users-panel";

export default async function OperatorUsersPage() {
  if (!isOpsApp()) {
    notFound();
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  if (!(await hasFinanceAdminAccess(session.user.email))) {
    redirect("/login?error=access_denied");
  }

  return <FinanceAdminUsersPanel />;
}
