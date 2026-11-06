import type { PlateMapProps } from "@/components/composed/Chart/kinds/PlateMap";

import { Chart } from "@/components/composed/Chart";

export type { PlateMapProps } from "@/components/composed/Chart/kinds/PlateMap";
export { DEFAULT_CATEGORY_COLORS } from "@/components/charts/PlateMap/constants";
export * from "@/components/charts/PlateMap/types";

/** Draws a plate map through the shared `Chart` component. */
export function PlateMap(props: PlateMapProps) {
  return <Chart type="plateMap" {...props} />;
}
