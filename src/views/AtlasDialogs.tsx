import { Button, Dialog, Select, TextField } from "@radix-ui/themes";
import { ArrowRight, Plus } from "lucide-react";
import { AtlasDialog } from "../components/AtlasDialog";
import { Stamp, Status } from "../components/Status";
import { regions, roles } from "../models/infrastructure";
import type { AtlasViewModel } from "../viewmodels/useAtlasViewModel";

export function AtlasDialogs({ vm }: { vm: AtlasViewModel }) {
  const server = vm.selectedServer;
  const node = vm.selectedNode;
  return (
    <>
      <AtlasDialog
        open={vm.createOpen}
        onOpenChange={vm.setCreateOpen}
        title="Register a server"
        description="Add an endpoint to this demo fleet. No real server will be provisioned."
      >
        <form
          className="server-form"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            vm.addServer({
              hostname: String(data.get("hostname")),
              ip: String(data.get("ip")),
              region: String(data.get("region")),
              role: String(data.get("role")),
            });
          }}
        >
          <label htmlFor="server-hostname">
            HOSTNAME
            <TextField.Root
              id="server-hostname"
              name="hostname"
              placeholder="k8s-node-1249"
              required
              maxLength={63}
              autoComplete="off"
            />
          </label>
          <label htmlFor="server-ip">
            IPV4 ADDRESS
            <TextField.Root
              id="server-ip"
              name="ip"
              placeholder="10.10.2.20"
              required
              autoComplete="off"
            />
          </label>
          <div className="form-columns">
            <div className="form-field">
              <label htmlFor="server-region">REGION</label>
              <Select.Root name="region" defaultValue="us-east-1">
                <Select.Trigger id="server-region" />
                <Select.Content>
                  {regions.map((region) => (
                    <Select.Item value={region.id} key={region.id}>
                      {region.id}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </div>
            <div className="form-field">
              <label htmlFor="server-role">ROLE</label>
              <Select.Root name="role" defaultValue="Compute">
                <Select.Trigger id="server-role" />
                <Select.Content>
                  {roles.map((role) => (
                    <Select.Item value={role} key={role}>
                      {role}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </div>
          </div>
          <p className="form-help">
            Default profile: 32 vCPU · 128 GB RAM · Linux
            <br />
            Local session only. Reloading restores the reference fleet.
          </p>
          {vm.formError && (
            <p className="form-error" role="alert">
              {vm.formError}
            </p>
          )}
          <div className="dialog-actions">
            <Dialog.Close>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Dialog.Close>
            <Button type="submit">
              <Plus size={14} />
              Register server
            </Button>
          </div>
        </form>
      </AtlasDialog>
      <AtlasDialog
        open={Boolean(server)}
        onOpenChange={(open) => {
          if (!open) vm.setSelectedServerId(null);
        }}
        title={server?.hostname ?? "Server details"}
        description="Asset configuration / local reference inventory"
      >
        {server && (
          <>
            <div className="detail-status">
              <Status status={server.status} />
              <Stamp tone="neutral">{server.role.toUpperCase()}</Stamp>
            </div>
            <dl className="detail-list">
              {[
                ["ASSET ID", server.id],
                ["IPV4 ADDRESS", server.ip],
                ["REGION", server.region],
                ["CPU UTILIZATION", `${server.cpu}% / ${server.cores} vCPU`],
                ["MEMORY", `${server.memory}% / ${server.ram} GB`],
                ["OPERATING SYSTEM", "Ubuntu 24.04 LTS"],
                ["AGENT", "linie-agent / reference fixture"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <p className="form-help">
              Maintenance changes the demo status only. Degraded and offline
              hosts must be investigated before entering maintenance.
            </p>
            <div className="dialog-actions">
              <Dialog.Close>
                <Button variant="outline">Close</Button>
              </Dialog.Close>
              <Button
                disabled={
                  server.status !== "online" && server.status !== "maintenance"
                }
                onClick={() => vm.toggleMaintenance(server.id)}
              >
                {server.status === "maintenance"
                  ? "End maintenance"
                  : "Set maintenance"}
                <ArrowRight size={14} />
              </Button>
            </div>
          </>
        )}
      </AtlasDialog>
      <AtlasDialog
        open={Boolean(node)}
        onOpenChange={(open) => {
          if (!open) vm.setSelectedNodeId(null);
        }}
        title={node?.name ?? "Network node"}
        description="Logical network component / reference architecture"
      >
        {node && (
          <>
            <div className="detail-status">
              <Status status={node.status} />
              <Stamp tone="neutral">{node.label}</Stamp>
            </div>
            <p className="node-description">{node.description}</p>
            <dl className="detail-list">
              <div>
                <dt>CAPACITY</dt>
                <dd>{node.detail}</dd>
              </div>
              <div>
                <dt>IMPLEMENTATION</dt>
                <dd>{node.meta}</dd>
              </div>
              <div>
                <dt>TOPOLOGY</dt>
                <dd>Global / redundant paths</dd>
              </div>
            </dl>
            <div className="dialog-actions">
              <Dialog.Close>
                <Button variant="outline">Close inspection</Button>
              </Dialog.Close>
            </div>
          </>
        )}
      </AtlasDialog>
    </>
  );
}
