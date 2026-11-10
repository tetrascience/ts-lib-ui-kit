/**
 * The point geom, and the record behind each geom.
 *
 * Split out of `Hexbin`, which drew circles keyed by array position when the count sat below the
 * density switch. Those circles could not say what they stood for, so a scatter was a picture instead
 * of a way into the data. A point here carries its record key, and hover resolves through one
 * quadtree lookup against a single capture surface instead of a listener per point.
 *
 * Drawing and hit testing read the same projection, so the geom under the readout is the geom the
 * pointer found.
 *
 * Above the fade threshold the points are drawn as a path per color step instead of an element
 * each. A facet of fourteen thousand records is fourteen thousand nodes for the browser to lay out
 * and paint, and six of them on one page is where the specimen section spent half a second. The
 * treatment is the same either way: same radius, same opacity, same color off the ramp. Identity
 * survives because hover resolves through the quadtree and the capture surface, neither of which
 * ever read the drawn elements.
 */

import {useMemo, useRef, useState} from "react";

import {
	buildIndex,
	nearest,
	placePoints,
	POINT_OUTLINE,
	REGULAR,
	type Placed,
	type PlotPoint,
} from "../../core/internal.js";
import type {PointHit, PointShape, Scale, ValueRamp} from "../../core/internal.js";

/**
 * Color steps across the ramp for the faded treatment.
 *
 * Enough that a bound color channel still reads as a gradient at 0.16 opacity, few enough that a
 * facet draws a handful of paths.
 */
const FADED_STEPS = 24;

/**
 * The faded treatment, per chart-design rule 7.
 *
 * Exported because the GPU renderer only ever draws counts that are already past the fade
 * threshold, and a geom that changed size when the renderer changed would read as the data moving.
 */
export const FADED_R = REGULAR.fadedRadius;
export const FADED_OPACITY = 0.16;

/**
 * Radius a point draws at when the caller names none.
 *
 * The regular column of `METRICS`. A caller with a panel of another size passes
 * `metrics.pointRadius` off the frame's render prop, which is how a facet gets three pixels and a
 * chart with a page to itself gets five.
 */
const POINT_R = REGULAR.pointRadius;

/** Outline width of a hollow glyph, capped so a small geom keeps a visible center. */
const outlineWidth = (r: number) => Math.min(POINT_OUTLINE, r * 0.5);

export type {PointShape};

/** A dot written as a path: two half arcs, which is how a circle survives being merged with others. */
const dot = (x: number, y: number, r: number) =>
	`M${(x - r).toFixed(2)},${y.toFixed(2)}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0`;

/**
 * Any glyph as a path, so one merged element can hold thousands of them.
 *
 * Exported so a guide draws its sample through the same arithmetic the chart drew the marks
 * with. A legend that redrew the four shapes by hand is a second writer of one glyph set.
 */
export function glyph(shape: PointShape, x: number, y: number, r: number): string {
	const at = (value: number) => value.toFixed(2);
	if (shape === "circle") return dot(x, y, r);
	if (shape === "square") {
		// Matched to the circle by area instead of by width, so a mixed plot reads as one weight.
		const half = r * 0.886;
		return `M${at(x - half)},${at(y - half)}h${at(half * 2)}v${at(half * 2)}h${at(-half * 2)}Z`;
	}
	if (shape === "triangle") {
		const reach = r * 1.2;
		return `M${at(x)},${at(y - reach)}L${at(x + reach)},${at(y + reach * 0.75)}L${at(
			x - reach,
		)},${at(y + reach * 0.75)}Z`;
	}
	const reach = r * 1.25;
	return `M${at(x)},${at(y - reach)}L${at(x + reach)},${at(y)}L${at(x)},${at(y + reach)}L${at(x - reach)},${at(y)}Z`;
}

export type {PlotPoint} from "../../core/internal.js";
export type {PointHit};

