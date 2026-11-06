import { Badge } from "@radix-ui/themes";
import type { ServerStatus } from "../models/infrastructure";

export function Status({ status }: { status: ServerStatus }) {
  return (
    <span className={`status status-${status}`}>
      <span className="status-dot" />
      {status === "degraded" ? "warning" : status}
    </span>
  );
}

export function Stamp({
  children,
  tone = "good",
}: {
  children: React.ReactNode;
  tone?: "good" | "warning" | "critical" | "neutral";
}) {
  return (
    <Badge variant="outline" className={`stamp stamp-${tone}`}>
      {children}
    </Badge>
  );
}
