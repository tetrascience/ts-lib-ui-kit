/**
 * An inline dot-and-label row.
 *
 * Sits above or below the plot, out of the data region. Used where direct labels do not fit: a
 * stacked bar has no room to write inside its segments, so the series names go here and the values
 * go in the tooltip. Above six series this stops being readable and the chart wants faceting
 * instead.
 *
 * Part of the chart layer, which is hand-drawn svg for the reason the widget geoms record.
 */

/** The 6px rhythm the kit prebuilt sheet does not carry. */
const GAP_1_5: React.CSSProperties = {gap: 6};

/** Tabular figures, so a column of numbers lines up on the digit. */
const TABULAR: React.CSSProperties = {fontVariantNumeric: "tabular-nums"};

export interface SeriesItem {
	id: string;
	label: string;
	color: string;
	value?: string;
}

export interface SeriesLegendProps {
	items: SeriesItem[];
	/**
	 * What the swatches stand for, written ahead of them.
	 *
	 * The series legend needs none: its rows are the series and the chart is about them. An annotation
	 * track does, since its swatches name values of some other column and two unlabeled strips beside
	 * one grid leave a reader guessing which is which.
	 */
	label?: string;
	/** Series drawn at full strength. The rest read as context. */
	active?: string | null;
	/**
	 * Which way the names run.
	 *
	 * A row under the plot is the default and wraps. A column is what a legend beside the panel
	 * wants, since names stacked against the geoms they label are read down the way the geoms are.
	 */
	orientation?: "row" | "column";
	onToggle?: (id: string) => void;
}

export function SeriesLegend({items, label, active, orientation = "row", onToggle}: SeriesLegendProps) {
	if (items.length === 0) return null;
	const interactive = Boolean(onToggle);

	return (
		<div className="contents">
			<span className="text-xs text-muted-foreground">{label}</span>
			<span
				className={
					orientation === "column"
						? "flex min-w-0 shrink-0 flex-col items-start gap-y-1"
						: "flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1"
				}
			>
				{items.map((item) => {
					const dim = active != null && item.id !== active;
					const content = (
						<>
							<span
								className="size-2 shrink-0 rounded-full"
								style={{background: item.color, opacity: dim ? 0.35 : 1}}
							/>
							<span className={`text-xs ${dim ? "text-muted-foreground" : "text-foreground"}`}>{item.label}</span>
							{item.value && (
								<span className="text-xs font-medium text-muted-foreground" style={TABULAR}>
									{item.value}
								</span>
							)}
						</>
					);

					return interactive ? (
						<button
							key={item.id}
							type="button"
							onClick={() => onToggle?.(item.id)}
							className="flex items-center"
							style={GAP_1_5}
						>
							{content}
						</button>
					) : (
						<span key={item.id} className="flex items-center" style={GAP_1_5}>
							{content}
						</span>
					);
				})}
			</span>
		</div>
	);
}
