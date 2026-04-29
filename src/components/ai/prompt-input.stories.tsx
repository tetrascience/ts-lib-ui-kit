import { SparklesIcon } from "lucide-react"
import React, { useState } from "react"
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test"

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
  PromptInputActionAddScreenshot,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuItem,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputButton,
  PromptInputCommand,
  PromptInputCommandEmpty,
  PromptInputCommandGroup,
  PromptInputCommandInput,
  PromptInputCommandItem,
  PromptInputCommandList,
  PromptInputCommandSeparator,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputHoverCard,
  PromptInputHoverCardContent,
  PromptInputHoverCardTrigger,
  PromptInputProvider,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSlotSwap,
  PromptInputSubmit,
  PromptInputTab,
  PromptInputTabBody,
  PromptInputTabItem,
  PromptInputTabLabel,
  PromptInputTabsList,
  PromptInputTextarea,
  PromptInputTools,
  useProviderAttachments,
  usePromptInputController,
  usePromptInputAttachments,
  usePromptInputReferencedSources,
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

const AttachmentCount = ({ testId = "attachment-count" }: { testId?: string }) => {
  const { files } = usePromptInputAttachments()
  return <span data-testid={testId}>{files.length}</span>
}

const ProviderControlPanel = ({ onUnmount }: { onUnmount: () => void }) => {
  const controller = usePromptInputController()
  const attachments = useProviderAttachments()
  const firstFile = attachments.files[0]

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span data-testid="provider-text">{controller.textInput.value}</span>
      <span data-testid="provider-attachment-count">{attachments.files.length}</span>
      <button type="button" onClick={() => controller.textInput.setInput("Provider text")}>
        Set provider text
      </button>
      <button type="button" onClick={() => attachments.add([])}>
        Add empty provider files
      </button>
      <button type="button" onClick={() => attachments.add([new File(["provider"], "provider.txt", { type: "text/plain" })])}>
        Add provider file
      </button>
      <button disabled={!firstFile} type="button" onClick={() => firstFile && attachments.remove(firstFile.id)}>
        Remove provider file
      </button>
      <button type="button" onClick={() => attachments.clear()}>
        Clear provider files
      </button>
      <button type="button" onClick={() => attachments.openFileDialog()}>
        Open provider file dialog
      </button>
      <button type="button" onClick={onUnmount}>
        Unmount provider
      </button>
    </div>
  )
}

const ReferencedSourcesPanel = () => {
  const referencedSources = usePromptInputReferencedSources()
  const firstSource = referencedSources.sources[0]

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span data-testid="source-count">{referencedSources.sources.length}</span>
      <button
        type="button"
        onClick={() =>
          referencedSources.add({
            sourceId: "doc-1",
            title: "Protocol",
            type: "source-document",
            url: "https://example.test/protocol",
          } as Parameters<typeof referencedSources.add>[0])
        }
      >
        Add source
      </button>
      <button
        type="button"
        onClick={() =>
          referencedSources.add([
            {
              sourceId: "doc-2",
              title: "Batch",
              type: "source-document",
              url: "https://example.test/batch",
            },
            {
              sourceId: "doc-3",
              title: "Result",
              type: "source-document",
              url: "https://example.test/result",
            },
          ] as Parameters<typeof referencedSources.add>[0])
        }
      >
        Add source list
      </button>
      <button disabled={!firstSource} type="button" onClick={() => firstSource && referencedSources.remove(firstSource.id)}>
        Remove source
      </button>
      <button type="button" onClick={() => referencedSources.clear()}>
        Clear sources
      </button>
    </div>
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
    await step("Model selector trigger renders", async () => {
      await expect(canvas.getByRole("combobox")).toBeInTheDocument()
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
    await step("Mic shown when input is empty", async () => {
      await expect(canvas.getByRole("button", { name: /microphone|mic/i })).toBeInTheDocument()
    })
    await step("Opening attachment menu shows add files option", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /add attachments/i }))
      await userEvent.click(await screen.findByText(/Add photos or files/i))
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

/** Enter key submits form with correct text payload. */
export const EnterKeySubmit: Story = {
  args: {
    onSubmit: fn(),
  },
  render: (args) => {
    const [text, setText] = useState("")
    return (
      <PromptCard className="max-w-2xl">
        <PromptInput onSubmit={args.onSubmit as (msg: PromptInputMessage, e: React.FormEvent<HTMLFormElement>) => void}>
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask anything..."
              value={text}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools />
            <PromptInputSubmit />
          </PromptInputFooter>
        </PromptInput>
      </PromptCard>
    )
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Enter key submits with correct text payload", async () => {
      await userEvent.type(canvas.getByPlaceholderText("Ask anything..."), "Hello world")
      await userEvent.keyboard("{Enter}")
      await waitFor(() => expect(args.onSubmit).toHaveBeenCalledOnce())
      await expect(args.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ text: "Hello world", files: [] }),
        expect.anything()
      )
    })
  },
}

