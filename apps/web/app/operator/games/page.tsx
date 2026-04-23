import { redirect, notFound } from "next/navigation";

import { isOpsApp } from "../../../lib/app-kind";
import { getOpsAdminSession } from "../../../lib/auth/ops-session";
import GamesDashboard from "../../components/games-dashboard";

export default async function OperatorGamesPage() {
  if (!isOpsApp()) {
    notFound();
  }

  const session = await getOpsAdminSession();

  if (!session?.email) {
    redirect("/login");
  }

  return (
    <GamesDashboard
      operator={{
        email: session.email,
        role: session.role
      }}
    />
  );
}
