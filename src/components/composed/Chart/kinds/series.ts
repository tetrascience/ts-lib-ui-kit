import type { Palettes } from "@/vendor/ts-lib-viz/core";

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
  const seen = new Map<string, number>();
  return dataSeries.map(({ name }) => {
    const count = (seen.get(name) ?? 0) + 1;
    seen.set(name, count);
    return count === 1 ? name : `${name} (${count})`;
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