/** Shift+Enter inserts a newline without submitting. */
export const ShiftEnterNewline: Story = {
  args: {
    onSubmit: fn(),
  },
  render: (args) => {
    const [text, setText] = useState("")
    return (
      <PromptCard className="max-w-2xl">
        <PromptInput onSubmit={args.onSubmit as (msg: PromptInputMessage, e: React.FormEvent<HTMLFormElement>) => void}>
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask anything..."
              value={text}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools />
            <PromptInputSubmit />
          </PromptInputFooter>
        </PromptInput>
      </PromptCard>
    )
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    const textarea = canvas.getByPlaceholderText("Ask anything...")
    await step("Shift+Enter does not submit the form", async () => {
      await userEvent.type(textarea, "Line one")
      await userEvent.keyboard("{Shift>}{Enter}{/Shift}")
      await expect(args.onSubmit).not.toHaveBeenCalled()
    })
    await step("Textarea still has focus after Shift+Enter", async () => {
      await expect(textarea).toHaveFocus()
    })
  },
}

/** Stop button calls onStop instead of submitting when streaming. */
export const StreamingStopCallback: Story = {
  args: {
    onStop: fn(),
  },
  render: (args) => (
    <PromptCard className="max-w-2xl">
      <PromptInput onSubmit={fn() as unknown as (msg: PromptInputMessage, e: React.FormEvent<HTMLFormElement>) => void}>
        <PromptInputBody>
          <PromptInputTextarea
            onChange={() => {}}
            placeholder="Ask anything..."
            value="Computing..."
          />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools />
          <PromptInputSubmit onStop={args.onStop as () => void} status="streaming" />
        </PromptInputFooter>
      </PromptInput>
    </PromptCard>
  ),
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Clicking stop button calls onStop callback", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /stop/i }))
      await expect(args.onStop).toHaveBeenCalledOnce()
    })
  },
}

/** Submitted status — spinner shown while waiting for response. */
export const SubmittedStatus: Story = {
  render: () => (
    <PromptCard className="max-w-2xl">
      <PromptInput onSubmit={() => {}}>
        <PromptInputBody>
          <PromptInputTextarea
            onChange={() => {}}
            placeholder="Ask anything..."
            value="What is the airspeed velocity of an unladen swallow?"
          />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools />
          <PromptInputSubmit status="submitted" />
        </PromptInputFooter>
      </PromptInput>
    </PromptCard>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Submitted status renders stop button (aria)", async () => {
      await expect(canvas.getByRole("button", { name: /stop/i })).toBeInTheDocument()
    })
  },
}

/** File validation — onError fires when file exceeds maxFileSize. */
export const FileValidationMaxSize: Story = {
  args: {
    onError: fn(),
  },
  render: (args) => (
    <PromptCard className="max-w-2xl">
      <PromptInput
        maxFileSize={100}
        onError={args.onError as (err: { code: string; message: string }) => void}
        onSubmit={() => {}}
      >
        <PromptInputBody>
          <PromptInputTextarea onChange={() => {}} placeholder="Ask anything..." value="" />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools />
          <PromptInputSubmit />
        </PromptInputFooter>
      </PromptInput>
    </PromptCard>
  ),
  play: async ({ args, canvasElement, step }) => {
    await step("Dropping an oversized file fires onError with max_file_size code", async () => {
      const oversizedFile = new File(["x".repeat(200)], "big.png", { type: "image/png" })
      const fileInput = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!
      await userEvent.upload(fileInput, oversizedFile)
      await waitFor(() => expect(args.onError).toHaveBeenCalledWith(
        expect.objectContaining({ code: "max_file_size" })
      ))
    })
  },
}

/** File type validation — onError fires when the uploaded MIME type is rejected by accept. */
export const FileAcceptTypeValidation: Story = {
  args: {
    onError: fn(),
  },
  render: (args) => (
    <PromptCard className="max-w-2xl">
      <PromptInput
        accept="image/*"
        onError={args.onError as (err: { code: string; message: string }) => void}
        onSubmit={() => {}}
      >
        <PromptInputBody>
          <PromptInputTextarea onChange={() => {}} placeholder="Ask anything..." value="" />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools />
          <PromptInputSubmit />
        </PromptInputFooter>
      </PromptInput>
    </PromptCard>
  ),
  play: async ({ args, canvasElement, step }) => {
    await step("Dragging a non-image file fires onError with accept code", async () => {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(new File(["hello"], "notes.txt", { type: "text/plain" }))
      const form = canvasElement.querySelector("form")!
      form.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer }))
      await waitFor(() => expect(args.onError).toHaveBeenCalledWith(
        expect.objectContaining({ code: "accept" })
      ))
    })
  },
}

