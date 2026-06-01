import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CHART_COLORS,
  DataAppShell,
  LineGraph,
  StatCard,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type NavGroup,
} from "@tetrascience-npm/tetrascience-react-ui";
import { FlaskConical, LayoutDashboard, Table2 } from "lucide-react";
import { useState } from "react";

import { useSampleData, type InstrumentRun } from "./useSampleData";

/**
 * Data Explorer — an end-to-end data-app example.
 *
 * Demonstrates the recommended pattern for a TetraScience data app: a
 * `DataAppShell` for navigation/chrome, `StatCard`s for KPIs, a `LineGraph`
 * for a trend, and a `Table` for the underlying records.
 *
 * Everything is imported from `@tetrascience-npm/tetrascience-react-ui`, so this
 * file is yours to edit — swap `useSampleData` for a real query and reshape the
 * layout to fit your app. The components stay up to date via the npm package.
 */

const STATUS_VARIANT: Record<InstrumentRun["status"], "default" | "secondary" | "destructive"> = {
  completed: "default",
  running: "secondary",
  failed: "destructive",
};

export function DataExplorerPage() {
  const { stats, runs, yieldSeries } = useSampleData();
  const [activePage, setActivePage] = useState("overview");

  const navGroups: NavGroup[] = [
    {
      pages: [
        {
          id: "overview",
          label: "Overview",
          icon: LayoutDashboard,
          isActive: activePage === "overview",
          onClick: () => setActivePage("overview"),
        },
        {
          id: "runs",
          label: "Runs",
          icon: Table2,
          isActive: activePage === "runs",
          onClick: () => setActivePage("runs"),
        },
      ],
    },
  ];

  return (
    <DataAppShell
      appName="DX"
      appFullName="Data Explorer"
      appIcon={<FlaskConical className="size-5" />}
      version="1.0.0"
      navGroups={navGroups}
      breadcrumbs={[{ label: "Data Explorer" }, { label: "Overview" }]}
    >
      <div className="flex flex-col gap-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total runs" value={stats.totalRuns} />
          <StatCard label="Completed" value={stats.completed} trend="up" />
          <StatCard label="Failed" value={stats.failed} trend={stats.failed > 0 ? "down" : "neutral"} />
          <StatCard label="Avg yield" value={`${stats.avgYield}%`} trend="up" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Yield trend</CardTitle>
          </CardHeader>
          <CardContent>
            <LineGraph
              height={320}
              width={720}
              variant="lines+markers"
              xTitle="Completed run"
              yTitle="Yield %"
              title=""
              dataSeries={[
                {
                  ...yieldSeries,
                  color: CHART_COLORS[2],
                },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent runs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Run</TableHead>
                  <TableHead>Instrument</TableHead>
                  <TableHead>Assay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Yield</TableHead>
                  <TableHead>Started</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="font-medium">{run.id}</TableCell>
                    <TableCell>{run.instrument}</TableCell>
                    <TableCell>{run.assay}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[run.status]}>{run.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{run.status === "completed" ? `${run.yield}%` : "—"}</TableCell>
                    <TableCell>{run.startedAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DataAppShell>
  );
}
