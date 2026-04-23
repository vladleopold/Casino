"use client";

import { useEffect, useMemo, useState } from "react";

import { FinanceOpsSidebar } from "./finance-ops-sidebar";

type FinanceOverview = {
  userCount: number;
  totalBalances: number;
  pendingDepositsAmount: number;
  approvedDepositsAmount: number;
  approvedDepositsCount: number;
  pendingDepositsCount: number;
  rejectedDepositsCount: number;
};

type DepositRequest = {
  depositId: string;
  userId: string;
  amount: number;
  currency: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  paymentMethod: string;
  paymentProvider: string;
  payerEmail?: string | null;
  createdAt: string;
};

type LedgerEntry = {
  entryId: string;
  userId: string;
  entryType: string;
  direction: "credit" | "debit";
  amount: number;
  currency: string;
  paymentMethod?: string | null;
  paymentProvider?: string | null;
  source?: string | null;
  createdAt: string;
};

type StorefrontUser = {
  userId: string;
  email: string;
  username: string;
  displayName: string;
};

type PaymentsPayload = {
  overview: FinanceOverview;
  requests: DepositRequest[];
  ledger: LedgerEntry[];
  users: StorefrontUser[];
};

type DayPoint = {
  key: string;
  label: string;
  start: number;
  end: number;
};

type WithdrawalStatus = "approved" | "pending" | "rejected";

type WithdrawalRow = {
  id: string;
  time: string;
  userId: string;
  player: string;
  method: string;
  amount: number;
  currency: string;
  network: string;
  status: WithdrawalStatus;
  txId: string;
  fee: number;
  netAmount: number;
};

const CHART_DAYS = 14;
const SVG_WIDTH = 760;
const SVG_HEIGHT = 220;

function formatCurrency(value: number) {
  return `${value.toLocaleString("uk-UA")} ₴`;
}

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

function buildDayPoints(days: number) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (days - index - 1));

    return {
      key: date.toISOString().slice(0, 10),
      label: new Intl.DateTimeFormat("uk-UA", { day: "2-digit", month: "2-digit" }).format(date),
      start: date.getTime(),
      end: date.getTime() + 24 * 60 * 60 * 1000
    } satisfies DayPoint;
  });
}

function sumForDay<T>(
  days: DayPoint[],
  items: T[],
  getDate: (item: T) => string | null | undefined,
  getValue: (item: T) => number
) {
  return days.map((day) =>
    items.reduce((total, item) => {
      const raw = getDate(item);

      if (!raw) {
        return total;
      }

      const timestamp = new Date(raw).getTime();
      return timestamp >= day.start && timestamp < day.end ? total + getValue(item) : total;
    }, 0)
  );
}

function buildLinePath(values: number[], maxValue: number) {
  const paddingX = 20;
  const paddingY = 18;
  const safeMax = Math.max(maxValue, 1);
  const innerWidth = SVG_WIDTH - paddingX * 2;
  const innerHeight = SVG_HEIGHT - paddingY * 2;
  const stepX = values.length > 1 ? innerWidth / (values.length - 1) : innerWidth;

  return values
    .map((value, index) => {
      const x = paddingX + stepX * index;
      const y = SVG_HEIGHT - paddingY - (value / safeMax) * innerHeight;
      return `${index === 0 ? "M" : "L"}${x},${Number.isFinite(y) ? y : SVG_HEIGHT - paddingY}`;
    })
    .join(" ");
}

function isWithdrawalEntry(entry: LedgerEntry) {
  return /withdraw|cashout|payout_request/i.test(entry.entryType);
}

function ChartHeader({
  kicker,
  title,
  meta
}: {
  kicker: string;
  title: string;
  meta?: string;
}) {
  return (
    <div className="slotcity-wallet-chart-head">
      <div>
        <span className="slotcity-wallet-kicker">{kicker}</span>
        <h3>{title}</h3>
      </div>
      {meta ? <span className="slotcity-wallet-chart-meta">{meta}</span> : null}
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  tone = "neutral",
  icon = "•"
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "neutral" | "green" | "gold" | "red";
  icon?: string;
}) {
  return (
    <article className={`slotcity-wallet-metric-card is-${tone}`}>
      <div className="slotcity-wallet-metric-head">
        <span>{label}</span>
        <i className="slotcity-wallet-metric-icon">{icon}</i>
      </div>
      <strong>{value}</strong>
      <small className="slotcity-wallet-metric-foot">{detail}</small>
    </article>
  );
}

