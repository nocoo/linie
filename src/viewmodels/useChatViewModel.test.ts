import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CHAT_LIMIT } from "../models/chat";
import { createFleet, initialIncidents } from "../models/infrastructure";
import { useChatViewModel } from "./useChatViewModel";
import { useShellViewModel } from "./useShellViewModel";

const context = { servers: createFleet(), incidents: initialIncidents };
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("chat session", () => {
  it("begins with a simulation disclosure and rejects empty or oversized messages", () => {
    const { result } = renderHook(() => useChatViewModel(context));
    expect(result.current.messages[0]?.content).toContain("local simulation");
    act(() => {
      expect(result.current.sendMessage(" ")).toBe(false);
      expect(result.current.sendMessage("a".repeat(CHAT_LIMIT + 1))).toBe(
        false,
      );
    });
    expect(result.current.error).toContain("1000");
    expect(result.current.messages).toHaveLength(1);
  });

  it("submits a draft, shows pending state and replies exactly once", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useChatViewModel(context));
    act(() => result.current.setDraft("  fleet health  "));
    act(() => {
      expect(result.current.sendMessage()).toBe(true);
      expect(result.current.sendMessage("duplicate")).toBe(false);
    });
    expect(result.current.pending).toBe(true);
    expect(result.current.draft).toBe("");
    expect(result.current.messages[1]?.content).toBe("fleet health");
    act(() => vi.advanceTimersByTime(450));
    expect(result.current.pending).toBe(false);
    expect(result.current.messages).toHaveLength(3);
    expect(result.current.messages[2]?.content).toContain(
      "1,248 managed servers",
    );
    act(() => result.current.sendMessage("more"));
    act(() => vi.advanceTimersByTime(450));
    expect(result.current.messages.at(-1)?.content).toContain("Next check");
    act(() => result.current.sendMessage("more"));
    act(() => vi.advanceTimersByTime(450));
    expect(result.current.messages.at(-1)?.content).toContain("FLEET SNAPSHOT");
  });

  it("uses the most recent context when sending a new message", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ servers }) => useChatViewModel({ ...context, servers }),
      { initialProps: { servers: context.servers } },
    );
    rerender({ servers: [] });
    act(() => result.current.sendMessage("fleet health"));
    act(() => vi.runAllTimers());
    expect(result.current.messages.at(-1)?.content).toContain(
      "0 managed servers",
    );
  });

  it("clears an in-flight reply, the draft, errors and follow-up context", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useChatViewModel(context));
    act(() => result.current.sendMessage("fleet health"));
    act(() => result.current.clearConversation());
    act(() => vi.runAllTimers());
    expect(result.current.pending).toBe(false);
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.error).toBe("");
    act(() => result.current.sendMessage("more"));
    act(() => vi.runAllTimers());
    expect(result.current.messages.at(-1)?.content).toContain("I can simulate");
    act(() => result.current.clearConversation());
    expect(result.current.messages).toHaveLength(1);
  });

  it("cleans pending timers when the workspace unmounts", () => {
    vi.useFakeTimers();
    const { result, unmount } = renderHook(() => useChatViewModel(context));
    act(() => result.current.sendMessage("network"));
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("shell defaults", () => {
  it("opens the sidebar, folds chat and keeps toggles independent", () => {
    const { result } = renderHook(useShellViewModel);
    expect(result.current.sidebarOpen).toBe(true);
    expect(result.current.chatOpen).toBe(false);
    expect(result.current.activeSection).toBe("atlas");
    act(() => {
      result.current.setSidebarOpen(false);
      result.current.setChatOpen(true);
      result.current.setActiveSection("panel-02");
    });
    expect(result.current.sidebarOpen).toBe(false);
    expect(result.current.chatOpen).toBe(true);
    expect(result.current.activeSection).toBe("panel-02");
  });
});
