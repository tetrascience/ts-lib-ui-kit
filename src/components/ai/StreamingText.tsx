import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

export interface StreamingTextProps {
  text: string;
  /** Whether the text is still streaming — shows a blinking caret when true. */
  streaming?: boolean;
  /** Render the text as Markdown. Defaults to true. */
  markdown?: boolean;
  className?: string;
}

/**
 * Renders a streaming text part from the assistant. When `streaming` is true
 * a caret blinks at the end of the text to signal live output.
 */
export function StreamingText({
  text,
  streaming = false,
  markdown = true,
  className,
}: StreamingTextProps) {
  return (
    <div
      data-slot="ai-streaming-text"
      data-streaming={streaming || undefined}
      className={cn(
        "prose prose-sm max-w-none text-body-md text-foreground",
        "prose-p:my-2 prose-pre:my-2 prose-headings:text-foreground",
        "prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:text-[0.9em]",
        "prose-pre:overflow-x-auto prose-pre:rounded-shape-sm prose-pre:bg-muted prose-pre:p-sp-sm prose-pre:text-foreground",
        "prose-a:text-primary prose-a:underline-offset-2 hover:prose-a:underline",
        className,
      )}
    >
      {markdown ? (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
      ) : (
        <p className="whitespace-pre-wrap">{text}</p>
      )}
      {streaming && (
        <span
          aria-hidden
          className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-current align-middle"
        />
      )}
    </div>
  );
}
