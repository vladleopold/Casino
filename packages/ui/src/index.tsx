import type { PropsWithChildren } from "react";

export function Kicker({ children }: PropsWithChildren) {
  return <span className="kicker">{children}</span>;
}

export function GlowCard({
  children,
  className = ""
}: PropsWithChildren<{ className?: string }>) {
  return <article className={`glow-card ${className}`.trim()}>{children}</article>;
}
