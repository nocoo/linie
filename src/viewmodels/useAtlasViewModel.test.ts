import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PAGE_SIZE, type ServerDraft } from "../models/infrastructure";
import { useAtlasViewModel } from "./useAtlasViewModel";

const draft: ServerDraft = {
  hostname: "new-server",
  ip: "10.20.30.40",
  region: "us-east-1",
  role: "Compute",
};
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("atlas ViewModel", () => {
  it("initializes the complete demo and paginates without losing records", () => {
    const { result } = renderHook(useAtlasViewModel);
    expect(result.current.summary.total).toBe(1248);
    expect(result.current.visibleServers).toHaveLength(PAGE_SIZE);
    expect(result.current.selectedServer).toBeNull();
    expect(result.current.selectedNode).toBeNull();
    act(() => result.current.setPage(1));
    expect(result.current.visibleServers[0]?.id).toBe(
      `srv-${String(PAGE_SIZE + 1).padStart(4, "0")}`,
    );
    act(() => result.current.setPage(9999));
    expect(result.current.page).toBe(result.current.pageCount - 1);
    act(() => result.current.setQuery("missing"));
    expect(result.current.page).toBe(0);
    expect(result.current.pageCount).toBe(1);
    expect(result.current.visibleServers).toEqual([]);
  });

  it("resets pagination for each filter and sorts a copy by CPU", () => {
    const { result } = renderHook(useAtlasViewModel);
    act(() => {
      result.current.setPage(3);
      result.current.setRegion("us-east-1");
    });
    expect(result.current.page).toBe(0);
    expect(result.current.filteredCount).toBe(312);
    expect(result.current.summary.total).toBe(1248);
    expect(result.current.regionSummaries).toHaveLength(4);
    expect(result.current.regionSummaries[0]?.summary.total).toBe(312);
    act(() => {
      result.current.setPage(3);
      result.current.setStatus("degraded");
    });
    expect(result.current.page).toBe(0);
    expect(
      result.current.visibleServers.every(
        (server) => server.status === "degraded",
      ),
    ).toBe(true);
    act(() => {
      result.current.setStatus("all");
      result.current.setSortDescending(true);
    });
    expect(result.current.visibleServers[0]?.cpu).toBe(88);
    expect(result.current.servers[0]?.id).toBe("srv-0001");
    act(() => result.current.setSortDescending(false));
    expect(result.current.visibleServers[0]?.id).toBe("srv-0001");
  });

  it("selects and closes server and topology inspections", () => {
    const { result } = renderHook(useAtlasViewModel);
    act(() => {
      result.current.setSelectedServerId("srv-0001");
      result.current.setSelectedNodeId("edge");
    });
    expect(result.current.selectedServer?.hostname).toBe("k8s-node-001");
    expect(result.current.selectedNode?.name).toBe("Global edge");
    act(() => {
      result.current.setSelectedServerId(null);
      result.current.setSelectedNodeId(null);
    });
    expect(result.current.selectedServer).toBeNull();
    expect(result.current.selectedNode).toBeNull();
  });

  it("validates before registration and reveals the newly created host", () => {
    const { result } = renderHook(useAtlasViewModel);
    act(() => result.current.openCreate());
    expect(result.current.createOpen).toBe(true);
    let added = true;
    act(() => {
      added = result.current.addServer({ ...draft, hostname: "" });
    });
    expect(added).toBe(false);
    expect(result.current.formError).toContain("hostname");
    expect(result.current.summary.total).toBe(1248);
    act(() => {
      result.current.setCreateOpen(false);
      result.current.openCreate();
    });
    expect(result.current.formError).toBeNull();
    act(() => {
      result.current.setRegion("eu-west-1");
      result.current.setStatus("offline");
      result.current.setQuery("missing");
      result.current.setSortDescending(true);
    });
    act(() => {
      added = result.current.addServer(draft);
    });
    expect(added).toBe(true);
    expect(result.current.createOpen).toBe(false);
    expect(result.current.summary.total).toBe(1249);
    expect(result.current.visibleServers[0]?.hostname).toBe("new-server");
    expect(result.current.query).toBe("");
    expect(result.current.region).toBe("all");
    expect(result.current.status).toBe("all");
    expect(result.current.sortDescending).toBe(false);
    expect(result.current.journal[0]?.action).toBe("Server registered");
    expect(result.current.notice).toContain("new-server");
  });

  it("toggles maintenance only for eligible hosts and updates summaries", () => {
    const { result } = renderHook(useAtlasViewModel);
    act(() => result.current.toggleMaintenance("srv-0001"));
    expect(result.current.servers[0]?.status).toBe("maintenance");
    expect(result.current.summary.attention).toBe(19);
    expect(result.current.summary.online).toBe(1223);
    expect(result.current.regionSummaries[0]?.summary.attention).toBe(6);
    expect(result.current.journal[0]?.action).toBe("Maintenance enabled");
    act(() => result.current.toggleMaintenance("srv-0001"));
    expect(result.current.servers[0]?.status).toBe("online");
    expect(result.current.journal[0]?.action).toBe("Maintenance ended");
    const before = result.current.servers;
    act(() => {
      result.current.toggleMaintenance("missing");
      result.current.toggleMaintenance("srv-0007");
      result.current.toggleMaintenance("srv-0166");
    });
    expect(result.current.servers).toBe(before);
  });

  it("acknowledges idempotently without resolving the incident", () => {
    const { result } = renderHook(useAtlasViewModel);
    expect(result.current.unacknowledged).toBe(3);
    act(() => result.current.acknowledgeIncident("INC-0042"));
    expect(result.current.unacknowledged).toBe(2);
    expect(result.current.incidents).toHaveLength(3);
    expect(result.current.incidents[0]?.acknowledged).toBe(true);
    expect(result.current.journal[0]?.action).toBe("Incident acknowledged");
    const before = result.current.journal;
    act(() => {
      result.current.acknowledgeIncident("INC-0042");
      result.current.acknowledgeIncident("missing");
    });
    expect(result.current.journal).toBe(before);
  });

  it("resamples telemetry, caps the journal and preserves inventory edits", () => {
    const { result } = renderHook(useAtlasViewModel);
    act(() => result.current.addServer(draft));
    act(() => {
      result.current.setRange("24h");
      for (let i = 0; i < 25; i++) result.current.refresh();
    });
    expect(result.current.range).toBe("24h");
    expect(result.current.revision).toBe(25);
    expect(result.current.traffic).toHaveLength(49);
    expect(result.current.summary.total).toBe(1249);
    expect(result.current.journal).toHaveLength(20);
    expect(new Set(result.current.journal.map((entry) => entry.id)).size).toBe(
      20,
    );
    expect(result.current.notice).toContain("resampled");
    act(() => result.current.setNotice(""));
    expect(result.current.notice).toBe("");
  });

  it("downloads JSON and revokes its object URL", () => {
    vi.useFakeTimers();
    const createObjectURL = vi.fn(() => "blob:demo");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal(
      "URL",
      Object.assign(URL, { createObjectURL, revokeObjectURL }),
    );
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    const { result } = renderHook(useAtlasViewModel);
    act(() => result.current.exportSnapshot());
    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(click).toHaveBeenCalledOnce();
    expect(result.current.notice).toContain("exported");
    expect(result.current.journal[0]?.action).toBe("Snapshot exported");
    act(() => vi.runAllTimers());
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:demo");
    vi.unstubAllGlobals();
  });
});
