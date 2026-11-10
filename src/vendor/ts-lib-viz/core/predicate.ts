/**
 * Typed predicates.
 *
 * A filter is data. The same filter runs in a SQL compiler, a vectorized pass over columnar
 * batches, and a toolbar chip. Chip copy stays with the app.
 */

export type Predicate =
	| {kind: "text"; fields: string[]; needle: string}
	| {kind: "range"; field: string; lo: number | null; hi: number | null}
	| {kind: "in"; field: string; values: string[]}
	| {kind: "eq"; field: string; value: string | number; negate?: boolean}
	| {kind: "regex"; field: string; pattern: string; caseInsensitive?: boolean}
	| {kind: "null"; field: string; negate?: boolean}
	| {kind: "time"; field: string; from: number | null; to: number | null}
	| {kind: "and"; of: Predicate[]}
	| {kind: "or"; of: Predicate[]}
	| {kind: "not"; of: Predicate};

/** Leaf predicates. A chip row lists what is in force without walking the tree twice. */
export function leaves(predicates: Predicate[]): Predicate[] {
	const out: Predicate[] = [];
	const walk = (p: Predicate) => {
		if (p.kind === "and" || p.kind === "or") p.of.forEach(walk);
		else if (p.kind === "not") walk(p.of);
		else out.push(p);
	};
	predicates.forEach(walk);
	return out;
}
