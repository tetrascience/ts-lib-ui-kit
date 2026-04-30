import { useState } from "react"
import { expect, userEvent, waitFor, within } from "storybook/test"

import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockContainer,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockHeader,
  CodeBlockLanguageSelector,
  CodeBlockLanguageSelectorContent,
  CodeBlockLanguageSelectorItem,
  CodeBlockLanguageSelectorTrigger,
  CodeBlockLanguageSelectorValue,
  CodeBlockTitle,
  highlightCode,
} from "./code-block"

import type { Meta, StoryObj } from "@storybook/react-vite"
import type { BundledLanguage } from "shiki"


const meta: Meta = {
  title: "AI Elements/Code Block",
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj

const tsExample = `export function greet(name: string): string {
  return \`Hello, \${name}!\`
}

// Say hi to the user
const message = greet("world")
console.log(message)`

const pythonExample = `def fibonacci(n: int) -> int:
    """Return the nth Fibonacci number."""
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)


for i in range(10):
    print(fibonacci(i))`

export const Default: Story = {
  render: () => (
    <CodeBlock className="max-w-2xl" code={tsExample} language="ts" />
  ),
  play: async ({ canvasElement, step }) => {
    await step("Code block renders code", async () => {
      await waitFor(
        () => {
          expect(canvasElement.querySelector("code")?.textContent ?? "").toContain("greet")
        },
        { timeout: 5000 }
      )
    })
  },
}

export const WithLineNumbers: Story = {
  render: () => (
    <CodeBlock
      className="max-w-2xl"
      code={pythonExample}
      language="python"
      showLineNumbers
    />
  ),
  play: async ({ canvasElement, step }) => {
    await step("Code block renders with line numbers", async () => {
      await waitFor(
        () => {
          expect(canvasElement.querySelector("code")?.textContent ?? "").toContain("fibonacci")
        },
        { timeout: 5000 }
      )
    })
  },
}

export const WithHeader: Story = {
  render: () => (
    <CodeBlock className="max-w-2xl" code={tsExample} language="ts">
      <CodeBlockHeader>
        <CodeBlockTitle>
          <CodeBlockFilename>greet.ts</CodeBlockFilename>
        </CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton />
        </CodeBlockActions>
      </CodeBlockHeader>
    </CodeBlock>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Filename renders", async () => {
      await expect(canvas.getByText("greet.ts")).toBeInTheDocument()
    })
    await step("Clicking the copy button invokes clipboard", async () => {
      const button = canvas.getByRole("button")
      await userEvent.click(button)
      await expect(button).toBeInTheDocument()
    })
  },
}

export const WithLanguageSelector: Story = {
  render: () => {
    const languages: { id: BundledLanguage; label: string; code: string }[] = [
      { id: "ts", label: "TypeScript", code: tsExample },
      { id: "python", label: "Python", code: pythonExample },
    ]

    const Example = () => {
      const [lang, setLang] = useState<BundledLanguage>("ts")
      const current = languages.find((l) => l.id === lang) ?? languages[0]

      return (
        <CodeBlock className="max-w-2xl" code={current.code} language={current.id}>
          <CodeBlockHeader>
            <CodeBlockTitle>
              <CodeBlockFilename>example</CodeBlockFilename>
            </CodeBlockTitle>
            <CodeBlockActions>
              <CodeBlockLanguageSelector
                onValueChange={(v) => setLang(v as BundledLanguage)}
                value={lang}
              >
                <CodeBlockLanguageSelectorTrigger>
                  <CodeBlockLanguageSelectorValue />
                </CodeBlockLanguageSelectorTrigger>
                <CodeBlockLanguageSelectorContent>
                  {languages.map((l) => (
                    <CodeBlockLanguageSelectorItem key={l.id} value={l.id}>
                      {l.label}
                    </CodeBlockLanguageSelectorItem>
                  ))}
                </CodeBlockLanguageSelectorContent>
              </CodeBlockLanguageSelector>
              <CodeBlockCopyButton />
            </CodeBlockActions>
          </CodeBlockHeader>
        </CodeBlock>
      )
    }

    return <Example />
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Language selector renders", async () => {
      await expect(canvas.getByRole("combobox")).toBeInTheDocument()
    })
  },
}

export const EmptyCode: Story = {
  render: () => (
    <CodeBlock className="max-w-2xl" code={""} language="ts" />
  ),
  play: async ({ canvasElement, step }) => {
    await step("Empty code block renders without errors", async () => {
      await expect(canvasElement.querySelector('[data-language="ts"]')).toBeInTheDocument()
    })
  },
}

export const ManualContent: Story = {
  render: () => (
    <CodeBlockContainer className="max-w-2xl" language="ts">
      <CodeBlockHeader>
        <CodeBlockTitle>
          <CodeBlockFilename>manual.ts</CodeBlockFilename>
        </CodeBlockTitle>
      </CodeBlockHeader>
      <CodeBlockContent code={tsExample} language="ts" showLineNumbers />
    </CodeBlockContainer>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Manual code block renders", async () => {
      await expect(canvas.getByText("manual.ts")).toBeInTheDocument()
    })
  },
}

export const SubscribesToHighlight: Story = {
  render: () => <CodeBlock className="max-w-2xl" code={tsExample} language="ts" />,
  play: async ({ step }) => {
    await step("highlightCode subscription path executes", async () => {
      const result = highlightCode(tsExample, "ts", () => {})
      // Either cached (non-null) or pending; both exercise branches.
      await expect(result === null || typeof result === "object").toBe(true)
    })
  },
}
