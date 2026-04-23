"use client";

export type FinanceOpsSidebarKey = "payments" | "withdrawals" | "players" | "users";

const NAV_SECTIONS: Array<{
  label: string;
  items: Array<{
    key: FinanceOpsSidebarKey;
    label: string;
    icon: string;
    href: string;
  }>;
}> = [
  {
    label: "Overview",
    items: [
      {
        key: "payments",
        label: "Payments",
        icon: "₴",
        href: "/operator/payments"
      },
      {
        key: "withdrawals",
        label: "Withdrawals",
        icon: "⇅",
        href: "/operator/withdrawals"
      }
    ]
  },
  {
    label: "Players",
    items: [
      {
        key: "players",
        label: "Player Control",
        icon: "◉",
        href: "/operator/players"
      }
    ]
  },
  {
    label: "System",
    items: [
      {
        key: "users",
        label: "Admin Access",
        icon: "◎",
        href: "/operator/users"
      }
    ]
  }
];

export function FinanceOpsSidebar({
  operator,
  active
}: {
  operator: {
    email: string;
    role: "super_admin" | "admin";
  };
  active: FinanceOpsSidebarKey;
}) {
  return (
    <aside className="slotcity-wallet-sidebar">
      <div className="slotcity-wallet-brand">
        <strong>CASINO</strong>
        <span>OPS</span>
        <b className="slotcity-wallet-brand-live">LIVE</b>
      </div>

      <div className="slotcity-wallet-nav">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="slotcity-wallet-sidebar-section">
            <span className="slotcity-wallet-sidebar-head">{section.label}</span>
            {section.items.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className={`slotcity-wallet-nav-item${item.key === active ? " is-active" : ""}`}
              >
                <i>{item.icon}</i>
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        ))}
      </div>

      <div className="slotcity-wallet-support">
        <strong>Google-only auth</strong>
        <span>Server ledger protected</span>
      </div>

      <div className="slotcity-wallet-admin">
        <div className="slotcity-wallet-admin-avatar">
          {(operator.email.slice(0, 1) || "A").toUpperCase()}
        </div>
        <div>
          <strong>{operator.email}</strong>
          <span>{operator.role}</span>
        </div>
      </div>

      <button
        type="button"
        className="slotcity-cta slotcity-cta-secondary"
        onClick={() => {
          window.location.assign("/api/ops/session/logout");
        }}
      >
        Вийти
      </button>
    </aside>
  );
}