/** Max files validation — onError fires and the over-limit files are dropped. */
export const MaxFilesValidation: Story = {
  args: {
    onError: fn(),
  },
  render: (args) => (
    <PromptCard className="max-w-2xl">
      <PromptInput
        maxFiles={2}
        multiple
        onError={args.onError as (err: { code: string; message: string }) => void}
        onSubmit={() => {}}
      >
        <PromptInputBody>
          <PromptInputTextarea onChange={() => {}} placeholder="Ask anything..." value="" />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools />
          <PromptInputSubmit />
        </PromptInputFooter>
      </PromptInput>
    </PromptCard>
  ),
  play: async ({ args, canvasElement, step }) => {
    await step("Uploading more files than maxFiles fires onError with max_files code", async () => {
      const files = [
        new File(["a"], "a.png", { type: "image/png" }),
        new File(["b"], "b.png", { type: "image/png" }),
        new File(["c"], "c.png", { type: "image/png" }),
      ]
      const fileInput = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!
      await userEvent.upload(fileInput, files)
      await waitFor(() => expect(args.onError).toHaveBeenCalledWith(
        expect.objectContaining({ code: "max_files" })
      ))
    })
  },
}

/** Backspace on an empty textarea removes the last attached file. */
export const BackspaceRemovesAttachment: Story = {
  args: {
    onSubmit: fn(),
  },
  render: (args) => {
    const AttachmentCount = () => {
      const { files } = usePromptInputAttachments()
      return <span data-testid="attachment-count">{files.length}</span>
    }
    return (
      <PromptCard className="max-w-2xl">
        <PromptInput
          onSubmit={args.onSubmit as (msg: PromptInputMessage, e: React.FormEvent<HTMLFormElement>) => void}
        >
          <PromptInputHeader>
            <AttachmentCount />
          </PromptInputHeader>
          <PromptInputBody>
            <PromptInputTextarea onChange={() => {}} placeholder="Ask anything..." value="" />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools />
            <PromptInputSubmit />
          </PromptInputFooter>
        </PromptInput>
      </PromptCard>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Upload a file so there is one attachment", async () => {
      const fileInput = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!
      await userEvent.upload(fileInput, new File(["x"], "photo.png", { type: "image/png" }))
      await waitFor(() => expect(canvas.getByTestId("attachment-count")).toHaveTextContent("1"))
    })
    await step("Backspace on empty textarea removes the attachment", async () => {
      await userEvent.click(canvas.getByPlaceholderText("Ask anything..."))
      await userEvent.keyboard("{Backspace}")
      await waitFor(() => expect(canvas.getByTestId("attachment-count")).toHaveTextContent("0"))
    })
  },
}

/** Pasting an image file into the textarea adds it as an attachment. */
export const PasteFileIntoTextarea: Story = {
  args: {
    onSubmit: fn(),
  },
  render: (args) => {
    const AttachmentCount = () => {
      const { files } = usePromptInputAttachments()
      return <span data-testid="attachment-count">{files.length}</span>
    }
    return (
      <PromptCard className="max-w-2xl">
        <PromptInput
          onSubmit={args.onSubmit as (msg: PromptInputMessage, e: React.FormEvent<HTMLFormElement>) => void}
        >
          <PromptInputHeader>
            <AttachmentCount />
          </PromptInputHeader>
          <PromptInputBody>
            <PromptInputTextarea onChange={() => {}} placeholder="Ask anything..." value="" />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools />
            <PromptInputSubmit />
          </PromptInputFooter>
        </PromptInput>
      </PromptCard>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Pasting an image file adds it as an attachment", async () => {
      const file = new File(["png-data"], "screenshot.png", { type: "image/png" })
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)

      const textarea = canvas.getByPlaceholderText("Ask anything...")
      textarea.focus()

      textarea.dispatchEvent(
        new ClipboardEvent("paste", {
          bubbles: true,
          cancelable: true,
          clipboardData: dataTransfer,
        })
      )

      await waitFor(() => expect(canvas.getByTestId("attachment-count")).toHaveTextContent("1"))
    })
  },
}

/** PromptInputProvider: textarea is controlled externally and cleared after submit. */
export const ProviderClearsAfterSubmit: Story = {
  render: () => (
    <PromptInputProvider>
      <PromptCard className="max-w-2xl">
        <PromptInput onSubmit={async () => {}}>
          <PromptInputBody>
            <PromptInputTextarea placeholder="Type here..." />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools />
            <PromptInputSubmit />
          </PromptInputFooter>
        </PromptInput>
      </PromptCard>
    </PromptInputProvider>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const textarea = canvas.getByPlaceholderText("Type here...")
    await step("Type text using provider-controlled textarea", async () => {
      await userEvent.type(textarea, "Hello provider")
      await expect(textarea).toHaveValue("Hello provider")
    })
    await step("Successful submit clears the textarea via provider", async () => {
      await userEvent.keyboard("{Enter}")
      await waitFor(() => expect(textarea).toHaveValue(""))
    })
  },
}

