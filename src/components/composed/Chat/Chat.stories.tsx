import { BrainIcon, ChevronDownIcon, CopyIcon, RefreshCcwIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { expect, fn, userEvent, waitFor, within } from "storybook/test"

import { Chat } from "./Chat"

import type { ChatMessage, ChatProps } from "./Chat"
import type { AttachmentData } from "@/components/ai/attachments"
import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  Attachment,
  AttachmentInfo,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from "@/components/ai/attachments"
import {
  Confirmation,
  ConfirmationAccepted,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationCode,
  ConfirmationRejected,
  ConfirmationRequest,
  ConfirmationShortcut,
  ConfirmationTitle,
} from "@/components/ai/confirmation"
import {
  Context,
  ContextContent,
  ContextContentBody,
  ContextContentFooter,
  ContextContentHeader,
  ContextInputUsage,
  ContextOutputUsage,
  ContextReasoningUsage,
  ContextTrigger,
} from "@/components/ai/context"
import { Conversation, ConversationContent } from "@/components/ai/conversation"
import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardBody,
  InlineCitationCardTrigger,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselItem,
  InlineCitationCarouselNext,
  InlineCitationCarouselPrev,
  InlineCitationQuote,
  InlineCitationSource,
  InlineCitationText,
} from "@/components/ai/inline-citation"
import { Message, MessageAction, MessageActions, MessageContent, MessageResponse } from "@/components/ai/message"
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
  type PromptInputMessage,
} from "@/components/ai/prompt-input"
import {
  Queue,
  QueueItem,
  QueueItemContent,
  QueueItemIndicator,
  QueueList,
  type QueueItemStatus,
} from "@/components/ai/queue"
import { Reasoning, ReasoningContent, ReasoningTrigger, useReasoning } from "@/components/ai/reasoning"
import { Shimmer, TS_SHIMMER_GRADIENT } from "@/components/ai/shimmer"
import { Source, Sources, SourcesContent, SourcesTrigger } from "@/components/ai/sources"
import { StreamStatus } from "@/components/ai/stream-status"
import { Task, TaskContent, TaskItem, TaskItemFile, TaskTrigger } from "@/components/ai/task"
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "@/components/ai/tool"
import { cn } from "@/lib/utils"

const meta: Meta<typeof Chat> = {
  title: "AI Elements/Chat",
  component: Chat,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<typeof Chat>

// ---------------------------------------------------------------------------
// Shared mock data
// ---------------------------------------------------------------------------

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    role: "user",
    content: "How does photosynthesis work?",
  },
  {
    id: "2",
    role: "assistant",
    reasoning:
      "The user is asking about a fundamental biology concept. I should explain it in plain language with a clear structure.",
    sources: [
      {
        href: "https://en.wikipedia.org/wiki/Photosynthesis",
        title: "Photosynthesis — Wikipedia",
      },
      {
        href: "https://www.khanacademy.org/science/photosynthesis",
        title: "Photosynthesis — Khan Academy",
      },
    ],
    content: `Photosynthesis is the process plants use to convert sunlight into food.

Here's the simple version:
1. **Light absorbed** — Chlorophyll in leaves captures sunlight
2. **Water split** — Water from roots is broken apart
3. **CO₂ fixed** — Carbon dioxide from air is combined with hydrogen
4. **Sugar made** — Glucose is produced as stored energy
5. **Oxygen released** — As a byproduct, oxygen is released into the air

The overall equation: **6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂**`,
  },
  {
    id: "3",
    role: "user",
    content: "What is chlorophyll exactly?",
  },
  {
    id: "4",
    role: "assistant",
    branches: [
      "Chlorophyll is a green pigment found in plant cells, specifically inside organelles called **chloroplasts**. It absorbs light most efficiently in the red and blue wavelengths, reflecting green light — which is why plants appear green.",
      "Chlorophyll is a photosynthetic pigment. The word comes from Greek: *khloros* (green) + *phyllon* (leaf). There are several types; chlorophyll‑a is the primary pigment in most plants.",
    ],
    content:
      "Chlorophyll is a green pigment found in plant cells, specifically inside organelles called **chloroplasts**. It absorbs light most efficiently in the red and blue wavelengths, reflecting green light — which is why plants appear green.",
  },
]

const MOCK_MODELS = [
  { id: "claude-sonnet-4-6", name: "Claude Sonnet" },
  { id: "claude-opus-4-7", name: "Claude Opus" },
  { id: "gpt-4o", name: "GPT-4o" },
]

const MOCK_SUGGESTIONS = [
  "Explain quantum entanglement",
  "Write a haiku about the ocean",
  "What is the Turing test?",
  "Summarise the French Revolution",
]

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const Empty: Story = {
  args: {
    models: MOCK_MODELS,
    suggestions: MOCK_SUGGESTIONS,
  },
  render: (args) => (
    <div className="h-screen w-full">
      <Chat {...args} />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Empty state renders with suggestions", async () => {
      await expect(canvas.getByText("Start a conversation")).toBeInTheDocument()
      await expect(canvas.getByText("Explain quantum entanglement")).toBeInTheDocument()
    })
    await step("Clicking a suggestion fills the textarea", async () => {
      await userEvent.click(canvas.getByText("Explain quantum entanglement"))
      await expect(canvas.getByPlaceholderText("Ask anything...")).toHaveValue("Explain quantum entanglement")
    })
  },
}

export const WithMessages: Story = {
  args: {
    initialMessages: MOCK_MESSAGES,
    models: MOCK_MODELS,
    suggestions: MOCK_SUGGESTIONS,
  },
  render: (args) => (
    <div className="h-screen w-full">
      <Chat {...args} />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("User and assistant messages render", async () => {
      await expect(canvas.getByText(/How does photosynthesis/)).toBeInTheDocument()
      await expect(canvas.getByText(/Photosynthesis is the process/)).toBeInTheDocument()
    })
    await step("Branch navigation is visible for multi-branch message", async () => {
      await expect(canvas.getByText(/1 of 2/)).toBeInTheDocument()
    })
    await step("Sources panel renders", async () => {
      await expect(canvas.getByText(/Used 2 sources/i)).toBeInTheDocument()
    })
  },
}

export const SingleModel: Story = {
  args: {
    initialMessages: MOCK_MESSAGES,
    models: [{ id: "claude-sonnet-4-6", name: "Claude Sonnet" }],
  },
  render: (args) => (
    <div className="h-screen w-full">
      <Chat {...args} />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Model selector hidden with single model", async () => {
      await expect(canvas.queryByRole("combobox")).not.toBeInTheDocument()
    })
  },
}

