export type ServerStatus = "online" | "degraded" | "offline" | "maintenance";
export type StatusFilter = "all" | ServerStatus;
export type TimeRange = "1h" | "6h" | "24h";

export interface Region {
  id: string;
  name: string;
  country: string;
  latency: number;
  racks: number;
}

export interface Server {
  id: string;
  hostname: string;
  ip: string;
  region: string;
  role: string;
  status: ServerStatus;
  cpu: number;
  memory: number;
  cores: number;
  ram: number;
}

export interface Incident {
  id: string;
  severity: "critical" | "warning";
  title: string;
  description: string;
  source: string;
  time: string;
  acknowledged: boolean;
}

export interface JournalEntry {
  id: string;
  time: string;
  action: string;
  detail: string;
  status: "done" | "info";
}

export interface NetworkNode {
  id: string;
  name: string;
  label: string;
  detail: string;
  meta: string;
  status: "online" | "degraded";
  description: string;
}

export interface ServerDraft {
  hostname: string;
  ip: string;
  region: string;
  role: string;
}

export const regions: Region[] = [
  {
    id: "us-east-1",
    name: "N. Virginia",
    country: "US",
    latency: 12,
    racks: 48,
  },
  { id: "eu-west-1", name: "Dublin", country: "IE", latency: 38, racks: 36 },
  {
    id: "ap-southeast-1",
    name: "Singapore",
    country: "SG",
    latency: 64,
    racks: 32,
  },
  {
    id: "ap-northeast-1",
    name: "Tokyo",
    country: "JP",
    latency: 51,
    racks: 40,
  },
];

export const roles = ["Compute", "Database", "Storage", "Gateway", "Worker"];
export const PAGE_SIZE = 20;

export function createFleet(): Server[] {
  const exceptions = new Map(
    Array.from({ length: 24 }, (_, i) => [
      (i * 53 + 6) % 1248,
      i % 4 === 3 ? ("offline" as const) : ("degraded" as const),
    ]),
  );
  return Array.from({ length: 1248 }, (_, i) => {
    const region = regions[Math.floor(i / 312)];
    const role = roles[i % roles.length];
    if (!region || !role) throw new Error("Invalid fleet fixture");
    const status = exceptions.get(i) ?? "online";
    return {
      id: `srv-${String(i + 1).padStart(4, "0")}`,
      hostname: `${["k8s-node", "pg-primary", "storage", "edge-gw", "worker"][i % 5]}-${String(i + 1).padStart(3, "0")}`,
      ip: `10.${Math.floor(i / 312) + 10}.${Math.floor((i % 312) / 254)}.${(i % 254) + 1}`,
      region: region.id,
      role,
      status,
      cpu:
        status === "offline"
          ? 0
          : status === "degraded"
            ? 88
            : 12 + ((i * 17) % 62),
      memory: status === "offline" ? 0 : 24 + ((i * 13) % 59),
      cores: 32,
      ram: 128,
    };
  });
}

export const initialIncidents: Incident[] = [
  {
    id: "INC-0042",
    severity: "critical",
    title: "Host unreachable",
    description: "Heartbeat absent for 180s. Failover route is active.",
    source: "k8s-node-166 · us-east-1",
    time: "09:42:18",
    acknowledged: false,
  },
  {
    id: "INC-0041",
    severity: "warning",
    title: "CPU threshold exceeded",
    description: "Utilization above 85%. Review workload allocation.",
    source: "pg-primary-007 · us-east-1",
    time: "09:38:05",
    acknowledged: false,
  },
  {
    id: "INC-0040",
    severity: "warning",
    title: "Elevated replication latency",
    description: "Cross-region replica lag is 240ms; target < 100ms.",
    source: "replication / ap-southeast-1",
    time: "09:31:42",
    acknowledged: false,
  },
];

export const networkNodes: NetworkNode[] = [
  {
    id: "edge",
    name: "Global edge",
    label: "INGRESS / ANYCAST",
    detail: "4 PoPs · BGP active",
    meta: "AS 64512 / dual-stack",
    status: "online",
    description:
      "Anycast ingress distributes traffic across four points of presence. Each site has redundant upstream providers and automatic route withdrawal.",
  },
  {
    id: "firewall",
    name: "Security gateway",
    label: "POLICY / INSPECTION",
    detail: "128 rules · 0 violations",
    meta: "L3–L7 / zero trust",
    status: "online",
    description:
      "The security gateway enforces network segmentation, connection tracking and allowlisted ingress policies before traffic reaches application services.",
  },
  {
    id: "balancer",
    name: "Load balancers",
    label: "DISTRIBUTION / L7",
    detail: "24 pools · health checked",
    meta: "Envoy / round-robin",
    status: "online",
    description:
      "Layer-seven load balancers distribute requests to healthy endpoints. Active checks remove unavailable hosts from service pools.",
  },
  {
    id: "compute",
    name: "Compute fabric",
    label: "WORKLOAD / EXECUTION",
    detail: "Kubernetes · 4 clusters",
    meta: "containerd / Cilium CNI",
    status: "online",
    description:
      "Regional Kubernetes clusters host the compute and worker fleet. Workloads use pod disruption budgets and topology-aware scheduling.",
  },
  {
    id: "service",
    name: "Service mesh",
    label: "EAST–WEST / ROUTING",
    detail: "86 services · mTLS on",
    meta: "Istio / policy enforced",
    status: "online",
    description:
      "The service mesh provides authenticated east–west traffic, circuit breaking and service-level observability across regional clusters.",
  },
  {
    id: "database",
    name: "Database cluster",
    label: "PERSISTENCE / REPLICA",
    detail: "12 primary · 24 replicas",
    meta: "PostgreSQL / lag 240ms",
    status: "degraded",
    description:
      "The PostgreSQL fleet uses synchronous regional replicas and asynchronous cross-region recovery. A simulated replication-lag warning is currently open.",
  },
  {
    id: "observe",
    name: "Observability",
    label: "METRICS / TRACES",
    detail: "3.2M samples / min",
    meta: "Prometheus / OpenTelemetry",
    status: "online",
    description:
      "Metrics, traces and structured logs feed the operations atlas. All values in this template are deterministic fixtures, not a live monitoring connection.",
  },
  {
    id: "storage",
    name: "Storage fabric",
    label: "BLOCK / OBJECT",
    detail: "2.4 PB · 3× replicated",
    meta: "Ceph / S3 compatible",
    status: "online",
    description:
      "The storage fabric exposes block and object interfaces with three-way replication and failure-domain-aware data placement.",
  },
  {
    id: "backup",
    name: "Disaster recovery",
    label: "SNAPSHOT / RESTORE",
    detail: "RPO 15m · RTO < 1h",
    meta: "immutable / cross-region",
    status: "online",
    description:
      "Scheduled immutable snapshots are replicated to an independent region. These recovery objectives describe the demo architecture, not a verified production guarantee.",
  },
];

