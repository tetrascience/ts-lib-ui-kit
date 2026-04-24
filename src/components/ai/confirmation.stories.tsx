import { CheckIcon, XIcon } from "lucide-react"
import { useState } from "react"
import { expect, userEvent, within } from "storybook/test"

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
} from "./confirmation"

import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta = {
  title: "AI Elements/Confirmation",
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj

const mockApproval = { id: "approval-1" }
const mockApprovalApproved = { id: "approval-1", approved: true as const }
const mockApprovalRejected = { id: "approval-1", approved: false as const }

// ---------------------------------------------------------------------------
// Default — command approval (Claude Code style)
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => (
    <div className="max-w-lg">
      <Confirmation approval={mockApproval} state="approval-requested">
        <ConfirmationTitle>Allow Claude to run ?</ConfirmationTitle>
        <ConfirmationRequest>
          <ConfirmationCode>
            {`find /Users/oseer/Development/git/ts-lib-ui-kit/src -name "*prompt*" -type f | grep -E "\\.(tsx|ts)$"`}
          </ConfirmationCode>
        </ConfirmationRequest>
        <ConfirmationActions>
          <ConfirmationAction variant="outline">
            Deny <ConfirmationShortcut>esc</ConfirmationShortcut>
          </ConfirmationAction>
          <div className="flex gap-2">
            <ConfirmationAction variant="outline">
              Allow once <ConfirmationShortcut>⌘⇧↩</ConfirmationShortcut>
            </ConfirmationAction>
            <ConfirmationAction variant="default">
              Always allow <ConfirmationShortcut>⌘↩</ConfirmationShortcut>
            </ConfirmationAction>
          </div>
        </ConfirmationActions>
      </Confirmation>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Confirmation renders with all three actions", async () => {
      await expect(canvas.getByText("Deny")).toBeInTheDocument()
      await expect(canvas.getByText("Always allow")).toBeInTheDocument()
    })
  },
}

// ---------------------------------------------------------------------------
// Accepted
// ---------------------------------------------------------------------------

export const Accepted: Story = {
  render: () => (
    <div className="max-w-lg">
      <Confirmation approval={mockApprovalApproved} state="output-available">
        <ConfirmationTitle>Allow Claude to run ?</ConfirmationTitle>
        <ConfirmationRequest>
          <ConfirmationCode>
            {`find /Users/oseer/Development/git/ts-lib-ui-kit/src -name "*prompt*" -type f | grep -E "\\.(tsx|ts)$"`}
          </ConfirmationCode>
        </ConfirmationRequest>
        <ConfirmationAccepted>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckIcon className="size-4 text-green-500" />
            <span>Allowed — command ran successfully</span>
          </div>
        </ConfirmationAccepted>
      </Confirmation>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Accepted state renders success message", async () => {
      await expect(canvas.getByText(/Allowed/)).toBeInTheDocument()
    })
  },
}

// ---------------------------------------------------------------------------
// Rejected
// ---------------------------------------------------------------------------

export const Rejected: Story = {
  render: () => (
    <div className="max-w-lg">
      <Confirmation approval={mockApprovalRejected} state="output-denied">
        <ConfirmationTitle>Allow Claude to run ?</ConfirmationTitle>
        <ConfirmationRequest>
          <ConfirmationCode>
            {`rm -rf /tmp/build-cache`}
          </ConfirmationCode>
        </ConfirmationRequest>
        <ConfirmationRejected>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <XIcon className="size-4 text-destructive" />
            <span>Denied — command was not executed</span>
          </div>
        </ConfirmationRejected>
      </Confirmation>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Rejected state renders denial message", async () => {
      await expect(canvas.getByText(/Denied/)).toBeInTheDocument()
    })
  },
}

// ---------------------------------------------------------------------------
// Interactive
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  render: () => {
    const [approved, setApproved] = useState<boolean | null>(null)

    const approval =
      approved === null ? mockApproval
      : approved ? mockApprovalApproved
      : mockApprovalRejected

    const state =
      approved === null ? "approval-requested"
      : approved ? "output-available"
      : "output-denied"

    return (
      <div className="max-w-lg">
        <Confirmation approval={approval} state={state}>
          <ConfirmationTitle>Allow Claude to run ?</ConfirmationTitle>
          <ConfirmationRequest>
            <ConfirmationCode>
              {`yarn tsc --noEmit && yarn lint`}
            </ConfirmationCode>
          </ConfirmationRequest>
          <ConfirmationAccepted>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckIcon className="size-4 text-green-500" />
              <span>Allowed — command ran successfully</span>
            </div>
          </ConfirmationAccepted>
          <ConfirmationRejected>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <XIcon className="size-4 text-destructive" />
              <span>Denied — command was not executed</span>
            </div>
          </ConfirmationRejected>
          <ConfirmationActions>
            <ConfirmationAction variant="outline" onClick={() => setApproved(false)}>
              Deny <ConfirmationShortcut>esc</ConfirmationShortcut>
            </ConfirmationAction>
            <div className="flex gap-2">
              <ConfirmationAction variant="outline" onClick={() => setApproved(true)}>
                Allow once <ConfirmationShortcut>⌘⇧↩</ConfirmationShortcut>
              </ConfirmationAction>
              <ConfirmationAction variant="default" onClick={() => setApproved(true)}>
                Always allow <ConfirmationShortcut>⌘↩</ConfirmationShortcut>
              </ConfirmationAction>
            </div>
          </ConfirmationActions>
        </Confirmation>
      </div>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Clicking Always allow shows accepted state", async () => {
      await expect(canvas.getByText(/yarn tsc/)).toBeInTheDocument()
      await userEvent.click(canvas.getByText("Always allow"))
      await expect(canvas.getByText(/Allowed/)).toBeInTheDocument()
    })
  },
}
