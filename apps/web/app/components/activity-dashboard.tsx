"use client";

import { useEffect, useMemo, useState } from "react";

interface ActivityUserSummary {
  userKey: string;
  displayName: string;
  authState: "authenticated" | "anonymous";
  userId?: string;
  anonymousId?: string;
  sessionId: string;
  firstSeenAt: string;
  lastSeenAt: string;
  lastEvent: string;
  lastPath?: string;
  eventCount: number;
}

interface ActivityEventRecord {
  id: string;
  userKey: string;
  event: string;
  source: string;
  occurredAt: string;
  userId?: string;
  anonymousId?: string;
  sessionId: string;
  gameId?: string;
  providerId?: string;
  route?: string;
  path?: string;
  label?: string;
  properties?: Record<string, unknown>;
}

interface ActivityUserDetails {
  user: ActivityUserSummary | null;
  events: ActivityEventRecord[];
}

function formatDate(value?: string) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatPropertyValue(value: unknown) {
  if (value === null || value === undefined) {
    return "—";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return JSON.stringify(value);
}

export function ActivityDashboard() {
  const [users, setUsers] = useState<ActivityUserSummary[]>([]);
  const [selectedUserKey, setSelectedUserKey] = useState<string>("");
  const [details, setDetails] = useState<ActivityUserDetails | null>(null);
  const [query, setQuery] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async (searchValue = query) => {
    setIsLoadingUsers(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/activity/users?limit=32&query=${encodeURIComponent(searchValue)}`,
        {
          cache: "no-store"
        }
      );

      if (!response.ok) {
        throw new Error(`users_${response.status}`);
      }

      const payload = (await response.json()) as {
        users: ActivityUserSummary[];
      };

      setUsers(payload.users);

      if (!selectedUserKey && payload.users[0]) {
        setSelectedUserKey(payload.users[0].userKey);
      }

      if (selectedUserKey && !payload.users.some((item) => item.userKey === selectedUserKey)) {
        setSelectedUserKey(payload.users[0]?.userKey ?? "");
      }
    } catch {
      setError("Не вдалося завантажити список користувачів.");
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    void loadUsers("");
  }, []);

  useEffect(() => {
    if (!selectedUserKey) {
      setDetails(null);
      return;
    }

    const controller = new AbortController();

    const loadDetails = async () => {
      setIsLoadingDetails(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/activity/users/${encodeURIComponent(selectedUserKey)}?limit=80`,
          {
            cache: "no-store",
            signal: controller.signal
          }
        );

        if (!response.ok) {
          throw new Error(`user_${response.status}`);
        }

        const payload = (await response.json()) as ActivityUserDetails;
        setDetails(payload);
      } catch (nextError) {
        if (controller.signal.aborted) {
          return;
        }

        setError("Не вдалося завантажити події користувача.");
        setDetails(null);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingDetails(false);
        }
      }
    };

    void loadDetails();

    return () => controller.abort();
  }, [selectedUserKey]);

  const selectedUser = useMemo(() => {
    return details?.user ?? users.find((item) => item.userKey === selectedUserKey) ?? null;
  }, [details?.user, selectedUserKey, users]);

  return (
    <div className="slotcity-activity-dashboard">
      <section className="slotcity-activity-users">
        <div className="slotcity-activity-toolbar">
          <div>
            <span className="slotcity-section-kicker">Operator Activity</span>
            <h1>Дії користувачів</h1>
          </div>
          <button
            type="button"
            className="slotcity-cta slotcity-cta-secondary"
            onClick={() => {
              void loadUsers(query);
            }}
          >
            Оновити
          </button>
        </div>

        <label className="slotcity-registration-field">
          <span>Пошук по userId / session / path</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="user:sc_..., /game/..., catalog"
          />
        </label>

        <button
          type="button"
          className="slotcity-auth-button slotcity-auth-button-dark"
          onClick={() => {
            void loadUsers(query);
          }}
        >
          Знайти
        </button>

        {isLoadingUsers ? <p className="slotcity-activity-empty">Завантаження користувачів...</p> : null}
        {!isLoadingUsers && users.length === 0 ? (
          <p className="slotcity-activity-empty">Подій ще немає або activity API недоступний.</p>
        ) : null}

        <div className="slotcity-activity-user-list">
          {users.map((user) => (
            <button
              key={user.userKey}
              type="button"
              className={`slotcity-activity-user-row${selectedUserKey === user.userKey ? " is-active" : ""}`}
              onClick={() => setSelectedUserKey(user.userKey)}
            >
              <strong>{user.displayName}</strong>
              <span>{user.userId ?? user.anonymousId ?? user.sessionId}</span>
              <small>
                {user.lastEvent} · {formatDate(user.lastSeenAt)}
              </small>
            </button>
          ))}
        </div>
      </section>

      <section className="slotcity-activity-details">
        {error ? <div className="slotcity-registration-error">{error}</div> : null}

        {selectedUser ? (
          <div className="slotcity-activity-summary">
            <div className="slotcity-activity-summary-header">
              <div>
                <span className="slotcity-section-kicker">User Summary</span>
                <h2>{selectedUser.displayName}</h2>
              </div>
              <span className="slotcity-activity-state">{selectedUser.authState}</span>
            </div>

            <div className="slotcity-chip-row slotcity-chip-row-activity">
              <span>userId: {selectedUser.userId ?? "—"}</span>
              <span>anonymous: {selectedUser.anonymousId ?? "—"}</span>
              <span>session: {selectedUser.sessionId}</span>
              <span>events: {selectedUser.eventCount}</span>
            </div>

            <div className="slotcity-editorial-grid slotcity-activity-meta-grid">
              <article className="slotcity-live-info-card">
                <span className="slotcity-section-kicker">Перший візит</span>
                <h3>{formatDate(selectedUser.firstSeenAt)}</h3>
                <p>Перший зафіксований event у поточному activity store.</p>
              </article>
              <article className="slotcity-live-info-card">
                <span className="slotcity-section-kicker">Остання дія</span>
                <h3>{selectedUser.lastEvent}</h3>
                <p>{selectedUser.lastPath ?? "Маршрут не передано"}.</p>
              </article>
            </div>
          </div>
        ) : (
          <p className="slotcity-activity-empty">Оберіть користувача ліворуч.</p>
        )}

        <div className="slotcity-activity-event-list">
          {isLoadingDetails ? <p className="slotcity-activity-empty">Завантаження подій...</p> : null}
          {!isLoadingDetails && details?.events.length === 0 ? (
            <p className="slotcity-activity-empty">Для цього користувача ще немає подій.</p>
          ) : null}

          {details?.events.map((event) => (
            <article key={event.id} className="slotcity-activity-event-card">
              <div className="slotcity-activity-event-header">
                <strong>{event.event}</strong>
                <span>{formatDate(event.occurredAt)}</span>
              </div>
              <div className="slotcity-chip-row slotcity-chip-row-activity">
                <span>{event.source}</span>
                <span>{event.path ?? event.route ?? "no-path"}</span>
                {event.gameId ? <span>game: {event.gameId}</span> : null}
                {event.label ? <span>{event.label}</span> : null}
              </div>
              {event.properties ? (
                <dl className="slotcity-activity-properties">
                  {Object.entries(event.properties)
                    .slice(0, 8)
                    .map(([key, value]) => (
                      <div key={key}>
                        <dt>{key}</dt>
                        <dd>{formatPropertyValue(value)}</dd>
                      </div>
                    ))}
                </dl>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
