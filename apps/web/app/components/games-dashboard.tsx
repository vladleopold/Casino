"use client";

import React from "react";

interface GameRow {
  game: string;
  provider: string;
  bets: number;
  wins: number;
  ggr: number;
  rtp: number;
  players: number;
  avgBet: number;
  volatility: "Low" | "Medium" | "High";
  status: "Active" | "Inactive" | "Paused";
}

const SAMPLE_GAMES: GameRow[] = [
  { game: "Sweet Bonanza", provider: "Pragmatic Play", bets: 256430, wins: 231890, ggr: 24540, rtp: 96.45, players: 2431, avgBet: 1.25, volatility: "High", status: "Active" },
  { game: "Gates of Olympus", provider: "Pragmatic Play", bets: 198450, wins: 179530, ggr: 18920, rtp: 95.32, players: 1987, avgBet: 1.35, volatility: "High", status: "Active" },
  { game: "Wanted Dead or a Wild", provider: "Hacksaw Gaming", bets: 165780, wins: 150110, ggr: 15670, rtp: 96.10, players: 1876, avgBet: 1.42, volatility: "High", status: "Active" },
  { game: "Book of Dead", provider: "Play'n GO", bets: 132890, wins: 120550, ggr: 12340, rtp: 94.85, players: 1543, avgBet: 1.28, volatility: "Medium", status: "Active" },
  { game: "Big Bass Splash", provider: "Pragmatic Play", bets: 98750, wins: 88900, ggr: 9850, rtp: 96.78, players: 1234, avgBet: 1.18, volatility: "Medium", status: "Active" }
];

export function GamesDashboard({ operator }: { operator: { email: string; role: string } }) {
  return (
    <section className="slotcity-wallet-shell">
      <aside className="slotcity-wallet-sidebar">
        <div className="slotcity-wallet-brand">
          <strong>WINZ</strong>
          <span>OPS</span>
        </div>

        <nav className="slotcity-wallet-nav">
          <a href="/operator/payments" className="slotcity-wallet-nav-item">Payments</a>
          <a href="/operator/users" className="slotcity-wallet-nav-item">Admin Access</a>
          <a href="/operator/games" className="slotcity-wallet-nav-item is-active">Games</a>
        </nav>

        <div className="slotcity-wallet-support">
          <strong>Support Chat</strong>
          <span>12 online</span>
        </div>

        <div className="slotcity-wallet-admin">
          <div className="slotcity-wallet-admin-avatar">{(operator.email.slice(0,1)||"A").toUpperCase()}</div>
          <div>
            <strong>{operator.email}</strong>
            <span>{operator.role}</span>
          </div>
        </div>
      </aside>

      <div className="slotcity-wallet-main">
        <header className="slotcity-wallet-topbar">
          <div>
            <h1>Game Analytics</h1>
            <p>Overview — real time summary</p>
          </div>

          <div className="slotcity-wallet-topbar-actions">
            <span>Server Time: {new Intl.DateTimeFormat("uk-UA", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date())} UTC</span>
            <span className="slotcity-wallet-topbar-divider" />
            <button type="button" className="slotcity-wallet-refresh">Refresh</button>
          </div>
        </header>

        <section className="slotcity-wallet-stat-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12 }}>
          <div className="slotcity-wallet-mini-card">
            <strong>€124,321</strong>
            <div style={{ color: 'var(--slotcity-admin-muted)' }}>Total GGR</div>
          </div>
          <div className="slotcity-wallet-mini-card">
            <strong>1,258,430</strong>
            <div style={{ color: 'var(--slotcity-admin-muted)' }}>Total Bets</div>
          </div>
          <div className="slotcity-wallet-mini-card">
            <strong>€1,134,210</strong>
            <div style={{ color: 'var(--slotcity-admin-muted)' }}>Total Wins</div>
          </div>
          <div className="slotcity-wallet-mini-card">
            <strong>95.23%</strong>
            <div style={{ color: 'var(--slotcity-admin-muted)' }}>RTP</div>
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 12, marginTop: 12 }}>
          <div className="slotcity-wallet-mini-card" style={{ minHeight: 260 }}>
            <strong style={{ display: 'block', marginBottom: 8 }}>GGR Over Time (Top Games)</strong>
            <div style={{ height: 180, background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))', borderRadius: 8 }} />
          </div>

          <div className="slotcity-wallet-mini-card" style={{ minHeight: 260 }}>
            <strong style={{ display: 'block', marginBottom: 8 }}>RTP Comparison</strong>
            <div style={{ height: 180, background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))', borderRadius: 8 }} />
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div className="slotcity-wallet-mini-card" style={{ padding: 8 }}>
            <strong style={{ display: 'block', marginBottom: 8 }}>Game List</strong>
            <div className="slotcity-wallet-table">
              <div className="slotcity-wallet-table-head" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 0.9fr 0.9fr 0.9fr 0.9fr 0.8fr' }}>
                <span>Game</span>
                <span>Provider</span>
                <span>Bets</span>
                <span>Wins</span>
                <span>GGR</span>
                <span>RTP</span>
                <span>Players</span>
                <span>Avg Bet</span>
                <span>Volatility</span>
                <span>Status</span>
              </div>

              {SAMPLE_GAMES.map((row) => (
                <div key={row.game} className="slotcity-wallet-table-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 0.9fr 0.9fr 0.9fr 0.9fr 0.8fr' }}>
                  <span>{row.game}</span>
                  <span>{row.provider}</span>
                  <strong>{row.bets.toLocaleString()}</strong>
                  <span>{row.wins.toLocaleString()}</span>
                  <strong>{`€${row.ggr.toLocaleString()}`}</strong>
                  <span>{row.rtp.toFixed(2)}%</span>
                  <span>{row.players.toLocaleString()}</span>
                  <span>€{row.avgBet.toFixed(2)}</span>
                  <span>{row.volatility}</span>
                  <em className={row.status === 'Active' ? 'is-approved' : 'is-rejected'}>{row.status}</em>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default GamesDashboard;
