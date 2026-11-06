import { Button, Progress } from "@radix-ui/themes";
import { ArrowUpRight } from "lucide-react";
import { Panel } from "../components/Panel";
import { Stamp } from "../components/Status";
import { regions, summarizeFleet } from "../models/infrastructure";
import type { AtlasViewModel } from "../viewmodels/useAtlasViewModel";

export function RegionsPanel({ vm }: { vm: AtlasViewModel }) {
  return (
    <Panel
      number="03"
      title="Regional infrastructure"
      label="AVAILABILITY ZONES"
      className="regions-panel"
    >
      <div className="panel-intro">
        <strong>4 regions / 12 availability zones</strong>
        <span>Geo-distributed</span>
      </div>
      <div className="region-list">
        {regions.map((region) => {
          const summary = summarizeFleet(
            vm.servers.filter((server) => server.region === region.id),
          );
          return (
            <article className="region-card" key={region.id}>
              <div className="region-card-header">
                <Button
                  variant="ghost"
                  size="1"
                  className="region-button"
                  onClick={() => {
                    vm.setRegion(region.id);
                    vm.setQuery("");
                    vm.setStatus("all");
                    document.getElementById("inventory")?.scrollIntoView({
                      behavior: "smooth",
                      block: "nearest",
                    });
                  }}
                >
                  {region.id}
                  <ArrowUpRight size={12} />
                </Button>
                <Stamp>CONNECTED</Stamp>
              </div>
              <strong className="region-count">
                {summary.total} hosts <span>/</span> {region.racks} racks{" "}
                <span>/</span> 3 AZ
              </strong>
              <div className="region-location">
                <span>
                  {region.name}, {region.country}
                </span>
                <span>{region.latency} ms RTT</span>
              </div>
              <Progress
                value={Number(summary.availability)}
                size="1"
                aria-label={`${region.id} reachability`}
                className="region-progress"
              />
              <div className="region-health">
                <span>
                  {summary.online} healthy · {summary.attention} attention
                </span>
                <span className={summary.offline ? "text-warning" : ""}>
                  {summary.availability}% reachable
                </span>
              </div>
            </article>
          );
        })}
      </div>
      <div className="subsection-heading">
        <strong>RESILIENCE / BUILT IN</strong>
      </div>
      <div className="resilience-chain">
        <span>Multi-AZ</span>
        <span>→</span>
        <span>Auto failover</span>
        <span>→</span>
        <span>Replicated</span>
      </div>
      <p className="fine-print">
        Independent failure domains. Encrypted inter-region links.
        <br />
        Select a region to scope the asset register.
      </p>
    </Panel>
  );
}