export const initialJournal: JournalEntry[] = [
  {
    id: "evt-1",
    time: "09:45:00",
    action: "Configuration synchronized",
    detail: "all regions / revision 8f2c4a1",
    status: "done",
  },
  {
    id: "evt-2",
    time: "09:40:12",
    action: "Snapshot completed",
    detail: "pg-primary / 24 volumes",
    status: "done",
  },
  {
    id: "evt-3",
    time: "09:35:08",
    action: "Certificate rotation",
    detail: "service mesh / 86 certificates",
    status: "done",
  },
  {
    id: "evt-4",
    time: "09:30:00",
    action: "Fleet discovery completed",
    detail: "1,248 hosts / 4 regions",
    status: "done",
  },
];

export function filterServers(
  servers: Server[],
  query: string,
  region: string,
  status: StatusFilter,
): Server[] {
  const term = query.trim().toLowerCase();
  return servers.filter(
    (server) =>
      (region === "all" || server.region === region) &&
      (status === "all" || server.status === status) &&
      `${server.hostname} ${server.ip} ${server.id} ${server.role}`
        .toLowerCase()
        .includes(term),
  );
}

export function summarizeFleet(servers: Server[]) {
  const online = servers.filter((server) => server.status === "online").length;
  const offline = servers.filter(
    (server) => server.status === "offline",
  ).length;
  const attention = servers.filter(
    (server) => server.status === "degraded" || server.status === "maintenance",
  ).length;
  const reachable = servers.filter(
    (server) => server.status === "online" || server.status === "degraded",
  ).length;
  return {
    total: servers.length,
    online,
    offline,
    attention,
    availability: servers.length
      ? ((reachable / servers.length) * 100).toFixed(2)
      : "0.00",
    cpu: servers.length
      ? Math.round(
          servers.reduce((sum, server) => sum + server.cpu, 0) / servers.length,
        )
      : 0,
    memory: servers.length
      ? Math.round(
          servers.reduce((sum, server) => sum + server.memory, 0) /
            servers.length,
        )
      : 0,
  };
}

export function validateServer(
  draft: ServerDraft,
  servers: Server[],
): string | null {
  if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(draft.hostname.trim())) {
    return "Use a hostname of 1–63 lowercase letters, digits or hyphens; start and end with a letter or digit.";
  }
  const octets = draft.ip.trim().split(".");
  if (
    octets.length !== 4 ||
    octets.some(
      (part) => !/^(0|[1-9]\d{0,2})$/.test(part) || Number(part) > 255,
    )
  ) {
    return "Enter a valid IPv4 address, for example 10.10.2.20.";
  }
  if (
    !regions.some((region) => region.id === draft.region) ||
    !roles.includes(draft.role)
  ) {
    return "Select a supported region and server role.";
  }
  if (
    servers.some(
      (server) =>
        server.hostname === draft.hostname.trim() ||
        server.ip === draft.ip.trim(),
    )
  ) {
    return "A server with this hostname or IP address already exists.";
  }
  return null;
}

export function createServer(draft: ServerDraft, id: string): Server {
  return {
    ...draft,
    hostname: draft.hostname.trim(),
    ip: draft.ip.trim(),
    id,
    status: "online",
    cpu: 0,
    memory: 0,
    cores: 32,
    ram: 128,
  };
}

export function sampleTraffic(range: TimeRange, revision: number) {
  const offset = { "1h": 0, "6h": 13, "24h": 27 }[range];
  return Array.from({ length: 49 }, (_, i) => ({
    x: (i / 48) * 600,
    ingress:
      25 +
      Math.sin((i + offset + revision) * 0.53) * 7 +
      Math.sin(i * 1.8) * 3 +
      (i > 29 && i < 36 ? 13 : 0),
    egress:
      14 + Math.cos((i + offset + revision) * 0.38) * 4 + Math.sin(i * 1.4) * 2,
  }));
}

export function buildSnapshot(
  servers: Server[],
  incidents: Incident[],
  capturedAt: string,
) {
  return {
    schemaVersion: 1,
    source: "linie-local-demo",
    capturedAt,
    summary: summarizeFleet(servers),
    servers,
    incidents,
  };
}
