import { LayoutShell } from "../../../components/layout-shell";
import { MobileDock } from "../../../components/mobile-dock";
import { ActivityDashboard } from "../../../components/activity-dashboard";

export default function OperatorActivityPage() {
  return (
    <LayoutShell route="operator">
      <main className="slotcity-home slotcity-route-page slotcity-operator-page">
        <div className="slotcity-page-glow slotcity-page-glow-green" />
        <div className="slotcity-page-glow slotcity-page-glow-gold" />
        <ActivityDashboard />
        <MobileDock />
      </main>
    </LayoutShell>
  );
}
