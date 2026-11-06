import { Button } from "@radix-ui/themes";
import { Check } from "lucide-react";
import { Panel } from "../components/Panel";
import { Stamp } from "../components/Status";
import type { AtlasViewModel } from "../viewmodels/useAtlasViewModel";

export function IncidentsPanel({ vm }: { vm: AtlasViewModel }) {
  return (
    <Panel
      number="04"
      title="Incidents & exceptions"
      label={`${vm.unacknowledged} UNACKNOWLEDGED`}
      className="incidents-panel"
    >
      <div className="incident-list">
        {vm.incidents.map((incident) => (
          <article
            className={`incident incident-${incident.severity}`}
            key={incident.id}
          >
            <div className="incident-heading">
              <Stamp
                tone={incident.acknowledged ? "neutral" : incident.severity}
              >
                {incident.acknowledged
                  ? "ACK"
                  : incident.severity === "critical"
                    ? "CRIT"
                    : "WARN"}
              </Stamp>
              <strong>{incident.title}</strong>
              <span>{incident.time}</span>
            </div>
            <p>{incident.description}</p>
            <div className="incident-action">
              <code>{incident.source}</code>
              <Button
                size="1"
                variant="ghost"
                disabled={incident.acknowledged}
                onClick={() => vm.acknowledgeIncident(incident.id)}
              >
                {incident.acknowledged ? (
                  <>
                    <Check size={11} />
                    Acknowledged
                  </>
                ) : (
                  "Acknowledge"
                )}
              </Button>
            </div>
          </article>
        ))}
      </div>
      <p className="fine-print">
        Acknowledging records ownership; it does not resolve the condition.
      </p>
    </Panel>
  );
}