export const SubmitAndStreamLifecycle: Story = {
  args: {
    models: MOCK_MODELS,
    defaultModel: "gpt-4o",
    suggestions: [],
    onSend: fn(async (message: string, model: string) => {
      await new Promise((resolve) => setTimeout(resolve, 50))
      return `Assistant heard "${message}" using ${model}.`
    }),
  },
  render: (args) => (
    <div className="h-screen w-full">
      <Chat {...args} onSend={args.onSend as ChatProps["onSend"]} />
    </div>
  ),
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Submitting prompt calls onSend with selected model", async () => {
      await userEvent.type(canvas.getByPlaceholderText("Ask anything..."), "Trace streamStart")
      await userEvent.click(canvas.getByRole("button", { name: "Submit" }))
      await waitFor(() => expect(args.onSend).toHaveBeenCalledWith("Trace streamStart", "gpt-4o"))
    })

    await step("streamStart renders status while reply is pending", async () => {
      await expect(canvas.getByText("Trace streamStart")).toBeInTheDocument()
      await expect(canvas.getByText(/^\d+s$/)).toBeInTheDocument()
    })

    await step("Assistant reply renders and streamStart clears after linger", async () => {
      await expect(await canvas.findByText('Assistant heard "Trace streamStart" using gpt-4o.')).toBeInTheDocument()
      await waitFor(() => expect(canvas.queryByText(/^\d+s$/)).not.toBeInTheDocument(), {
        timeout: 3600,
      })
    })
  },
}

// ---------------------------------------------------------------------------
// Advanced composition helpers
// ---------------------------------------------------------------------------

const TsBrainGradientDef = () => (
  <svg aria-hidden height={0} style={{ position: "absolute" }} width={0}>
    <defs>
      <linearGradient id="ts-chat-brain-gradient" x1="0%" x2="100%" y1="0%" y2="0%">
        <stop offset="0%" stopColor="#549DFF" />
        <stop offset="50%" stopColor="#8243BA" />
        <stop offset="100%" stopColor="#9665F4" />
      </linearGradient>
    </defs>
  </svg>
)

const GradientReasoningTrigger = () => {
  const { isStreaming, isOpen, duration } = useReasoning()
  return (
    <>
      <TsBrainGradientDef />
      <BrainIcon className="size-4" stroke={isStreaming ? "url(#ts-chat-brain-gradient)" : "currentColor"} />
      {isStreaming ? (
        <Shimmer duration={1.5} gradient={TS_SHIMMER_GRADIENT}>
          Thinking...
        </Shimmer>
      ) : (
        <span>Thought for {duration ?? "a few"} seconds</span>
      )}
      <ChevronDownIcon
        className={cn(
          "size-4 opacity-0 transition-all group-focus-visible:opacity-100 group-hover:opacity-100",
          isOpen ? "rotate-180 opacity-100" : "rotate-0",
        )}
      />
    </>
  )
}

const INTERACTIVE_MODELS = [
  { id: "claude-sonnet-4-6", name: "Sonnet 4.6" },
  { id: "claude-opus-4-7", name: "Opus 4.7" },
  { id: "claude-haiku-4-5", name: "Haiku 4.5" },
  { id: "gpt-4o", name: "GPT-4o" },
]

/** Inline attachment chips rendered in the PromptInputHeader after files are picked. */
const AttachmentsHeader = () => {
  const { files, remove } = usePromptInputAttachments()
  if (files.length === 0) return null
  return (
    <Attachments variant="inline">
      {files.map((file) => (
        <Attachment data={file} key={file.id} onRemove={() => remove(file.id)} variant="inline">
          <AttachmentPreview />
          <AttachmentInfo />
          <AttachmentRemove />
        </Attachment>
      ))}
    </Attachments>
  )
}

/**
 * Wraps children and overlays the ts-border-pulse glow in a
 * pointer-events-none absolute layer so that the glow can fade in/out via
 * opacity — the raw utility uses a box-shadow keyframe animation which
 * would otherwise snap on/off.
 */
const PulseWrapper = ({
  active,
  radius = "rounded-md",
  children,
}: {
  active: boolean
  radius?: string
  children: React.ReactNode
}) => (
  <div className="relative">
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out",
        radius,
        active ? "ts-border-pulse opacity-100" : "opacity-0",
      )}
    />
    {children}
  </div>
)

const ChatShell = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto h-screen w-full">
    <Conversation>
      <ConversationContent>{children}</ConversationContent>
    </Conversation>
  </div>
)

// ---------------------------------------------------------------------------
// ReasoningCitationsAndQueue — thinking → queue → message w/ inline citation
// ---------------------------------------------------------------------------

const QUEUE_STEPS: {
  id: string
  title: string
  status: QueueItemStatus
}[][] = [
  [
    { id: "1", title: "Parse user question", status: "loading" },
    { id: "2", title: "Search knowledge base", status: "pending" },
    { id: "3", title: "Validate auth token", status: "pending" },
    { id: "4", title: "Draft response", status: "pending" },
  ],
  [
    { id: "1", title: "Parse user question", status: "done" },
    { id: "2", title: "Search knowledge base", status: "loading" },
    { id: "3", title: "Validate auth token", status: "pending" },
    { id: "4", title: "Draft response", status: "pending" },
  ],
  [
    { id: "1", title: "Parse user question", status: "done" },
    { id: "2", title: "Search knowledge base", status: "done" },
    { id: "3", title: "Validate auth token", status: "error" },
    { id: "4", title: "Draft response", status: "loading" },
  ],
  [
    { id: "1", title: "Parse user question", status: "done" },
    { id: "2", title: "Search knowledge base", status: "done" },
    { id: "3", title: "Validate auth token", status: "error" },
    { id: "4", title: "Draft response", status: "done" },
  ],
]

