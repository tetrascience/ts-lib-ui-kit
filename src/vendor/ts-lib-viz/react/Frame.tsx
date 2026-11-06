/**
 * The plot frame: scales, dash ticks, and the annotation layer.
 *
 * Encodes the chart-design rules so a geom author cannot get them wrong. Transparent background,
 * no box, no gridlines unless a value has to be read off the chart, ticks as short dashes outside
 * the axis, one axis title inline with the tick labels, axis ends captioned with what more and less
 * mean.
 *
 * Geoms receive scales through a render prop, so a geom holds no layout opinion and any geom can
 * appear inside a facet. An axis is continuous or banded, which is what lets bars, boxes, and
 * spans share the frame with scatter and density.
 *
 * Those rules are the defaults and not the only answer. Rule width, tick length and side, the turn
 * on the labels, the type size and where the title sits come off the axis spec, because a scatter of a
 * quarter of a million geoms and a bar chart of nine categories want different chrome around the same
 * frame. `axisRoom` hands the caller the arithmetic, so a turned label grows the margin that holds it.
 *
 * The arithmetic itself is in `/core`: axis specs, scale building, tick stepping, the room an axis
 * takes and the plot area inside a margin. What is left here is the drawing.
 */

import {Annotation, Connector, EditableAnnotation, Label} from "@visx/annotation";
import {useId, useMemo, type ReactNode, type Ref} from "react";

import {
	buildAxis,
	REGULAR,
	isBand,
	LABEL_GAP,
	longestOf,
	scaleKey,
	sideLayout,
	tickRoom,
	ASCENT,
	TITLE_PAD,
	Y_TITLE_ABOVE,
	type AxisEnd,
	type AxisChrome,
	type AxisSpec,
	type Chrome,
	type FrameChildProps,
	type Metrics,
	type FrameNote,
	type SideChildProps,
	type SidePanel,
	type MovedNote,
} from "../core/internal.js";
import {Figure} from "./Figure.js";

/** Tabular figures, so a column of numbers lines up on the digit. */
const TABULAR: React.CSSProperties = {fontVariantNumeric: "tabular-nums"};

/** The annotation size from the type ramp, as a number the label component asks for. */

/** How wide a note runs before it wraps, so a sentence on the chart stays a couple of lines. */
const ANNOT_WIDTH = 160;

/** The grip on a note that can be moved: a ring in the leader's own ink instead of a library gray. */
const HANDLE = {
	r: 7,
	fill: "transparent",
	stroke: "var(--viz-leader)",
	strokeDasharray: "2 2",
	strokeWidth: 1,
};

/** Tick and title ink. Strong lifts a band axis carrying identity up to the weight of the geoms. */
const inkOf = (chrome: AxisChrome) => (chrome.ink === "strong" ? "var(--viz-ink)" : "var(--viz-ink-muted)");

/**
 * Where a tick, its label and the turn on that label are drawn.
 *
 * Ticks follow the side the author asked for; the labels stay outside the plot area either way, since
 * a number sitting among the geoms is read as one of them.
 */
function tickPlacement(chrome: Chrome, axis: "x" | "y") {
	const inward = chrome.tickSide === "in";
	const sign = (inward ? -1 : 1) * (axis === "x" ? 1 : -1);
	const beyond = inward ? 0 : chrome.tickLength;
	const angle = chrome.tickAngle;

	return {
		tick: sign * chrome.tickLength,
		/** Half a major, so the eye reads which tick carries the number. */
		minor: (sign * chrome.tickLength) / 2,
		/** A flat x label sits on its baseline. A turned one centers on its pivot, like a y label. */
		label: axis === "y" ? -(beyond + LABEL_GAP) : angle ? beyond + LABEL_GAP : beyond + chrome.fontSize + 1,
		dy: axis === "y" || angle ? "0.32em" : undefined,
		/** An x label turned clockwise hangs from its start. */
		anchor: (axis === "x" && angle < 0 ? "start" : angle || axis === "y" ? "end" : "middle") as
			"start" | "end" | "middle",
		turn: (at: number) => (angle ? `rotate(${-angle},${axis === "x" ? `0,${at}` : `${at},0`})` : undefined),
	};
}

/** Where a title sits along its own rule, which is what `titleAlign` names. */
const alongRule = (align: Chrome["titleAlign"], span: number) =>
	align === "start"
		? {at: 0, anchor: "start" as const}
		: align === "center"
			? {at: span / 2, anchor: "middle" as const}
			: {at: span, anchor: "end" as const};

