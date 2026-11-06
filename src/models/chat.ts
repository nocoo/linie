import {
  type Incident,
  networkNodes,
  regions,
  type Server,
  summarizeFleet,
} from "./infrastructure";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface ChatContext {
  servers: Server[];
  incidents: Incident[];
}

export const CHAT_LIMIT = 1000;
export const chatSuggestions = [
  "Summarize fleet health",
  "Which hosts need attention?",
  "Compare regions",
  "Explain the network",
];

export const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "I'm your operations companion. Ask about this fleet, inspect a hostname, or explore the network.\n\nThis is a local simulation, not an AI connection. Replies use the current demo inventory; I cannot execute infrastructure changes.",
};

export function createChatReply(
  prompt: string,
  context: ChatContext,
  previousPrompt = "",
) {
  const normalized = prompt.toLowerCase().trim();
  const followUp =
    /^(why|more|details|tell me more|continue|为什么|继续|更多|详细)[?？.!\s]*$/.test(
      normalized,
    );
  const query =
    followUp && previousPrompt ? previousPrompt.toLowerCase() : normalized;
  const { servers, incidents } = context;
  const summary = summarizeFleet(servers);
  const detail = followUp
    ? "\n\nNext check: inspect the relevant host or region in the atlas. These observations are simulated, not a diagnosis of a real system."
    : "";

  if (
    /maintenan|restart|reboot|delete|shutdown|stop |维护|重启|删除|关机/.test(
      query,
    )
  ) {
    return "No infrastructure action was executed. This companion is read-only.\n\nSuggested maintenance plan:\n1. Inspect the host and confirm it is healthy.\n2. Drain workloads and check regional redundancy.\n3. Use ‘Set maintenance’ in the host inspector to change the demo state.\n4. End maintenance after your checks.\n\nOffline or degraded hosts must be investigated first.";
  }

  const host = servers.find(
    (server) => query.includes(server.hostname) || query.includes(server.ip),
  );
  if (host) {
    return `${host.hostname} / ${host.status.toUpperCase()}\n\nAddress: ${host.ip}\nRegion: ${host.region}\nRole: ${host.role}\nCPU: ${host.cpu}% of ${host.cores} vCPU\nMemory: ${host.memory}% of ${host.ram} GB\n\nOpen this hostname in the asset register to inspect its configuration.${detail}`;
  }

  if (
    /region|zone|区域|机房/.test(query) ||
    regions.some((region) => query.includes(region.id))
  ) {
    const selected = regions.filter((region) => query.includes(region.id));
    const targets = selected.length ? selected : regions;
    return `REGIONAL SNAPSHOT\n\n${targets
      .map((region) => {
        const fleet = summarizeFleet(
          servers.filter((server) => server.region === region.id),
        );
        return `${region.id} · ${region.name}\n${fleet.total} hosts / ${fleet.online} healthy / ${fleet.offline} offline\n${fleet.availability}% reachable · ${region.latency} ms reference RTT`;
      })
      .join(
        "\n\n",
      )}\n\nRegion metrics reflect the full inventory, not the current table filters.${detail}`;
  }

  if (/attention|offline|incident|alert|warning|异常|离线|告警/.test(query)) {
    const attention = servers.filter((server) => server.status !== "online");
    const pending = incidents.filter((incident) => !incident.acknowledged);
    return `ATTENTION REQUIRED\n\n${summary.offline} offline hosts · ${summary.attention} degraded or in maintenance.\n${pending.length} incidents still need acknowledgement.\n\n${
      attention.length
        ? attention
            .slice(0, 5)
            .map(
              (server) =>
                `${server.hostname} — ${server.status} / ${server.region}`,
            )
            .join("\n")
        : "No hosts currently need attention."
    }\n\nAcknowledgement records ownership; it does not resolve the underlying condition.${detail}`;
  }

  if (/network|topology|routing|网络|拓扑|路由/.test(query)) {
    return `NETWORK WALKTHROUGH\n\nGlobal edge → Security gateway → Load balancers\nCompute fabric ↔ Service mesh ↔ Database cluster\nObservability · Storage fabric · Disaster recovery\n\nThe reference architecture contains ${networkNodes.length} logical components across ${regions.length} regions. The database component has a simulated replication-lag warning.\n\nSelect a topology node for its role, capacity and implementation.${detail}`;
  }

  if (
    /health|summary|summarize|status|fleet|overview|健康|状态|概览|总结/.test(
      query,
    )
  ) {
    return `FLEET SNAPSHOT\n\n${summary.total.toLocaleString("en-US")} managed servers across ${regions.length} regions.\n${summary.online.toLocaleString("en-US")} healthy · ${summary.offline} offline · ${summary.attention} need attention.\n\nReachability: ${summary.availability}%\nAverage CPU: ${summary.cpu}%\nAverage memory: ${summary.memory}%\n\nReachability includes healthy and degraded hosts, but excludes maintenance. This is the current session's demo data.${detail}`;
  }

  return "I can simulate an operations conversation about fleet health, hosts needing attention, regions, topology or a specific hostname/IP address.\n\nTry ‘Summarize fleet health’ or ‘Inspect k8s-node-001’. Follow up with ‘more’ for the same topic. I don't browse the web, call an AI service or execute commands.";
}
