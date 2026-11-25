import type { Palettes } from "@tetrascience-npm/ts-lib-viz/core";

import { categoricalPalettes } from "@/components/charts/viz/VizChart";
import { seriesColor } from "@/utils/colors";

/** A series as a chart draws it: the name the legend shows and, optionally, its colour. */
interface NamedSeries {
  name: string;
  color?: string;
}

/**
 * The name each series draws under. ts-lib-viz merges rows that share a name into one series, so
 * a repeated name gets a count: "Run", then "Run (2)". The legend shows the counted name.
 */
export function uniqueSeriesNames(dataSeries: readonly NamedSeries[]): string[] {
  // Every name the caller gave is reserved, so a counted name never takes another series' own name.
  const reserved = new Set(dataSeries.map(({ name }) => name));
  const emitted = new Set<string>();
  return dataSeries.map(({ name }) => {
    if (!emitted.has(name)) {
      emitted.add(name);
      return name;
    }
    let count = 2;
    while (reserved.has(`${name} (${count})`) || emitted.has(`${name} (${count})`)) count++;
    const counted = `${name} (${count})`;
    emitted.add(counted);
    return counted;
  });
}

/**
 * The palette for the series that have rows. ts-lib-viz numbers series in the order their rows first
 * show them, so a series with no rows takes no colour and would shift every series after it. Each
 * colour is the one its series draws with at its own position in `dataSeries`.
 */
export function seriesPalettes(dataSeries: readonly NamedSeries[], hasRows: readonly boolean[]): Palettes {
  const colors = dataSeries.flatMap((series, index) => (hasRows[index] ? [seriesColor(index, series.color)] : []));
  return categoricalPalettes(colors);
}
