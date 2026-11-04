/**
 * A field read through its depth, as a shell or as a whole.
 *
 * `isosurface` draws where the field holds one value, which is the shape a threshold picks out of a
 * cloud. `volume` integrates along the ray, which shows the field's own falloff instead of one
 * level of it. Both are the honest 3D case the design language already allowed, and both need the
 * camera the amendment added: a still projection of a translucent field is a picture nobody can
 * read the depth of.
 *
 * The level a shell stands at is a reading, so it is stated in the figure instead of left to a
 * default nobody sees. See the ADR "A third position scale is permitted where the reader can
 * rotate".
 */

import {useMemo} from "react";

import {rgbOf, type Field3d, type LayerStyle, type Rgb, type ThemeSnapshot} from "../../core/internal.js";
import {GlVolume} from "../gl/GlVolume.js";
import {CubeStage} from "./cube-stage.js";
import type {UnitRamp} from "../../core/internal.js";

export interface VolumeProps {
	field: Field3d;
	width: number;
	height: number;
	/** The magnitude map over nought to one, in the CSS the rest of the chart is drawn in. */
	ramp: UnitRamp;
	labels: {x: string; y: string; z: string};
	format?: (value: number) => string;
	/** Which back faces of the box take a pane. */
	panes?: LayerStyle["panes"];
	/** The live token values where the chart sits, for the GL path's colors. */
	theme?: ThemeSnapshot | null;
	/** Set for the shell, clear for the integrated read. */
	iso: boolean;
	/** Where the shell stands, over nought to one. Absent puts it at the middle of the range. */
	isoLevel?: number;
}

const MUTED: Rgb = [0.55, 0.55, 0.58];

export function Volume({field, width, height, ramp, labels, format, panes, theme, iso, isoLevel = 0.5}: VolumeProps) {
	const domains = useMemo(
		() => ({x: field.xDomain, y: field.yDomain, z: field.zDomain}),
		[field.xDomain, field.yDomain, field.zDomain],
	);

	const center = useMemo(
		(): [number, number, number] => [
			(field.xDomain[0] + field.xDomain[1]) / 2,
			(field.yDomain[0] + field.yDomain[1]) / 2,
			(field.zDomain[0] + field.zDomain[1]) / 2,
		],
		[field.xDomain, field.yDomain, field.zDomain],
	);

	const glRamp = useMemo(() => {
		const cache = new Map<number, Rgb>();
		return (t: number): Rgb => {
			const step = Math.round(t * 64) / 64;
			const held = cache.get(step);
			if (held) return held;
			const rgb = rgbOf(ramp(step)) ?? MUTED;
			cache.set(step, rgb);
			return rgb;
		};
	}, [ramp]);

	return (
		<CubeStage
			domains={domains}
			center={center}
			width={width}
			height={height}
			labels={labels}
			format={format}
			panes={panes}
			theme={theme}
		>
			{({orbit}) => (
				<GlVolume
					field={field}
					orbit={orbit}
					width={width}
					height={height}
					ramp={glRamp}
					iso={iso}
					isoLevel={isoLevel}
				/>
			)}
		</CubeStage>
	);
}
