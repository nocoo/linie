import type { ReactNode } from "react";

interface PanelProps {
  number: string;
  title: string;
  label: string;
  children: ReactNode;
  className?: string;
}

export function Panel({
  number,
  title,
  label,
  children,
  className = "",
}: PanelProps) {
  return (
    <section
      className={`panel ${className}`}
      aria-labelledby={`panel-${number}`}
    >
      <header className="panel-heading">
        <span className="panel-number">{number}</span>
        <h2 id={`panel-${number}`}>{title}</h2>
        <span className="panel-label">{label}</span>
      </header>
      <div className="panel-body">{children}</div>
      <span
        className="registration-mark registration-mark-tl"
        aria-hidden="true"
      />
      <span
        className="registration-mark registration-mark-br"
        aria-hidden="true"
      />
    </section>
  );
}