function TimeChart({
  days,
  series
}: {
  days: DayPoint[];
  series: Array<{ label: string; color: string; values: number[] }>;
}) {
  const maxValue = Math.max(1, ...series.flatMap((item) => item.values));

  return (
    <div className="slotcity-wallet-timechart">
      <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="slotcity-wallet-timechart-svg" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => {
          const y = 18 + ((SVG_HEIGHT - 36) / 4) * index;
          return (
            <line
              key={index}
              x1="20"
              x2={SVG_WIDTH - 20}
              y1={y}
              y2={y}
              className="slotcity-wallet-chart-gridline"
            />
          );
        })}
        {series.map((item) => (
          <path
            key={item.label}
            d={buildLinePath(item.values, maxValue)}
            stroke={item.color}
            className="slotcity-wallet-chart-line"
          />
        ))}
      </svg>
      <div className="slotcity-wallet-chart-axis">
        {days.map((day) => (
          <span key={day.key}>{day.label}</span>
        ))}
      </div>
    </div>
  );
}

function StatusDonut({
  approved,
  pending,
  rejected
}: {
  approved: number;
  pending: number;
  rejected: number;
}) {
  const total = approved + pending + rejected;
  const safeTotal = Math.max(total, 1);
  const approvedEnd = (approved / safeTotal) * 360;
  const pendingEnd = approvedEnd + (pending / safeTotal) * 360;

  return (
    <div className="slotcity-wallet-donut-wrap">
      <div
        className="slotcity-wallet-donut"
        style={{
          background: `conic-gradient(
            var(--slotcity-chart-green) 0deg ${approvedEnd}deg,
            var(--slotcity-chart-amber) ${approvedEnd}deg ${pendingEnd}deg,
            var(--slotcity-chart-red) ${pendingEnd}deg 360deg
          )`
        }}
      >
        <div className="slotcity-wallet-donut-center">
          <strong>{formatCurrency(total)}</strong>
          <span>Total</span>
        </div>
      </div>

      <div className="slotcity-wallet-donut-legend">
        <div>
          <i style={{ background: "var(--slotcity-chart-green)" }} />
          <span>Approved</span>
          <strong>{formatCurrency(approved)}</strong>
        </div>
        <div>
          <i style={{ background: "var(--slotcity-chart-amber)" }} />
          <span>Pending</span>
          <strong>{formatCurrency(pending)}</strong>
        </div>
        <div>
          <i style={{ background: "var(--slotcity-chart-red)" }} />
          <span>Rejected</span>
          <strong>{formatCurrency(rejected)}</strong>
        </div>
      </div>
    </div>
  );
}

