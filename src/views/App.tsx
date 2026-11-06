import { IconButton } from "@radix-ui/themes";
import { CheckCircle2, X } from "lucide-react";
import { DrawingFrame } from "../components/DrawingFrame";
import { useAtlasViewModel } from "../viewmodels/useAtlasViewModel";
import { AtlasDialogs } from "./AtlasDialogs";
import { AtlasFooter } from "./AtlasFooter";
import { AtlasHeader } from "./AtlasHeader";
import { IncidentsPanel } from "./IncidentsPanel";
import { InventoryPanel } from "./InventoryPanel";
import { JournalPanel } from "./JournalPanel";
import { RegionsPanel } from "./RegionsPanel";
import { TelemetryPanel } from "./TelemetryPanel";
import { TopologyPanel } from "./TopologyPanel";

export function App() {
  const vm = useAtlasViewModel();
  return (
    <>
      <DrawingFrame>
        <AtlasHeader vm={vm} />
        <div className="atlas-grid">
          <InventoryPanel vm={vm} />
          <TopologyPanel vm={vm} />
          <RegionsPanel vm={vm} />
          <IncidentsPanel vm={vm} />
          <TelemetryPanel vm={vm} />
          <JournalPanel vm={vm} />
        </div>
        <AtlasFooter />
      </DrawingFrame>
      <AtlasDialogs vm={vm} />
      <div
        className="notice-region"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {vm.notice && (
          <div className="notice">
            <CheckCircle2 size={16} />
            <span>{vm.notice}</span>
            <IconButton
              size="1"
              variant="ghost"
              aria-label="Dismiss notification"
              onClick={() => vm.setNotice("")}
            >
              <X size={14} />
            </IconButton>
          </div>
        )}
      </div>
    </>
  );
}
