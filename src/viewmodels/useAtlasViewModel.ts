import { useMemo, useState } from "react";
import {
  buildSnapshot,
  createFleet,
  createServer,
  filterServers,
  initialIncidents,
  initialJournal,
  networkNodes,
  PAGE_SIZE,
  type ServerDraft,
  type StatusFilter,
  summarizeFleet,
  type TimeRange,
  validateServer,
} from "../models/infrastructure";

export function useAtlasViewModel() {
  const [servers, setServers] = useState(createFleet);
  const [incidents, setIncidents] = useState(initialIncidents);
  const [journal, setJournal] = useState(initialJournal);
  const [query, setQueryState] = useState("");
  const [region, setRegionState] = useState("all");
  const [status, setStatusState] = useState<StatusFilter>("all");
  const [page, setPage] = useState(0);
  const [sortDescending, setSortDescending] = useState(false);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [range, setRange] = useState<TimeRange>("1h");
  const [revision, setRevision] = useState(0);
  const [sampledAt, setSampledAt] = useState(() => new Date());

  const filtered = useMemo(() => {
    const matches = filterServers(servers, query, region, status);
    return sortDescending
      ? [...matches].sort((a, b) => b.cpu - a.cpu)
      : matches;
  }, [servers, query, region, status, sortDescending]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const summary = useMemo(() => summarizeFleet(servers), [servers]);

  function record(action: string, detail: string) {
    setJournal((entries) =>
      [
        {
          id: crypto.randomUUID(),
          time: new Date().toLocaleTimeString("en-GB", { hour12: false }),
          action,
          detail,
          status: "done" as const,
        },
        ...entries,
      ].slice(0, 20),
    );
  }

  function setQuery(value: string) {
    setQueryState(value);
    setPage(0);
  }
  function setRegion(value: string) {
    setRegionState(value);
    setPage(0);
  }
  function setStatus(value: StatusFilter) {
    setStatusState(value);
    setPage(0);
  }

  function addServer(draft: ServerDraft) {
    const error = validateServer(draft, servers);
    setFormError(error);
    if (error) return false;
    const server = createServer(draft, `srv-${crypto.randomUUID()}`);
    setServers((current) => [server, ...current]);
    setQuery("");
    setRegion("all");
    setStatus("all");
    setSortDescending(false);
    setCreateOpen(false);
    setNotice(`${server.hostname} added to the demo fleet.`);
    record("Server registered", `${server.hostname} / ${server.region}`);
    return true;
  }

  function toggleMaintenance(id: string) {
    const server = servers.find((item) => item.id === id);
    if (
      !server ||
      (server.status !== "online" && server.status !== "maintenance")
    )
      return;
    const nextStatus =
      server.status === "maintenance" ? "online" : "maintenance";
    setServers((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: nextStatus } : item,
      ),
    );
    setNotice(
      `${server.hostname}: ${nextStatus}. Demo only; no infrastructure was changed.`,
    );
    record(
      nextStatus === "maintenance"
        ? "Maintenance enabled"
        : "Maintenance ended",
      server.hostname,
    );
  }

  function acknowledgeIncident(id: string) {
    const incident = incidents.find((item) => item.id === id);
    if (!incident || incident.acknowledged) return;
    setIncidents((current) =>
      current.map((item) =>
        item.id === id ? { ...item, acknowledged: true } : item,
      ),
    );
    setNotice(`${id} acknowledged. The underlying condition remains open.`);
    record("Incident acknowledged", `${id} / ${incident.title}`);
  }

  function refresh() {
    setRevision((value) => value + 1);
    setSampledAt(new Date());
    setNotice("Simulated traffic resampled. Inventory changes are preserved.");
    record("Telemetry resampled", "local fixture / no remote connection");
  }

  function exportSnapshot() {
    const capturedAt = new Date().toISOString();
    const snapshot = buildSnapshot(servers, incidents, capturedAt);
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(snapshot, null, 2)], {
        type: "application/json",
      }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `linie-snapshot-${capturedAt.slice(0, 10)}.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    setNotice("Demo snapshot exported as JSON.");
    record(
      "Snapshot exported",
      `${servers.length.toLocaleString("en-US")} servers / JSON`,
    );
  }

  return {
    servers,
    incidents,
    journal,
    query,
    region,
    status,
    range,
    revision,
    sampledAt,
    summary,
    page: currentPage,
    pageCount,
    sortDescending,
    createOpen,
    formError,
    notice,
    visibleServers: filtered.slice(
      currentPage * PAGE_SIZE,
      (currentPage + 1) * PAGE_SIZE,
    ),
    filteredCount: filtered.length,
    selectedServer:
      servers.find((server) => server.id === selectedServerId) ?? null,
    selectedNode:
      networkNodes.find((node) => node.id === selectedNodeId) ?? null,
    unacknowledged: incidents.filter((incident) => !incident.acknowledged)
      .length,
    setQuery,
    setRegion,
    setStatus,
    setRange,
    setPage,
    setSortDescending,
    setSelectedServerId,
    setSelectedNodeId,
    setNotice,
    openCreate: () => {
      setFormError(null);
      setCreateOpen(true);
    },
    setCreateOpen,
    addServer,
    toggleMaintenance,
    acknowledgeIncident,
    refresh,
    exportSnapshot,
  };
}

export type AtlasViewModel = ReturnType<typeof useAtlasViewModel>;
