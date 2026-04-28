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
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputProvider,
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
      await expect(await screen.findByText(/Add photos or files/i)).toBeInTheDocument()
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
        <PromptInput onSubmit={() => {}}>
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
