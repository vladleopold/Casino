"use client";

import { useEffect, useState } from "react";
import { FinanceOpsSidebar } from "./finance-ops-sidebar";

type FinanceAdminUser = {
  adminId: string;
  email: string;
  role: "super_admin" | "admin";
  status: "active";
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function FinanceAdminUsersPanel({
  operator
}: {
  operator: {
    email: string;
    role: "super_admin" | "admin";
  };
}) {
  const [admins, setAdmins] = useState<FinanceAdminUser[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<FinanceAdminUser["role"]>("admin");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/operator/admin-users", {
        cache: "no-store"
      });
      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; admins?: FinanceAdminUser[]; message?: string }
        | null;

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.message ?? "Не вдалося завантажити список адміністраторів.");
      }

      setAdmins(payload.admins ?? []);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Не вдалося завантажити список адміністраторів."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleAdd = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/operator/admin-users", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          email,
          role
        })
      });
      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; message?: string }
        | null;

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.message ?? "Не вдалося додати Google-пошту.");
      }

      setEmail("");
      setRole("admin");
      await load();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Не вдалося додати Google-пошту.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (targetEmail: string) => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/operator/admin-users", {
        method: "DELETE",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          email: targetEmail
        })
      });
      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; message?: string }
        | null;

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.message ?? "Не вдалося видалити Google-пошту.");
      }

      await load();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Не вдалося видалити Google-пошту.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="slotcity-wallet-shell">
      <FinanceOpsSidebar operator={operator} active="users" />

      <div className="slotcity-wallet-main">
        <header className="slotcity-wallet-topbar">
          <div>
            <h1>Admin Access</h1>
            <p>Google allowlist management</p>
          </div>
        </header>

        {error ? <div className="slotcity-registration-error">{error}</div> : null}

        <section className="slotcity-wallet-stat-row">
          <article className="slotcity-wallet-metric-card is-green">
            <div className="slotcity-wallet-metric-head">
              <span>Allowed Emails</span>
              <i className="slotcity-wallet-metric-icon">◎</i>
            </div>
            <strong>{admins.length}</strong>
            <small className="slotcity-wallet-metric-foot">LIVE</small>
          </article>
          <article className="slotcity-wallet-metric-card is-gold">
            <div className="slotcity-wallet-metric-head">
              <span>Super Admins</span>
              <i className="slotcity-wallet-metric-icon">★</i>
            </div>
            <strong>{admins.filter((admin) => admin.role === "super_admin").length}</strong>
            <small className="slotcity-wallet-metric-foot">Protected access</small>
          </article>
          <article className="slotcity-wallet-metric-card is-neutral">
            <div className="slotcity-wallet-metric-head">
              <span>Admins</span>
              <i className="slotcity-wallet-metric-icon">●</i>
            </div>
            <strong>{admins.filter((admin) => admin.role === "admin").length}</strong>
            <small className="slotcity-wallet-metric-foot">Can add / remove emails</small>
          </article>
        </section>

        <div className="slotcity-wallet-board">
          <div className="slotcity-wallet-column">
            <article className="slotcity-wallet-card">
              <div className="slotcity-wallet-card-toolbar">
                <div>
                  <span className="slotcity-wallet-kicker">SETTINGS</span>
                  <h2>Додати нову Google-пошту</h2>
                </div>
              </div>

              <div className="slotcity-wallet-inline-form">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@company.com"
                />
                <select value={role} onChange={(event) => setRole(event.target.value as FinanceAdminUser["role"])}>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                <button
                  type="button"
                  className="slotcity-cta slotcity-cta-primary"
                  disabled={!email || isSaving}
                  onClick={() => {
                    void handleAdd();
                  }}
                >
                  Додати
                </button>
              </div>
            </article>

            <article className="slotcity-wallet-card slotcity-wallet-card-table">
              <div className="slotcity-wallet-card-toolbar">
                <div>
                  <span className="slotcity-wallet-kicker">ALLOWLIST</span>
                  <h2>Керування доступом</h2>
                </div>
              </div>

              {isLoading ? <p className="slotcity-wallet-empty-copy">Завантаження адміністраторів...</p> : null}

              <div className="slotcity-payments-list">
                {admins.map((admin) => (
                  <article key={admin.adminId} className="slotcity-payment-row">
                    <div>
                      <strong>{admin.email}</strong>
                      <p>
                        {admin.role} · {admin.status}
                      </p>
                      <small>
                        Додано: {formatDate(admin.createdAt)}
                        {admin.createdBy ? ` · by ${admin.createdBy}` : ""}
                      </small>
                    </div>
                    <div className="slotcity-payment-row-actions">
                      {admin.role === "super_admin" ? (
                        <span className="slotcity-payment-status is-posted">protected</span>
                      ) : (
                        <button
                          type="button"
                          className="slotcity-cta slotcity-cta-secondary"
                          disabled={isSaving}
                          onClick={() => {
                            void handleRemove(admin.email);
                          }}
                        >
                          Видалити
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