/** PromptInputProvider: text is retained when onSubmit rejects (user can retry). */
export const ProviderRetainsTextOnError: Story = {
  render: () => {
    const failingSubmit = async () => { throw new Error("Server error") }
    return (
      <PromptInputProvider>
        <PromptCard className="max-w-2xl">
          <PromptInput onSubmit={failingSubmit}>
            <PromptInputBody>
              <PromptInputTextarea placeholder="Type here..." />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools />
              <PromptInputSubmit />
            </PromptInputFooter>
          </PromptInput>
        </PromptCard>
      </PromptInputProvider>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const textarea = canvas.getByPlaceholderText("Type here...")
    await step("Type a message", async () => {
      await userEvent.type(textarea, "My message")
      await expect(textarea).toHaveValue("My message")
    })
    await step("After a failing async submit, text is retained for retry", async () => {
      await userEvent.keyboard("{Enter}")
      // Give the rejected promise time to settle
      await new Promise((r) => setTimeout(r, 100))
      await expect(textarea).toHaveValue("My message")
    })
  },
}

/** PromptInputProvider: file accept + size validation goes through addWithProviderValidation. */
export const ProviderFileValidation: Story = {
  args: {
    onError: fn(),
  },
  render: (args) => (
    <PromptInputProvider>
      <PromptCard className="max-w-2xl">
        <PromptInput
          accept="image/*"
          maxFileSize={50}
          maxFiles={1}
          multiple
          onError={args.onError as (err: { code: string; message: string }) => void}
          onSubmit={() => {}}
        >
          <PromptInputHeader>
            <AttachmentCount />
          </PromptInputHeader>
          <PromptInputBody>
            <PromptInputTextarea onChange={() => {}} placeholder="Ask anything..." value="" />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools />
            <PromptInputSubmit />
          </PromptInputFooter>
        </PromptInput>
      </PromptCard>
    </PromptInputProvider>
  ),
  play: async ({ args, canvasElement, step }) => {
    await step("Dragging a wrong-type file fires accept error through provider validation", async () => {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(new File(["text"], "doc.txt", { type: "text/plain" }))
      const form = canvasElement.querySelector("form")!
      form.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer }))
      await waitFor(() => expect(args.onError).toHaveBeenCalledWith(
        expect.objectContaining({ code: "accept" })
      ))
    })
    await step("Uploading an oversized image fires max_file_size error through provider validation", async () => {
      const fileInput = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!
      await userEvent.upload(fileInput, new File(["x".repeat(100)], "big.png", { type: "image/png" }))
      await waitFor(() => expect(args.onError).toHaveBeenCalledWith(
        expect.objectContaining({ code: "max_file_size" })
      ))
    })
    await step("Uploading too many valid files fires max_files through provider validation", async () => {
      const fileInput = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!
      await userEvent.upload(fileInput, [
        new File(["a"], "a.png", { type: "image/png" }),
        new File(["b"], "b.png", { type: "image/png" }),
      ])
      await waitFor(() => expect(args.onError).toHaveBeenCalledWith(
        expect.objectContaining({ code: "max_files" })
      ))
      await waitFor(() => expect(within(canvasElement).getByTestId("attachment-count")).toHaveTextContent("1"))
    })
  },
}

/** PromptInputButton string tooltip — tooltip content and optional shortcut render. */
export const ButtonStringTooltip: Story = {
  render: () => (
    <PromptCard className="max-w-2xl">
      <PromptInput onSubmit={() => {}}>
        <PromptInputBody>
          <PromptInputTextarea onChange={() => {}} placeholder="Ask anything..." value="" />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputButton tooltip="Format text">Aa</PromptInputButton>
            <PromptInputButton tooltip={{ content: "Attach", shortcut: "⌘K" }}>+</PromptInputButton>
          </PromptInputTools>
          <PromptInputSubmit />
        </PromptInputFooter>
      </PromptInput>
    </PromptCard>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("String tooltip button renders", async () => {
      await expect(canvas.getByRole("button", { name: "Aa" })).toBeInTheDocument()
    })
    await step("Object tooltip button with shortcut renders", async () => {
      await expect(canvas.getByRole("button", { name: "+" })).toBeInTheDocument()
    })
    await step("Hovering string tooltip button shows Format text tooltip", async () => {
      await userEvent.hover(canvas.getByRole("button", { name: "Aa" }))
      // findByRole waits for the element to appear (Radix adds role="tooltip" to TooltipContent)
      await expect(await screen.findByRole("tooltip")).toHaveTextContent("Format text")
    })
    await step("Hovering object tooltip button shows shortcut ⌘K", async () => {
      // Unhover first button so its tooltip closes before the next one opens
      await userEvent.unhover(canvas.getByRole("button", { name: "Aa" }))
      await userEvent.hover(canvas.getByRole("button", { name: "+" }))
      await waitFor(() => expect(screen.getByRole("tooltip")).toHaveTextContent("⌘K"))
    })
  },
}

