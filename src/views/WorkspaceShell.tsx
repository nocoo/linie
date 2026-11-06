import { Button, IconButton, Tooltip } from "@radix-ui/themes";
import { MessageSquare, PanelLeft } from "lucide-react";
import { type ReactNode, useCallback, useRef } from "react";
import type { AtlasViewModel } from "../viewmodels/useAtlasViewModel";
import { useChatViewModel } from "../viewmodels/useChatViewModel";
import { useShellViewModel } from "../viewmodels/useShellViewModel";
import { ChatPanel } from "./ChatPanel";
import { Sidebar } from "./Sidebar";

export function WorkspaceShell({
  vm,
  children,
}: {
  vm: AtlasViewModel;
  children: ReactNode;
}) {
  const shell = useShellViewModel();
  const chat = useChatViewModel({
    servers: vm.servers,
    incidents: vm.incidents,
  });
  const chatToggle = useRef<HTMLButtonElement>(null);
  const closeChat = useCallback(() => {
    shell.setChatOpen(false);
    chatToggle.current?.focus();
  }, [shell.setChatOpen]);

  return (
    <div
      className="workspace-shell"
      data-sidebar={shell.sidebarOpen ? "open" : "closed"}
      data-chat={shell.chatOpen ? "open" : "closed"}
    >
      {shell.sidebarOpen && <Sidebar vm={vm} shell={shell} />}
      <div className="workspace-main">
        <header className="shell-toolbar">
          <Tooltip
            content={shell.sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <IconButton
              size="1"
              variant="ghost"
              aria-label={shell.sidebarOpen ? "Close sidebar" : "Open sidebar"}
              aria-expanded={shell.sidebarOpen}
              aria-controls="workspace-sidebar"
              onClick={() => shell.setSidebarOpen(!shell.sidebarOpen)}
            >
              <PanelLeft size={16} />
            </IconButton>
          </Tooltip>
          <div className="shell-breadcrumb">
            <strong>WORKSPACE</strong>
            <span>/</span>
            <span>Global infrastructure</span>
          </div>
          <span className="shell-demo">SIMULATION MODE</span>
          <Button
            ref={chatToggle}
            size="1"
            variant={shell.chatOpen ? "solid" : "outline"}
            aria-expanded={shell.chatOpen}
            aria-controls="operations-chat"
            onClick={() => shell.setChatOpen(!shell.chatOpen)}
          >
            <MessageSquare size={13} />
            {shell.chatOpen ? "Hide companion" : "Open companion"}
          </Button>
        </header>
        <div className="atlas-viewport">{children}</div>
      </div>
      {shell.chatOpen && <ChatPanel vm={chat} onClose={closeChat} />}
    </div>
  );
}
