/**
 * The reference geoms: a line across the plot area per row, labeled where it ends.
 *
 * Rule 4 ink unless the layer maps or states a color.
 */

import {
	dashArray,
	ruleSegment,
	textRun,
	type Linetype,
	type RuleAxis,
	type RuleLine,
	type Scale,
} from "../../core/internal.js";

export interface RuleProps {
	rules: readonly RuleLine[];
	x: Scale;
	y: Scale;
	/** The data's two axes, zoom included, in the data's own roles. A band axis is null. */
	xAxis: RuleAxis | null;
	yAxis: RuleAxis | null;
	/** A band axis's categories in the data's roles. A value naming none of them draws nothing. */
	xBand?: readonly string[] | undefined;
	yBand?: readonly string[] | undefined;
	width: number;
	height: number;
	/** Whether the frame drew its pair with the roles swapped. A horizontal line then stands upright. */
	transposed?: boolean;
	/** Ink the layer maps or states. Absent draws rule 4's foreground at low opacity. */
	color?: string;
	dash?: Linetype;
	lineWidth?: number;
	/** Opacity of the line. Absent is 0.9 on a stated color and rule 4's 0.55 on the foreground. */
	opacity?: number;
	fontSize?: number;
}

/** Rule 4's pattern, where the layer names none. */
const RULE_DASH = "3 3";

export function Rule({
	rules,
	x,
	y,
	xAxis,
	yAxis,
	xBand,
	yBand,
	width,
	height,
	transposed = false,
	color,
	dash,
	lineWidth = 1,
	opacity,
	fontSize = 11,
}: RuleProps) {
	/* A position in the data's roles, put on screen. A transpose swaps the pair. */
	const at = (dataX: number, dataY: number): [number, number] =>
		transposed ? [x(dataY), y(dataX)] : [x(dataX), y(dataY)];

	/* Upright labels, a row of horizontal spans per line of text. A label takes the first row it fits. */
	const rows: [number, number][][] = [];
	const rowFor = (from: number, to: number): number => {
		let row = rows.findIndex((spans) => spans.every(([start, end]) => to < start || from > end));
		if (row < 0) row = rows.push([]) - 1;
		rows[row]!.push([from, to]);
		return row;
	};

	return (
		<g pointerEvents="none" data-geom="rule">
			{rules.map((rule, index) => {
				const segment = ruleSegment(rule, xAxis, yAxis);
				if (!segment) return null;
				if ("x" in segment && xBand && !xBand.includes(String(segment.x))) return null;
				if ("y" in segment && yBand && !yBand.includes(String(segment.y))) return null;

				let ends: [number, number, number, number];
				if ("x0" in segment) {
					ends = [...at(segment.x0, segment.y0), ...at(segment.x1, segment.y1)];
				} else if ("y" in segment) {
					ends = transposed ? [x(segment.y), height, x(segment.y), 0] : [0, y(segment.y), width, y(segment.y)];
				} else {
					ends = transposed ? [0, y(segment.x), width, y(segment.x)] : [x(segment.x), height, x(segment.x), 0];
				}
				/* The label at the right-hand end, inside the plot area. */
				const [ax, ay, bx, by] = ends;
				const [ex, ey] = bx >= ax ? [bx, by] : [ax, ay];
				const upright = ax === bx;
				const low = ey < fontSize + 4;
				/* An upright label that would cross the right edge turns to the left of its line. */
				const run = textRun(rule.label?.length ?? 0, fontSize);
				const leftward = upright && ex + 4 + run > width;
				const row =
					upright && rule.label ? (leftward ? rowFor(ex - 4 - run, ex - 4) : rowFor(ex + 4, ex + 4 + run)) : 0;

				return (
					<g key={`${rule.kind}${index}`}>
						<line
							x1={ax}
							y1={ay}
							x2={bx}
							y2={by}
							stroke={color ?? "var(--viz-ink)"}
							strokeOpacity={opacity ?? (color ? 0.9 : 0.55)}
							strokeWidth={lineWidth}
							strokeDasharray={dash ? dashArray(dash) : RULE_DASH}
						/>
						{rule.label && (
							<text
								x={upright && !leftward ? ex + 4 : ex - 4}
								y={upright ? fontSize + row * (fontSize + 2) : low ? ey + fontSize + 2 : ey - 4}
								textAnchor={upright && !leftward ? "start" : "end"}
								fontSize={fontSize}
								fill="var(--viz-annotation)"
							>
								{rule.label}
							</text>
						)}
					</g>
				);
			})}
		</g>
	);
}
