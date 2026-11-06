import { Panel } from "../components/Panel";
import type { AtlasViewModel } from "../viewmodels/useAtlasViewModel";

export function JournalPanel({ vm }: { vm: AtlasViewModel }) {
  return (
    <Panel
      number="06"
      title="Operations journal"
      label="AUDIT TRAIL"
      className="journal-panel"
    >
      <div className="journal-list">
        {vm.journal.slice(0, 4).map((entry) => (
          <div className="journal-entry" key={entry.id}>
            <time>{entry.time}</time>
            <div>
              <strong>{entry.action}</strong>
              <p>{entry.detail}</p>
            </div>
            <span className="status-dot" />
          </div>
        ))}
      </div>
      <div className="journal-footer">
        <strong>TRACEABLE BY DEFAULT</strong>
        <p>
          Actions are recorded in this session. Export a snapshot to retain the
          current fleet and incident state.
        </p>
      </div>
    </Panel>
  );
}
