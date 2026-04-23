import { SparklesIcon } from "lucide-react"
import { useState } from "react"
import { expect, userEvent, within } from "storybook/test"

import {
  Attachment,
  AttachmentInfo,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from "./attachments"
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
  PromptInputSlotSwap,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
  type PromptInputMessage,
} from "./prompt-input"
import { SpeechInput } from "./speech-input"
import { Suggestion, Suggestions } from "./suggestion"

import type { Meta, StoryObj } from "@storybook/react-vite"


// ---------------------------------------------------------------------------
// Layout helpers
// ---------------------------------------------------------------------------

/**
 * Wraps a PromptInput to give it a solid, always-visible border + shadow.
 * The default InputGroup uses `border-input` (muted) which looks faded until
 * focused. This wrapper overrides the slot with `border-border` + `shadow-md`.
 */
const PromptCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`w-full [&_[data-slot=input-group]]:border-border [&_[data-slot=input-group]]:shadow-md [&_[data-slot=input-group]]:bg-card ${className}`}
  >
    {children}
  </div>
)

/** Renders inline attachment chips inside PromptInputHeader. */
const AttachmentsHeader = () => {
  const { files, remove } = usePromptInputAttachments()
  if (files.length === 0) return null
  return (
    <Attachments variant="inline">
      {files.map((file) => (
        <Attachment
          data={file}
          key={file.id}
          onRemove={() => remove(file.id)}
          variant="inline"
        >
          <AttachmentPreview />
          <AttachmentInfo />
          <AttachmentRemove />
        </Attachment>
      ))}
    </Attachments>
  )
}

const MODELS = [
  { id: "claude-sonnet-4-6", name: "Sonnet 4.6", description: "Most efficient for everyday tasks" },
  { id: "claude-opus-4-7", name: "Opus 4.7", description: "Most capable for ambitious work" },
  { id: "claude-haiku-4-5", name: "Haiku 4.5", description: "Fastest for quick answers" },
]

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: "AI Elements/Prompt Input",
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Basic prompt — mic shown when empty, submit appears when typing. */
export const Default: Story = {
  render: () => {
    const [text, setText] = useState("")

    return (
      <PromptCard className="max-w-2xl">
        <PromptInput
          onSubmit={(_msg: PromptInputMessage) => { setText("") }}
        >
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask anything..."
              value={text}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools />
            <PromptInputSlotSwap
              a={<SpeechInput onTranscriptionChange={(t) => setText((p) => p ? `${p} ${t}` : t)} size="icon" variant="ghost" />}
              b={<PromptInputSubmit status="ready" />}
              show={!!text.trim()}
            />
          </PromptInputFooter>
        </PromptInput>
      </PromptCard>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Renders textarea and mic button when empty", async () => {
      await expect(canvas.getByPlaceholderText("Ask anything...")).toBeInTheDocument()
      await expect(canvas.getByRole("button", { name: /microphone|mic/i })).toBeInTheDocument()
    })
    await step("Typing replaces mic with submit button", async () => {
      await userEvent.type(canvas.getByPlaceholderText("Ask anything..."), "Hello")
      await expect(canvas.getByRole("button", { name: /submit/i })).toBeInTheDocument()
    })
  },
}

/**
 * Intro / empty-state layout — greeting, centred prompt card with model
 * selector and mic, suggestion chips below. Matches the Claude.ai pattern.
 */
export const IntroScreen: Story = {
  parameters: {
    layout: "centered",
  },
  render: () => {
    const [text, setText] = useState("")
    const [model, setModel] = useState("claude-sonnet-4-6")

    const suggestions = [
      { icon: "✏️", label: "Write" },
      { icon: "🎓", label: "Learn" },
      { icon: "💻", label: "Code" },
      { icon: "📊", label: "Analyse" },
      { icon: "🖼️", label: "Create image" },
    ]

    return (
      <div className="flex min-h-[520px] w-full max-w-3xl flex-col items-center justify-center gap-8 p-8">
        {/* Greeting */}
        <div className="flex flex-col items-center gap-3 text-center">
          <SparklesIcon className="size-10 text-primary" />
          <h1 className="text-4xl font-semibold tracking-tight">How can I help you?</h1>
        </div>

        {/* Prompt card */}
        <PromptCard className="w-full">
          <PromptInput
            accept="image/*,application/pdf,text/*"
            multiple
            onSubmit={() => setText("")}
          >
            {/* Header — inline attachment chips appear here after picking files */}
            <PromptInputHeader>
              <AttachmentsHeader />
            </PromptInputHeader>

            <PromptInputBody>
              <PromptInputTextarea
                className="min-h-20"
                onChange={(e) => setText(e.target.value)}
                placeholder="How can I help you today?"
                value={text}
              />
            </PromptInputBody>

            <PromptInputFooter>
              {/* Left tools: attachment picker */}
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger tooltip={{ content: "Add attachments" }} />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
              </PromptInputTools>

              {/* Right: model selector + mic-or-submit */}
              <div className="flex items-center gap-1">
                <PromptInputSelect onValueChange={setModel} value={model}>
                  <PromptInputSelectTrigger>
                    <PromptInputSelectValue />
                  </PromptInputSelectTrigger>
                  <PromptInputSelectContent>
                    {MODELS.map((m) => (
                      <PromptInputSelectItem key={m.id} value={m.id}>
                        {m.name}
                      </PromptInputSelectItem>
                    ))}
                  </PromptInputSelectContent>
                </PromptInputSelect>

                <PromptInputSlotSwap
                  a={<SpeechInput onTranscriptionChange={(t) => setText((p) => p ? `${p} ${t}` : t)} size="icon" variant="ghost" />}
                  b={<PromptInputSubmit status="ready" />}
                  show={!!text.trim()}
                />
              </div>
            </PromptInputFooter>
          </PromptInput>
        </PromptCard>

        {/* Suggestion chips */}
        <Suggestions>
          {suggestions.map((s) => (
            <Suggestion
              key={s.label}
              onClick={(label) => setText(label)}
              suggestion={s.label}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </Suggestion>
          ))}
        </Suggestions>
      </div>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Greeting and prompt render", async () => {
      await expect(canvas.getByText("How can I help you?")).toBeInTheDocument()
      await expect(canvas.getByPlaceholderText("How can I help you today?")).toBeInTheDocument()
    })
    await step("Model selector shows default model", async () => {
      await expect(canvas.getByText("Sonnet 4.6")).toBeInTheDocument()
    })
    await step("Suggestion chips render", async () => {
      await expect(canvas.getByText("Write")).toBeInTheDocument()
      await expect(canvas.getByText("Code")).toBeInTheDocument()
    })
    await step("Clicking a chip fills the textarea", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /write/i }))
      await expect(canvas.getByPlaceholderText("How can I help you today?")).toHaveValue("Write")
    })
  },
}

