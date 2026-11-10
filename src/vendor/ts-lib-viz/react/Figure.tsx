/**
 * Figure chrome: headline, subtitle, caption.
 *
 * Held apart from the axis frame because a sankey, a span track, and a treemap want the same
 * chrome and no axes. The headline is a sentence stating the claim instead of a restatement of
 * the axis labels, and the caption carries provenance plus any geom substitution, so a reader
 * who thinks they are looking at individual records is corrected in place.
 */

import type {ReactNode} from "react";

/** The 6px rhythm the kit prebuilt sheet does not carry. */
const GAP_1_5: React.CSSProperties = {gap: 6};

export interface FigureProps {
	headline?: string;
	subtitle?: string;
	/** The footer line: provenance, and what the figure admits. */
	caption?: string;
	/** A control on the footer line, for what the note can state but not hold. */
	aside?: ReactNode;
	children: ReactNode;
}

export function Figure({headline, subtitle, caption, aside, children}: FigureProps) {
	return (
		<figure className="m-0 flex flex-col gap-1">
			{headline && <figcaption className="text-xl font-semibold">{headline}</figcaption>}
			{subtitle && <span className="text-sm text-muted-foreground">{subtitle}</span>}
			{children}
			{(caption || aside) && (
				<div className="flex min-w-0 items-center" style={GAP_1_5}>
					{caption && <span className="text-2xs min-w-0 text-muted-foreground">{caption}</span>}
					{aside}
				</div>
			)}
		</figure>
	);
}
