/**
 * Parallel coordinates: one line per record, across a rule per measure.
 *
 * The trade-off view. Four measures held at once is the question, and a shared pair of axes cannot
 * express it, so this geom takes the panel whole and draws its own rules in each measure's own units.
 * `GRAMMAR` answers `false` for the kind's axial coordinate, which is what stops the frame drawing a
 * horizontal rule under it.
 *
 * A range dragged on a rule is the tool that turns the picture into an answer, per the ADR "A range
 * on an axis filters the parallel plot". The arithmetic is `/core`'s: `axisLayout` puts the rules
 * down, `valueOn` reads a drag back into the measure's units, and the caller narrows the build with
 * what comes out. The geom holds no ranges of its own, since the figure states what was kept and one
 * of the two would otherwise be reporting a filter the other did not apply.
 *
 * Hover searches the lines and not the pixels. A polyline a pixel wide is not something a hand
 * points at, so `nearestLine` answers with whichever record runs closest.
 */

import {useMemo, useRef, useState} from "react";

import {
	axisLayout,
	boundsOf,
	extentOf,
	nearestLine,
	placeOn,
	setRange,
	valueOn,
	textRun,
	type AxisRanges,
	type GeomHit,
	type ParallelAxis,
	type ParallelLine,
} from "../../core/internal.js";
import type {ValueRamp} from "../../core/internal.js";

/** Room for the measure's name above each rule and its low value below. */
const INSET = {x: 46, top: 26, bottom: 26};

/** Type size of a rule's title, and the line pitch a wrapped title takes. */
const TITLE_SIZE = 11;
const TITLE_LINE = 13;

/** Clear space kept between two neighboring titles, and between an end title and the panel edge. */
const TITLE_GAP = 8;

/** A rule's title as lines. A title wider than its room puts the unit on a second line. */
function titleLines(label: string, room: number): string[] {
	if (textRun(label.length, TITLE_SIZE) <= room) return [label];
	const at = label.lastIndexOf(" (");
	return at > 0 ? [label.slice(0, at), label.slice(at + 1)] : [label];
}

/** The widest line of a title, in pixels. */
const widest = (lines: readonly string[]): number =>
	Math.max(0, boundsOf(lines.map((line) => textRun(line.length, TITLE_SIZE)))[1]);

/** The inset once the titles are placed: the end titles fit the panel and a wrapped title gets its line. A quarter of the panel caps each side. */
function insetFor(titles: readonly string[][], width: number): typeof INSET {
	const ends = [titles[0] ?? [], titles[titles.length - 1] ?? []].map((lines) => widest(lines) / 2 + TITLE_GAP);
	const tall = titles.some((lines) => lines.length > 1);
	const x = Math.min(Math.max(INSET.x, boundsOf(ends)[1]), Math.max(INSET.x, width / 4));
	return {x, top: INSET.top + (tall ? TITLE_LINE : 0), bottom: INSET.bottom};
}

/** How wide the grab strip on a rule runs, so a range is draggable without covering the lines. */
const GRIP = 14;

/** Pixels a pointer may miss a line by and still be pointing at it. */
const REACH = 6;

export interface ParallelProps {
	axes: ParallelAxis[];
	lines: ParallelLine[];
	width: number;
	height: number;
	/** Maps a line's weight to a color. Lines with no weight take `color`. */
	ramp: ValueRamp;
	color: string;
	/** Opacity of a line at rest. Absent is 0.7. */
	opacity?: number;
	/** The ranges in force. The caller holds them, since the caller is what narrows the build. */
	ranges?: AxisRanges;
	onRanges?: (next: AxisRanges) => void;
	format?: (value: number) => string;
	/** The record whose line runs nearest the pointer, placed where the line passes it. */
	onHover?: (hit: GeomHit<ParallelLine> | null) => void;
	onSelect?: (hit: GeomHit<ParallelLine>) => void;
}

const asText = (value: number) => value.toLocaleString(undefined, {maximumSignificantDigits: 3});