export interface FrameProps {
	width: number;
	height: number;
	x: AxisSpec;
	y: AxisSpec;
	headline?: string;
	subtitle?: string;
	/** The footer line under the figure. */
	caption?: string;
	aside?: ReactNode;
	axisEnds?: AxisEnd[];
	notes?: FrameNote[];
	/** Dotted verticals between categories, so a stacked column reads as its own group. */
	columnRules?: boolean;
	margin?: {top: number; right: number; bottom: number; left: number};
	/**
	 * Holds the geoms and the notes inside the plot area.
	 *
	 * Off by default, since a label above a point and a geom on the baseline both reach past the area
	 * on purpose. A caller that narrowed the domain turns it on, because the geoms left outside it
	 * would otherwise be drawn across the ticks and the panel beside them.
	 */
	clip?: boolean;
	/**
	 * Type and spacing for this panel's size.
	 *
	 * Hand it `frame.metrics`, which is what the frame was built at. The axis type size and tick
	 * length are already resolved onto `x` and `y`, so a mismatch here cannot move a margin; what it
	 * would move is the annotation type and whatever the geoms take off `FrameChildProps`.
	 */
	metrics?: Metrics;
	/**
	 * Panels drawn beside the plot area, each sharing one of its axes.
	 *
	 * Declared here and rendered by `side`, so the frame owns where they sit and the caller owns what
	 * goes in them. The extent comes off the geoms and not off the figure: a side is room the plot
	 * area gives up, which is what keeps a figure that grew for its content the size it grew to.
	 */
	sides?: readonly SidePanel[];
	/** The box the geoms are drawn in, handed out so a caller binds gestures to the chart. */
	surface?: Ref<HTMLDivElement>;
	/** A note dragged to a new anchor, reported in data coordinates. Absent means the notes hold still. */
	onNoteMove?: (moved: MovedNote) => void;
	children: (props: FrameChildProps) => ReactNode;
	/**
	 * HTML drawn over the plot area, for a readout that wants type and a shadow.
	 *
	 * Positioned to the same origin the geoms use, so a caller places a card at the pixel a geom
	 * reported without knowing what the margins are.
	 */
	overlay?: (props: FrameChildProps) => ReactNode;
	/**
	 * What one side panel draws, against the shared scale the geoms use.
	 *
	 * Takes the same props the geoms take, plus the panel it is drawing for, since the box it is
	 * given is already translated to the plot area's own origin along the shared axis.
	 */
	side?: (props: SideChildProps) => ReactNode;
}

