import { Badge, Button, IconButton, Tooltip } from "@radix-ui/themes";
import {
  Activity,
  ArrowDownToLine,
  Box,
  CircleAlert,
  Globe2,
  LayoutDashboard,
  ListChecks,
  Network,
  PanelLeftClose,
  Plus,
  Server,
  UserRound,
} from "lucide-react";
import type { AtlasViewModel } from "../viewmodels/useAtlasViewModel";
import type { ShellViewModel } from "../viewmodels/useShellViewModel";

const navigation = [
  { id: "atlas", label: "Overview", icon: LayoutDashboard, marker: "00" },
  { id: "panel-01", label: "Servers", icon: Server, marker: "01" },
  { id: "panel-02", label: "Network", icon: Network, marker: "02" },
  { id: "panel-03", label: "Regions", icon: Globe2, marker: "03" },
  { id: "panel-04", label: "Incidents", icon: CircleAlert, marker: "04" },
  { id: "panel-05", label: "Telemetry", icon: Activity, marker: "05" },
  { id: "panel-06", label: "Activity", icon: ListChecks, marker: "06" },
];

export function Sidebar({
  vm,
  shell,
  onClose,
}: {
  vm: AtlasViewModel;
  shell: ShellViewModel;
  onClose: () => void;
}) {
  return (
    <aside
      className="app-sidebar"
      id="workspace-sidebar"
      aria-label="Workspace sidebar"
    >
      <div className="sidebar-brand">
        <Box size={25} strokeWidth={1.2} />
        <strong>LINIE</strong>
        <Badge className="version-pill" variant="outline">
          v{__APP_VERSION__}
        </Badge>
        <Tooltip content="Close sidebar">
          <IconButton
            variant="ghost"
            size="1"
            aria-label="Close sidebar"
            onClick={onClose}
          >
            <PanelLeftClose size={16} />
          </IconButton>
        </Tooltip>
      </div>
      <div className="sidebar-workspace">
        <span className="sidebar-eyebrow">WORKSPACE / 01</span>
        <strong>Global infrastructure</strong>
        <span>
          <i className="status-dot" />
          Local simulation
        </span>
      </div>
      <nav className="sidebar-navigation" aria-label="Workspace navigation">
        <span className="sidebar-eyebrow">OPERATIONS</span>
        {navigation.map(({ id, label, icon: Icon, marker }) => (
          <Button
            key={id}
            asChild
            variant="ghost"
            className={`sidebar-link ${shell.activeSection === id ? "is-active" : ""}`}
          >
            <a
              href={`#${id}`}
              aria-current={shell.activeSection === id ? "location" : undefined}
              onClick={() => shell.setActiveSection(id)}
            >
              <Icon size={16} strokeWidth={1.5} />
              <span>{label}</span>
              <span className="nav-marker">
                {id === "panel-04" ? vm.unacknowledged : marker}
              </span>
            </a>
          </Button>
        ))}
      </nav>
      <div className="sidebar-tools">
        <span className="sidebar-eyebrow">QUICK ACTIONS</span>
        <Button size="1" variant="outline" onClick={vm.openCreate}>
          <Plus size={13} />
          Register server
        </Button>
        <Button size="1" variant="outline" onClick={vm.exportSnapshot}>
          <ArrowDownToLine size={13} />
          Export fleet snapshot
        </Button>
      </div>
      <div className="sidebar-footer">
        <div className="sidebar-operator">
          <UserRound size={18} strokeWidth={1.5} />
          <div>
            <strong>Local operator</strong>
            <span>Demo workspace / no sign-in</span>
          </div>
        </div>
        <p>
          LN-NET-001 / REV A<br />
          All systems, in perspective.
        </p>
      </div>
    </aside>
  );
}