export function WithdrawalsDashboard({
  operator
}: {
  operator: {
    email: string;
    role: "super_admin" | "admin";
  };
}) {
  const [payload, setPayload] = useState<PaymentsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | WithdrawalStatus>("all");

  const dayPoints = useMemo(() => buildDayPoints(CHART_DAYS), []);

  const load = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/operator/payments", {
        cache: "no-store"
      });
      const nextPayload = (await response.json().catch(() => null)) as
        | (PaymentsPayload & { ok?: boolean; message?: string })
        | null;

      if (!response.ok || !nextPayload?.overview) {
        throw new Error(nextPayload?.message ?? "Не вдалося завантажити payouts dashboard.");
      }

      setPayload(nextPayload);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Не вдалося завантажити payouts dashboard."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const usersMap = useMemo(
    () => new Map((payload?.users ?? []).map((user) => [user.userId, user])),
    [payload?.users]
  );

  const withdrawalEntries = useMemo(
    () =>
      (payload?.ledger ?? [])
        .filter(isWithdrawalEntry)
        .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()),
    [payload?.ledger]
  );

  const withdrawalRows = useMemo<WithdrawalRow[]>(
    () =>
      withdrawalEntries.map((entry) => {
        const method = entry.paymentProvider ?? entry.paymentMethod ?? entry.source ?? "Other";
        const fee = Math.round(entry.amount * 0.001 * 100) / 100;
        const player = usersMap.get(entry.userId);

        return {
          id: entry.entryId,
          time: entry.createdAt,
          userId: entry.userId,
          player: player?.username ?? player?.displayName ?? entry.userId,
          method,
          amount: entry.amount,
          currency: entry.currency,
          network: method.includes("USDT") ? "TRC20" : method.includes("Bitcoin") ? "BTC" : method,
          status: "approved",
          txId: entry.entryId.slice(0, 10),
          fee,
          netAmount: Math.max(entry.amount - fee, 0)
        };
      }),
    [usersMap, withdrawalEntries]
  );

  const filteredRows = useMemo(
    () => (statusFilter === "all" ? withdrawalRows : withdrawalRows.filter((row) => row.status === statusFilter)),
    [statusFilter, withdrawalRows]
  );

  const withdrawalSeries = useMemo(
    () => sumForDay(dayPoints, withdrawalRows, (entry) => entry.time, (entry) => entry.amount),
    [dayPoints, withdrawalRows]
  );

  const depositSeries = useMemo(
    () =>
      sumForDay(
        dayPoints,
        (payload?.requests ?? []).filter((request) => request.status === "approved"),
        (request) => request.createdAt,
        (request) => request.amount
      ),
    [dayPoints, payload?.requests]
  );

  const totalWithdrawals = withdrawalRows.reduce((total, entry) => total + entry.amount, 0);
  const approvedWithdrawals = withdrawalRows
    .filter((entry) => entry.status === "approved")
    .reduce((total, entry) => total + entry.amount, 0);
  const pendingWithdrawals = withdrawalRows
    .filter((entry) => entry.status === "pending")
    .reduce((total, entry) => total + entry.amount, 0);
  const rejectedWithdrawals = withdrawalRows
    .filter((entry) => entry.status === "rejected")
    .reduce((total, entry) => total + entry.amount, 0);
  const averageWithdrawal = withdrawalRows.length ? totalWithdrawals / withdrawalRows.length : 0;
  const maxSingleWithdrawal = Math.max(...withdrawalRows.map((entry) => entry.amount), 0);
  const approvedRate = withdrawalRows.length ? (withdrawalRows.filter((entry) => entry.status === "approved").length / withdrawalRows.length) * 100 : 0;
  const withdrawalsVsDeposits =
    (payload?.overview?.approvedDepositsAmount ?? 0) > 0
      ? (totalWithdrawals / (payload?.overview?.approvedDepositsAmount ?? 1)) * 100
      : 0;

  const methods = useMemo(() => {
    const grouped = new Map<string, { method: string; amount: number; count: number; rate: number }>();

    for (const entry of withdrawalRows) {
      const current = grouped.get(entry.method) ?? { method: entry.method, amount: 0, count: 0, rate: 0 };
      current.amount += entry.amount;
      current.count += 1;
      grouped.set(entry.method, current);
    }

    return Array.from(grouped.values())
      .map((row) => ({
        ...row,
        rate: withdrawalRows.length ? (row.count / withdrawalRows.length) * 100 : 0
      }))
      .sort((left, right) => right.amount - left.amount)
      .slice(0, 8);
  }, [withdrawalRows]);

  const currencyRows = useMemo(() => {
    const grouped = new Map<string, { currency: string; deposits: number; withdrawals: number }>();

    for (const request of payload?.requests ?? []) {
      const current = grouped.get(request.currency) ?? {
        currency: request.currency,
        deposits: 0,
        withdrawals: 0
      };

      if (request.status === "approved") {
        current.deposits += request.amount;
      }

      grouped.set(request.currency, current);
    }

    for (const row of withdrawalRows) {
      const current = grouped.get(row.currency) ?? {
        currency: row.currency,
        deposits: 0,
        withdrawals: 0
      };
      current.withdrawals += row.amount;
      grouped.set(row.currency, current);
    }

    return Array.from(grouped.values()).map((row) => ({
      ...row,
      netFlow: row.deposits - row.withdrawals
    }));
  }, [payload?.requests, withdrawalRows]);

  const alerts = useMemo(() => {
    const base = [];

    if (totalWithdrawals > 100_000) {
      base.push({
        label: "High Withdrawal Volume",
        detail: `+${formatCurrency(totalWithdrawals)} за поточний період`,
        tone: "danger"
      });
    }

    if (maxSingleWithdrawal >= 25_000) {
      base.push({
        label: "Large Withdrawal",
        detail: `Макс. payout ${formatCurrency(maxSingleWithdrawal)}`,
        tone: "warning"
      });
    }

    if (withdrawalsVsDeposits > 65) {
      base.push({
        label: "Withdrawals / Deposits Spike",
        detail: `${formatPercent(withdrawalsVsDeposits)} payout ratio`,
        tone: "warning"
      });
    }

    if (!base.length) {
      base.push({
        label: "No payout anomalies",
        detail: "Поточний потік виплат виглядає стабільним.",
        tone: "ok"
      });
    }

    return base;
  }, [maxSingleWithdrawal, totalWithdrawals, withdrawalsVsDeposits]);

  const usedLimit = Math.min(totalWithdrawals, 500_000);
  const remainingLimit = Math.max(500_000 - usedLimit, 0);

  return (
    <section className="slotcity-wallet-shell">
      <FinanceOpsSidebar operator={operator} active="withdrawals" />

      <div className="slotcity-wallet-main">
        <header className="slotcity-wallet-topbar">
          <div>
            <h1>Withdrawals</h1>
            <p>Protected payout flow and method monitoring</p>
          </div>

          <div className="slotcity-wallet-topbar-actions">
            <span className="slotcity-wallet-topbar-chip">Today</span>
            <span className="slotcity-wallet-topbar-chip">Compared: yesterday</span>
            <button type="button" className="slotcity-wallet-refresh" onClick={() => void load()}>
              <span className="slotcity-wallet-live-ping" />
              Refresh: 15s
            </button>
          </div>
        </header>

        {error ? <div className="slotcity-registration-error">{error}</div> : null}

        <section className="slotcity-wallet-stat-row slotcity-wallet-stat-row-wide">
          <MetricCard label="Total Withdrawals" value={formatCurrency(totalWithdrawals)} detail="Posted ledger" tone="red" icon="⇅" />
          <MetricCard label="Approved" value={formatCurrency(approvedWithdrawals)} detail={`${formatPercent(approvedRate)} success`} tone="green" icon="✓" />
          <MetricCard label="Pending" value={formatCurrency(pendingWithdrawals)} detail="Queue" tone="gold" icon="…" />
          <MetricCard label="Rejected" value={formatCurrency(rejectedWithdrawals)} detail="Provider rejects" tone="red" icon="!" />
          <MetricCard label="Avg. Withdrawal" value={formatCurrency(averageWithdrawal)} detail="Mean payout" tone="neutral" icon="∿" />
          <MetricCard label="Withdrawals / Deposits" value={formatPercent(withdrawalsVsDeposits)} detail="Payout ratio" tone="green" icon="%" />
          <MetricCard label="Max Single Withdrawal" value={formatCurrency(maxSingleWithdrawal)} detail={withdrawalRows[0]?.player ?? "No payouts"} tone="neutral" icon="★" />
        </section>

        <div className="slotcity-wallet-board slotcity-wallet-board-with-rail">
          <div className="slotcity-wallet-column slotcity-wallet-column-wide">
            <div className="slotcity-wallet-panel-grid">
              <article className="slotcity-wallet-card">
                <ChartHeader kicker="WITHDRAWALS OVER TIME" title="Approved / pending / rejected" meta="Today" />
                <TimeChart
                  days={dayPoints}
                  series={[
                    { label: "Approved", color: "var(--slotcity-chart-green)", values: withdrawalSeries },
                    { label: "Pending", color: "var(--slotcity-chart-amber)", values: dayPoints.map(() => 0) },
                    { label: "Rejected", color: "var(--slotcity-chart-red)", values: dayPoints.map(() => 0) }
                  ]}
                />
              </article>

              <article className="slotcity-wallet-card">
                <ChartHeader kicker="WITHDRAWALS VS DEPOSITS" title="Liquidity pressure" meta="Today" />
                <TimeChart
                  days={dayPoints}
                  series={[
                    { label: "Deposits", color: "var(--slotcity-chart-blue)", values: depositSeries },
                    { label: "Withdrawals", color: "var(--slotcity-chart-red)", values: withdrawalSeries }
                  ]}
                />
              </article>

              <article className="slotcity-wallet-card">
                <ChartHeader kicker="WITHDRAWAL STATUS DISTRIBUTION" title="Status share" meta="Today" />
                <StatusDonut approved={approvedWithdrawals} pending={pendingWithdrawals} rejected={rejectedWithdrawals} />
              </article>
            </div>

            <article className="slotcity-wallet-card slotcity-wallet-card-table">
              <div className="slotcity-wallet-card-toolbar">
                <div>
                  <span className="slotcity-wallet-kicker">WITHDRAWAL FLOW</span>
                  <h3>Requests and posted payouts</h3>
                </div>
              </div>

              <div className="slotcity-wallet-toolbar-tabs">
                {[
                  ["all", `All Withdrawals (${withdrawalRows.length})`],
                  ["pending", `Pending (${withdrawalRows.filter((row) => row.status === "pending").length})`],
                  ["approved", `Approved (${withdrawalRows.filter((row) => row.status === "approved").length})`],
                  ["rejected", `Rejected (${withdrawalRows.filter((row) => row.status === "rejected").length})`]
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={`slotcity-wallet-subnav-item${statusFilter === key ? " is-active" : ""}`}
                    onClick={() => setStatusFilter(key as "all" | WithdrawalStatus)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="slotcity-wallet-filter-row">
                <span className="slotcity-wallet-topbar-chip">Today</span>
                <span className="slotcity-wallet-topbar-chip">All Methods</span>
                <span className="slotcity-wallet-topbar-chip">All Currencies</span>
                <span className="slotcity-wallet-topbar-chip">Search by player ID</span>
              </div>

              {isLoading ? <p className="slotcity-wallet-empty-copy">Завантаження payouts...</p> : null}

              <div className="slotcity-wallet-table-shell">
                <div className="slotcity-wallet-table">
                  <div className="slotcity-wallet-table-head slotcity-wallet-table-head-payouts">
                    <span>Time</span>
                    <span>Player</span>
                    <span>Method</span>
                    <span>Amount</span>
                    <span>Currency</span>
                    <span>Network</span>
                    <span>Status</span>
                    <span>Tx ID</span>
                    <span>Fee</span>
                    <span>Net</span>
                    <span>Actions</span>
                  </div>
                  {filteredRows.slice(0, 12).map((entry) => (
                    <div key={entry.id} className="slotcity-wallet-table-row slotcity-wallet-table-row-payouts">
                      <span>
                        {new Intl.DateTimeFormat("uk-UA", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit"
                        }).format(new Date(entry.time))}
                      </span>
                      <strong>{entry.player}</strong>
                      <span>{entry.method}</span>
                      <strong>{formatCurrency(entry.amount)}</strong>
                      <span>{entry.currency}</span>
                      <span>{entry.network}</span>
                      <em className={`is-${entry.status}`}>{entry.status}</em>
                      <span>{entry.txId}</span>
                      <span>{formatCurrency(entry.fee)}</span>
                      <strong>{formatCurrency(entry.netAmount)}</strong>
                      <span>
                        <a className="slotcity-wallet-action blue" href={`/operator/players?userId=${encodeURIComponent(entry.userId)}`}>
                          View
                        </a>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </div>

          <div className="slotcity-wallet-column slotcity-wallet-right-rail">
            <article className="slotcity-wallet-card slotcity-wallet-card-table">
              <ChartHeader kicker="TOP WITHDRAWAL METHODS" title="Method breakdown" meta="Today" />
              <div className="slotcity-wallet-table is-compact">
                <div className="slotcity-wallet-table-head">
                  <span>Method</span>
                  <span>Amount</span>
                  <span>Rate</span>
                </div>
                {methods.map((row) => (
                  <div key={row.method} className="slotcity-wallet-table-row">
                    <span>{row.method}</span>
                    <strong>{formatCurrency(row.amount)}</strong>
                    <em className="is-approved">{formatPercent(row.rate)}</em>
                  </div>
                ))}
              </div>
            </article>

            <article className="slotcity-wallet-card slotcity-wallet-card-table">
              <ChartHeader kicker="TOP CURRENCIES" title="Net cash by currency" meta="Today" />
              <div className="slotcity-wallet-table is-compact">
                <div className="slotcity-wallet-table-head">
                  <span>Currency</span>
                  <span>Deposits</span>
                  <span>Net Flow</span>
                </div>
                {currencyRows.slice(0, 6).map((row) => (
                  <div key={row.currency} className="slotcity-wallet-table-row">
                    <span>{row.currency}</span>
                    <strong>{formatCurrency(row.deposits)}</strong>
                    <em className={row.netFlow >= 0 ? "is-approved" : "is-rejected"}>
                      {row.netFlow >= 0 ? "+" : "-"}
                      {formatCurrency(Math.abs(row.netFlow))}
                    </em>
                  </div>
                ))}
              </div>
            </article>

            <article className="slotcity-wallet-card">
              <ChartHeader kicker="WITHDRAWAL LIMITS" title="Today" />
              <div className="slotcity-wallet-progress-panel">
                <div>
                  <span>Total Limit</span>
                  <strong>{formatCurrency(500_000)}</strong>
                </div>
                <div>
                  <span>Used</span>
                  <strong>{formatCurrency(usedLimit)}</strong>
                </div>
                <div>
                  <span>Remaining</span>
                  <strong>{formatCurrency(remainingLimit)}</strong>
                </div>
                <div className="slotcity-wallet-progress-track">
                  <span
                    className="slotcity-wallet-progress-fill"
                    style={{ width: `${Math.min((usedLimit / 500_000) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </article>

            <article className="slotcity-wallet-card">
              <ChartHeader kicker="WITHDRAWAL ALERTS" title="Ops stream" />
              <div className="slotcity-wallet-risk-list compact">
                {alerts.map((alert) => (
                  <div key={alert.label} className="slotcity-wallet-risk-row">
                    <div>
                      <strong>{alert.label}</strong>
                      <span>{alert.detail}</span>
                    </div>
                    <b className={`slotcity-wallet-alert-pill is-${alert.tone}`}>{alert.tone}</b>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
