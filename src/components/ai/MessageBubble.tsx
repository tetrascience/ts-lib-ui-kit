import { Bot, CircleAlert, User } from "lucide-react";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type MessageRole = "user" | "assistant" | "system" | "error";

export interface MessageBubbleProps {
  messageRole: MessageRole;
  children: ReactNode;
  className?: string;
}

function RoleAvatar({ messageRole }: { messageRole: MessageRole }) {
  if (messageRole === "user") {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-shape-full bg-primary text-primary-foreground">
        <User className="size-3.5" aria-hidden />
      </div>
    );
  }
  if (messageRole === "error") {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-shape-full bg-destructive/10 text-destructive">
        <CircleAlert className="size-3.5" aria-hidden />
      </div>
    );
  }
  return (
    <div className="flex size-7 shrink-0 items-center justify-center rounded-shape-full bg-surface-container-high text-surface-foreground">
      <Bot className="size-3.5" aria-hidden />
    </div>
  );
}

/**
 * A single chat turn. User turns align right with the primary color;
 * assistant and error turns align left.
 */
export function MessageBubble({ messageRole, children, className }: MessageBubbleProps) {
  const isUser = messageRole === "user";
  return (
    <div
      data-slot="ai-message"
      data-role={messageRole}
      className={cn(
        "flex gap-sp-xs",
        isUser ? "flex-row-reverse" : "flex-row",
        className,
      )}
    >
      <RoleAvatar messageRole={messageRole} />
      <div
        className={cn(
          "flex min-w-0 max-w-[85%] flex-col gap-sp-xs rounded-shape-md px-sp-sm py-sp-xs",
          isUser && "bg-primary text-primary-foreground",
          messageRole === "assistant" && "bg-surface-container text-surface-foreground",
          messageRole === "system" && "bg-muted text-muted-foreground italic",
          messageRole === "error" &&
            "border border-destructive/30 bg-destructive/5 text-destructive",
        )}
      >
        {children}
      </div>
    </div>
  );
}