const ReasoningCitationsQueueDemo = () => {
  const [phase, setPhase] = useState<"thinking" | "queue" | "done">("thinking")
  const [queueStep, setQueueStep] = useState(0)

  useEffect(() => {
    const thinkingTimer = setTimeout(() => setPhase("queue"), 2500)
    return () => clearTimeout(thinkingTimer)
  }, [])

  useEffect(() => {
    if (phase !== "queue") return
    const interval = setInterval(() => {
      setQueueStep((s) => {
        if (s >= QUEUE_STEPS.length - 1) {
          clearInterval(interval)
          setTimeout(() => setPhase("done"), 800)
          return s
        }
        return s + 1
      })
    }, 1250)
    return () => clearInterval(interval)
  }, [phase])

  const sources = ["https://en.wikipedia.org/wiki/Photosynthesis", "https://www.khanacademy.org/science/photosynthesis"]

  return (
    <ChatShell>
      <Message from="user">
        <MessageContent>
          <MessageResponse>How does photosynthesis work?</MessageResponse>
        </MessageContent>
      </Message>

      <div className="space-y-2">
        <Reasoning defaultOpen isStreaming={phase === "thinking"}>
          <ReasoningTrigger>
            <GradientReasoningTrigger />
          </ReasoningTrigger>
          <ReasoningContent>
            {`The user is asking about a fundamental biology concept. Plain language with structure works best. I'll cite Wikipedia and Khan Academy.`}
          </ReasoningContent>
        </Reasoning>

        {phase !== "thinking" && (
          <Queue isStreaming={phase === "queue"}>
            <QueueList>
              {QUEUE_STEPS[queueStep].map((item) => (
                <QueueItem key={item.id}>
                  <QueueItemIndicator status={item.status} />
                  <QueueItemContent
                    className={item.status === "error" ? "text-destructive line-through" : undefined}
                    completed={item.status === "done"}
                  >
                    {item.title}
                    {item.status === "error" && " — skipped"}
                  </QueueItemContent>
                </QueueItem>
              ))}
            </QueueList>
          </Queue>
        )}

        {phase === "done" && (
          <>
            <Message from="assistant">
              <MessageContent>
                <div className="text-sm leading-relaxed">
                  Photosynthesis converts sunlight into chemical energy stored in glucose. Chlorophyll absorbs light,
                  water is split, and CO₂ is fixed into sugars
                  <InlineCitation>
                    <InlineCitationText> — see the overall equation</InlineCitationText>
                    <InlineCitationCard>
                      <InlineCitationCardTrigger sources={sources} />
                      <InlineCitationCardBody>
                        <InlineCitationCarousel>
                          <InlineCitationCarouselHeader>
                            <InlineCitationCarouselPrev />
                            <InlineCitationCarouselIndex />
                            <InlineCitationCarouselNext />
                          </InlineCitationCarouselHeader>
                          <InlineCitationCarouselContent>
                            {sources.map((url) => (
                              <InlineCitationCarouselItem key={url}>
                                <InlineCitationSource title={new URL(url).hostname} url={url} />
                                <InlineCitationQuote>6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂</InlineCitationQuote>
                              </InlineCitationCarouselItem>
                            ))}
                          </InlineCitationCarouselContent>
                        </InlineCitationCarousel>
                      </InlineCitationCardBody>
                    </InlineCitationCard>
                  </InlineCitation>
                  .
                </div>
              </MessageContent>
              <MessageActions>
                <MessageAction label="Copy">
                  <CopyIcon className="size-3" />
                </MessageAction>
                <MessageAction label="Retry">
                  <RefreshCcwIcon className="size-3" />
                </MessageAction>
              </MessageActions>
            </Message>

            <Sources>
              <SourcesTrigger count={sources.length} />
              <SourcesContent>
                {sources.map((href) => (
                  <Source href={href} key={href} title={new URL(href).hostname} />
                ))}
              </SourcesContent>
            </Sources>
          </>
        )}

        {phase !== "done" && (
          <StreamStatus iconVariant="loader-circle" isStreaming showIndicator startTime={new Date(Date.now() - 2000)} />
        )}
      </div>
    </ChatShell>
  )
}

export const WithReasoningCitationsAndQueue: Story = {
  name: "With Reasoning, Citations & Queue",
  render: () => <ReasoningCitationsQueueDemo />,
}

// ---------------------------------------------------------------------------
// TaskAndTools — task breakdown + tool calling
// ---------------------------------------------------------------------------

