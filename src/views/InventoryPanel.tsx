import {
  Button,
  IconButton,
  Select,
  Table,
  TextField,
  Tooltip,
} from "@radix-ui/themes";
import {
  ArrowDownWideNarrow,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { Panel } from "../components/Panel";
import { Status } from "../components/Status";
import {
  PAGE_SIZE,
  regions,
  type StatusFilter,
} from "../models/infrastructure";
import type { AtlasViewModel } from "../viewmodels/useAtlasViewModel";

export function InventoryPanel({ vm }: { vm: AtlasViewModel }) {
  return (
    <Panel
      number="01"
      title="Server inventory"
      label="ASSET REGISTER"
      className="inventory-panel"
    >
      <div id="inventory" className="panel-intro">
        <strong>{vm.filteredCount.toLocaleString("en-US")} hosts</strong>
        <span>Discover. Inspect. Keep in line.</span>
      </div>
      <div className="inventory-filters">
        <TextField.Root
          size="1"
          placeholder="Find a host or IP…"
          aria-label="Search servers"
          value={vm.query}
          onChange={(event) => vm.setQuery(event.target.value)}
        >
          <TextField.Slot>
            <Search size={12} />
          </TextField.Slot>
          {vm.query && (
            <TextField.Slot>
              <IconButton
                variant="ghost"
                size="1"
                aria-label="Clear search"
                onClick={() => vm.setQuery("")}
              >
                <X size={12} />
              </IconButton>
            </TextField.Slot>
          )}
        </TextField.Root>
        <Select.Root size="1" value={vm.region} onValueChange={vm.setRegion}>
          <Select.Trigger aria-label="Filter by region" />
          <Select.Content>
            <Select.Item value="all">All regions</Select.Item>
            {regions.map((region) => (
              <Select.Item key={region.id} value={region.id}>
                {region.id}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        <Select.Root
          size="1"
          value={vm.status}
          onValueChange={(value) => vm.setStatus(value as StatusFilter)}
        >
          <Select.Trigger aria-label="Filter by status" />
          <Select.Content>
            {["all", "online", "degraded", "offline", "maintenance"].map(
              (status) => (
                <Select.Item key={status} value={status}>
                  {status === "all" ? "All states" : status}
                </Select.Item>
              ),
            )}
          </Select.Content>
        </Select.Root>
      </div>
      <div className="inventory-table-wrap">
        <Table.Root size="1" className="inventory-table">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell className="row-index">
                #
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>HOSTNAME</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell
                align="right"
                aria-sort={vm.sortDescending ? "descending" : "none"}
              >
                <Tooltip content="Toggle highest CPU first">
                  <Button
                    variant="ghost"
                    size="1"
                    className="sort-button"
                    onClick={() => vm.setSortDescending(!vm.sortDescending)}
                  >
                    CPU
                    <ArrowDownWideNarrow size={11} />
                  </Button>
                </Tooltip>
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell align="right">MEM</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell align="right">
                STATE
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {vm.visibleServers.map((server, index) => (
              <Table.Row key={server.id}>
                <Table.Cell className="row-index">
                  {String(vm.page * PAGE_SIZE + index + 1).padStart(2, "0")}
                </Table.Cell>
                <Table.RowHeaderCell>
                  <Button
                    variant="ghost"
                    size="1"
                    className="hostname-button"
                    onClick={() => vm.setSelectedServerId(server.id)}
                  >
                    {server.hostname}
                  </Button>
                </Table.RowHeaderCell>
                <Table.Cell
                  align="right"
                  className={server.cpu > 85 ? "text-warning" : ""}
                >
                  {server.status === "offline" ? "—" : `${server.cpu}%`}
                </Table.Cell>
                <Table.Cell align="right">
                  {server.status === "offline" ? "—" : `${server.memory}%`}
                </Table.Cell>
                <Table.Cell align="right">
                  <Status status={server.status} />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        {!vm.filteredCount && (
          <div className="empty-state">
            <Search size={24} strokeWidth={1} />
            <strong>No hosts match this view.</strong>
            <p>Try a different hostname, IP address or filter.</p>
            <Button
              variant="outline"
              size="1"
              onClick={() => {
                vm.setQuery("");
                vm.setRegion("all");
                vm.setStatus("all");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
      <div className="inventory-pagination">
        <span>
          {vm.filteredCount ? vm.page * PAGE_SIZE + 1 : 0}–
          {Math.min((vm.page + 1) * PAGE_SIZE, vm.filteredCount)} OF{" "}
          {vm.filteredCount.toLocaleString("en-US")}
        </span>
        <div>
          <IconButton
            size="1"
            variant="ghost"
            disabled={vm.page === 0}
            aria-label="Previous page"
            onClick={() => vm.setPage(vm.page - 1)}
          >
            <ChevronLeft size={14} />
          </IconButton>
          <span>
            {vm.page + 1} / {vm.pageCount}
          </span>
          <IconButton
            size="1"
            variant="ghost"
            disabled={vm.page >= vm.pageCount - 1}
            aria-label="Next page"
            onClick={() => vm.setPage(vm.page + 1)}
          >
            <ChevronRight size={14} />
          </IconButton>
        </div>
      </div>
      <div className="panel-footnote">
        <strong>ONE REGISTER / EVERY ENDPOINT</strong>
        <p>IPv4 · agent-based discovery · 32 vCPU / 128 GB default</p>
        <p>Select a hostname to inspect its configuration.</p>
      </div>
    </Panel>
  );
}
