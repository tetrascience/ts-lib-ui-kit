/**
 * An annotation track drawn as a strip of cells beside the band it annotates.
 *
 * The same shape a grid's row is, and for the same reason: one cell per category, filling the band
 * the category holds, so the strip and the grid line up cell for cell and a reader traces across.
 * The extent perpendicular to that is the panel's, which is one cell's worth in pheatmap and
 * whatever the author asked for here.
 *
 * A category with no reading leaves a gap instead of a cell. Absent and lowest are different facts,
 * which is the argument the grid's own gaps make: a strip that fills them says a lot was annotated
 * when nobody annotated it.
 *
 * See the ADR "A figure takes side panels that share one axis", decisions 5 to 7.
 */

import type {SideTrack, SidePanel} from "../../core/internal.js";

export interface TrackPanelProps {
	track: SideTrack;
	/** Where a category sits along the shared axis. The band scale answers with its center. */
	at: (category: string) => number;
	/** The category's extent along the shared axis, which is the band scale's own bandwidth. */
	band: number;
	position: SidePanel["position"];
	width: number;
	height: number;
	/** The category's color, or null where it carries no reading. */
	fill: (category: string) => string | null;
	/**
	 * Ink on the cell edge, which is the grid's own. Absent draws none, as the grid's cells do.
	 *
	 * pheatmap's `border_color` draws the annotation strip and the matrix alike, and the arithmetic
	 * here is the grid's: an edge lands inside the band instead of on its boundary, so a strip cell
	 * is the same size as the cell beside it instead of a hairline taller.
	 */
	stroke?: string;
	lineWidth?: number;
}

export function TrackPanel({track, at, band, position, width, height, fill, stroke, lineWidth = 1.5}: TrackPanelProps) {
	const across = position === "top" || position === "bottom";
	const reach = Math.max(1, band);
	const hairline = stroke ? lineWidth : 0;
	const inset = hairline / 2;
	const thick = Math.max(1, reach - hairline);

	const cells = [...track.at.keys()].flatMap((category) => {
		const color = fill(category);
		if (color == null) return [];
		const along = at(category) - reach / 2 + inset;
		return [
			{
				category,
				color,
				x: across ? along : inset,
				y: across ? inset : along,
				w: across ? thick : Math.max(1, width - hairline),
				h: across ? Math.max(1, height - hairline) : thick,
			},
		];
	});
	if (cells.length === 0) return null;

	return (
		<g data-track={track.field}>
			{cells.map((cell) => (
				<rect
					key={cell.category}
					x={cell.x}
					y={cell.y}
					width={cell.w}
					height={cell.h}
					fill={cell.color}
					stroke={stroke}
					strokeWidth={hairline}
				/>
			))}
		</g>
	);
}
