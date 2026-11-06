import { Progress, SegmentedControl } from "@radix-ui/themes";
import { Panel } from "../components/Panel";
import { sampleTraffic, type TimeRange } from "../models/infrastructure";
import type { AtlasViewModel } from "../viewmodels/useAtlasViewModel";

export function TelemetryPanel({ vm }: { vm: AtlasViewModel }) {
  const samples = sampleTraffic(vm.range, vm.revision);
  const ingress = samples
    .map((sample) => `${sample.x},${110 - sample.ingress * 2}`)
    .join(" ");
  const egress = samples
    .map((sample) => `${sample.x},${110 - sample.egress * 2}`)
    .join(" ");
  const labels = {
    "1h": ["−60m", "−45m", "−30m", "−15m", "now"],
    "6h": ["−6h", "−4.5h", "−3h", "−1.5h", "now"],
    "24h": ["−24h", "−18h", "−12h", "−6h", "now"],
  }[vm.range];
  return (
    <Panel
      number="05"
      title="Traffic & resource utilization"
      label="PERFORMANCE TELEMETRY"
      className="telemetry-panel"
    >
      <div className="telemetry-toolbar">
        <div className="chart-legend">
          <span>
            <i className="legend-line" />
            Ingress
          </span>
          <span>
            <i className="legend-line legend-line-out" />
            Egress
          </span>
          <span className="unit-label">Gbps / simulated</span>
        </div>
        <SegmentedControl.Root
          size="1"
          value={vm.range}
          onValueChange={(value) => vm.setRange(value as TimeRange)}
          aria-label="Telemetry time range"
        >
          <SegmentedControl.Item value="1h">1H</SegmentedControl.Item>
          <SegmentedControl.Item value="6h">6H</SegmentedControl.Item>
          <SegmentedControl.Item value="24h">24H</SegmentedControl.Item>
        </SegmentedControl.Root>
      </div>
      <div className="traffic-chart">
        <div className="chart-y-labels">
          <span>50</span>
          <span>25</span>
          <span>0</span>
        </div>
        <svg
          viewBox="0 0 600 110"
          preserveAspectRatio="none"
          role="img"
          aria-label={`Simulated network traffic over ${vm.range}: ingress varies between 15 and 48 Gbps; egress between 8 and 20 Gbps.`}
        >
          <title>Ingress and egress / {vm.range}</title>
          <defs>
            <pattern
              id="chart-grid"
              width="75"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M75 0H0V50"
                fill="none"
                stroke="var(--rule-soft)"
                strokeWidth="0.7"
                strokeDasharray="2 3"
              />
            </pattern>
          </defs>
          <rect width="600" height="110" fill="url(#chart-grid)" />
          <polygon
            points={`0,110 ${ingress} 600,110`}
            fill="var(--accent-wash)"
            opacity="0.65"
          />
          <polyline
            points={ingress}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.7"
            vectorEffect="non-scaling-stroke"
          />
          <polyline
            points={egress}
            fill="none"
            stroke="var(--muted)"
            strokeWidth="1.3"
            strokeDasharray="4 3"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
      <div className="chart-x-labels">
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="resource-meters">
        <div>
          <label htmlFor="cpu-progress">
            <strong>COMPUTE</strong>
            <span>{vm.summary.cpu}% avg. CPU</span>
          </label>
          <Progress
            id="cpu-progress"
            value={vm.summary.cpu}
            size="1"
            aria-label="Average CPU utilization"
          />
        </div>
        <div>
          <label htmlFor="memory-progress">
            <strong>MEMORY</strong>
            <span>{vm.summary.memory}% allocated</span>
          </label>
          <Progress
            id="memory-progress"
            value={vm.summary.memory}
            size="1"
            aria-label="Average memory utilization"
          />
        </div>
      </div>
      <p className="fine-print">
        Deterministic demo samples · Changing the time window redraws the
        series.
      </p>
    </Panel>
  );
}