/** Local attachments are converted from blob URLs to data URLs before submit. */
export const BlobAttachmentSubmitConversion: Story = {
  args: {
    onSubmit: fn(),
  },
  render: (args) => (
    <PromptCard className="max-w-2xl">
      <PromptInput
        accept="text/plain"
        onSubmit={args.onSubmit as (msg: PromptInputMessage, e: React.FormEvent<HTMLFormElement>) => void}
        syncHiddenInput
      >
        <PromptInputHeader>
          <AttachmentCount />
        </PromptInputHeader>
        <PromptInputBody>
          <PromptInputTextarea onChange={() => {}} placeholder="Ask anything..." value="" />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools />
          <PromptInputSubmit />
        </PromptInputFooter>
      </PromptInput>
    </PromptCard>
  ),
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Uploading an accepted exact MIME type adds one attachment", async () => {
      const fileInput = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!
      await userEvent.upload(fileInput, new File(["hello"], "note.txt", { type: "text/plain" }))
      await waitFor(() => expect(canvas.getByTestId("attachment-count")).toHaveTextContent("1"))
    })

    await step("Submitting converts the blob URL attachment to a data URL", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /submit/i }))
      await waitFor(() =>
        expect(args.onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            files: expect.arrayContaining([
              expect.objectContaining({
                filename: "note.txt",
                url: expect.stringMatching(/^data:text\/plain/),
              }),
            ]),
            text: "",
          }),
          expect.anything()
        )
      )
      await waitFor(() => expect(canvas.getByTestId("attachment-count")).toHaveTextContent("0"))
    })
  },
}

/** Provider hooks can update text, add/remove/clear files, and clean up on unmount. */
export const ProviderAttachmentControls: Story = {
  render: () => {
    const [mounted, setMounted] = useState(true)

    if (!mounted) {
      return <span>Provider unmounted</span>
    }

    return (
      <PromptInputProvider>
        <PromptCard className="max-w-2xl">
          <PromptInput onSubmit={() => {}}>
            <PromptInputHeader>
              <ProviderControlPanel onUnmount={() => setMounted(false)} />
            </PromptInputHeader>
            <PromptInputBody>
              <PromptInputTextarea placeholder="Provider prompt..." />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools />
              <PromptInputSubmit />
            </PromptInputFooter>
          </PromptInput>
        </PromptCard>
      </PromptInputProvider>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Provider controller updates textarea text", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Set provider text" }))
      await expect(canvas.getByPlaceholderText("Provider prompt...")).toHaveValue("Provider text")
      await expect(canvas.getByTestId("provider-text")).toHaveTextContent("Provider text")
    })

    await step("Provider add ignores empty lists and adds real files", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Add empty provider files" }))
      await expect(canvas.getByTestId("provider-attachment-count")).toHaveTextContent("0")
      await userEvent.click(canvas.getByRole("button", { name: "Add provider file" }))
      await waitFor(() => expect(canvas.getByTestId("provider-attachment-count")).toHaveTextContent("1"))
    })

    await step("Provider remove and clear update attachment state", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Remove provider file" }))
      await waitFor(() => expect(canvas.getByTestId("provider-attachment-count")).toHaveTextContent("0"))
      await userEvent.click(canvas.getByRole("button", { name: "Add provider file" }))
      await userEvent.click(canvas.getByRole("button", { name: "Add provider file" }))
      await waitFor(() => expect(canvas.getByTestId("provider-attachment-count")).toHaveTextContent("2"))
      await userEvent.click(canvas.getByRole("button", { name: "Clear provider files" }))
      await waitFor(() => expect(canvas.getByTestId("provider-attachment-count")).toHaveTextContent("0"))
    })

    await step("Provider openFileDialog and unmount cleanup paths run", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Open provider file dialog" }))
      await userEvent.click(canvas.getByRole("button", { name: "Add provider file" }))
      await waitFor(() => expect(canvas.getByTestId("provider-attachment-count")).toHaveTextContent("1"))
      await userEvent.click(canvas.getByRole("button", { name: "Unmount provider" }))
      await expect(canvas.getByText("Provider unmounted")).toBeInTheDocument()
    })
  },
}

