"use client";

import { useEffect, useMemo, useState } from "react";

import { FinanceOpsSidebar } from "./finance-ops-sidebar";

type StorefrontUser = {
  userId: string;
  email: string;
  username: string;
  displayName: string;
  authProvider: string;
  balance: number;
  status: "active" | "blocked";
  isVip: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
  lastSeenAt?: string | null;
};

type DepositRequest = {
  depositId: string;
  userId: string;
  amount: number;
  currency: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  paymentMethod: string;
  paymentProvider: string;
  createdAt: string;
};

type LedgerEntry = {
  entryId: string;
  userId: string;
  entryType: string;
  direction: "credit" | "debit";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  source: string;
  description?: string | null;
  createdAt: string;
};

type PlayerProfile = {
  user: StorefrontUser;
  approvedDepositsAmount: number;
  approvedDepositsCount: number;
  pendingDepositsAmount: number;
  pendingDepositsCount: number;
  recentDeposits: DepositRequest[];
  recentLedger: LedgerEntry[];
};

function formatCurrency(value: number) {
  return `${value.toLocaleString("uk-UA")} ₴`;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Never";
  }

  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function FinancePlayersPanel({
  operator
}: {
  operator: {
    email: string;
    role: "super_admin" | "admin";
  };
}) {
  const [users, setUsers] = useState<StorefrontUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [search, setSearch] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [creditNote, setCreditNote] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadUsers = async (preferredUserId?: string | null) => {
    setIsLoadingUsers(true);
    setError(null);

    try {
      const response = await fetch("/api/operator/players", {
        cache: "no-store"
      });
      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; users?: StorefrontUser[]; message?: string }
        | null;

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.message ?? "Не вдалося завантажити список гравців.");
      }

      const nextUsers = payload.users ?? [];
      setUsers(nextUsers);
      setSelectedUserId((current) => {
        if (preferredUserId && nextUsers.some((user) => user.userId === preferredUserId)) {
          return preferredUserId;
        }

        if (current && nextUsers.some((user) => user.userId === current)) {
          return current;
        }

        return nextUsers[0]?.userId ?? null;
      });
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Не вдалося завантажити список гравців."
      );
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadProfile = async (userId: string) => {
    setIsLoadingProfile(true);
    setError(null);

    try {
      const response = await fetch(`/api/operator/players/${encodeURIComponent(userId)}`, {
        cache: "no-store"
      });
      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; profile?: PlayerProfile; message?: string }
        | null;

      if (!response.ok || !payload?.ok || !payload.profile) {
        throw new Error(payload?.message ?? "Не вдалося завантажити профіль гравця.");
      }

      setProfile(payload.profile);
    } catch (nextError) {
      setProfile(null);
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Не вдалося завантажити профіль гравця."
      );
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  useEffect(() => {
    if (!selectedUserId) {
      setProfile(null);
      return;
    }

    void loadProfile(selectedUserId);
  }, [selectedUserId]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) =>
      [user.email, user.username, user.displayName, user.userId].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [search, users]);

  const counts = useMemo(
    () => ({
      total: users.length,
      blocked: users.filter((user) => user.status === "blocked").length,
      vip: users.filter((user) => user.isVip).length
    }),
    [users]
  );

  const runMutation = async (
    request: () => Promise<Response>,
    successMessage?: {
      resetCredit?: boolean;
      resetPassword?: boolean;
    }
  ) => {
    if (!selectedUserId) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await request();
      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; message?: string }
        | null;

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.message ?? "Не вдалося виконати дію.");
      }

      if (successMessage?.resetCredit) {
        setCreditAmount("");
        setCreditNote("");
      }

      if (successMessage?.resetPassword) {
        setNextPassword("");
      }

      await Promise.all([loadUsers(selectedUserId), loadProfile(selectedUserId)]);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Не вдалося виконати дію.");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedUser = profile?.user ?? users.find((user) => user.userId === selectedUserId) ?? null;

  return (
    <section className="slotcity-wallet-shell">
      <FinanceOpsSidebar operator={operator} active="players" />

      <div className="slotcity-wallet-main">
        <header className="slotcity-wallet-topbar">
          <div>
            <h1>Players</h1>
            <p>Balance tools, VIP state and account controls</p>
          </div>
        </header>

        {error ? <div className="slotcity-registration-error">{error}</div> : null}

        <section className="slotcity-wallet-stat-row">
          <article className="slotcity-wallet-metric-card is-green">
            <div className="slotcity-wallet-metric-head">
              <span>Total players</span>
              <i className="slotcity-wallet-metric-icon">◉</i>
            </div>
            <strong>{counts.total}</strong>
            <small className="slotcity-wallet-metric-foot">Auth storage</small>
          </article>
          <article className="slotcity-wallet-metric-card is-gold">
            <div className="slotcity-wallet-metric-head">
              <span>VIP players</span>
              <i className="slotcity-wallet-metric-icon">★</i>
            </div>
            <strong>{counts.vip}</strong>
            <small className="slotcity-wallet-metric-foot">VIP tag enabled</small>
          </article>
          <article className="slotcity-wallet-metric-card is-red">
            <div className="slotcity-wallet-metric-head">
              <span>Blocked</span>
              <i className="slotcity-wallet-metric-icon">⛔</i>
            </div>
            <strong>{counts.blocked}</strong>
            <small className="slotcity-wallet-metric-foot">Login disabled</small>
          </article>
        </section>

        <div className="slotcity-wallet-board">
          <div className="slotcity-wallet-column">
            <article className="slotcity-wallet-card">
              <div className="slotcity-wallet-card-toolbar">
                <div>
                  <span className="slotcity-wallet-kicker">SEARCH</span>
                  <h2>Вибір гравця</h2>
                </div>
              </div>

              <input
                className="slotcity-wallet-search-input"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Email, username, user id"
              />

              {isLoadingUsers ? (
                <p className="slotcity-wallet-empty-copy">Завантаження списку гравців...</p>
              ) : null}

              <div className="slotcity-wallet-user-list">
                {filteredUsers.map((user) => (
                  <button
                    key={user.userId}
                    type="button"
                    className={`slotcity-wallet-user-item${user.userId === selectedUserId ? " is-selected" : ""}`}
                    onClick={() => {
                      setSelectedUserId(user.userId);
                    }}
                  >
                    <div>
                      <strong>{user.displayName}</strong>
                      <span>{user.email}</span>
                    </div>
                    <div className="slotcity-wallet-user-meta">
                      <em>{formatCurrency(user.balance)}</em>
                      <small>{user.isVip ? "VIP" : user.status}</small>
                    </div>
                  </button>
                ))}
              </div>
            </article>
          </div>

          <div className="slotcity-wallet-column slotcity-wallet-column-wide">
            <article className="slotcity-wallet-card">
              <div className="slotcity-wallet-card-toolbar">
                <div>
                  <span className="slotcity-wallet-kicker">PROFILE</span>
                  <h2>{selectedUser?.displayName ?? "Гравця не вибрано"}</h2>
                </div>
              </div>

              {isLoadingProfile ? (
                <p className="slotcity-wallet-empty-copy">Завантаження профілю...</p>
              ) : selectedUser && profile ? (
                <>
                  <div className="slotcity-wallet-player-card">
                    <div className="slotcity-wallet-player-avatar">
                      {selectedUser.displayName.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div className="slotcity-wallet-player-name">
                        <strong>{selectedUser.displayName}</strong>
                        {selectedUser.isVip ? (
                          <span className="slotcity-wallet-player-chip">VIP</span>
                        ) : null}
                        {selectedUser.status === "blocked" ? (
                          <span className="slotcity-wallet-player-chip is-danger">BLOCKED</span>
                        ) : null}
                      </div>
                      <span>{selectedUser.email}</span>
                      <small>
                        ID: {selectedUser.userId} · Created: {formatDate(selectedUser.createdAt)}
                      </small>
                    </div>
                  </div>

                  <div className="slotcity-wallet-player-stats">
                    <div>
                      <span>Balance</span>
                      <strong>{formatCurrency(selectedUser.balance)}</strong>
                    </div>
                    <div>
                      <span>Approved deposits</span>
                      <strong>{formatCurrency(profile.approvedDepositsAmount)}</strong>
                    </div>
                    <div>
                      <span>Pending deposits</span>
                      <strong>{formatCurrency(profile.pendingDepositsAmount)}</strong>
                    </div>
                  </div>

                  <div className="slotcity-wallet-player-grid">
                    <article className="slotcity-wallet-action-card">
                      <span className="slotcity-wallet-kicker">BALANCE</span>
                      <h3>Ручне нарахування</h3>
                      <div className="slotcity-wallet-form-grid">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={creditAmount}
                          onChange={(event) => setCreditAmount(event.target.value)}
                          placeholder="Сума в ₴"
                        />
                        <textarea
                          value={creditNote}
                          onChange={(event) => setCreditNote(event.target.value)}
                          placeholder="Примітка оператора"
                          rows={3}
                        />
                      </div>
                      <button
                        type="button"
                        className="slotcity-cta slotcity-cta-primary"
                        disabled={isSaving || !creditAmount || Number(creditAmount) <= 0}
                        onClick={() => {
                          void runMutation(
                            () =>
                              fetch(
                                `/api/operator/players/${encodeURIComponent(selectedUser.userId)}/manual-credit`,
                                {
                                  method: "POST",
                                  headers: {
                                    "content-type": "application/json"
                                  },
                                  body: JSON.stringify({
                                    amount: Number(creditAmount),
                                    note: creditNote
                                  })
                                }
                              ),
                            {
                              resetCredit: true
                            }
                          );
                        }}
                      >
                        Нарахувати гроші
                      </button>
                    </article>

                    <article className="slotcity-wallet-action-card">
                      <span className="slotcity-wallet-kicker">ACCOUNT</span>
                      <h3>Статус гравця</h3>
                      <div className="slotcity-wallet-action-stack">
                        <button
                          type="button"
                          className={`slotcity-wallet-action${selectedUser.status === "blocked" ? " blue" : " danger"}`}
                          disabled={isSaving}
                          onClick={() => {
                            void runMutation(() =>
                              fetch(`/api/operator/players/${encodeURIComponent(selectedUser.userId)}`, {
                                method: "PATCH",
                                headers: {
                                  "content-type": "application/json"
                                },
                                body: JSON.stringify({
                                  status: selectedUser.status === "blocked" ? "active" : "blocked"
                                })
                              })
                            );
                          }}
                        >
                          {selectedUser.status === "blocked" ? "Розблокувати" : "Заблокувати"}
                        </button>
                        <button
                          type="button"
                          className={`slotcity-wallet-action${selectedUser.isVip ? "" : " gold"}`}
                          disabled={isSaving}
                          onClick={() => {
                            void runMutation(() =>
                              fetch(`/api/operator/players/${encodeURIComponent(selectedUser.userId)}`, {
                                method: "PATCH",
                                headers: {
                                  "content-type": "application/json"
                                },
                                body: JSON.stringify({
                                  isVip: !selectedUser.isVip
                                })
                              })
                            );
                          }}
                        >
                          {selectedUser.isVip ? "Зняти VIP" : "Зробити VIP"}
                        </button>
                      </div>
                    </article>

                    <article className="slotcity-wallet-action-card">
                      <span className="slotcity-wallet-kicker">SECURITY</span>
                      <h3>Змінити пароль</h3>
                      <div className="slotcity-wallet-form-grid">
                        <input
                          type="password"
                          value={nextPassword}
                          onChange={(event) => setNextPassword(event.target.value)}
                          placeholder="Новий пароль"
                        />
                      </div>
                      <button
                        type="button"
                        className="slotcity-cta slotcity-cta-secondary"
                        disabled={isSaving || nextPassword.trim().length < 8}
                        onClick={() => {
                          void runMutation(
                            () =>
                              fetch(`/api/operator/players/${encodeURIComponent(selectedUser.userId)}`, {
                                method: "PATCH",
                                headers: {
                                  "content-type": "application/json"
                                },
                                body: JSON.stringify({
                                  password: nextPassword
                                })
                              }),
                            {
                              resetPassword: true
                            }
                          );
                        }}
                      >
                        Зберегти пароль
                      </button>
                    </article>
                  </div>
                </>
              ) : (
                <p className="slotcity-wallet-empty-copy">
                  Виберіть гравця ліворуч, щоб побачити баланс, проводки та admin-дії.
                </p>
              )}
            </article>

            {profile ? (
              <>
                <article className="slotcity-wallet-card slotcity-wallet-card-table">
                  <div className="slotcity-wallet-card-toolbar">
                    <div>
                      <span className="slotcity-wallet-kicker">LEDGER</span>
                      <h2>Останні проводки</h2>
                    </div>
                  </div>
                  <div className="slotcity-wallet-table">
                    <div className="slotcity-wallet-table-head">
                      <span>Type</span>
                      <span>Direction</span>
                      <span>Amount</span>
                      <span>Balance</span>
                      <span>Time</span>
                    </div>
                    {profile.recentLedger.map((entry) => (
                      <div key={entry.entryId} className="slotcity-wallet-table-row">
                        <span>{entry.entryType}</span>
                        <span>{entry.direction}</span>
                        <strong>{formatCurrency(entry.amount)}</strong>
                        <span>
                          {formatCurrency(entry.balanceBefore)} → {formatCurrency(entry.balanceAfter)}
                        </span>
                        <span>{formatDate(entry.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="slotcity-wallet-card slotcity-wallet-card-table">
                  <div className="slotcity-wallet-card-toolbar">
                    <div>
                      <span className="slotcity-wallet-kicker">DEPOSITS</span>
                      <h2>Останні заявки</h2>
                    </div>
                  </div>
                  <div className="slotcity-wallet-table">
                    <div className="slotcity-wallet-table-head">
                      <span>Provider</span>
                      <span>Method</span>
                      <span>Amount</span>
                      <span>Status</span>
                      <span>Time</span>
                    </div>
                    {profile.recentDeposits.map((request) => (
                      <div key={request.depositId} className="slotcity-wallet-table-row">
                        <span>{request.paymentProvider}</span>
                        <span>{request.paymentMethod}</span>
                        <strong>{formatCurrency(request.amount)}</strong>
                        <em className={`is-${request.status}`}>{request.status}</em>
                        <span>{formatDate(request.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                </article>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