export interface PointsProps {
	/** Whether the pair of scales is drawn the other way round, as the band geoms take it. */
	transposed?: boolean;
	/** Distance between two neighboring band centers on the category axis, in pixels. A jitter's offset there reads in it. */
	step?: number;
	points: PlotPoint[];
	x: Scale;
	y: Scale;
	/** The 1,500 to 15,000 treatment: smaller and translucent, per chart-design rule 7. */
	faded?: boolean;
	/**
	 * Maps a point's weight to a color.
	 *
	 * The weight keeps its own units, so scaling belongs to whoever knows what they are: the caller
	 * closes over the range it read the field across, and the geom asks for colors without knowing
	 * whether it is holding degrees or a proportion.
	 */
	ramp: ValueRamp;
	/** Point radius, where the size channel resolved none. Overrides the density treatment's pick. */
	radius?: number;
	/** Geom opacity. Overrides the density treatment. */
	opacity?: number;
	/** Glyph each geom draws, so two groups over one frame are told apart without relying on hue. */
	shape?: PointShape;
	/**
	 * Draws the glyph as an outline with paper showing through it.
	 *
	 * The hollow center is what a reader counts through, so the halo goes unread here: it would take
	 * the stroke the outline needs, and there is nothing left for it to separate.
	 */
	hollow?: boolean;
	/**
	 * Width of the paper-colored halo around each geom, in pixels. Zero draws none.
	 *
	 * The halo is space and not a border: it lets a reader count geoms that overlap. On a sparse
	 * panel there is nothing to separate and it costs the geom some of its own area.
	 */
	halo?: number;
	/** Plot area. Supply with `onHover` so the pointer is caught across the whole frame. */
	width?: number;
	height?: number;
	onHover?: (hit: PointHit | null) => void;
	/** A geom taken instead of read. The caller decides what opening a record means. */
	onSelect?: (hit: PointHit) => void;
}

/**
 * Whether a point of radius `r` draws the paper-colored hairline around itself.
 *
 * Chart-design rule 9 asks for the hairline on points above 4px and says why: a crowd of large
 * geoms stops being countable without space between them. A point at the default radius has that
 * space already, and a ring on it reads as an outline the figure did not ask for.
 *
 * A stated width answers for itself either way, so an author can put the hairline on a small point
 * or take it off a large one.
 */
const HALO_ABOVE = 4;

const haloOn = (r: number, halo: number | undefined): boolean => (halo == null ? r > HALO_ABOVE : halo > 0);

