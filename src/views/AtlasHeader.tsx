import { Button, IconButton, Tooltip } from "@radix-ui/themes";
import { ArrowDownToLine, Plus, RotateCw } from "lucide-react";
import type { AtlasViewModel } from "../viewmodels/useAtlasViewModel";

export function AtlasHeader({ vm }: { vm: AtlasViewModel }) {
  return (
    <>
      <header className="masthead">
        <div className="brand">
          <img
            className="brand-mark"
            src="/brand-mark.png"
            alt=""
            aria-hidden="true"
            width={48}
            height={48}
          />
          <div>
            <div className="brand-titles">
              <h1>LINIE</h1>
              <span>Infrastructure atlas</span>
            </div>
            <p>NETWORK OPERATIONS / A SINGLE SOURCE OF TRUTH</p>
            <div className="brand-caption">
              Every connection. Every machine. Everything in line.
            </div>
          </div>
        </div>
        <div className="drawing-metadata">
          <div>
            <strong>DRAWING LN-NET-001</strong>
            <strong>REV A / OPERATIONS</strong>
          </div>
          <div>
            <span>GLOBAL INFRASTRUCTURE</span>
            <span>{vm.sampledAt.toISOString().slice(0, 10)} / UTC</span>
          </div>
          <div>
            <span className="demo-label">
              <span className="status-dot" />
              LOCAL DEMO / SIMULATED DATA
            </span>
            <span>SHEET 1 OF 1</span>
          </div>
        </div>
      </header>
      <section className="metric-strip" aria-label="Fleet summary">
        {[
          {
            value: vm.summary.total.toLocaleString("en-US"),
            label: "Managed servers",
            detail: "Physical & virtual machines",
            tone: "good",
          },
          {
            value: vm.summary.online.toLocaleString("en-US"),
            label: "Healthy hosts",
            detail: "All health checks passing",
            tone: "good",
          },
          {
            value: "4 / 4",
            label: "Connected regions",
            detail: "Global network coverage",
            tone: "good",
          },
          {
            value: "38.4",
            label: "Network throughput",
            detail: "Gbps / reference sample",
            tone: "good",
          },
          {
            value: vm.summary.offline,
            label: "Offline hosts",
            detail: "Heartbeat not received",
            tone: "critical",
          },
          {
            value: vm.summary.attention,
            label: "Needs attention",
            detail: "Degraded or in maintenance",
            tone: "warning",
          },
          {
            value: `${vm.summary.availability}%`,
            label: "Fleet reachability",
            detail: "Healthy + degraded / total",
            tone: "good",
          },
        ].map((metric) => (
          <div className={`metric metric-${metric.tone}`} key={metric.label}>
            <strong className="metric-value">{metric.value}</strong>
            <h2>{metric.label}</h2>
            <p>{metric.detail}</p>
          </div>
        ))}
      </section>
      <nav className="workspace-bar" aria-label="Atlas actions">
        <div className="workspace-path">
          <span className="status-dot" />
          <strong>OPERATIONS OVERVIEW</strong>
          <span className="path-divider">/</span>
          <span>GLOBAL FLEET</span>
        </div>
        <div className="toolbar-actions">
          <span className="sample-time">
            SAMPLED{" "}
            {vm.sampledAt.toLocaleTimeString("en-GB", { hour12: false })}
          </span>
          <Tooltip content="Resample simulated telemetry">
            <IconButton
              size="1"
              variant="outline"
              aria-label="Refresh telemetry"
              onClick={vm.refresh}
            >
              <RotateCw size={13} />
            </IconButton>
          </Tooltip>
          <Button size="1" variant="outline" onClick={vm.exportSnapshot}>
            <ArrowDownToLine size={13} />
            Export snapshot
          </Button>
          <Button size="1" onClick={vm.openCreate}>
            <Plus size={13} />
            Add server
          </Button>
        </div>
      </nav>
    </>
  );
}