/** Referenced source helpers add, remove, and clear local PromptInput sources. */
export const ReferencedSourcesControls: Story = {
  render: () => (
    <PromptCard className="max-w-2xl">
      <PromptInput onSubmit={() => {}}>
        <PromptInputHeader>
          <ReferencedSourcesPanel />
        </PromptInputHeader>
        <PromptInputBody>
          <PromptInputTextarea onChange={() => {}} placeholder="Ask anything..." value="" />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools />
          <PromptInputSubmit />
        </PromptInputFooter>
      </PromptInput>
    </PromptCard>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Referenced sources can be added one at a time and in arrays", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Add source" }))
      await waitFor(() => expect(canvas.getByTestId("source-count")).toHaveTextContent("1"))
      await userEvent.click(canvas.getByRole("button", { name: "Add source list" }))
      await waitFor(() => expect(canvas.getByTestId("source-count")).toHaveTextContent("3"))
    })

    await step("Referenced sources can be removed and cleared", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Remove source" }))
      await waitFor(() => expect(canvas.getByTestId("source-count")).toHaveTextContent("2"))
      await userEvent.click(canvas.getByRole("button", { name: "Clear sources" }))
      await waitFor(() => expect(canvas.getByTestId("source-count")).toHaveTextContent("0"))
    })
  },
}

/** Global drag/drop attaches files from document-level handlers. */
export const GlobalDropAttachments: Story = {
  render: () => (
    <PromptCard className="max-w-2xl">
      <PromptInput globalDrop onSubmit={() => {}}>
        <PromptInputHeader>
          <AttachmentCount />
        </PromptInputHeader>
        <PromptInputBody>
          <PromptInputTextarea onChange={() => {}} placeholder="Ask anything..." value="" />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools />
          <PromptInputSubmit />
        </PromptInputFooter>
      </PromptInput>
    </PromptCard>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Document dragover prevents default for files", async () => {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(new File(["dropped"], "dropped.txt", { type: "text/plain" }))
      const dragOver = new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer })
      document.dispatchEvent(dragOver)
      await expect(dragOver.defaultPrevented).toBe(true)
    })

    await step("Document drop adds file attachment", async () => {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(new File(["dropped"], "dropped.txt", { type: "text/plain" }))
      document.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer }))
      await waitFor(() => expect(canvas.getByTestId("attachment-count")).toHaveTextContent("1"))
    })
  },
}

/** Keyboard guard paths skip submit when handlers prevent or composition/disabled states apply. */
export const KeyboardSubmitGuards: Story = {
  args: {
    onSubmit: fn(),
    onKeyDown: fn((event: React.KeyboardEvent<HTMLTextAreaElement>) => event.preventDefault()),
  },
  render: (args) => {
    const [text, setText] = useState("")
    return (
      <PromptCard className="max-w-2xl">
        <PromptInput onSubmit={args.onSubmit as (msg: PromptInputMessage, e: React.FormEvent<HTMLFormElement>) => void}>
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e) => setText(e.target.value)}
              onKeyDown={args.onKeyDown as React.KeyboardEventHandler<HTMLTextAreaElement>}
              placeholder="Guarded prompt..."
              value={text}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools />
            <PromptInputSubmit disabled />
          </PromptInputFooter>
        </PromptInput>
      </PromptCard>
    )
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    const textarea = canvas.getByPlaceholderText("Guarded prompt...")

    await step("External onKeyDown can prevent internal submit handling", async () => {
      await userEvent.type(textarea, "Blocked")
      await userEvent.keyboard("{Enter}")
      await expect(args.onKeyDown).toHaveBeenCalled()
      await expect(args.onSubmit).not.toHaveBeenCalled()
    })
  },
}

/** Composition Enter and disabled submit buttons do not submit the prompt. */
export const CompositionAndDisabledSubmitGuards: Story = {
  args: {
    onSubmit: fn(),
  },
  render: (args) => {
    const [text, setText] = useState("")
    return (
      <PromptCard className="max-w-2xl">
        <PromptInput onSubmit={args.onSubmit as (msg: PromptInputMessage, e: React.FormEvent<HTMLFormElement>) => void}>
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e) => setText(e.target.value)}
              placeholder="Composing prompt..."
              value={text}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools />
            <PromptInputSubmit disabled />
          </PromptInputFooter>
        </PromptInput>
      </PromptCard>
    )
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    const textarea = canvas.getByPlaceholderText("Composing prompt...")

    await step("Enter during composition does not submit", async () => {
      await userEvent.type(textarea, "Draft")
      textarea.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }))
      await userEvent.keyboard("{Enter}")
      textarea.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }))
      await expect(args.onSubmit).not.toHaveBeenCalled()
    })

    await step("Enter with a disabled submit button does not submit", async () => {
      await userEvent.keyboard("{Enter}")
      await expect(args.onSubmit).not.toHaveBeenCalled()
    })
  },
}

