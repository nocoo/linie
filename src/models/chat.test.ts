import { describe, expect, it } from "vitest";
import { createChatReply } from "./chat";
import { createFleet, initialIncidents } from "./infrastructure";

const context = { servers: createFleet(), incidents: initialIncidents };

describe("simulated operations replies", () => {
  it.each(["Summarize fleet health", "健康状态"])(
    "uses the current inventory for %s",
    (prompt) => {
      expect(createChatReply(prompt, context)).toContain(
        "1,248 managed servers",
      );
      expect(createChatReply(prompt, context)).toContain("99.52%");
    },
  );

  it("uses changed inventory instead of a hardcoded fleet total", () => {
    expect(createChatReply("fleet", { servers: [], incidents: [] })).toContain(
      "0 managed servers",
    );
  });

  it.each(["Which hosts need attention?", "离线告警"])(
    "explains open conditions for %s",
    (prompt) => {
      const reply = createChatReply(prompt, context);
      expect(reply).toContain("6 offline hosts");
      expect(reply).toContain("3 incidents");
      expect(reply).toContain("pg-primary-007");
    },
  );

  it("handles an empty attention list and acknowledged incidents", () => {
    expect(
      createChatReply("attention", {
        servers: [],
        incidents: initialIncidents.map((incident) => ({
          ...incident,
          acknowledged: true,
        })),
      }),
    ).toContain("0 incidents");
    expect(
      createChatReply("attention", { servers: [], incidents: [] }),
    ).toContain("No hosts currently need attention");
  });

  it("compares all regions or targets a named region", () => {
    const all = createChatReply("Compare regions", context);
    expect(all).toContain("us-east-1");
    expect(all).toContain("ap-northeast-1");
    const selected = createChatReply("eu-west-1", context);
    expect(selected).toContain("Dublin");
    expect(selected).not.toContain("Tokyo");
    expect(createChatReply("区域", context)).toContain("312 hosts");
  });

  it("inspects a hostname or IP address", () => {
    expect(createChatReply("Inspect k8s-node-001", context)).toContain(
      "Address: 10.10.0.1",
    );
    expect(createChatReply("10.10.0.1", context)).toContain("32 vCPU");
  });

  it("explains the logical topology without claiming live checks", () => {
    expect(createChatReply("Explain the network", context)).toContain(
      "9 logical components",
    );
    expect(createChatReply("拓扑", context)).toContain(
      "simulated replication-lag warning",
    );
  });

  it.each(["Restart k8s-node-001", "maintenance", "删除服务器", "重启"])(
    "never performs a write for %s",
    (prompt) => {
      expect(createChatReply(prompt, context)).toContain(
        "No infrastructure action was executed",
      );
      expect(context.servers[0]?.status).toBe("online");
    },
  );

  it("continues the previous topic only for explicit follow-up prompts", () => {
    expect(createChatReply("more", context, "fleet health")).toContain(
      "FLEET SNAPSHOT",
    );
    expect(createChatReply("more", context, "fleet health")).toContain(
      "Next check",
    );
    expect(createChatReply("继续", context, "topology")).toContain(
      "NETWORK WALKTHROUGH",
    );
    expect(createChatReply("more", context)).toContain("I can simulate");
    expect(
      createChatReply("a different topic", context, "fleet health"),
    ).toContain("I can simulate");
  });
});