const TaskAndToolsDemo = () => {
  const [phase, setPhase] = useState<"thinking" | "running" | "done">("thinking")
  const [toolState, setToolState] = useState<"input-streaming" | "input-available" | "output-available">(
    "input-streaming",
  )

  useEffect(() => {
    const t1 = setTimeout(() => {
      setPhase("running")
      setToolState("input-available")
    }, 2000)
    const t2 = setTimeout(() => setToolState("output-available"), 4500)
    const t3 = setTimeout(() => setPhase("done"), 5500)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  return (
    <ChatShell>
      <Message from="user">
        <MessageContent>
          <MessageResponse>What&apos;s the weather in San Francisco?</MessageResponse>
        </MessageContent>
      </Message>

      <div className="space-y-2">
        <Reasoning defaultOpen isStreaming={phase === "thinking"}>
          <ReasoningTrigger>
            <GradientReasoningTrigger />
          </ReasoningTrigger>
          <ReasoningContent>
            I need current weather data. I&apos;ll break this into subtasks, then call the `get_weather` tool with a
            location parameter.
          </ReasoningContent>
        </Reasoning>

        {phase !== "thinking" && (
          <>
            <Task defaultOpen isStreaming={phase === "running"}>
              <TaskTrigger title="Plan and execute weather lookup" />
              <TaskContent>
                <TaskItem>
                  <>Resolved location to </>
                  <TaskItemFile>San Francisco, CA</TaskItemFile>
                </TaskItem>
                <TaskItem>
                  Selected tool: <TaskItemFile>get_weather</TaskItemFile>
                </TaskItem>
                <TaskItem>Calling tool with derived parameters…</TaskItem>
              </TaskContent>
            </Task>

            <Tool defaultOpen isStreaming={toolState !== "output-available"}>
              <ToolHeader state={toolState} type="tool-get_weather" />
              <ToolContent>
                <ToolInput input={{ location: "San Francisco, CA", unit: "fahrenheit" }} />
                {toolState === "output-available" && (
                  <ToolOutput
                    errorText={undefined}
                    output={{
                      temperature: 68,
                      condition: "Partly cloudy",
                      humidity: 72,
                    }}
                  />
                )}
              </ToolContent>
            </Tool>
          </>
        )}

        {phase === "done" && (
          <Message from="assistant">
            <MessageContent>
              <MessageResponse>It&apos;s 68°F and partly cloudy in San Francisco, with 72% humidity.</MessageResponse>
            </MessageContent>
          </Message>
        )}
      </div>
    </ChatShell>
  )
}

export const WithTaskAndTools: Story = {
  name: "With Task & Tool Calling",
  render: () => <TaskAndToolsDemo />,
}

// ---------------------------------------------------------------------------
// Attachments — user message with file attachments
// ---------------------------------------------------------------------------

const MOCK_ATTACHMENTS: AttachmentData[] = [
  {
    type: "file",
    id: "img-1",
    filename: "chart-q1.png",
    mediaType: "image/png",
    url: "./sample_image2.png",
  },
  {
    type: "file",
    id: "doc-1",
    filename: "earnings-report.pdf",
    mediaType: "application/pdf",
  },
  {
    type: "file",
    id: "doc-2",
    filename: "notes.txt",
    mediaType: "text/plain",
  },
]

export const WithAttachments: Story = {
  name: "With Attachments in Message",
  render: () => (
    <ChatShell>
      <Message from="user">
        <MessageContent>
          <Attachments variant="grid">
            {MOCK_ATTACHMENTS.map((data) => (
              <Attachment data={data} key={data.id}>
                <AttachmentPreview />
              </Attachment>
            ))}
          </Attachments>
          <MessageResponse>Can you summarize these Q1 materials and flag anything unusual?</MessageResponse>
        </MessageContent>
      </Message>

      <Message from="assistant">
        <MessageContent>
          <MessageResponse>
            I&apos;ve reviewed the chart, earnings report, and notes. Revenue is up 12% QoQ. One line item — &quot;Other
            operating expenses&quot; — jumped 40% and is worth a closer look.
          </MessageResponse>
          <Attachments variant="inline">
            {MOCK_ATTACHMENTS.slice(0, 2).map((data) => (
              <Attachment data={data} key={data.id}>
                <AttachmentPreview />
                <AttachmentInfo />
              </Attachment>
            ))}
          </Attachments>
        </MessageContent>
      </Message>
    </ChatShell>
  ),
}

// ---------------------------------------------------------------------------
// HumanInTheLoop — assistant proposes a tool call that needs user approval
// before execution. Shows the Confirmation primitive gated between the
// tool-input and tool-output phases.
// ---------------------------------------------------------------------------

type HumanInLoopPhase = "thinking" | "awaiting-approval" | "approved" | "running" | "done" | "denied"

const HUMAN_IN_LOOP_PHASE_TRANSITIONS: Partial<Record<HumanInLoopPhase, { next: HumanInLoopPhase; delay: number }>> = {
  thinking: { next: "awaiting-approval", delay: 1800 },
  approved: { next: "running", delay: 600 },
  running: { next: "done", delay: 1400 },
}

function getHumanInLoopApproval(phase: HumanInLoopPhase) {
  if (phase === "awaiting-approval") return { id: "approval-1" }
  if (phase === "approved" || phase === "running" || phase === "done")
    return { id: "approval-1", approved: true as const }
  if (phase === "denied") return { id: "approval-1", approved: false as const }
}

function getHumanInLoopConfirmationState(
  phase: HumanInLoopPhase,
): "approval-requested" | "approval-responded" | "output-available" | "output-denied" {
  if (phase === "awaiting-approval") return "approval-requested"
  if (phase === "denied") return "output-denied"
  if (phase === "done") return "output-available"
  return "approval-responded"
}

function getHumanInLoopToolState(phase: HumanInLoopPhase): "input-streaming" | "input-available" | "output-available" {
  if (phase === "thinking") return "input-streaming"
  if (phase === "done") return "output-available"
  return "input-available"
}

const HumanInTheLoopDemo = () => {
  const [phase, setPhase] = useState<HumanInLoopPhase>("thinking")

  useEffect(() => {
    const transition = HUMAN_IN_LOOP_PHASE_TRANSITIONS[phase]
    if (!transition) return
    const t = setTimeout(() => setPhase(transition.next), transition.delay)
    return () => clearTimeout(t)
  }, [phase])

  const isStreaming = phase !== "done" && phase !== "denied" && phase !== "awaiting-approval"

  const approval = getHumanInLoopApproval(phase)
  const confirmationState = getHumanInLoopConfirmationState(phase)
  const toolState = getHumanInLoopToolState(phase)

  return (
    <div className="flex h-screen w-full flex-col">
      <Conversation className="flex-1">
        <ConversationContent>
          <Message from="user">
            <MessageContent>
              <MessageResponse>Can you delete the stale build-cache folder?</MessageResponse>
            </MessageContent>
          </Message>

          <div className="space-y-3">
            <Reasoning defaultOpen isStreaming={phase === "thinking"}>
              <ReasoningTrigger>
                <GradientReasoningTrigger />
              </ReasoningTrigger>
              <ReasoningContent>
                Deleting files is destructive — I&apos;ll prepare the command and ask for explicit approval before
                running it.
              </ReasoningContent>
            </Reasoning>

            {phase !== "thinking" && (
              <Tool defaultOpen isStreaming={toolState !== "output-available"}>
                <ToolHeader state={toolState} type="tool-run_shell" />
                <ToolContent>
                  <ToolInput input={{ command: "rm -rf /tmp/build-cache", cwd: "/" }} />
                  {phase === "done" && (
                    <ToolOutput errorText={undefined} output={{ status: "ok", bytesFreed: 248_193_024 }} />
                  )}
                </ToolContent>
              </Tool>
            )}

            {approval && phase !== "thinking" && (
              <Confirmation approval={approval} state={confirmationState}>
                <ConfirmationTitle>Allow assistant to run this command?</ConfirmationTitle>
                <ConfirmationRequest>
                  <ConfirmationCode>rm -rf /tmp/build-cache</ConfirmationCode>
                </ConfirmationRequest>
                <ConfirmationActions>
                  <ConfirmationAction onClick={() => setPhase("denied")} variant="outline">
                    Deny <ConfirmationShortcut>esc</ConfirmationShortcut>
                  </ConfirmationAction>
                  <div className="flex gap-2">
                    <ConfirmationAction onClick={() => setPhase("approved")} variant="outline">
                      Allow once <ConfirmationShortcut>⌘⇧↩</ConfirmationShortcut>
                    </ConfirmationAction>
                    <ConfirmationAction onClick={() => setPhase("approved")} variant="default">
                      Always allow <ConfirmationShortcut>⌘↩</ConfirmationShortcut>
                    </ConfirmationAction>
                  </div>
                </ConfirmationActions>
                <ConfirmationAccepted>
                  <div className="text-muted-foreground text-sm">Allowed — command executed successfully.</div>
                </ConfirmationAccepted>
                <ConfirmationRejected>
                  <div className="text-muted-foreground text-sm">
                    Denied — I won&apos;t run the command. Let me know how you&apos;d like to proceed.
                  </div>
                </ConfirmationRejected>
              </Confirmation>
            )}

            {phase === "done" && (
              <Message from="assistant">
                <MessageContent>
                  <MessageResponse>Done — freed about 237 MB from `/tmp/build-cache`.</MessageResponse>
                </MessageContent>
              </Message>
            )}

            {phase === "denied" && (
              <Message from="assistant">
                <MessageContent>
                  <MessageResponse>
                    No problem — I&apos;ll leave the cache alone. Want me to suggest a safer cleanup instead?
                  </MessageResponse>
                </MessageContent>
              </Message>
            )}
          </div>
        </ConversationContent>
      </Conversation>

      <div className="px-4 py-2">
        <StreamStatus
          iconVariant="loader-circle"
          isStreaming={isStreaming}
          showIndicator
          startTime={new Date(Date.now() - 1500)}
          state={
            phase === "done"
              ? "done"
              : phase === "denied"
                ? "idle"
                : phase === "awaiting-approval"
                  ? "idle"
                  : "streaming"
          }
        />
      </div>
    </div>
  )
}

export const WithHumanInTheLoop: Story = {
  name: "With Human-in-the-Loop Confirmation",
  render: () => <HumanInTheLoopDemo />,
}

// ---------------------------------------------------------------------------
// Interactive — the full end-to-end demo. When the user sends a message,
// the assistant plays through every AI primitive: reasoning (with brand
// gradient while thinking), queue (steps progress, one errors and is
// skipped), task breakdown, tool calling (input-streaming → available →
// output), stream status, sources, and an inline citation in the reply.
// ---------------------------------------------------------------------------

type FullPhase = "idle" | "thinking" | "planning" | "awaiting-approval" | "denied" | "tooling" | "writing" | "done"

const FULL_QUEUE_BASE = [
  { id: "1", title: "Parse user question" },
  { id: "2", title: "Search knowledge base" },
  { id: "3", title: "Validate auth token" },
  { id: "4", title: "Draft response" },
]

const getQueueStatuses = (step: number): QueueItemStatus[] => {
  // 5 steps over ~5s. index 2 errors, step 4 is skipped → draft still completes.
  const frames: QueueItemStatus[][] = [
    ["loading", "pending", "pending", "pending"],
    ["done", "loading", "pending", "pending"],
    ["done", "done", "loading", "pending"],
    ["done", "done", "error", "loading"],
    ["done", "done", "error", "done"],
  ]
  return frames[Math.min(step, frames.length - 1)]
}

const FULL_SOURCES = [
  "https://en.wikipedia.org/wiki/Photosynthesis",
  "https://www.khanacademy.org/science/photosynthesis",
]

const FULL_THOUGHT_TEXT = `The user is asking a biology question, so I'll plan a sourced answer.

1. **Break the question down** — what's the real ask? They want the mechanism, not just a definition, so I should cover the inputs (light, water, CO₂), the process (light-dependent + light-independent reactions), and the outputs (glucose, oxygen).
2. **Pull references** — Wikipedia and Khan Academy are both authoritative and widely cited, so I'll call the knowledge-base tool and surface them as sources.
3. **Check safety** — this is a benign informational query, so no extra guardrails needed.
4. **Draft structure** — lead with a one-sentence summary, then a short numbered list of the key steps, and finish with the overall chemical equation as a cited callout.`

const FULL_ANSWER_TEXT = `**Photosynthesis** converts sunlight into chemical energy stored in glucose. Plants use it to feed themselves — and, as a useful side effect, to release the oxygen the rest of us breathe.

Here's the process end-to-end:

1. **Light absorbed** — Chlorophyll in the leaves captures photons, mainly in the red and blue wavelengths.
2. **Water split** — In the light-dependent reactions, water molecules are broken apart into hydrogen ions, electrons, and oxygen.
3. **CO₂ fixed** — In the Calvin cycle, carbon dioxide is combined with hydrogen using energy carriers (ATP and NADPH) produced in step 2.
4. **Sugar built** — Those fixed carbons are assembled into glucose and other sugars that the plant stores or uses for growth.
5. **Oxygen released** — The oxygen produced when water was split is vented out through the stomata.

The whole thing runs inside chloroplasts, and it is remarkably efficient: a single leaf can fix thousands of CO₂ molecules per second under bright light`

const WRITING_TICK_MS = 20
const WRITING_CHARS_PER_TICK = 4
const THINKING_TICK_MS = 20
const THINKING_CHARS_PER_TICK = 6

interface FullTurn {
  id: number
  userText: string
  userAttachments?: AttachmentData[]
  phase: FullPhase
  queueStep: number
  toolState: "input-streaming" | "input-available" | "output-available"
  streamStart: Date
  approval?: { id: string; approved?: boolean }
  writtenChars: number
  thoughtChars: number
}

const MAX_CONTEXT_TOKENS = 200_000

interface LiveUsage {
  inputTokens: number
  outputTokens: number
  reasoningTokens: number
}

const InteractiveFullDemo = () => {
  const [turns, setTurns] = useState<FullTurn[]>([])
  const [text, setText] = useState("")
  const [model, setModel] = useState(INTERACTIVE_MODELS[0].id)
  const [usage, setUsage] = useState<LiveUsage>({
    inputTokens: 0,
    outputTokens: 0,
    reasoningTokens: 0,
  })

  const activeTurn = turns[turns.length - 1]
  const isStreaming =
    activeTurn &&
    activeTurn.phase !== "done" &&
    activeTurn.phase !== "denied" &&
    activeTurn.phase !== "awaiting-approval"
  const [showStreamStatus, setShowStreamStatus] = useState(false)

  useEffect(() => {
    if (!activeTurn) return
    if (activeTurn.phase === "done" || activeTurn.phase === "denied") {
      // Let the confirm-ripple play, then fade out.
      const t = setTimeout(() => setShowStreamStatus(false), 1500)
      return () => clearTimeout(t)
    }
    setShowStreamStatus(true)
  }, [activeTurn, activeTurn?.phase])

  // Live token ticker — each phase grows a different bucket so the Context
  // gauge in the footer mirrors what the assistant is doing in real time.
  useEffect(() => {
    if (!activeTurn || activeTurn.phase === "done") return
    const id = setInterval(() => {
      setUsage((u) => {
        switch (activeTurn.phase) {
          case "thinking":
            return { ...u, reasoningTokens: u.reasoningTokens + 180 }
          case "planning":
            return { ...u, inputTokens: u.inputTokens + 90 }
          case "tooling":
            return {
              ...u,
              inputTokens: u.inputTokens + 60,
              outputTokens: u.outputTokens + 40,
            }
          case "writing":
            return { ...u, outputTokens: u.outputTokens + 220 }
          default:
            return u
        }
      })
    }, 150)
    return () => clearInterval(id)
  }, [activeTurn])

  // Drive the active turn through all phases.
  useEffect(() => {
    if (!activeTurn || activeTurn.phase === "done") return

    const setTurn = (patch: Partial<FullTurn>) =>
      setTurns((prev) => prev.map((t) => (t.id === activeTurn.id ? { ...t, ...patch } : t)))

    if (activeTurn.phase === "thinking") {
      if (activeTurn.thoughtChars >= FULL_THOUGHT_TEXT.length) {
        const t = setTimeout(() => setTurn({ phase: "planning", queueStep: 0 }), 400)
        return () => clearTimeout(t)
      }
      const t = setTimeout(
        () =>
          setTurn({
            thoughtChars: Math.min(activeTurn.thoughtChars + THINKING_CHARS_PER_TICK, FULL_THOUGHT_TEXT.length),
          }),
        THINKING_TICK_MS,
      )
      return () => clearTimeout(t)
    }

    if (activeTurn.phase === "planning") {
      if (activeTurn.queueStep >= 4) {
        // Pause for human approval before executing the tool.
        const t = setTimeout(
          () =>
            setTurn({
              phase: "awaiting-approval",
              toolState: "input-streaming", // "Pending" until approved
              approval: { id: `appr-${activeTurn.id}` },
            }),
          700,
        )
        return () => clearTimeout(t)
      }
      const t = setTimeout(() => setTurn({ queueStep: activeTurn.queueStep + 1 }), 1100)
      return () => clearTimeout(t)
    }

    if (activeTurn.phase === "tooling") {
      if (activeTurn.toolState === "input-available") {
        const t = setTimeout(() => setTurn({ toolState: "output-available" }), 1600)
        return () => clearTimeout(t)
      }
      const t = setTimeout(() => setTurn({ phase: "writing" }), 700)
      return () => clearTimeout(t)
    }

    if (activeTurn.phase === "writing") {
      if (activeTurn.writtenChars >= FULL_ANSWER_TEXT.length) {
        const t = setTimeout(() => setTurn({ phase: "done" }), 250)
        return () => clearTimeout(t)
      }
      const t = setTimeout(
        () =>
          setTurn({
            writtenChars: Math.min(activeTurn.writtenChars + WRITING_CHARS_PER_TICK, FULL_ANSWER_TEXT.length),
          }),
        WRITING_TICK_MS,
      )
      return () => clearTimeout(t)
    }
  }, [activeTurn])

  const respondApproval = (turnId: number, approved: boolean) => {
    setTurns((prev) =>
      prev.map((t) =>
        t.id === turnId
          ? {
              ...t,
              approval: { id: `appr-${turnId}`, approved },
              phase: approved ? "tooling" : "denied",
              toolState: approved ? "input-available" : t.toolState,
            }
          : t,
      ),
    )
  }

  const handleSubmit = (msg: PromptInputMessage) => {
    const trimmed = (msg.text ?? text).trim()
    if (!trimmed || isStreaming) return
    const submittedAttachments: AttachmentData[] | undefined =
      msg.files && msg.files.length > 0
        ? msg.files.map((f, i) => ({
            ...f,
            id: `attach-${turns.length}-${i}`,
          }))
        : undefined
    // Seed: rough estimate for the prompt + attachments.
    const attachmentTokens = (submittedAttachments?.length ?? 0) * 900
    const seed = Math.ceil(trimmed.length / 4) + attachmentTokens
    setUsage((u) => ({ ...u, inputTokens: u.inputTokens + seed }))
    setTurns((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        userText: trimmed,
        userAttachments: submittedAttachments,
        phase: "thinking",
        queueStep: 0,
        toolState: "input-streaming",
        streamStart: new Date(),
        writtenChars: 0,
        thoughtChars: 0,
      },
    ])
    setText("")
  }

  const totalUsed = usage.inputTokens + usage.outputTokens + usage.reasoningTokens

  // Fake per-phase pricing so the footer shows a meaningful cost instead of $0.
  // Roughly mirrors Claude Sonnet 4.5 pricing ($3 / $15 per 1M tok).
  const INPUT_COST_PER_TOKEN = 3 / 1_000_000
  const OUTPUT_COST_PER_TOKEN = 15 / 1_000_000
  const REASONING_COST_PER_TOKEN = 15 / 1_000_000
  const formatCost = (n: number) =>
    new Intl.NumberFormat("en-US", {
      currency: "USD",
      style: "currency",
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(n)
  const inputCost = usage.inputTokens * INPUT_COST_PER_TOKEN
  const outputCost = usage.outputTokens * OUTPUT_COST_PER_TOKEN
  const reasoningCost = usage.reasoningTokens * REASONING_COST_PER_TOKEN
  const totalCost = inputCost + outputCost + reasoningCost
  const formatTokens = (n: number) => new Intl.NumberFormat("en-US", { notation: "compact" }).format(n)

  return (
    <div className="h-screen w-full mx-auto flex w-full max-w-[980px] flex-col">
      <Conversation>
        <ConversationContent>
          {turns.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-2 py-16 text-center">
              <h3 className="font-medium text-foreground">Try the full demo</h3>
              <p className="max-w-sm text-muted-foreground text-sm">
                Send any message — the assistant will walk through reasoning, a live queue, tool calls, and a cited
                answer.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {["How does photosynthesis work?", "Summarize these notes"].map((s) => (
                  <button
                    className="rounded-full border bg-background px-3 py-1 text-sm hover:bg-muted"
                    key={s}
                    onClick={() => setText(s)}
                    type="button"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {turns.map((turn) => {
            const isActiveTurn = turn.id === activeTurn?.id

            return (
              <div className="space-y-3" key={turn.id}>
                {/* User message */}
                <Message from="user">
                  <MessageContent>
                    {turn.userAttachments && (
                      <Attachments variant="grid">
                        {turn.userAttachments.map((a) => (
                          <Attachment data={a} key={a.id}>
                            <AttachmentPreview />
                          </Attachment>
                        ))}
                      </Attachments>
                    )}
                    <MessageResponse>{turn.userText}</MessageResponse>
                  </MessageContent>
                </Message>

                {/* Reasoning — always rendered; streaming state drives the gradient */}
                <Reasoning defaultOpen isStreaming={turn.phase === "thinking"}>
                  <ReasoningTrigger />
                  <ReasoningContent>
                    {turn.phase === "thinking" ? FULL_THOUGHT_TEXT.slice(0, turn.thoughtChars) : FULL_THOUGHT_TEXT}
                  </ReasoningContent>
                </Reasoning>

                {/* Queue — appears once thinking is done. Pulses only while
                  items are still moving (planning); fades once complete. */}
                {turn.phase !== "thinking" && (
                  <PulseWrapper active={turn.phase === "planning"} radius="rounded-xl">
                    <Queue isStreaming={turn.phase === "planning"}>
                      <QueueList>
                        {FULL_QUEUE_BASE.map((item, i) => {
                          const statuses = getQueueStatuses(turn.queueStep)
                          const status =
                            turn.phase === "planning" ? statuses[i] : statuses[i] === "loading" ? "done" : statuses[i]
                          return (
                            <QueueItem key={item.id}>
                              <QueueItemIndicator status={status} />
                              <QueueItemContent
                                className={status === "error" ? "text-destructive line-through" : undefined}
                                completed={status === "done"}
                              >
                                {item.title}
                                {status === "error" && " — skipped"}
                              </QueueItemContent>
                            </QueueItem>
                          )
                        })}
                      </QueueList>
                    </Queue>
                  </PulseWrapper>
                )}

                {/* Task + Tool — appears once queue finishes; pulses while the
                  tool is awaiting approval or actively running. */}
                {(turn.phase === "awaiting-approval" ||
                  turn.phase === "tooling" ||
                  turn.phase === "writing" ||
                  turn.phase === "done" ||
                  turn.phase === "denied") && (
                  <>
                    <Task defaultOpen isStreaming={turn.phase !== "done" && turn.phase !== "denied"}>
                      <TaskTrigger title="Plan and execute lookup" />
                      <TaskContent>
                        <TaskItem>
                          <>Resolved topic to </>
                          <TaskItemFile>photosynthesis</TaskItemFile>
                        </TaskItem>
                        <TaskItem>
                          Selected tool: <TaskItemFile>search_knowledge_base</TaskItemFile>
                        </TaskItem>
                        <TaskItem>Calling tool with derived parameters…</TaskItem>
                      </TaskContent>
                    </Task>

                    <PulseWrapper active={turn.phase === "tooling" && turn.toolState === "input-available"}>
                      <Tool defaultOpen isStreaming={turn.toolState !== "output-available"}>
                        <ToolHeader state={turn.toolState} type="tool-search_knowledge_base" />
                        <ToolContent>
                          <ToolInput
                            input={{
                              query: turn.userText,
                              topK: 3,
                              useCache: true,
                            }}
                          />
                          {turn.toolState === "output-available" && (
                            <ToolOutput
                              errorText={undefined}
                              output={{
                                hits: [
                                  {
                                    title: "Photosynthesis — Wikipedia",
                                    score: 0.94,
                                  },
                                  {
                                    title: "Photosynthesis — Khan Academy",
                                    score: 0.89,
                                  },
                                ],
                                latencyMs: 142,
                              }}
                            />
                          )}
                        </ToolContent>
                      </Tool>
                    </PulseWrapper>

                    {/* Human-in-the-loop approval gate */}
                    {(turn.phase === "awaiting-approval" ||
                      turn.phase === "denied" ||
                      (turn.phase === "done" && turn.approval?.approved)) &&
                      turn.approval !== undefined && (
                        <Confirmation
                          approval={
                            turn.approval.approved === undefined
                              ? { id: turn.approval.id }
                              : {
                                  id: turn.approval.id,
                                  approved: turn.approval.approved,
                                }
                          }
                          state={
                            turn.phase === "awaiting-approval"
                              ? "approval-requested"
                              : turn.phase === "denied"
                                ? "output-denied"
                                : "output-available"
                          }
                        >
                          <ConfirmationTitle>
                            Allow assistant to call <span className="font-mono">search_knowledge_base</span>?
                          </ConfirmationTitle>
                          <ConfirmationRequest>
                            <ConfirmationCode>
                              {`search_knowledge_base({\n  query: ${JSON.stringify(turn.userText)},\n  topK: 3,\n  useCache: true\n})`}
                            </ConfirmationCode>
                          </ConfirmationRequest>
                          <ConfirmationActions>
                            <ConfirmationAction onClick={() => respondApproval(turn.id, false)} variant="outline">
                              Deny <ConfirmationShortcut>esc</ConfirmationShortcut>
                            </ConfirmationAction>
                            <div className="flex gap-2">
                              <ConfirmationAction onClick={() => respondApproval(turn.id, true)} variant="outline">
                                Allow once <ConfirmationShortcut>⌘⇧↩</ConfirmationShortcut>
                              </ConfirmationAction>
                              <ConfirmationAction onClick={() => respondApproval(turn.id, true)} variant="default">
                                Always allow <ConfirmationShortcut>⌘↩</ConfirmationShortcut>
                              </ConfirmationAction>
                            </div>
                          </ConfirmationActions>
                          <ConfirmationAccepted>
                            <div className="text-muted-foreground text-sm">
                              Allowed — tool call executed successfully.
                            </div>
                          </ConfirmationAccepted>
                          <ConfirmationRejected>
                            <div className="text-muted-foreground text-sm">Denied — tool call was not executed.</div>
                          </ConfirmationRejected>
                        </Confirmation>
                      )}
                  </>
                )}

                {turn.phase === "denied" && (
                  <Message from="assistant">
                    <MessageContent>
                      <MessageResponse>
                        Understood — I won&apos;t run the tool. Let me know how you&apos;d like to proceed.
                      </MessageResponse>
                    </MessageContent>
                  </Message>
                )}

                {/* Final answer — text streams in during `writing`, then the
                  inline citation + period snap in on `done`. */}
                {(turn.phase === "writing" || turn.phase === "done") && (
                  <Message from="assistant">
                    <MessageContent>
                      <div className="text-sm leading-relaxed">
                        <MessageResponse>
                          {turn.phase === "writing" ? FULL_ANSWER_TEXT.slice(0, turn.writtenChars) : FULL_ANSWER_TEXT}
                        </MessageResponse>
                        {turn.phase === "done" && (
                          <>
                            <InlineCitation>
                              <InlineCitationText> — see the overall equation</InlineCitationText>
                              <InlineCitationCard>
                                <InlineCitationCardTrigger sources={FULL_SOURCES} />
                                <InlineCitationCardBody>
                                  <InlineCitationCarousel>
                                    <InlineCitationCarouselHeader>
                                      <InlineCitationCarouselPrev />
                                      <InlineCitationCarouselIndex />
                                      <InlineCitationCarouselNext />
                                    </InlineCitationCarouselHeader>
                                    <InlineCitationCarouselContent>
                                      {FULL_SOURCES.map((url) => (
                                        <InlineCitationCarouselItem key={url}>
                                          <InlineCitationSource title={new URL(url).hostname} url={url} />
                                          <InlineCitationQuote>6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂</InlineCitationQuote>
                                        </InlineCitationCarouselItem>
                                      ))}
                                    </InlineCitationCarouselContent>
                                  </InlineCitationCarousel>
                                </InlineCitationCardBody>
                              </InlineCitationCard>
                            </InlineCitation>
                            .
                          </>
                        )}
                      </div>
                    </MessageContent>
                    {turn.phase === "done" && (
                      <MessageActions>
                        <MessageAction label="Copy">
                          <CopyIcon className="size-3" />
                        </MessageAction>
                        <MessageAction label="Retry">
                          <RefreshCcwIcon className="size-3" />
                        </MessageAction>
                      </MessageActions>
                    )}
                  </Message>
                )}

                {/* Sources — revealed once streaming is complete */}
                {turn.phase === "done" && (
                  <Sources>
                    <SourcesTrigger count={FULL_SOURCES.length} />
                    <SourcesContent>
                      {FULL_SOURCES.map((href) => (
                        <Source href={href} key={href} title={new URL(href).hostname} />
                      ))}
                    </SourcesContent>
                  </Sources>
                )}

                {isActiveTurn && (
                  <div
                    className={cn(
                      "mt-3 transition-opacity duration-700",
                      showStreamStatus ? "opacity-100" : "pointer-events-none opacity-0",
                    )}
                  >
                    <StreamStatus
                      iconVariant="loader-circle"
                      isStreaming={isStreaming}
                      showIndicator
                      startTime={turn.streamStart}
                      state={turn.phase === "done" ? "done" : isStreaming ? "streaming" : "idle"}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </ConversationContent>
      </Conversation>

      {/* Prompt input — TS blue glow ring before the first submission to
          draw the eye, plain border once the convo starts. */}
      <div className="p-4 pt-0">
        <PromptInput
          accept="image/*,application/pdf,text/*"
          multiple
          onSubmit={(msg, e) => {
            e.preventDefault()
            handleSubmit(msg)
          }}
        >
          <PromptInputHeader>
            <AttachmentsHeader />
          </PromptInputHeader>
          <PromptInputBody>
            <PromptInputTextarea onChange={(e) => setText(e.target.value)} placeholder="Ask anything..." value={text} />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <PromptInputSelect onValueChange={setModel} value={model}>
                <PromptInputSelectTrigger>
                  <PromptInputSelectValue />
                </PromptInputSelectTrigger>
                <PromptInputSelectContent>
                  {INTERACTIVE_MODELS.map((m) => (
                    <PromptInputSelectItem key={m.id} value={m.id}>
                      {m.name}
                    </PromptInputSelectItem>
                  ))}
                </PromptInputSelectContent>
              </PromptInputSelect>
            </PromptInputTools>
            <div className="flex items-center gap-1">
              <Context
                maxTokens={MAX_CONTEXT_TOKENS}
                modelId="anthropic:claude-sonnet-4-5"
                usage={usage}
                usedTokens={totalUsed}
              >
                <ContextTrigger />
                <ContextContent>
                  <ContextContentHeader />
                  <ContextContentBody>
                    <ContextInputUsage>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Input</span>
                        <span>
                          {formatTokens(usage.inputTokens)}
                          <span className="ml-2 text-muted-foreground">• {formatCost(inputCost)}</span>
                        </span>
                      </div>
                    </ContextInputUsage>
                    <ContextReasoningUsage>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Reasoning</span>
                        <span>
                          {formatTokens(usage.reasoningTokens)}
                          <span className="ml-2 text-muted-foreground">• {formatCost(reasoningCost)}</span>
                        </span>
                      </div>
                    </ContextReasoningUsage>
                    <ContextOutputUsage>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Output</span>
                        <span>
                          {formatTokens(usage.outputTokens)}
                          <span className="ml-2 text-muted-foreground">• {formatCost(outputCost)}</span>
                        </span>
                      </div>
                    </ContextOutputUsage>
                  </ContextContentBody>
                  <ContextContentFooter>
                    <span className="text-muted-foreground">Total cost</span>
                    <span>{formatCost(totalCost)}</span>
                  </ContextContentFooter>
                </ContextContent>
              </Context>
              <PromptInputSubmit disabled={false} status={isStreaming ? "streaming" : "ready"} />
            </div>
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  )
}

export const Interactive: Story = {
  name: "Interactive — Full demo",
  render: () => InteractiveFullDemo(),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Prompt input is present", async () => {
      await expect(canvas.getByPlaceholderText("Ask anything...")).toBeInTheDocument()
    })
    await step("Context trigger sits before submit in the prompt footer", async () => {
      const contextTrigger = canvas.getByRole("img", { name: "Model context usage" }).closest("button")
      const submitButton = canvas.getByRole("button", {
        name: /send|submit/i,
      })
      const buttons = canvas.getAllByRole("button")

      await expect(contextTrigger).toBeInTheDocument()
      await expect(buttons.indexOf(contextTrigger as HTMLButtonElement)).toBeLessThan(buttons.indexOf(submitButton))
    })
    await step("Typing enables the submit button", async () => {
      await userEvent.type(canvas.getByPlaceholderText("Ask anything..."), "Hello")
      await expect(canvas.getByRole("button", { name: /send|submit/i })).not.toBeDisabled()
    })
  },
}
