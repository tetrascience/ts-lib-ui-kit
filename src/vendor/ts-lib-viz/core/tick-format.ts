/**
 * How an axis prints its numbers.
 *
 * `auto` is the house shortener and reads well across magnitudes -- 1.2k for 1200. The other
 * three take a decimal count. Built on `d3-format`.
 */

import {format as d3format} from "d3-format";

import type {TickFormat} from "./spec.js";

export const TICK_FORMATS: {id: TickFormat; label: string}[] = [
	{id: "auto", label: "auto"},
	{id: "fixed", label: "0.00"},
	{id: "scientific", label: "1e0"},
	{id: "percent", label: "%"},
];

/** The house shortener. Enough precision to tell values apart and short enough to sit under a tick. */
export function compact(value: number): string {
	const abs = Math.abs(value);
	if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(abs % 1_000_000 === 0 ? 0 : 1)}M`;
	if (abs >= 1_000) return `${(value / 1_000).toFixed(abs % 1_000 === 0 ? 0 : 1)}k`;
	if (abs >= 10) return value.toFixed(0);
	if (abs >= 1) return value.toFixed(1);
	return value.toPrecision(2);
}

/**
 * Decimals a number needs to print as itself, capped at six.
 *
 * Read off the number's own representation. A quarter step occupies two decimals.
 */
function decimalsFor(value: number): number {
	const size = Math.abs(value);
	if (!Number.isFinite(size) || size === 0) return 0;
	for (let places = 0; places < 6; places += 1) {
		if (Math.abs(Number(value.toFixed(places)) - value) < size * 1e-9) return places;
	}
	return 6;
}

/**
 * Decimals enough to tell one axis's ticks apart.
 *
 * Takes the decimals the smallest gap occupies. A tick needing more gets them. Above a thousand
 * it defers to `compact`.
 */
export function compactFor(ticks: readonly number[]): (value: number) => string {
	let gap = Infinity;
	for (let i = 1; i < ticks.length; i += 1) {
		const step = Math.abs(ticks[i]! - ticks[i - 1]!);
		if (step > 0 && step < gap) gap = step;
	}
	if (!Number.isFinite(gap)) return compact;
	if (ticks.some((tick) => Math.abs(tick) >= 1_000)) return compact;

	const shortened = ticks.map(compact);
	/* A label with no point has zero decimals. */
	const decimals = shortened.map((label) => {
		const point = label.indexOf(".");
		return point < 0 ? 0 : label.length - point - 1;
	});
	const separated = new Set(shortened).size === shortened.length;
	const even = new Set(decimals).size <= 1;
	if (separated && even) return compact;

	let wanted = decimalsFor(gap);
	for (const tick of ticks) wanted = Math.max(wanted, decimalsFor(tick));
	return d3format(`,.${Math.min(6, wanted)}f`);
}

export function tickFormatter(kind: TickFormat = "auto", decimals = 2): (value: number) => string {
	const places = Math.max(0, Math.min(10, Math.trunc(decimals)));
	switch (kind) {
		case "fixed":
			return d3format(`,.${places}f`);
		case "scientific":
			return d3format(`.${places}e`);
		case "percent":
			// A fraction. 0.42 prints as 42%. A column already in points would double-count.
			return d3format(`.${places}%`);
		default:
			return compact;
	}
}
