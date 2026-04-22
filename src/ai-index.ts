// Barrel for AI agent UI primitives. Re-exported from the main entry; use
// this file directly when you only need the AI components without pulling in
// the rest of the library surface.

export * from "@/components/ai";
export * from "@/components/composed/AIAgent";
export { useChat } from "@/hooks/useChat";
export type { UseChatOptions, UseChatReturn } from "@/hooks/useChat";