/**
 * Minimal — compact single-row input for use inside a chat thread.
 * Grows with content; mic on right until text is entered.
 */
export const Minimal: Story = {
  render: () => {
    const [text, setText] = useState("")

    return (
      <PromptCard className="max-w-2xl">
        <PromptInput onSubmit={() => setText("")}>
          <PromptInputBody>
            <PromptInputTextarea
              className="min-h-0"
              onChange={(e) => setText(e.target.value)}
              placeholder="Describe a task or ask a question"
              value={text}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger tooltip={{ content: "Add attachments" }} />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
            </PromptInputTools>
            <PromptInputSlotSwap
              a={<SpeechInput onTranscriptionChange={(t) => setText((p) => p ? `${p} ${t}` : t)} size="icon" variant="ghost" />}
              b={<PromptInputSubmit status="ready" />}
              show={!!text.trim()}
            />
          </PromptInputFooter>
        </PromptInput>
      </PromptCard>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Minimal prompt renders with mic", async () => {
      await expect(
        canvas.getByPlaceholderText("Describe a task or ask a question")
      ).toBeInTheDocument()
      await expect(canvas.getByRole("button", { name: /microphone|mic/i })).toBeInTheDocument()
    })
    await step("Typing replaces mic with submit", async () => {
      await userEvent.type(
        canvas.getByPlaceholderText("Describe a task or ask a question"),
        "Hello"
      )
      await expect(canvas.getByRole("button", { name: /submit/i })).toBeInTheDocument()
    })
  },
}

/** Full-featured prompt with attachment header, model selector, web search toggle. */
export const WithAttachmentsAndSpeech: Story = {
  render: () => {
    const [text, setText] = useState("")
    const [model, setModel] = useState("claude-sonnet-4-6")

    return (
      <PromptCard className="max-w-2xl">
        <PromptInput
          accept="image/*,application/pdf,text/*"
          multiple
          onSubmit={() => setText("")}
        >
          <PromptInputHeader>
            <AttachmentsHeader />
          </PromptInputHeader>

          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask anything..."
              value={text}
            />
          </PromptInputBody>

          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger tooltip={{ content: "Add attachments" }} />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>

              <PromptInputSelect onValueChange={setModel} value={model}>
                <PromptInputSelectTrigger>
                  <PromptInputSelectValue />
                </PromptInputSelectTrigger>
                <PromptInputSelectContent>
                  {MODELS.map((m) => (
                    <PromptInputSelectItem key={m.id} value={m.id}>
                      {m.name}
                    </PromptInputSelectItem>
                  ))}
                </PromptInputSelectContent>
              </PromptInputSelect>
            </PromptInputTools>

            <PromptInputSlotSwap
              a={<SpeechInput onTranscriptionChange={(t) => setText((p) => p ? `${p} ${t}` : t)} size="icon" variant="ghost" />}
              b={<PromptInputSubmit status="ready" />}
              show={!!text.trim()}
            />
          </PromptInputFooter>
        </PromptInput>
      </PromptCard>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Attachment menu trigger renders", async () => {
      await expect(canvas.getByRole("button", { name: /add attachments/i })).toBeInTheDocument()
    })
    await step("Opening attachment menu shows add files option", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /add attachments/i }))
      await expect(canvas.getByText(/Add photos or files/i)).toBeInTheDocument()
    })
    await step("Mic shown when input is empty", async () => {
      await expect(canvas.getByRole("button", { name: /microphone|mic/i })).toBeInTheDocument()
    })
  },
}

/** Streaming state — submit button shows a stop icon. */
export const Streaming: Story = {
  render: () => (
    <PromptCard className="max-w-2xl">
      <PromptInput onSubmit={() => {}}>
        <PromptInputBody>
          <PromptInputTextarea
            onChange={() => {}}
            placeholder="Ask anything..."
            value="How does quantum entanglement work?"
          />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools />
          <PromptInputSubmit status="streaming" />
        </PromptInputFooter>
      </PromptInput>
    </PromptCard>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Streaming state shows stop button", async () => {
      await expect(canvas.getByRole("button", { name: /stop/i })).toBeInTheDocument()
    })
  },
}