export function Points({
	points,
	x,
	y,
	faded = false,
	ramp,
	radius,
	opacity,
	shape = "circle",
	hollow = false,
	halo,
	width,
	height,
	onHover,
	onSelect,
	transposed = false,
	step,
}: PointsProps) {
	const [hovered, setHovered] = useState<Placed | null>(null);

	const placed = useMemo(
		() =>
			placePoints(
				points,
				(v) => x(v),
				(v) => y(v),
				{transposed, step},
			),
		[points, x, y, transposed, step],
	);

	const hoverable = onHover != null && width != null && height != null;
	const index = useMemo(() => (hoverable ? buildIndex(placed) : null), [hoverable, placed]);

	/*
    One path per color step, built only for the treatment that draws enough points to need it.

    Steps are cut across the weights in hand instead of across zero to one, so the ramp is asked
    for a color a couple of dozen times whatever units the weights carry and whatever domain the
    ramp was built over.
  */
	const bands = useMemo(() => {
		if (!faded) return [];
		const r = radius ?? FADED_R;

		let lo = Infinity;
		let hi = -Infinity;
		for (const p of placed) {
			const weight = p.point.weight;
			if (weight == null) continue;
			if (weight < lo) lo = weight;
			if (weight > hi) hi = weight;
		}

		const span = hi - lo;
		const steps = span > 0 ? FADED_STEPS : 1;
		const parts = new Array<string>(steps).fill("");
		for (const p of placed) {
			const weight = p.point.weight;
			const step = weight == null || span <= 0 ? 0 : Math.round(((weight - lo) / span) * (steps - 1));
			// A step merges glyphs of one color, so a bound size channel still varies inside it.
			parts[step] += glyph(shape, p.x, p.y, p.point.size ?? r);
		}

		return parts
			.map((d, step) => ({
				d,
				// The weight this step stands for, which is what the ramp was given for a single geom.
				weight: span > 0 ? lo + (step / (steps - 1)) * span : Number.isFinite(lo) ? lo : null,
			}))
			.filter((band) => band.d.length > 0);
	}, [faded, placed, radius, shape]);

	/*
    Whether a bound channel reached these points, which is what takes them off the merged path.

    The faded treatment merges glyphs into one path per color step, and a path carries one glyph and
    one opacity between them. So a figure binding either channel draws its geoms one element each and
    pays the node count. The treatment's own radius still applies, which is what keeps a dense panel
    from filling in while the channel does its work.
  */
	const perMark = useMemo(() => placed.some((p) => p.point.shape != null || p.point.opacity != null), [placed]);

	/*
    The geom the pointer last landed on, held so a move that lands on it again reports nothing.

    A hand resting inside one geom's snap radius sends a move per frame, and each one used to
    rebuild the readout rows and re-render the chart above them. The answer changes when the geom
    changes, so that is what the guard watches. The quadtree hands back the datum it stored, so
    identity is the comparison, and a rebuilt index carries fresh data that opens the guard again.
  */
	const reported = useRef<Placed | null>(null);

	const report = (event: React.PointerEvent<SVGRectElement>) => {
		if (!index) return;
		const bounds = event.currentTarget.getBoundingClientRect();
		const found = nearest(index, event.clientX - bounds.left, event.clientY - bounds.top);
		if (found === reported.current) return;
		reported.current = found;

		setHovered(found);
		onHover?.(found ? {datum: found.point, index: found.index, at: {x: found.x, y: found.y}} : null);
	};

	const clear = () => {
		if (reported.current === null) return;
		reported.current = null;
		setHovered(null);
		onHover?.(null);
	};

	// The pointer already resolved a geom, so a click reuses that answer instead of looking again.
	const take = () => {
		if (hovered) {
			onSelect?.({datum: hovered.point, index: hovered.index, at: {x: hovered.x, y: hovered.y}});
		}
	};

	return (
		<g data-geom="points">
			{faded && !perMark
				? bands.map((band, step) => {
						const ink = ramp(band.weight ?? 0.72);
						return hollow ? (
							<path
								key={step}
								d={band.d}
								fill="none"
								stroke={ink}
								strokeOpacity={opacity ?? FADED_OPACITY}
								strokeWidth={outlineWidth(radius ?? FADED_R)}
							/>
						) : (
							<path key={step} d={band.d} fill={ink} fillOpacity={opacity ?? FADED_OPACITY} />
						);
					})
				: placed.map((p) => {
						// A point carrying a weight colors by it, which is what a bound color channel sets.
						const fill = ramp(p.point.weight ?? 0.62);
						// A bound size channel resolved this point's radius in `buildLayers`.
						const r = p.point.size ?? radius ?? (faded ? FADED_R : POINT_R);
						/* A bound glyph and a bound opacity resolved the same way, and each falls back to the layer's. */
						const mark = p.point.shape ?? shape;
						const ink = p.point.opacity ?? opacity ?? (faded ? FADED_OPACITY : undefined);
						/*
						  A hollow geom spends its stroke on the outline, and the paper halo it would otherwise
						  draw has nothing left to do: the open center is already what a reader counts through.

						  Filled geoms take the page color, so overlapping points stay countable and the halo
						  reads as space instead of as an outline. Zero width draws none.
						*/
						const paint = hollow
							? {fill: "none", stroke: fill, strokeOpacity: ink ?? 0.85, strokeWidth: outlineWidth(r)}
							: {
									fill,
									fillOpacity: ink ?? 0.85,
									...(haloOn(r, halo) ? {stroke: "var(--viz-paper)", strokeWidth: halo ?? 1} : {}),
								};

						/*
						  Keyed by position in the trace, which is the only thing here that is distinct.

						  `point.key` is the record's name, and `keyField` takes the table's first text column
						  where the caller states none. That column names a record on the readout and carries
						  no promise of being unique: a table of four thousand rows whose first text column is
						  the category gave nine hundred geoms the same key, and React keeps one child per key
						  and drops the rest. The index is unique inside the trace and stable in draw order.
						*/
						return mark === "circle" ? (
							<circle key={p.index} cx={p.x} cy={p.y} r={r} {...paint} />
						) : (
							<path key={p.index} d={glyph(mark, p.x, p.y, r)} {...paint} />
						);
					})}

			{hovered && (
				<circle
					cx={hovered.x}
					cy={hovered.y}
					r={7}
					fill="none"
					stroke="var(--viz-ink)"
					strokeWidth={1.2}
					pointerEvents="none"
				/>
			)}

			{hoverable && (
				<rect
					width={width}
					height={height}
					fill="transparent"
					cursor={onSelect && hovered ? "pointer" : undefined}
					onPointerMove={report}
					onPointerLeave={clear}
					onClick={onSelect ? take : undefined}
				/>
			)}
		</g>
	);
}
