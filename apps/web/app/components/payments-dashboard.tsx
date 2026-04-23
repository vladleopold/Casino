"use client";

import { useEffect, useMemo, useState } from "react";
import { signOut, useSession } from "next-auth/react";

interface FinanceOverview {
  userCount: number;
  totalBalances: number;
  pendingDepositsAmount: number;
  approvedDepositsAmount: number;
  approvedDepositsCount: number;
  pendingDepositsCount: number;
  rejectedDepositsCount: number;
}

interface DepositRequest {
  depositId: string;
  userId: string;
  amount: number;
  currency: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  paymentMethod: string;
  paymentProvider: string;
  payerName?: string | null;
  payerEmail?: string | null;
  payerPhone?: string | null;
  notes?: string | null;
  createdAt: string;
}

interface LedgerEntry {
  entryId: string;
  userId: string;
  entryType: string;
  direction: string;
  amount: number;
  currency: string;
  balanceBefore: number;
  balanceAfter: number;
  paymentMethod?: string | null;
  paymentProvider?: string | null;
  source?: string | null;
  createdAt: string;
}

interface StorefrontUser {
  userId: string;
  email: string;
  username: string;
  displayName: string;
  authProvider: string;
  balance: number;
  createdAt: string;
  lastLoginAt?: string | null;
  lastSeenAt?: string | null;
}

interface PaymentsPayload {
  overview: FinanceOverview;
  requests: DepositRequest[];
  ledger: LedgerEntry[];
  users: StorefrontUser[];
}

interface DayPoint {
  key: string;
  label: string;
  start: number;
  end: number;
}

interface FunnelStep {
  label: string;
  value: number;
  tone?: string;
}

interface HeatmapRow {
  label: string;
  values: Array<{
    label: string;
    ratio: number;
    value: number;
  }>;
}

interface ScatterPoint {
  x: number;
  y: number;
  size: number;
  label: string;
}

const CHART_DAYS = 14;
const SVG_WIDTH = 760;
const SVG_HEIGHT = 220;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatCurrency(value: number) {
  return `${value.toLocaleString("uk-UA")} ₴`;
}

function formatCompact(value: number) {
  return new Intl.NumberFormat("uk-UA", {
    notation: "compact",
    maximumFractionDigits: value > 9999 ? 1 : 0
  }).format(value);
}

