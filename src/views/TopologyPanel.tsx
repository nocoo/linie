import { Button } from "@radix-ui/themes";
import { ArrowUpRight } from "lucide-react";
import { Panel } from "../components/Panel";
import { networkNodes } from "../models/infrastructure";
import type { AtlasViewModel } from "../viewmodels/useAtlasViewModel";

const protocols = [
  ["BACKBONE", "Private inter-region fabric", "100 Gbps", "12 ms"],
  ["ROUTING", "BGP / ECMP multipath", "4 peers", "< 1 ms"],
  ["SECURITY", "mTLS / network policies", "128 rules", "2.4 ms"],
  ["DISCOVERY", "DNS / service registry", "86 services", "0.8 ms"],
  ["TELEMETRY", "Metrics / logs / traces", "3.2M / min", "5 s"],
];

export function TopologyPanel({ vm }: { vm: AtlasViewModel }) {
  return (
    <Panel
      number="02"
      title="Network topology & routing"
      label="LOGICAL SCHEMATIC"
      className="topology-panel"
    >
      <div className="topology-caption">
        <strong>One connected system. From edge to everything.</strong>
        <span>Layer 3–7 / redundant paths / click any node to inspect</span>
      </div>
      <div className="topology-drawing">
        <svg
          className="topology-wires"
          viewBox="0 0 600 270"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 8 5 L 0 9" fill="none" stroke="currentColor" />
            </marker>
          </defs>
          <path
            d="M175 36H213M387 36H425M515 65V91H300V105M213 140H175M387 140H425M86 169V204M300 169V204M515 169V204M175 238H213M387 238H425"
            markerEnd="url(#arrow)"
          />
          <path
            className="wire-secondary"
            d="M86 65V86H196V188H515V204M86 169V188H20V238H36"
          />
        </svg>
        {networkNodes.map((node) => (
          <Button
            key={node.id}
            variant="outline"
            className={`topology-node topology-node-${node.status}`}
            onClick={() => vm.setSelectedNodeId(node.id)}
          >
            <span className="node-label">{node.label}</span>
            <strong>
              {node.name}
              <ArrowUpRight size={12} />
            </strong>
            <span className="node-detail">{node.detail}</span>
            <span className="node-meta">{node.meta}</span>
            <span className="connector connector-left" aria-hidden="true" />
            <span className="connector connector-right" aria-hidden="true" />
          </Button>
        ))}
      </div>
      <div className="subsection-heading">
        <strong>TRANSPORT & SERVICE PLANE</strong>
        <span>REFERENCE METRICS</span>
      </div>
      <div className="protocol-list">
        {protocols.map(([name, description, capacity, latency]) => (
          <div className="protocol-row" key={name}>
            <strong>{name}</strong>
            <span>{description}</span>
            <span>{capacity}</span>
            <span>{latency}</span>
            <span className="status-dot" />
          </div>
        ))}
      </div>
      <div className="subsection-heading topology-summary-heading">
        <strong>NETWORK AT A GLANCE</strong>
        <span>GLOBAL / AGGREGATED</span>
      </div>
      <div className="mini-metrics">
        {[
          ["86", "Registered services"],
          ["2,496", "Active interfaces"],
          ["0.02%", "Packet loss"],
          ["12 ms", "Median latency"],
        ].map(([value, label]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="topology-note">
        <span className="status-dot" />
        <span>
          Redundancy by design. No single point of failure in the reference
          topology.
        </span>
      </div>
    </Panel>
  );
}