export function Parallel({
	axes,
	lines,
	width,
	height,
	ramp,
	color,
	opacity = 0.7,
	ranges = {},
	onRanges,
	format = asText,
	onHover,
	onSelect,
}: ParallelProps) {
	/* Wrapped twice. The second pass reads the room between the rules the first pass's inset leaves. */
	const titles = useMemo(() => {
		const wrap = (inset: number) => {
			const room = axes.length > 1 ? (width - 2 * inset) / (axes.length - 1) - TITLE_GAP : width;
			return axes.map((axis) => titleLines(axis.label, room));
		};
		return wrap(insetFor(wrap(INSET.x), width).x);
	}, [axes, width]);
	const layout = useMemo(() => axisLayout(axes, width, height, insetFor(titles, width)), [axes, width, height, titles]);

	/* The rule under the hand and where the drag began, in that rule's own units. */
	const dragging = useRef<{axis: string; index: number; from: number} | null>(null);
	const [drag, setDrag] = useState<{axis: string; extent: [number, number]} | null>(null);
	const [hovered, setHovered] = useState<GeomHit<ParallelLine> | null>(null);

	const paths = useMemo(
		() =>
			lines.map((line) => {
				let path = "";
				for (let at = 0; at < layout.at.length; at += 1) {
					const value = line.values[at];
					if (value == null) break;
					path += `${path ? "L" : "M"}${layout.at[at]!.toFixed(2)},${placeOn(value, layout.spans[at]!).toFixed(2)}`;
				}
				return {path, color: line.weight == null ? color : ramp(line.weight)};
			}),
		[lines, layout, ramp, color],
	);

	const report = (event: React.PointerEvent<SVGRectElement>) => {
		const box = event.currentTarget.getBoundingClientRect();
		const found = nearestLine(lines, layout, event.clientX - box.left, event.clientY - box.top, REACH);
		const hit = found && {datum: found.line, index: found.index, at: found.at};
		setHovered(hit);
		onHover?.(hit);
	};

	const clear = () => {
		setHovered(null);
		onHover?.(null);
	};

	/* The whole hit, kept from the hover. A click reports the position the pointer found. */
	const take = () => {
		if (hovered) onSelect?.(hovered);
	};

	const startDrag = (axis: ParallelAxis, index: number) => (event: React.PointerEvent<SVGRectElement>) => {
		if (!onRanges) return;
		event.currentTarget.setPointerCapture?.(event.pointerId);
		const box = event.currentTarget.getBoundingClientRect();
		const value = valueOn(event.clientY - box.top + layout.spans[index]!.top, layout.spans[index]!);
		dragging.current = {axis: axis.id, index, from: value};
		setDrag({axis: axis.id, extent: [value, value]});
	};

	const moveDrag = (event: React.PointerEvent<SVGRectElement>) => {
		const held = dragging.current;
		if (!held) return;
		const box = event.currentTarget.getBoundingClientRect();
		const span = layout.spans[held.index]!;
		setDrag({axis: held.axis, extent: extentOf(held.from, valueOn(event.clientY - box.top + span.top, span))});
	};

	/* A press that went nowhere lifts the range, which is how a reader takes a filter back off. */
	const endDrag = () => {
		const held = dragging.current;
		const at = drag;
		dragging.current = null;
		setDrag(null);
		if (!held || !at || !onRanges) return;
		const [lo, hi] = at.extent;
		const span = layout.spans[held.index]!;
		const moved = ((hi - lo) / (span.hi - span.lo || 1)) * (span.bottom - span.top) >= 2;
		onRanges(setRange(ranges, held.axis, moved ? at.extent : null));
	};

	if (axes.length < 2) return null;

	return (
		<g>
			{axes.map((axis, index) => {
				const span = layout.spans[index]!;
				const at = layout.at[index]!;
				const shown = drag?.axis === axis.id ? drag.extent : ranges[axis.id];
				return (
					<g key={axis.id}>
						<line x1={at} x2={at} y1={span.top} y2={span.bottom} stroke="var(--viz-rule)" strokeWidth={1} />
						<text x={at} y={span.top - 10} fontSize={TITLE_SIZE} textAnchor="middle" fill="var(--viz-ink)">
							{titles[index]!.map((line, row, all) => (
								<tspan key={line} x={at} dy={row === 0 ? -(all.length - 1) * TITLE_LINE : TITLE_LINE}>
									{line}
								</tspan>
							))}
						</text>
						<text x={at} y={span.top - 1} fontSize={9} textAnchor="middle" fill="var(--viz-ink-muted)">
							{format(axis.hi)}
						</text>
						<text x={at} y={span.bottom + 12} fontSize={9} textAnchor="middle" fill="var(--viz-ink-muted)">
							{format(axis.lo)}
						</text>

						{shown && (
							<rect
								x={at - GRIP / 2}
								y={placeOn(shown[1], span)}
								width={GRIP}
								height={Math.max(1, placeOn(shown[0], span) - placeOn(shown[1], span))}
								fill="var(--viz-ink)"
								fillOpacity={0.16}
								stroke="var(--viz-ink)"
								strokeOpacity={0.4}
							/>
						)}
					</g>
				);
			})}

			{paths.map((line, index) => (
				<path
					key={index}
					d={line.path}
					fill="none"
					stroke={line.color}
					strokeWidth={hovered?.index === index ? 2 : 1}
					strokeOpacity={hovered == null || hovered.index === index ? opacity : 0.25}
				/>
			))}

			{/* One capture surface, since the search is arithmetic and the lines need no hit paths of their own. */}
			{(onHover || onSelect) && (
				<rect
					width={width}
					height={height}
					fill="transparent"
					cursor={onSelect && hovered != null ? "pointer" : undefined}
					onPointerMove={report}
					onPointerLeave={clear}
					onClick={onSelect ? take : undefined}
				/>
			)}

			{/*
        The grips paint last so they take the drag off the capture surface below them. A rectangle
        drawn under it would catch nothing, which is the fault the cube's gesture had.
      */}
			{onRanges &&
				axes.map((axis, index) => {
					const span = layout.spans[index]!;
					return (
						<rect
							key={axis.id}
							x={layout.at[index]! - GRIP / 2}
							y={span.top}
							width={GRIP}
							height={Math.max(0, span.bottom - span.top)}
							fill="transparent"
							cursor="ns-resize"
							onPointerDown={startDrag(axis, index)}
							onPointerMove={moveDrag}
							onPointerUp={endDrag}
							onPointerCancel={endDrag}
						/>
					);
				})}
		</g>
	);
}