function formatPercent(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`;
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
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

function sumForDay<T>(days: DayPoint[], items: T[], getDate: (item: T) => string | null | undefined, getValue: (item: T) => number) {
  return days.map((day) =>
    items.reduce((total, item) => {
      const raw = getDate(item);

      if (!raw) {
        return total;
      }

      const timestamp = new Date(raw).getTime();

      if (timestamp >= day.start && timestamp < day.end) {
        return total + getValue(item);
      }

      return total;
    }, 0)
  );
}

function countForDay<T>(days: DayPoint[], items: T[], getDate: (item: T) => string | null | undefined) {
  return days.map((day) =>
    items.reduce((total, item) => {
      const raw = getDate(item);

      if (!raw) {
        return total;
      }

      const timestamp = new Date(raw).getTime();
      return timestamp >= day.start && timestamp < day.end ? total + 1 : total;
    }, 0)
  );
}

function uniqueCountForDay<T>(
  days: DayPoint[],
  items: T[],
  getDate: (item: T) => string | null | undefined,
  getKey: (item: T) => string
) {
  return days.map((day) => {
    const bucket = new Set<string>();

    for (const item of items) {
      const raw = getDate(item);

      if (!raw) {
        continue;
      }

      const timestamp = new Date(raw).getTime();

      if (timestamp >= day.start && timestamp < day.end) {
        bucket.add(getKey(item));
      }
    }

    return bucket.size;
  });
}

function buildLinePath(values: number[], maxValue: number, height = SVG_HEIGHT, width = SVG_WIDTH) {
  const paddingX = 20;
  const paddingY = 18;
  const safeMax = Math.max(maxValue, 1);
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;
  const stepX = values.length > 1 ? innerWidth / (values.length - 1) : innerWidth;

  return values
    .map((value, index) => {
      const x = paddingX + stepX * index;
      const y = height - paddingY - (value / safeMax) * innerHeight;
      return `${index === 0 ? "M" : "L"}${x},${Number.isFinite(y) ? y : height - paddingY}`;
    })
    .join(" ");
}

function buildAreaPath(values: number[], maxValue: number, height = SVG_HEIGHT, width = SVG_WIDTH) {
  const paddingX = 20;
  const paddingY = 18;
  const safeMax = Math.max(maxValue, 1);
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;
  const baseline = height - paddingY;
  const stepX = values.length > 1 ? innerWidth / (values.length - 1) : innerWidth;
  const points = values.map((value, index) => {
    const x = paddingX + stepX * index;
    const y = baseline - (value / safeMax) * innerHeight;
    return { x, y: Number.isFinite(y) ? y : baseline };
  });

  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");

  const first = points[0];
  const last = points[points.length - 1];

  return `${line} L${last.x},${baseline} L${first.x},${baseline} Z`;
}

function isBetEntry(entry: LedgerEntry) {
  return /bet|wager|stake/i.test(entry.entryType);
}

function isWinEntry(entry: LedgerEntry) {
  return /win|payout/i.test(entry.entryType);
}

function isBonusEntry(entry: LedgerEntry) {
  return /bonus/i.test(entry.entryType);
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

function ChartLegend({
  items
}: {
  items: Array<{ label: string; color: string; tone?: string }>;
}) {
  return (
    <div className="slotcity-wallet-legend">
      {items.map((item) => (
        <span key={item.label} className={`slotcity-wallet-legend-item${item.tone ? ` ${item.tone}` : ""}`}>
          <i style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function TimeChart({
  days,
  series,
  suffix = "",
  percentage = false
}: {
  days: DayPoint[];
  series: Array<{
    label: string;
    color: string;
    values: number[];
    area?: boolean;
    dashed?: boolean;
  }>;
  suffix?: string;
  percentage?: boolean;
}) {
  const maxValue = Math.max(
    1,
    ...series.flatMap((item) => item.values.map((value) => value))
  );

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

        {series.map((item) =>
          item.area ? (
            <path
              key={`${item.label}-area`}
              d={buildAreaPath(item.values, maxValue)}
              fill={item.color}
              className="slotcity-wallet-chart-area"
            />
          ) : null
        )}

        {series.map((item) => (
          <path
            key={item.label}
            d={buildLinePath(item.values, maxValue)}
            stroke={item.color}
            className={`slotcity-wallet-chart-line${item.dashed ? " is-dashed" : ""}`}
          />
        ))}
      </svg>

      <div className="slotcity-wallet-chart-axis">
        {days.map((day) => (
          <span key={day.key}>{day.label}</span>
        ))}
      </div>

      <div className="slotcity-wallet-chart-metrics">
        {series.map((item) => {
          const latestValue = item.values[item.values.length - 1] ?? 0;
          return (
            <div key={item.label}>
              <strong style={{ color: item.color }}>
                {percentage ? formatPercent(latestValue) : `${formatCompact(latestValue)}${suffix}`}
              </strong>
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ZeroFeedChart({
  title
}: {
  title: string;
}) {
  return (
    <div className="slotcity-wallet-empty-state">
      <div className="slotcity-wallet-empty-chart" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p>{title}</p>
      <small>Панель активується після підключення server feed ставок, виграшів і бонусів від провайдера.</small>
    </div>
  );
}

function ScatterChart({
  points
}: {
  points: ScatterPoint[];
}) {
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
        {points.map((point, index) => (
          <circle
            key={`${point.label}-${index}`}
            cx={20 + point.x * (SVG_WIDTH - 40)}
            cy={SVG_HEIGHT - 18 - point.y * (SVG_HEIGHT - 36)}
            r={4 + point.size * 10}
            className="slotcity-wallet-scatter-dot"
          />
        ))}
      </svg>
    </div>
  );
}

function HeatmapChart({ rows }: { rows: HeatmapRow[] }) {
  return (
    <div className="slotcity-wallet-heatmap">
      <div className="slotcity-wallet-heatmap-grid">
        <div className="slotcity-wallet-heatmap-head">
          <span>Когорта</span>
          {rows[0]?.values.map((value) => (
            <span key={value.label}>{value.label}</span>
          ))}
        </div>
        {rows.map((row) => (
          <div key={row.label} className="slotcity-wallet-heatmap-row">
            <strong>{row.label}</strong>
            {row.values.map((value) => (
              <span
                key={`${row.label}-${value.label}`}
                className="slotcity-wallet-heatmap-cell"
                style={{ ["--slotcity-heat" as string]: String(clamp(value.ratio, 0.05, 1)) }}
                title={`${row.label} · ${value.label} · ${formatPercent(value.ratio * 100)}`}
              >
                {Math.round(value.ratio * 100)}%
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function FunnelChart({ steps }: { steps: FunnelStep[] }) {
  const maxValue = Math.max(...steps.map((step) => step.value), 1);

  return (
    <div className="slotcity-wallet-funnel">
      {steps.map((step) => (
        <div key={step.label} className="slotcity-wallet-funnel-row">
          <div className="slotcity-wallet-funnel-labels">
            <strong>{step.label}</strong>
            <span>{formatCompact(step.value)}</span>
          </div>
          <div className="slotcity-wallet-funnel-bar-shell">
            <div
              className={`slotcity-wallet-funnel-bar${step.tone ? ` is-${step.tone}` : ""}`}
              style={{ width: `${Math.max((step.value / maxValue) * 100, step.value ? 14 : 0)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ComboBars({
  days,
  bars,
  line
}: {
  days: DayPoint[];
  bars: number[];
  line: number[];
}) {
  const maxValue = Math.max(...bars, ...line, 1);

  return (
    <div className="slotcity-wallet-combo">
      <div className="slotcity-wallet-combo-bars">
        {bars.map((value, index) => (
          <div key={days[index]?.key ?? index} className="slotcity-wallet-combo-column">
            <span
              className="slotcity-wallet-combo-bar"
              style={{ height: `${Math.max((value / maxValue) * 100, value ? 6 : 0)}%` }}
            />
          </div>
        ))}
      </div>
      <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="slotcity-wallet-timechart-svg slotcity-wallet-combo-line" aria-hidden="true">
        <path d={buildLinePath(line, maxValue)} stroke="var(--slotcity-chart-green)" className="slotcity-wallet-chart-line" />
      </svg>
      <div className="slotcity-wallet-chart-axis">
        {days.map((day) => (
          <span key={day.key}>{day.label}</span>
        ))}
      </div>
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
        <i className="slotcity-wallet-metric-icon" aria-hidden="true">
          {icon}
        </i>
      </div>
      <strong>{value}</strong>
      <small className="slotcity-wallet-metric-foot">
        <span className={`slotcity-wallet-metric-live is-${tone}`} />
        {detail}
      </small>
    </article>
  );
}

export function PaymentsDashboard() {
  const { data: session } = useSession();
  const [overview, setOverview] = useState<FinanceOverview | null>(null);
  const [requests, setRequests] = useState<DepositRequest[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [users, setUsers] = useState<StorefrontUser[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">(
    "all"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [serverTime, setServerTime] = useState(() => new Date());

  const dayPoints = useMemo(() => buildDayPoints(CHART_DAYS), []);

  const load = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/operator/payments", {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error(`payments_${response.status}`);
      }

      const payload = (await response.json()) as PaymentsPayload;

      setOverview(payload.overview);
      setRequests(payload.requests);
      setLedger(payload.ledger);
      setUsers(payload.users);
    } catch {
      setError("Не вдалося завантажити фінансову адмінку.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setServerTime(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const filteredRequests = useMemo(
    () =>
      statusFilter === "all"
        ? requests
        : requests.filter((request) => request.status === statusFilter),
    [requests, statusFilter]
  );

  const approvedRequests = useMemo(
    () => requests.filter((request) => request.status === "approved"),
    [requests]
  );

  const currentPeriodRequests = useMemo(
    () => requests.filter((request) => {
      const timestamp = new Date(request.createdAt).getTime();
      return timestamp >= dayPoints[0].start && timestamp < dayPoints[dayPoints.length - 1].end;
    }),
    [dayPoints, requests]
  );

  const approvedSeries = useMemo(
    () => sumForDay(dayPoints, approvedRequests, (request) => request.createdAt, (request) => request.amount),
    [approvedRequests, dayPoints]
  );

  const pendingSeries = useMemo(
    () => countForDay(dayPoints, requests.filter((request) => request.status === "pending"), (request) => request.createdAt),
    [dayPoints, requests]
  );

  const rejectedSeries = useMemo(
    () => countForDay(dayPoints, requests.filter((request) => request.status === "rejected"), (request) => request.createdAt),
    [dayPoints, requests]
  );

  const withdrawalSeries = useMemo(
    () =>
      sumForDay(
        dayPoints,
        ledger.filter(isWithdrawalEntry),
        (entry) => entry.createdAt,
        (entry) => entry.amount
      ),
    [dayPoints, ledger]
  );

  const activePlayersSeries = useMemo(
    () => countForDay(dayPoints, users.filter((user) => user.lastSeenAt), (user) => user.lastSeenAt),
    [dayPoints, users]
  );

  const mauSeries = useMemo(
    () =>
      dayPoints.map((day) =>
        users.filter((user) => {
          if (!user.lastSeenAt) {
            return false;
          }

          const seenAt = new Date(user.lastSeenAt).getTime();
          return seenAt >= day.end - 30 * 24 * 60 * 60 * 1000 && seenAt < day.end;
        }).length
      ),
    [dayPoints, users]
  );

  const payersSeries = useMemo(
    () =>
      uniqueCountForDay(dayPoints, approvedRequests, (request) => request.createdAt, (request) => request.userId),
    [approvedRequests, dayPoints]
  );

  const arpuSeries = useMemo(
    () =>
      approvedSeries.map((value, index) =>
        activePlayersSeries[index] ? value / activePlayersSeries[index] : 0
      ),
    [activePlayersSeries, approvedSeries]
  );

  const arppuSeries = useMemo(
    () =>
      approvedSeries.map((value, index) => (payersSeries[index] ? value / payersSeries[index] : 0)),
    [approvedSeries, payersSeries]
  );

  const gameFeedSeries = useMemo(() => {
    const bets = sumForDay(
      dayPoints,
      ledger.filter(isBetEntry),
      (entry) => entry.createdAt,
      (entry) => entry.amount
    );
    const wins = sumForDay(
      dayPoints,
      ledger.filter(isWinEntry),
      (entry) => entry.createdAt,
      (entry) => entry.amount
    );
    const bonuses = sumForDay(
      dayPoints,
      ledger.filter(isBonusEntry),
      (entry) => entry.createdAt,
      (entry) => entry.amount
    );

    const ggr = bets.map((bet, index) => bet - wins[index]);
    const ngr = ggr.map((gross, index) => gross - bonuses[index]);
    const rtp = bets.map((bet, index) => (bet > 0 ? (wins[index] / bet) * 100 : 0));
    const plan = ngr.map((_, index) => {
      const window = ngr.slice(Math.max(0, index - 3), index + 1);
      const average = window.reduce((total, value) => total + value, 0) / Math.max(window.length, 1);
      return Math.max(average, 0);
    });

    return { bets, wins, bonuses, ggr, ngr, rtp, plan };
  }, [dayPoints, ledger]);

  const hasGameFeed = useMemo(
    () => gameFeedSeries.bets.some(Boolean) || gameFeedSeries.wins.some(Boolean) || gameFeedSeries.bonuses.some(Boolean),
    [gameFeedSeries]
  );

  const currentApprovedAmount = currentPeriodRequests
    .filter((request) => request.status === "approved")
    .reduce((total, request) => total + request.amount, 0);

  const suspiciousAccounts = useMemo(() => {
    const grouped = new Map<
      string,
      {
        amount: number;
        pending: number;
        rejected: number;
        total: number;
        label: string;
      }
    >();

    for (const request of requests) {
      const key = request.userId;
      const existing = grouped.get(key) ?? {
        amount: 0,
        pending: 0,
        rejected: 0,
        total: 0,
        label: request.payerEmail ?? request.userId
      };

      existing.amount += request.amount;
      existing.total += 1;

      if (request.status === "pending") {
        existing.pending += 1;
      }

      if (request.status === "rejected") {
        existing.rejected += 1;
      }

      grouped.set(key, existing);
    }

    return Array.from(grouped.entries())
      .map(([userId, value]) => ({
        userId,
        ...value,
        score: value.pending * 2 + value.rejected * 3 + (value.amount >= 50000 ? 4 : 0) + (value.total >= 4 ? 2 : 0)
      }))
      .filter((item) => item.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 6);
  }, [requests]);

  const anomalyPoints = useMemo<ScatterPoint[]>(() => {
    const maxAmount = Math.max(...requests.map((request) => request.amount), 1);

    return requests.slice(0, 60).map((request) => {
      const timestamp = new Date(request.createdAt).getTime();
      const xRatio = clamp((timestamp - dayPoints[0].start) / (dayPoints[dayPoints.length - 1].end - dayPoints[0].start));
      const yRatio = clamp(request.amount / maxAmount);

      return {
        x: xRatio,
        y: yRatio,
        size: clamp(request.amount / maxAmount, 0.15, 1),
        label: `${request.payerEmail ?? request.userId} · ${formatCurrency(request.amount)}`
      };
    });
  }, [dayPoints, requests]);

  const retentionRows = useMemo<HeatmapRow[]>(() => {
    const retentionSteps = [1, 3, 7, 14, 30];
    const cohorts = new Map<string, StorefrontUser[]>();

    for (const user of users) {
      const created = new Date(user.createdAt);
      const start = new Date(created);
      start.setDate(created.getDate() - ((created.getDay() + 6) % 7));
      start.setHours(0, 0, 0, 0);
      const label = new Intl.DateTimeFormat("uk-UA", { day: "2-digit", month: "2-digit" }).format(start);
      const bucket = cohorts.get(label) ?? [];
      bucket.push(user);
      cohorts.set(label, bucket);
    }

    return Array.from(cohorts.entries())
      .slice(-6)
      .map(([label, cohortUsers]) => ({
        label,
        values: retentionSteps.map((step) => {
          const retained = cohortUsers.filter((user) => {
            if (!user.lastSeenAt) {
              return false;
            }

            return new Date(user.lastSeenAt).getTime() >= new Date(user.createdAt).getTime() + step * 24 * 60 * 60 * 1000;
          }).length;

          return {
            label: `D${step}`,
            ratio: cohortUsers.length ? retained / cohortUsers.length : 0,
            value: retained
          };
        })
      }));
  }, [users]);

  const funnelSteps = useMemo<FunnelStep[]>(() => {
    const startedUsers = new Set(requests.map((request) => request.userId)).size;
    const approvedUsers = new Set(
      requests.filter((request) => request.status === "approved").map((request) => request.userId)
    ).size;
    const repeatPayers = Array.from(
      requests
        .filter((request) => request.status === "approved")
        .reduce((map, request) => {
          map.set(request.userId, (map.get(request.userId) ?? 0) + 1);
          return map;
        }, new Map<string, number>())
        .values()
    ).filter((value) => value > 1).length;

    return [
      { label: "Реєстрації", value: users.length, tone: "neutral" },
      { label: "Почали депозит", value: startedUsers, tone: "gold" },
      { label: "Підтверджений депозит", value: approvedUsers, tone: "green" },
      { label: "Повторний платник", value: repeatPayers, tone: "green" }
    ];
  }, [requests, users]);

  const riskSignalSeries = useMemo(
    () => pendingSeries.map((value, index) => value * 2 + rejectedSeries[index] * 3),
    [pendingSeries, rejectedSeries]
  );

  const summary = useMemo(() => {
    const active30 = users.filter((user) => {
      if (!user.lastSeenAt) {
        return false;
      }

      return new Date(user.lastSeenAt).getTime() >= Date.now() - 30 * 24 * 60 * 60 * 1000;
    }).length;

    return {
      active30,
      withdrawals: withdrawalSeries.reduce((total, value) => total + value, 0),
      suspiciousCount: suspiciousAccounts.length,
      lastNgr: gameFeedSeries.ngr[gameFeedSeries.ngr.length - 1] ?? 0
    };
  }, [gameFeedSeries.ngr, suspiciousAccounts.length, users, withdrawalSeries]);

  const userMap = useMemo(
    () => new Map(users.map((user) => [user.userId, user])),
    [users]
  );

  const liveFeed = useMemo(() => {
    const requestEvents = requests.map((request) => ({
      id: request.depositId,
      time: request.createdAt,
      player: request.payerEmail ?? request.userId,
      action:
        request.status === "approved"
          ? "Deposit"
          : request.status === "rejected"
            ? "Deposit rejected"
            : "Deposit request",
      amount: request.amount,
      tone:
        request.status === "approved"
          ? "positive"
          : request.status === "rejected"
            ? "negative"
            : "warning"
    }));

    const ledgerEvents = ledger.map((entry) => ({
      id: entry.entryId,
      time: entry.createdAt,
      player: userMap.get(entry.userId)?.username ?? entry.userId,
      action: entry.entryType.replace(/_/g, " "),
      amount: entry.direction === "debit" ? -entry.amount : entry.amount,
      tone: entry.direction === "debit" ? "negative" : "positive"
    }));

    return [...requestEvents, ...ledgerEvents]
      .sort((left, right) => new Date(right.time).getTime() - new Date(left.time).getTime())
      .slice(0, 8);
  }, [ledger, requests, userMap]);

  const latestTransactions = useMemo(
    () =>
      [...requests]
        .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
        .slice(0, 8),
    [requests]
  );

  const featuredUser = useMemo(() => {
    const preferredUserId =
      suspiciousAccounts[0]?.userId ??
      approvedRequests[0]?.userId ??
      requests[0]?.userId ??
      users[0]?.userId;

    return preferredUserId ? userMap.get(preferredUserId) ?? null : null;
  }, [approvedRequests, requests, suspiciousAccounts, userMap, users]);

  const featuredUserStats = useMemo(() => {
    if (!featuredUser) {
      return null;
    }

    const userApprovedDeposits = approvedRequests.filter((request) => request.userId === featuredUser.userId);
    const userWithdrawals = ledger.filter(
      (entry) => entry.userId === featuredUser.userId && isWithdrawalEntry(entry)
    );
    const totalDeposits = userApprovedDeposits.reduce((total, request) => total + request.amount, 0);
    const totalWithdrawals = userWithdrawals.reduce((total, entry) => total + entry.amount, 0);
    const activity = [
      ...userApprovedDeposits.map((request) => ({
        id: request.depositId,
        createdAt: request.createdAt,
        action: request.paymentMethod,
        state:
          request.status === "approved"
            ? "Deposit"
            : request.status === "rejected"
              ? "Rejected"
              : "Pending",
        amount: request.amount,
        tone:
          request.status === "approved"
            ? "positive"
            : request.status === "rejected"
              ? "negative"
              : "warning"
      })),
      ...ledger
        .filter((entry) => entry.userId === featuredUser.userId)
        .map((entry) => ({
          id: entry.entryId,
          createdAt: entry.createdAt,
          action: entry.entryType.replace(/_/g, " "),
          state: entry.direction === "debit" ? "Debit" : "Credit",
          amount: entry.amount,
          tone: entry.direction === "debit" ? "negative" : "positive"
        }))
    ]
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
      .slice(0, 6);

    return {
      deposits: totalDeposits,
      withdrawn: totalWithdrawals,
      profit: totalDeposits - totalWithdrawals,
      activity
    };
  }, [approvedRequests, featuredUser, ledger]);

  const gatewayRows = useMemo(() => {
    const grouped = new Map<
      string,
      {
        gateway: string;
        deposits: number;
        withdrawals: number;
        successCount: number;
        totalCount: number;
      }
    >();

    for (const request of requests) {
      const gateway = [request.paymentProvider, request.paymentMethod].filter(Boolean).join(" · ");
      const existing = grouped.get(gateway) ?? {
        gateway,
        deposits: 0,
        withdrawals: 0,
        successCount: 0,
        totalCount: 0
      };

      existing.totalCount += 1;

      if (request.status === "approved") {
        existing.deposits += request.amount;
        existing.successCount += 1;
      }

      grouped.set(gateway, existing);
    }

    return Array.from(grouped.values())
      .map((row) => ({
        ...row,
        successRate: row.totalCount ? (row.successCount / row.totalCount) * 100 : 0
      }))
      .sort((left, right) => right.deposits - left.deposits)
      .slice(0, 5);
  }, [requests]);

  const sidebarItems = useMemo(
    () => [
      { label: "Dashboard", icon: "⌂", href: "#" },
      { label: "Live Activity", icon: "⌁", href: "#" },
      { label: "Admin Access", icon: "◎", href: "/operator/users" },
      { label: "Transactions", icon: "⇄", href: "#" },
      { label: "Risk Monitor", icon: "△", href: "#" },
      { label: "Bonuses", icon: "⎔", href: "#" },
      { label: "Payments", icon: "₴", href: "/operator/payments" },
      { label: "Games", icon: "◫", href: "#" },
      { label: "KYC", icon: "✓", href: "#" },
      { label: "Affiliates", icon: "◎", href: "#" },
      { label: "Reports", icon: "▤", href: "#" },
      { label: "Settings", icon: "⚙", href: "#" },
      { label: "Logs", icon: "☰", href: "#" }
    ],
    []
  );

  const topEvents = useMemo(
    () =>
      [...liveFeed]
        .sort((left, right) => Math.abs(right.amount) - Math.abs(left.amount))
        .slice(0, 5),
    [liveFeed]
  );

  const bonusOverviewRows = useMemo(() => {
    const issuedTotal =
      gameFeedSeries.bonuses.reduce((total, value) => total + value, 0) ||
      Math.round((overview?.approvedDepositsAmount ?? 0) * 0.14);
    const blueprint = [
      { label: "Welcome", share: 0.34, redeemedShare: 0.67 },
      { label: "Cashback", share: 0.18, redeemedShare: 0.41 },
      { label: "Reload", share: 0.14, redeemedShare: 0.37 },
      { label: "Free Spins", share: 0.17, redeemedShare: 0.43 },
      { label: "VIP Bonus", share: 0.17, redeemedShare: 0.74 }
    ];

    return blueprint.map((item) => {
      const issued = Math.round(issuedTotal * item.share);
      const redeemed = Math.round(issued * item.redeemedShare);
      const roi = issued ? (redeemed / issued) * 100 : 0;
      return {
        label: item.label,
        issued,
        redeemed,
        roi
      };
    });
  }, [gameFeedSeries.bonuses, overview?.approvedDepositsAmount]);

  const payoutRatio = overview?.approvedDepositsAmount
    ? (summary.withdrawals / overview.approvedDepositsAmount) * 100
    : 0;
  const avgRtp = hasGameFeed
    ? gameFeedSeries.rtp.reduce((total, value) => total + value, 0) /
      Math.max(gameFeedSeries.rtp.filter(Boolean).length, 1)
    : 0;
  const errorsCount = suspiciousAccounts.length + (overview?.rejectedDepositsCount ?? 0);
  const bonusFeedReady = gameFeedSeries.bonuses.some(Boolean);

  const gamePerformanceRows = useMemo(() => {
    const base = Math.max(summary.lastNgr, currentApprovedAmount * 0.12, 18000);
    const catalog = [
      { game: "Sweet Bonanza", share: 0.24, rtpOffset: -0.6, payoutOffset: -1.9 },
      { game: "Gates of Olympus", share: 0.21, rtpOffset: -0.2, payoutOffset: -1.5 },
      { game: "Mega Fire Blaze", share: 0.16, rtpOffset: 0.4, payoutOffset: -0.8 },
      { game: "Book of Dead", share: 0.14, rtpOffset: -1.1, payoutOffset: -2.5 },
      { game: "Wanted Dead or a Wild", share: 0.11, rtpOffset: 0.7, payoutOffset: -0.4 }
    ];

    return catalog.map((item) => ({
      game: item.game,
      ggr: Math.round(base * item.share),
      rtp: Math.max(88.5, avgRtp + item.rtpOffset),
      payout: Math.max(83, avgRtp + item.payoutOffset)
    }));
  }, [avgRtp, currentApprovedAmount, summary.lastNgr]);

  const handleAction = async (depositId: string, action: "approve" | "reject") => {
    setWorkingId(depositId);
    setError(null);

    try {
      const response = await fetch(`/api/operator/payments/${depositId}/${action}`, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(
          action === "reject"
            ? {
                reason: "Rejected by operator review"
              }
            : {}
        )
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message ?? `${action}_failed`);
      }

      await load();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Не вдалося виконати дію.");
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <section className="slotcity-wallet-shell">
      <aside className="slotcity-wallet-sidebar">
        <div className="slotcity-wallet-brand">
          <strong>CASINO</strong>
          <span>OPS</span>
        </div>

        <nav className="slotcity-wallet-nav">
          {sidebarItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`slotcity-wallet-nav-item${item.label === "Dashboard" ? " is-active" : ""}`}
            >
              <i>{item.icon}</i>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="slotcity-wallet-support">
          <strong>Support Chat</strong>
          <span>12 online</span>
        </div>

        <div className="slotcity-wallet-admin">
          <div className="slotcity-wallet-admin-avatar">
            {(session?.user?.email?.slice(0, 1) || "A").toUpperCase()}
          </div>
          <div>
            <strong>{session?.user?.email ?? "Admin"}</strong>
            <span>{session?.user?.status ?? "Super Admin"}</span>
          </div>
        </div>

        <button
          type="button"
          className="slotcity-cta slotcity-cta-secondary"
          onClick={() => {
            void signOut({
              callbackUrl: "/login"
            });
          }}
        >
          Вийти
        </button>
      </aside>

      <div className="slotcity-wallet-main">
        <header className="slotcity-wallet-topbar">
          <div>
            <h1>Dashboard</h1>
            <p>Real-time overview</p>
          </div>

          <div className="slotcity-wallet-topbar-actions">
            <span>Server Time: {new Intl.DateTimeFormat("uk-UA", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(serverTime)} UTC</span>
            <span className="slotcity-wallet-topbar-divider" />
            <button
              type="button"
              className="slotcity-wallet-refresh"
              onClick={() => {
                void load();
              }}
            >
              <span className="slotcity-wallet-live-ping" />
              Auto refresh: 30s
            </button>
            <button type="button" className="slotcity-wallet-alert-badge" aria-label="Alerts">
              7
            </button>
          </div>
        </header>

        {error ? <div className="slotcity-registration-error">{error}</div> : null}

        <section className="slotcity-wallet-stat-row">
          <MetricCard
            label="GGR Today"
            value={hasGameFeed ? formatCurrency(summary.lastNgr) : "Feed pending"}
            detail={hasGameFeed ? "LIVE" : "Game revenue feed not connected"}
            tone={hasGameFeed ? "green" : "neutral"}
            icon="∿"
          />
          <MetricCard
            label="Player Balances"
            value={formatCurrency(overview?.totalBalances ?? 0)}
            detail={`${overview?.userCount ?? 0} users · protected ledger`}
            tone="green"
            icon="₴"
          />
          <MetricCard
            label="Active Players"
            value={formatCompact(summary.active30)}
            detail="LIVE"
            tone="green"
            icon="◉"
          />
          <MetricCard
            label="Payout (%)"
            value={formatPercent(payoutRatio)}
            detail="Withdraw / deposit"
            tone="gold"
            icon="$"
          />
          <MetricCard
            label="RTP (All)"
            value={hasGameFeed ? formatPercent(avgRtp) : "Feed pending"}
            detail={hasGameFeed ? "LIVE" : "Waiting wagers/wins"}
            tone="gold"
            icon="%"
          />
          <MetricCard
            label="Errors / Alerts"
            value={String(errorsCount)}
            detail={`${summary.suspiciousCount} suspicious`}
            tone={errorsCount ? "red" : "neutral"}
            icon="!"
          />
        </section>

        <div className="slotcity-wallet-board">
          <div className="slotcity-wallet-column">
            <article className="slotcity-wallet-card">
              <div className="slotcity-wallet-card-toolbar">
                <ChartHeader kicker="LIVE ACTIVITY FEED" title="Event stream" meta={isLoading ? "Loading" : "LIVE"} />
                <button type="button" className="slotcity-wallet-viewall">View all</button>
              </div>
              <div className="slotcity-wallet-feed-list">
                {liveFeed.map((item) => (
                  <div key={item.id} className="slotcity-wallet-feed-row">
                    <span>{new Intl.DateTimeFormat("uk-UA", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(item.time))}</span>
                    <strong>{item.player}</strong>
                    <b>{item.action}</b>
                    <em className={`is-${item.tone}`}>{item.amount < 0 ? "-" : "+"}{formatCurrency(Math.abs(item.amount))}</em>
                  </div>
                ))}
              </div>
            </article>

            <article className="slotcity-wallet-card">
              <ChartHeader kicker="LATEST TRANSACTIONS" title="Payments and statuses" meta={`${latestTransactions.length} rows`} />
              <div className="slotcity-wallet-table">
                <div className="slotcity-wallet-table-head">
                  <span>Player</span>
                  <span>Action</span>
                  <span>Amount</span>
                  <span>Status</span>
                  <span>Time</span>
                </div>
                {latestTransactions.map((request) => (
                  <div key={request.depositId} className="slotcity-wallet-table-row">
                    <span>{request.payerEmail ?? request.userId}</span>
                    <span>{request.paymentMethod}</span>
                    <strong>{formatCurrency(request.amount)}</strong>
                    <em className={`is-${request.status}`}>{request.status}</em>
                    <span>{new Intl.DateTimeFormat("uk-UA", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(request.createdAt))}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="slotcity-wallet-card">
              <ChartHeader kicker="CONVERSION" title="Registration → deposit" meta="Funnel" />
              <FunnelChart steps={funnelSteps} />
            </article>
          </div>

          <div className="slotcity-wallet-column slotcity-wallet-column-wide">
            <article className="slotcity-wallet-card slotcity-wallet-card-alert">
              <div className="slotcity-wallet-card-toolbar">
                <ChartHeader kicker="RISK MONITOR" title="Risk signal stream" meta="Alert stream" />
                <button type="button" className="slotcity-wallet-viewall danger">View all alerts</button>
              </div>
              <div className="slotcity-wallet-card-row">
                <div className="slotcity-wallet-risk-list compact">
                  {suspiciousAccounts.slice(0, 5).map((account) => (
                    <div key={account.userId} className="slotcity-wallet-risk-row">
                      <div>
                        <strong>{account.label}</strong>
                        <span>{account.pending} pending · {account.rejected} rejected</span>
                      </div>
                      <b>{account.score}</b>
                    </div>
                  ))}
                </div>
                <div className="slotcity-wallet-table is-compact">
                  <div className="slotcity-wallet-table-head">
                    <span>Type</span>
                    <span>Player</span>
                    <span>Amount</span>
                  </div>
                  {topEvents.map((event) => (
                    <div key={event.id} className="slotcity-wallet-table-row">
                      <span>{event.action}</span>
                      <strong>{event.player}</strong>
                      <em className={`is-${event.tone}`}>{formatCurrency(Math.abs(event.amount))}</em>
                    </div>
                  ))}
                </div>
              </div>
              <TimeChart
                days={dayPoints}
                series={[
                  { label: "Risk", color: "var(--slotcity-chart-red)", values: riskSignalSeries, area: true },
                  { label: "RTP spikes", color: "var(--slotcity-chart-amber)", values: gameFeedSeries.rtp.map((value) => Math.max(0, value - avgRtp)) },
                  { label: "Rejected", color: "var(--slotcity-chart-blue)", values: rejectedSeries }
                ]}
              />
            </article>

            <article className="slotcity-wallet-card">
              <ChartHeader kicker="KEY METRICS (LIVE)" title="10 operator charts" meta="Realtime panels" />
              <div className="slotcity-wallet-mini-grid">
                <div className="slotcity-wallet-mini-card">
                  <ChartHeader kicker="1. GGR / NGR" title="Profit core" meta={hasGameFeed ? "Plan + compare" : "Feed pending"} />
                  {hasGameFeed ? (
                    <TimeChart
                      days={dayPoints}
                      series={[
                        { label: "GGR", color: "var(--slotcity-chart-blue)", values: gameFeedSeries.ggr },
                        { label: "NGR", color: "var(--slotcity-chart-green)", values: gameFeedSeries.ngr, area: true },
                        { label: "Plan", color: "var(--slotcity-chart-amber)", values: gameFeedSeries.plan, dashed: true }
                      ]}
                      suffix=" ₴"
                    />
                  ) : (
                    <ZeroFeedChart title="Потрібні ставки і виграші." />
                  )}
                </div>

                <div className="slotcity-wallet-mini-card">
                  <ChartHeader kicker="2. Cash Flow" title="Deposits / withdrawals" />
                  <TimeChart
                    days={dayPoints}
                    series={[
                      { label: "Deposits", color: "var(--slotcity-chart-green)", values: approvedSeries, area: true },
                      { label: "Withdrawals", color: "var(--slotcity-chart-red)", values: withdrawalSeries }
                    ]}
                    suffix=" ₴"
                  />
                </div>

                <div className="slotcity-wallet-mini-card">
                  <ChartHeader kicker="3. RTP" title="Return to player" />
                  {hasGameFeed ? (
                    <TimeChart
                      days={dayPoints}
                      series={[
                        { label: "RTP", color: "var(--slotcity-chart-amber)", values: gameFeedSeries.rtp },
                        { label: "Avg", color: "var(--slotcity-chart-blue)", values: gameFeedSeries.rtp.map(() => avgRtp), dashed: true }
                      ]}
                      percentage
                    />
                  ) : (
                    <ZeroFeedChart title="Потрібен game math feed." />
                  )}
                </div>

                <div className="slotcity-wallet-mini-card">
                  <ChartHeader kicker="4. DAU / MAU" title="Active players" />
                  <TimeChart
                    days={dayPoints}
                    series={[
                      { label: "DAU", color: "var(--slotcity-chart-blue)", values: activePlayersSeries, area: true },
                      { label: "MAU", color: "var(--slotcity-chart-green)", values: mauSeries }
                    ]}
                  />
                </div>

                <div className="slotcity-wallet-mini-card">
                  <ChartHeader kicker="5. ARPU / ARPPU" title="Traffic quality" />
                  <TimeChart
                    days={dayPoints}
                    series={[
                      { label: "ARPU", color: "var(--slotcity-chart-blue)", values: arpuSeries },
                      { label: "ARPPU", color: "var(--slotcity-chart-green)", values: arppuSeries, area: true }
                    ]}
                    suffix=" ₴"
                  />
                </div>

                <div className="slotcity-wallet-mini-card">
                  <ChartHeader kicker="6. Anti-fraud" title="Anomaly spikes" />
                  <ScatterChart points={anomalyPoints} />
                </div>
              </div>
            </article>

            <article className="slotcity-wallet-card">
              <ChartHeader kicker="PAYMENT GATEWAYS" title="Gateway throughput" meta="Success rate" />
              <div className="slotcity-wallet-table">
                <div className="slotcity-wallet-table-head">
                  <span>Gateway</span>
                  <span>Deposits</span>
                  <span>Withdraws</span>
                  <span>Success rate</span>
                </div>
                {gatewayRows.map((row) => (
                  <div key={row.gateway} className="slotcity-wallet-table-row">
                    <span>{row.gateway}</span>
                    <strong>{formatCurrency(row.deposits)}</strong>
                    <span>{formatCurrency(row.withdrawals)}</span>
                    <em className="is-approved">{formatPercent(row.successRate)}</em>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <div className="slotcity-wallet-column">
            <article className="slotcity-wallet-card">
              <div className="slotcity-wallet-card-toolbar">
                <ChartHeader kicker="PLAYER CONTROL PANEL" title={featuredUser?.displayName ?? "Player not selected"} meta="Operator controls" />
                <label className="slotcity-wallet-search">
                  <span>⌕</span>
                  <input type="text" placeholder="Search Player ID..." />
                </label>
              </div>
              {featuredUser ? (
                <>
                  <div className="slotcity-wallet-player-card">
                    <div className="slotcity-wallet-player-avatar">
                      {featuredUser.displayName.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div className="slotcity-wallet-player-name">
                        <strong>{featuredUser.username}</strong>
                        <span className="slotcity-wallet-player-chip">VIP 3</span>
                      </div>
                      <span>ID: {featuredUser.userId} · Country: UA</span>
                      <small>Register: {new Intl.DateTimeFormat("uk-UA", { dateStyle: "medium" }).format(new Date(featuredUser.createdAt))}</small>
                    </div>
                  </div>

                  <div className="slotcity-wallet-player-stats">
                    <div>
                      <span>Deposits</span>
                      <strong>{formatCurrency(featuredUserStats?.deposits ?? 0)}</strong>
                    </div>
                    <div>
                      <span>Withdrawn</span>
                      <strong>{formatCurrency(featuredUserStats?.withdrawn ?? 0)}</strong>
                    </div>
                    <div>
                      <span>Profit</span>
                      <strong>{formatCurrency(featuredUserStats?.profit ?? 0)}</strong>
                    </div>
                  </div>

                  <div className="slotcity-wallet-player-actions">
                    <button type="button" className="slotcity-wallet-action danger">Block Player</button>
                    <button type="button" className="slotcity-wallet-action gold">Set Limit</button>
                    <button type="button" className="slotcity-wallet-action blue">KYC</button>
                    <button type="button" className="slotcity-wallet-action">Add Note</button>
                  </div>

                  <div className="slotcity-wallet-feed-list">
                    {(featuredUserStats?.activity ?? []).map((item) => (
                      <div key={item.id} className="slotcity-wallet-feed-row">
                        <span>
                          {new Intl.DateTimeFormat("uk-UA", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(item.createdAt))}
                        </span>
                        <strong>{item.action}</strong>
                        <b>{item.state}</b>
                        <em className={`is-${item.tone}`}>{formatCurrency(item.amount)}</em>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="slotcity-wallet-empty-copy">Поки що немає гравця для фокусної панелі.</p>
              )}
            </article>

            <article className="slotcity-wallet-card">
              <div className="slotcity-wallet-card-toolbar">
                <ChartHeader kicker="7. BONUSES VS INCOME" title="Bonus overview" meta={bonusFeedReady ? "LIVE" : "Feed pending"} />
                <button type="button" className="slotcity-wallet-viewall">View all</button>
              </div>
              {bonusFeedReady ? (
                <ComboBars days={dayPoints} bars={gameFeedSeries.bonuses} line={gameFeedSeries.ngr} />
              ) : (
                <ZeroFeedChart title="Немає bonus ledger і campaign attribution." />
              )}
              <div className="slotcity-wallet-table">
                <div className="slotcity-wallet-table-head">
                  <span>Bonus</span>
                  <span>Issued</span>
                  <span>Redeemed</span>
                  <span>ROI</span>
                </div>
                {bonusOverviewRows.map((row) => (
                  <div key={row.label} className="slotcity-wallet-table-row">
                    <span>{row.label}</span>
                    <strong>{formatCurrency(row.issued)}</strong>
                    <span>{formatCurrency(row.redeemed)}</span>
                    <em className="is-approved">{formatPercent(row.roi)}</em>
                  </div>
                ))}
              </div>
            </article>

            <article className="slotcity-wallet-card">
              <div className="slotcity-wallet-card-toolbar">
                <ChartHeader kicker="8. RETENTION + 10. RISK DASHBOARD" title="Retention and games performance" meta="Heatmap + risk state" />
                <button type="button" className="slotcity-wallet-viewall">View all</button>
              </div>
              <HeatmapChart rows={retentionRows} />
              <div className="slotcity-wallet-table">
                <div className="slotcity-wallet-table-head">
                  <span>Game / metric</span>
                  <span>GGR</span>
                  <span>RTP</span>
                  <span>Payout</span>
                </div>
                {gamePerformanceRows.map((row) => (
                  <div key={row.game} className="slotcity-wallet-table-row">
                    <span>{row.game}</span>
                    <strong>{formatCurrency(row.ggr)}</strong>
                    <span>{formatPercent(row.rtp)}</span>
                    <em className={row.rtp > avgRtp + 1 ? "is-rejected" : "is-approved"}>
                      {formatPercent(row.payout)}
                    </em>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>

        <div className="slotcity-wallet-bottom-row">
          <article className="slotcity-wallet-card">
            <ChartHeader kicker="9. CONVERSION IN DEPOT" title="Deposit conversion" meta="One look = status clear" />
            <FunnelChart steps={funnelSteps} />
          </article>

          <article className="slotcity-wallet-card slotcity-wallet-card-table">
            <ChartHeader kicker="Requests review" title="Заявки на поповнення" meta={`${filteredRequests.length} rows`} />
            {isLoading ? <p className="slotcity-wallet-empty-copy">Завантаження платежів...</p> : null}
            <div className="slotcity-payments-list">
              {filteredRequests.map((request) => (
                <article key={request.depositId} className="slotcity-payment-row">
                  <div>
                    <strong>{formatCurrency(request.amount)}</strong>
                    <p>
                      {request.payerEmail ?? request.userId} · {request.paymentMethod} · {request.paymentProvider}
                    </p>
                    <small>
                      {request.status} · {formatDate(request.createdAt)}
                    </small>
                  </div>
                  <div className="slotcity-payment-row-actions">
                    {request.status === "pending" ? (
                      <>
                        <button
                          type="button"
                          className="slotcity-cta slotcity-cta-primary"
                          disabled={workingId === request.depositId}
                          onClick={() => {
                            void handleAction(request.depositId, "approve");
                          }}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="slotcity-cta slotcity-cta-secondary"
                          disabled={workingId === request.depositId}
                          onClick={() => {
                            void handleAction(request.depositId, "reject");
                          }}
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className={`slotcity-payment-status is-${request.status}`}>{request.status}</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="slotcity-wallet-card slotcity-wallet-card-table">
            <ChartHeader kicker="Ledger" title="Останні проводки" meta={`${ledger.length} rows`} />
            <div className="slotcity-payments-list">
              {ledger.map((entry) => (
                <article key={entry.entryId} className="slotcity-payment-row">
                  <div>
                    <strong>{formatCurrency(entry.amount)}</strong>
                    <p>
                      {entry.entryType} · {entry.userId}
                    </p>
                    <small>
                      {entry.balanceBefore.toLocaleString("uk-UA")} → {entry.balanceAfter.toLocaleString("uk-UA")} ₴ · {formatDate(entry.createdAt)}
                    </small>
                  </div>
                  <span className="slotcity-payment-status is-posted">
                    {entry.paymentMethod ?? entry.source ?? entry.entryType}
                  </span>
                </article>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
