import type { ReactNode } from "react";

const columns = Array.from({ length: 25 }, (_, i) =>
  String(i + 1).padStart(2, "0"),
);
const rows = "ABCDEFGHIJKLMNOPQR".split("");

export function DrawingFrame({ children }: { children: ReactNode }) {
  return (
    <main className="atlas" id="atlas">
      <a className="skip-link" href="#inventory">
        Skip to server inventory
      </a>
      <div className="ruler ruler-top" aria-hidden="true">
        {columns.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="ruler ruler-bottom" aria-hidden="true">
        {columns.map((label) => (
          <span key={label} />
        ))}
      </div>
      <div className="ruler ruler-left" aria-hidden="true">
        {rows.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="ruler ruler-right" aria-hidden="true">
        {rows.map((label) => (
          <span key={label} />
        ))}
      </div>
      {children}
    </main>
  );
}