export function Frame({
	width,
	height,
	x,
	y,
	headline,
	subtitle,
	caption,
	aside,
	axisEnds = [],
	notes = [],
	columnRules = false,
	margin = {top: 14, right: 14, bottom: 30, left: 44},
	clip = false,
	metrics = REGULAR,
	sides,
	surface,
	onNoteMove,
	children,
	overlay,
	side,
}: FrameProps) {
	const {room, inner, inside, regions} = sideLayout(sides, width, height, margin);

	/*
    X reads left to right and its title has always sat at the high end; Y's sits above its top.

    A vertical value scale runs upward from the origin, and a vertical band runs down from the top.
    The order a band carries is a reading order and not a magnitude: a ranked bar chart puts its
    longest bar at the top, and a clustered grid puts the first leaf of its tree there, which is
    where pheatmap draws it. Inheriting the value scale's inverted range drew both upside down.
  */
	const yRange: [number, number] = isBand(y) ? [0, inner.height] : [inner.height, 0];
	const xa = buildAxis(x, [0, inner.width], metrics.ticks, "end");
	const ya = buildAxis(y, yRange, metrics.ticks, "end");

	const xRoom = tickRoom(xa.chrome, xa.labelTicks, longestOf(xa), "x");
	const yRoom = tickRoom(ya.chrome, ya.labelTicks, longestOf(ya), "y");
	/*
    Where the axis chrome sits, which is not always the edge of the plot area.

    A panel drawn inside the axis labels stands between them and the geoms, so the ticks, their
    numbers and the title all move out past it. Without this the labels drew over the panel: they are
    placed against the plot area's own origin, and an inside panel is the one thing that can be
    between the two.
  */
	const chromeX = -inside.left;
	const chromeY = inner.height + inside.bottom;
	/* Titles sit past the labels, on the far edge of the room the ticks asked for. */
	const xTitleY = chromeY + xRoom + TITLE_PAD / 2 + ASCENT * xa.chrome.fontSize;
	const xTicks = tickPlacement(xa.chrome, "x");
	const yTicks = tickPlacement(ya.chrome, "y");

	/*
    The scales the geoms are handed keep their identity for as long as they answer the same.

    Held apart from `xa` and `ya`, which rebuild freely: a geom reads the scale and the axis reads the
    ticks, so the two want different lifetimes. While the key holds, the function from the render that
    minted it is handed back, and it maps as it did because the key covers what the mapping reads.
  */
	const xKey = scaleKey(x, [0, inner.width]);
	const yKey = scaleKey(y, yRange);
	// eslint-disable-next-line react-hooks/exhaustive-deps -- the key covers what the mapping reads, which is the point
	const xScale = useMemo(() => xa.scale, [xKey]);
	// eslint-disable-next-line react-hooks/exhaustive-deps -- as above
	const yScale = useMemo(() => ya.scale, [yKey]);

	// eslint-disable-next-line react-hooks/exhaustive-deps -- as above
	const xInvert = useMemo(() => xa.invert, [xKey]);
	// eslint-disable-next-line react-hooks/exhaustive-deps -- as above
	const yInvert = useMemo(() => ya.invert, [yKey]);

	const childProps: FrameChildProps = {
		x: xScale,
		y: yScale,
		xInvert,
		yInvert,
		xBand: xa.bandwidth,
		yBand: ya.bandwidth,
		xStep: xa.step,
		yStep: ya.step,
		width: inner.width,
		height: inner.height,
		metrics,
	};

	// Boundaries sit midway between adjacent category centers, plus the two outer edges.
	const rules =
		columnRules && isBand(x)
			? (() => {
					const centers = x.values.map((v) => xa.scale(v));
					const mids = centers.slice(0, -1).map((c, i) => (c + centers[i + 1]!) / 2);
					return [0, ...mids, inner.width];
				})()
			: [];

	/*
    A grid line stands where a tick stands, so the two read one interval.

    Drawn from the axis and not from a frame-wide switch, since a reader takes a value off one scale
    at a time and a chart wanting horizontals rarely wants verticals with them. Both sets read
    `--viz-rule` and separate by weight, which keeps the labeled set legible against the
    subdivisions and leaves a theme flip to the browser.
  */
	const gridFor = (axis: typeof xa | typeof ya, along: "x" | "y") =>
		(["major", "minor"] as const).flatMap((kind) => {
			if (!(kind === "major" ? axis.chrome.grid : axis.chrome.minorGrid)) return [];
			return (kind === "major" ? axis.ticks : axis.minor).map((at) => {
				const p = axis.scale(at);
				return (
					<line
						key={`grid${along}${kind}${at}`}
						data-grid={kind}
						x1={along === "x" ? p : 0}
						x2={along === "x" ? p : inner.width}
						y1={along === "x" ? 0 : p}
						y2={along === "x" ? inner.height : p}
						stroke="var(--viz-rule)"
						strokeOpacity={kind === "major" ? undefined : 0.45}
						strokeDasharray="1 3"
					/>
				);
			});
		});

	const hold = useId();
	const holdIn = clip ? `url(#${hold})` : undefined;

	return (
		<Figure headline={headline} subtitle={subtitle} caption={caption} aside={aside}>
			{/* Positioned inline. A Tailwind build that skips node_modules leaves
			    `relative` with no rule, and the overlay resolves against the page. */}
			<div ref={surface} className="relative" style={{position: "relative", width, height}}>
				<svg data-viz-panel="" width={width} height={height} style={{overflow: "visible"}}>
					{clip && (
						<clipPath id={hold}>
							<rect x={0} y={0} width={inner.width} height={inner.height} />
						</clipPath>
					)}
					{/* A side reads the plot area's scales and clips to its own rectangle wherever the plot area clips. */}
					{side &&
						regions.map((region, at) => (
							<g
								key={`side${at}`}
								data-side={region.panel.content.kind}
								transform={`translate(${region.x},${region.y})`}
								clipPath={clip ? `url(#${hold}side${at})` : undefined}
							>
								{clip && (
									<clipPath id={`${hold}side${at}`}>
										<rect x={0} y={0} width={region.width} height={region.height} />
									</clipPath>
								)}
								{side({...childProps, panel: region.panel, width: region.width, height: region.height})}
							</g>
						))}

					<g transform={`translate(${room.left + margin.left},${room.top + margin.top})`}>
						{rules.map((rx, i) => (
							<line
								key={`r${i}`}
								x1={rx}
								x2={rx}
								y1={0}
								y2={inner.height}
								stroke="var(--viz-rule)"
								strokeOpacity={0.7}
								strokeDasharray="2 4"
							/>
						))}

						{gridFor(xa, "x")}
						{gridFor(ya, "y")}

						<g clipPath={holdIn}>
							{children(childProps)}

							{/*
                Notes last, so a leader crosses the geoms instead of hiding under them.

                The subject is what the note is about and the label is what it says, which is the pair
                the annotation layer is built around. A note with no leader is its own subject. Both
                positions come off the scales, so an anchor written in data coordinates lands where the
                reading is whatever the domain currently shows.
              */}
							{notes.map((note, i) => {
								const nx = xa.scale(note.at.x);
								const ny = ya.scale(note.at.y);
								const at = note.toward ? {x: xa.scale(note.toward.x), y: ya.scale(note.toward.y)} : {x: nx, y: ny};

								const written = (
									<>
										{note.toward && <Connector type="line" stroke="var(--viz-leader)" pathProps={{strokeWidth: 0.9}} />}
										<Label
											title={note.text}
											showBackground={false}
											showAnchorLine={false}
											fontColor="var(--viz-annotation)"
											titleFontSize={metrics.annotation}
											titleFontWeight={400}
											horizontalAnchor={note.align ?? "start"}
											verticalAnchor="end"
											maxWidth={ANNOT_WIDTH}
										/>
									</>
								);

								return onNoteMove ? (
									<EditableAnnotation
										key={`n${i}`}
										x={at.x}
										y={at.y}
										dx={nx - at.x}
										dy={ny - at.y}
										width={inner.width}
										height={inner.height}
										canEditLabel={note.toward != null}
										subjectDragHandleProps={HANDLE}
										labelDragHandleProps={HANDLE}
										onDragEnd={({x: sx, y: sy, dx, dy}) =>
											onNoteMove({
												source: note.source,
												at: {x: xa.invert(sx + dx), y: ya.invert(sy + dy)},
												toward: note.toward ? {x: xa.invert(sx), y: ya.invert(sy)} : undefined,
											})
										}
									>
										{written}
									</EditableAnnotation>
								) : (
									<Annotation key={`n${i}`} x={at.x} y={at.y} dx={nx - at.x} dy={ny - at.y}>
										{written}
									</Annotation>
								);
							})}
						</g>

						{/* The baseline, and a vertical rule where the author asked for one by setting its width.
						    An axis with no ticks measures nothing. */}
						{xa.ticks.length > 0 && (
							<line
								x1={0}
								x2={inner.width}
								y1={inner.height}
								y2={inner.height}
								stroke="var(--viz-rule)"
								strokeWidth={xa.chrome.lineWidth}
							/>
						)}
						{ya.chrome.rule && ya.ticks.length > 0 && (
							<line x1={0} x2={0} y1={0} y2={inner.height} stroke="var(--viz-rule)" strokeWidth={ya.chrome.lineWidth} />
						)}

						{/* Minors first and shorter, so a major reads as the one carrying the number. */}
						{xa.minor.map((t) => (
							<line
								key={`xm${t}`}
								x1={xa.scale(t)}
								x2={xa.scale(t)}
								y1={chromeY}
								y2={chromeY + xTicks.minor}
								stroke="var(--viz-rule)"
								strokeWidth={xa.chrome.lineWidth}
								strokeOpacity={0.6}
							/>
						))}
						{ya.minor.map((t) => (
							<line
								key={`ym${t}`}
								x1={chromeX + yTicks.minor}
								x2={chromeX}
								y1={ya.scale(t)}
								y2={ya.scale(t)}
								stroke="var(--viz-rule)"
								strokeWidth={ya.chrome.lineWidth}
								strokeOpacity={0.6}
							/>
						))}

						{xa.ticks.map((t) => (
							<g key={`x${t}`} transform={`translate(${xa.scale(t)},${chromeY})`}>
								<line y2={xTicks.tick} stroke="var(--viz-rule)" strokeWidth={xa.chrome.lineWidth} />
								{xa.labelTicks && (
									<text
										y={xTicks.label}
										dy={xTicks.dy}
										textAnchor={xTicks.anchor}
										transform={xTicks.turn(xTicks.label)}
										fontSize={xa.chrome.fontSize}
										style={TABULAR}
										fill={inkOf(xa.chrome)}
									>
										{xa.format(t)}
									</text>
								)}
							</g>
						))}
						{ya.ticks.map((t) => (
							<g key={`y${t}`} transform={`translate(${chromeX},${ya.scale(t)})`}>
								<line x2={yTicks.tick} stroke="var(--viz-rule)" strokeWidth={ya.chrome.lineWidth} />
								{ya.labelTicks && (
									<text
										x={yTicks.label}
										dy={yTicks.dy}
										textAnchor={yTicks.anchor}
										transform={yTicks.turn(yTicks.label)}
										fontSize={ya.chrome.fontSize}
										style={TABULAR}
										fill={inkOf(ya.chrome)}
									>
										{ya.format(t)}
									</text>
								)}
							</g>
						))}

						{/* An axis-end caption carries more meaning than a repeated unit, so where both want the
                right end of the baseline the caption wins. */}
						{xa.label &&
							!axisEnds.some(
								(e) =>
									e.axis === "x" &&
									e.end === (xa.chrome.titleAlign === "start" ? "low" : xa.chrome.titleAlign === "end" ? "high" : null),
							) &&
							(() => {
								const {at, anchor} = alongRule(xa.chrome.titleAlign, inner.width);
								return (
									<text x={at} y={xTitleY} textAnchor={anchor} fontSize={xa.chrome.fontSize} fill={inkOf(xa.chrome)}>
										{xa.label}
									</text>
								);
							})()}

						{/*
              The vertical title turns to run along its own rule unless it sits above the top of it.

              Above the axis it reads as a caption on the numbers under it, which is what the frame has
              always drawn and what a short measure name wants. Moved along the rule it has no room to
              stay horizontal, so it turns.
            */}
						{/* A title run down from the top of the rule shares that corner with a high caption. The caption wins. */}
						{ya.label &&
							!(ya.chrome.titleAlign === "start" && axisEnds.some((e) => e.axis === "y" && e.end === "high")) &&
							(ya.chrome.titleAlign === "end" ? (
								<text
									x={chromeX - yRoom}
									y={-Y_TITLE_ABOVE}
									textAnchor="start"
									fontSize={ya.chrome.fontSize}
									fill={inkOf(ya.chrome)}
								>
									{ya.label}
								</text>
							) : (
								(() => {
									const {at, anchor} = alongRule(ya.chrome.titleAlign, inner.height);
									const x = chromeX - (yRoom + TITLE_PAD / 2 + (1 - ASCENT) * ya.chrome.fontSize);
									return (
										<text
											textAnchor={anchor === "start" ? "end" : anchor}
											fontSize={ya.chrome.fontSize}
											fill={inkOf(ya.chrome)}
											transform={`translate(${x},${at}) rotate(-90)`}
										>
											{ya.label}
										</text>
									);
								})()
							))}

						{axisEnds.map((end) => {
							const atLow = end.end === "low";
							if (end.axis === "x") {
								return (
									<text
										key={`ae${end.axis}${end.end}`}
										x={atLow ? 0 : inner.width}
										y={xTitleY}
										textAnchor={atLow ? "start" : "end"}
										fontSize={xa.chrome.fontSize}
										className="font-medium"
										fill="var(--viz-annotation)"
									>
										{end.text}
									</text>
								);
							}
							return (
								<text
									key={`ae${end.axis}${end.end}`}
									x={yTicks.label}
									y={atLow ? inner.height : 10}
									textAnchor="end"
									fontSize={ya.chrome.fontSize}
									className="font-medium"
									fill="var(--viz-annotation)"
								>
									{end.text}
								</text>
							);
						})}
					</g>
				</svg>

				{overlay && (
					<div
						className="pointer-events-none absolute"
						style={{
							position: "absolute",
							pointerEvents: "none",
							left: room.left + margin.left,
							top: room.top + margin.top,
							width: inner.width,
							height: inner.height,
						}}
					>
						{overlay(childProps)}
					</div>
				)}
			</div>
		</Figure>
	);
}
