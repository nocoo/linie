import { describe, expect, it } from "vitest";
import {
  buildSnapshot,
  createFleet,
  createServer,
  filterServers,
  initialIncidents,
  regions,
  type ServerDraft,
  sampleTraffic,
  summarizeFleet,
  validateServer,
} from "./infrastructure";

const fleet = createFleet();
const draft: ServerDraft = {
  hostname: "new-host",
  ip: "10.20.30.40",
  region: "us-east-1",
  role: "Compute",
};

describe("reference fleet", () => {
  it("creates a deterministic fleet with unique identifiers, hostnames and addresses", () => {
    expect(createFleet()).toEqual(fleet);
    expect(fleet).toHaveLength(1248);
    for (const key of ["id", "hostname", "ip"] as const)
      expect(new Set(fleet.map((server) => server[key])).size).toBe(1248);
    expect(
      fleet
        .filter((server) => server.status === "offline")
        .every((server) => server.cpu === 0 && server.memory === 0),
    ).toBe(true);
    for (const region of regions)
      expect(
        fleet.filter((server) => server.region === region.id),
      ).toHaveLength(312);
  });

  it("derives all status counters from the actual inventory", () => {
    expect(summarizeFleet(fleet)).toMatchObject({
      total: 1248,
      online: 1224,
      offline: 6,
      attention: 18,
      availability: "99.52",
    });
    expect(summarizeFleet([])).toEqual({
      total: 0,
      online: 0,
      offline: 0,
      attention: 0,
      availability: "0.00",
      cpu: 0,
      memory: 0,
    });
    expect(
      summarizeFleet([
        { ...createServer(draft, "test"), status: "maintenance" },
      ]),
    ).toMatchObject({ attention: 1, online: 0, availability: "0.00" });
  });
});

describe("inventory filtering", () => {
  it("matches normalized hostname, IP, asset ID and role searches", () => {
    expect(filterServers(fleet, "  K8S-NODE-001  ", "all", "all")).toHaveLength(
      1,
    );
    expect(
      filterServers(fleet, "10.10.0.1", "all", "all").length,
    ).toBeGreaterThan(0);
    expect(filterServers(fleet, "srv-0001", "all", "all")).toHaveLength(1);
    expect(
      filterServers(fleet, "Database", "all", "all").every(
        (server) => server.role === "Database",
      ),
    ).toBe(true);
    expect(filterServers(fleet, "", "all", "all")).toHaveLength(1248);
  });

  it("combines region, status and text instead of replacing filters", () => {
    expect(filterServers(fleet, "", "us-east-1", "all")).toHaveLength(312);
    expect(filterServers(fleet, "", "all", "offline")).toHaveLength(6);
    expect(filterServers(fleet, "k8s", "us-east-1", "offline")).toHaveLength(1);
    expect(filterServers(fleet, "not-a-real-server", "all", "all")).toEqual([]);
  });
});

describe("server registration", () => {
  it("accepts supported hosts and normalizes whitespace", () => {
    expect(validateServer(draft, fleet)).toBeNull();
    expect(
      validateServer({ ...draft, hostname: "a", ip: "0.0.0.0" }, fleet),
    ).toBeNull();
    expect(
      validateServer(
        { ...draft, hostname: "a".repeat(63), ip: "255.255.255.255" },
        fleet,
      ),
    ).toBeNull();
    expect(
      createServer(
        { ...draft, hostname: " new-host ", ip: " 10.20.30.40 " },
        "new-id",
      ),
    ).toMatchObject({
      id: "new-id",
      hostname: "new-host",
      ip: "10.20.30.40",
      status: "online",
      cpu: 0,
      memory: 0,
      cores: 32,
      ram: 128,
    });
  });

  it.each([
    "",
    "UPPER",
    "with space",
    "-start",
    "end-",
    "a".repeat(64),
    "bad.host",
  ])("rejects invalid hostname %s", (hostname) => {
    expect(validateServer({ ...draft, hostname }, fleet)).toContain("hostname");
  });

  it.each([
    "",
    "1.2.3",
    "1.2.3.4.5",
    "256.1.1.1",
    "1.a.1.1",
    "01.2.3.4",
    "-1.2.3.4",
    "1..2.3",
  ])("rejects invalid IPv4 address %s", (ip) => {
    expect(validateServer({ ...draft, ip }, fleet)).toContain("IPv4");
  });

  it("rejects unsupported regions, roles and duplicates", () => {
    expect(validateServer({ ...draft, region: "unknown" }, fleet)).toContain(
      "supported",
    );
    expect(validateServer({ ...draft, role: "Unknown" }, fleet)).toContain(
      "supported",
    );
    expect(
      validateServer({ ...draft, hostname: "k8s-node-001" }, fleet),
    ).toContain("already exists");
    expect(validateServer({ ...draft, ip: "10.10.0.1" }, fleet)).toContain(
      "already exists",
    );
  });
});

describe("telemetry and export", () => {
  it("changes the series by time range and revision without randomness", () => {
    const samples = sampleTraffic("1h", 0);
    expect(samples).toHaveLength(49);
    expect(samples.at(0)?.x).toBe(0);
    expect(samples.at(-1)?.x).toBe(600);
    expect(samples).toEqual(sampleTraffic("1h", 0));
    expect(samples).not.toEqual(sampleTraffic("6h", 0));
    expect(samples).not.toEqual(sampleTraffic("24h", 0));
    expect(samples).not.toEqual(sampleTraffic("1h", 1));
    expect(
      samples.every((sample) => sample.ingress > 0 && sample.egress > 0),
    ).toBe(true);
  });

  it("exports versioned data with explicit demo provenance", () => {
    const snapshot = buildSnapshot(
      fleet,
      initialIncidents,
      "2026-11-07T00:00:00.000Z",
    );
    expect(snapshot).toMatchObject({
      schemaVersion: 1,
      source: "linie-local-demo",
      capturedAt: "2026-11-07T00:00:00.000Z",
      summary: { total: 1248 },
    });
    expect(snapshot.servers).toHaveLength(1248);
    expect(snapshot.incidents).toHaveLength(3);
  });
});