/** Paste events with no clipboard items are ignored. */
export const PasteWithoutClipboardItems: Story = {
  render: () => (
    <PromptCard className="max-w-2xl">
      <PromptInput onSubmit={() => {}}>
        <PromptInputHeader>
          <AttachmentCount />
        </PromptInputHeader>
        <PromptInputBody>
          <PromptInputTextarea onChange={() => {}} placeholder="Ask anything..." value="" />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools />
          <PromptInputSubmit />
        </PromptInputFooter>
      </PromptInput>
    </PromptCard>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Pasting without clipboardData items does not add attachments", async () => {
      const textarea = canvas.getByPlaceholderText("Ask anything...")
      textarea.dispatchEvent(new ClipboardEvent("paste", { bubbles: true, cancelable: true }))
      await expect(canvas.getByTestId("attachment-count")).toHaveTextContent("0")
    })
  },
}

/** Error-state submit button renders and delegates regular clicks to onClick. */
export const ErrorSubmitClick: Story = {
  args: {
    onClick: fn(),
  },
  render: (args) => (
    <PromptCard className="max-w-2xl">
      <PromptInput onSubmit={() => {}}>
        <PromptInputBody>
          <PromptInputTextarea onChange={() => {}} placeholder="Ask anything..." value="Retry this" />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools />
          <PromptInputSubmit onClick={args.onClick as React.MouseEventHandler<HTMLButtonElement>} status="error" />
        </PromptInputFooter>
      </PromptInput>
    </PromptCard>
  ),
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Clicking an error-status submit calls onClick", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /submit/i }))
      await expect(args.onClick).toHaveBeenCalledOnce()
    })
  },
}

/** PromptInput wrapper primitives render hover cards, tabs, commands, and custom menu items. */
export const WrapperPrimitives: Story = {
  args: {
    onCustomAction: fn(),
  },
  render: (args) => (
    <div className="flex max-w-2xl flex-col gap-4">
      <PromptCard>
        <PromptInput onSubmit={() => {}}>
          <PromptInputBody>
            <PromptInputTextarea onChange={() => {}} placeholder="Ask anything..." value="" />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputButton>Plain</PromptInputButton>
              <PromptInputButton>
                <span>A</span>
                <span>B</span>
              </PromptInputButton>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger tooltip="More actions" />
                <PromptInputActionMenuContent>
                  <PromptInputActionMenuItem onSelect={args.onCustomAction as () => void}>
                    Custom action
                  </PromptInputActionMenuItem>
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
            </PromptInputTools>
            <PromptInputSubmit />
          </PromptInputFooter>
        </PromptInput>
      </PromptCard>

      <PromptInputHoverCard>
        <PromptInputHoverCardTrigger asChild>
          <button type="button">Hover details</button>
        </PromptInputHoverCardTrigger>
        <PromptInputHoverCardContent>Helpful hover content</PromptInputHoverCardContent>
      </PromptInputHoverCard>

      <PromptInputTabsList>
        <PromptInputTab>
          <PromptInputTabLabel>Recent tools</PromptInputTabLabel>
          <PromptInputTabBody>
            <PromptInputTabItem>Search docs</PromptInputTabItem>
          </PromptInputTabBody>
        </PromptInputTab>
      </PromptInputTabsList>

      <PromptInputCommand>
        <PromptInputCommandInput placeholder="Search commands" />
        <PromptInputCommandList>
          <PromptInputCommandEmpty>No command found</PromptInputCommandEmpty>
          <PromptInputCommandGroup heading="Actions">
            <PromptInputCommandItem value="summarize">Summarize</PromptInputCommandItem>
            <PromptInputCommandSeparator />
          </PromptInputCommandGroup>
        </PromptInputCommandList>
      </PromptInputCommand>
    </div>
  ),
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Custom prompt buttons and menu item render and run", async () => {
      await expect(canvas.getByRole("button", { name: "Plain" })).toBeInTheDocument()
      await expect(canvas.getByRole("button", { name: "A B" })).toBeInTheDocument()
      await userEvent.click(canvas.getByRole("button", { name: "More actions" }))
      await userEvent.click(await screen.findByText("Custom action"))
      await expect(args.onCustomAction).toHaveBeenCalledOnce()
    })

    await step("Hover card content appears on hover", async () => {
      await userEvent.hover(canvas.getByRole("button", { hidden: true, name: "Hover details" }))
      await expect(await screen.findByText("Helpful hover content")).toBeInTheDocument()
    })

    await step("Tabs and command wrappers render content", async () => {
      await expect(canvas.getByText("Recent tools")).toBeInTheDocument()
      await expect(canvas.getByText("Search docs")).toBeInTheDocument()
      await expect(canvas.getByPlaceholderText("Search commands")).toBeInTheDocument()
      await expect(canvas.getByText("Summarize")).toBeInTheDocument()
    })
  },
}

/** Screenshot action captures screen media and adds it as an attachment. */
export const ScreenshotActionAddsAttachment: Story = {
  args: {
    onCustomAction: fn(),
  },
  render: (args) => (
    <PromptCard className="max-w-2xl">
      <PromptInput onSubmit={() => {}}>
        <PromptInputHeader>
          <AttachmentCount />
        </PromptInputHeader>
        <PromptInputBody>
          <PromptInputTextarea onChange={() => {}} placeholder="Ask anything..." value="" />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger tooltip="Capture tools" />
              <PromptInputActionMenuContent>
                <PromptInputActionMenuItem onSelect={args.onCustomAction as () => void}>
                  Custom action
                </PromptInputActionMenuItem>
                <PromptInputActionAddScreenshot
                  label="Prevent screenshot"
                  onSelect={(event) => event.preventDefault()}
                />
                <PromptInputActionAddScreenshot />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
          </PromptInputTools>
          <PromptInputSubmit />
        </PromptInputFooter>
      </PromptInput>
    </PromptCard>
  ),
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    const stopTrack = fn()
    const drawImage = fn()
    const originalMediaDevices = navigator.mediaDevices
    const originalPlay = HTMLMediaElement.prototype.play
    const originalPause = HTMLMediaElement.prototype.pause
    const originalGetContext = HTMLCanvasElement.prototype.getContext
    const originalToBlob = HTMLCanvasElement.prototype.toBlob
    const originalSrcObjectDescriptor = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "srcObject")
    const originalVideoWidthDescriptor = Object.getOwnPropertyDescriptor(HTMLVideoElement.prototype, "videoWidth")
    const originalVideoHeightDescriptor = Object.getOwnPropertyDescriptor(HTMLVideoElement.prototype, "videoHeight")

    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        ...originalMediaDevices,
        getDisplayMedia: fn(async () => ({
          getTracks: () => [{ stop: stopTrack }],
        })),
      },
    })
    Object.defineProperty(HTMLMediaElement.prototype, "srcObject", {
      configurable: true,
      get() {
        return (this as HTMLMediaElement & { __srcObject?: MediaStream | null }).__srcObject ?? null
      },
      set(value) {
        ;(this as HTMLMediaElement & { __srcObject?: MediaStream | null }).__srcObject = value as MediaStream | null
        if (value) {
          queueMicrotask(() => this.onloadedmetadata?.(new Event("loadedmetadata")))
        }
      },
    })
    Object.defineProperty(HTMLVideoElement.prototype, "videoWidth", {
      configurable: true,
      get: () => 16,
    })
    Object.defineProperty(HTMLVideoElement.prototype, "videoHeight", {
      configurable: true,
      get: () => 9,
    })
    Object.defineProperty(HTMLMediaElement.prototype, "play", {
      configurable: true,
      value: fn(async () => {}),
    })
    Object.defineProperty(HTMLMediaElement.prototype, "pause", {
      configurable: true,
      value: fn(),
    })
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      configurable: true,
      value: fn(() => ({ drawImage })),
    })
    Object.defineProperty(HTMLCanvasElement.prototype, "toBlob", {
      configurable: true,
      value: (callback: BlobCallback) => callback(new Blob(["png"], { type: "image/png" })),
    })

    await step("Custom menu item can prevent the screenshot action machinery", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Capture tools" }))
      await userEvent.click(await screen.findByText("Custom action"))
      await expect(args.onCustomAction).toHaveBeenCalledOnce()
      await userEvent.click(canvas.getByRole("button", { hidden: true, name: "Capture tools" }))
      await userEvent.click(await screen.findByText("Prevent screenshot"))
      await expect(canvas.getByTestId("attachment-count")).toHaveTextContent("0")
    })

    await step("Screenshot action captures media, stops the track, and adds attachment", async () => {
      await userEvent.click(canvas.getByRole("button", { hidden: true, name: "Capture tools" }))
      await userEvent.click(await screen.findByText("Take screenshot"))
      await waitFor(() => expect(canvas.getByTestId("attachment-count")).toHaveTextContent("1"))
      await expect(drawImage).toHaveBeenCalled()
      await expect(stopTrack).toHaveBeenCalledOnce()
    })

    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: originalMediaDevices,
    })
    Object.defineProperty(HTMLMediaElement.prototype, "play", {
      configurable: true,
      value: originalPlay,
    })
    Object.defineProperty(HTMLMediaElement.prototype, "pause", {
      configurable: true,
      value: originalPause,
    })
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      configurable: true,
      value: originalGetContext,
    })
    Object.defineProperty(HTMLCanvasElement.prototype, "toBlob", {
      configurable: true,
      value: originalToBlob,
    })
    if (originalSrcObjectDescriptor) {
      Object.defineProperty(HTMLMediaElement.prototype, "srcObject", originalSrcObjectDescriptor)
    }
    if (originalVideoWidthDescriptor) {
      Object.defineProperty(HTMLVideoElement.prototype, "videoWidth", originalVideoWidthDescriptor)
    }
    if (originalVideoHeightDescriptor) {
      Object.defineProperty(HTMLVideoElement.prototype, "videoHeight", originalVideoHeightDescriptor)
    }
  },
}
