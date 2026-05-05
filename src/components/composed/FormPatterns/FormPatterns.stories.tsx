import { useState } from "react"
import { expect, userEvent, within } from "storybook/test"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"

import { FormSection } from "./FormSection"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof FormSection> = {
  title: "Design Patterns/FormPatterns",
  component: FormSection,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[520px]">
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof FormSection>

export const SingleSection: Story = {
  args: {
    title: "Project details",
    description: "Basic information about this project.",
  },
  render: (args) => (
    <FormSection {...args}>
      <Field>
        <FieldLabel htmlFor="single-name">
          <FieldTitle>Project name</FieldTitle>
        </FieldLabel>
        <FieldContent>
          <Input id="single-name" placeholder="Enter project name" />
          <FieldDescription>Used in dashboards and exports.</FieldDescription>
        </FieldContent>
      </Field>
      <Field>
        <FieldLabel htmlFor="single-desc">
          <FieldTitle>Description</FieldTitle>
        </FieldLabel>
        <FieldContent>
          <Input id="single-desc" placeholder="Short description (optional)" />
        </FieldContent>
      </Field>
    </FormSection>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T1527" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Section title renders", async () => {
      expect(canvas.getByText("Project details")).toBeInTheDocument()
    })

    await step("Fields render", async () => {
      expect(canvas.getByPlaceholderText("Enter project name")).toBeInTheDocument()
    })
  },
}

export const SectionedForm: Story = {
  render: () => (
    <form className="flex flex-col gap-8">
      <FormSection title="Personal info">
        <Field>
          <FieldLabel htmlFor="sf-first">
            <FieldTitle>First name</FieldTitle>
          </FieldLabel>
          <FieldContent>
            <Input id="sf-first" placeholder="First name" />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="sf-last">
            <FieldTitle>Last name</FieldTitle>
          </FieldLabel>
          <FieldContent>
            <Input id="sf-last" placeholder="Last name" />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="sf-email">
            <FieldTitle>Email address</FieldTitle>
          </FieldLabel>
          <FieldContent>
            <Input id="sf-email" type="email" placeholder="Email address" />
          </FieldContent>
        </Field>
      </FormSection>

      <FormSection title="Role & Access">
        <Field>
          <FieldLabel htmlFor="sf-role">
            <FieldTitle>Role</FieldTitle>
          </FieldLabel>
          <FieldContent>
            <Select>
              <SelectTrigger id="sf-role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>
        <Field orientation="horizontal">
          <FieldLabel htmlFor="sf-notifications">
            <FieldTitle>Email notifications</FieldTitle>
            <FieldDescription>Receive alerts for pipeline status changes.</FieldDescription>
          </FieldLabel>
          <FieldContent>
            <Switch id="sf-notifications" />
          </FieldContent>
        </Field>
      </FormSection>

      <FormSection title="Preferences">
        <Field>
          <FieldLabel htmlFor="sf-timezone">
            <FieldTitle>Timezone</FieldTitle>
          </FieldLabel>
          <FieldContent>
            <Select>
              <SelectTrigger id="sf-timezone">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="utc">UTC</SelectItem>
                <SelectItem value="est">EST (UTC-5)</SelectItem>
                <SelectItem value="pst">PST (UTC-8)</SelectItem>
                <SelectItem value="cet">CET (UTC+1)</SelectItem>
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="sf-language">
            <FieldTitle>Language</FieldTitle>
          </FieldLabel>
          <FieldContent>
            <Select>
              <SelectTrigger id="sf-language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>
      </FormSection>

      <Button type="submit" className="self-end">
        Save changes
      </Button>
    </form>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T1525" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("All three section titles render", async () => {
      expect(canvas.getByText("Personal info")).toBeInTheDocument()
      expect(canvas.getByText("Role & Access")).toBeInTheDocument()
      expect(canvas.getByText("Preferences")).toBeInTheDocument()
    })

    await step("Key form fields render", async () => {
      expect(canvas.getByPlaceholderText("First name")).toBeInTheDocument()
      expect(canvas.getByPlaceholderText("Email address")).toBeInTheDocument()
    })

    await step("Submit button renders", async () => {
      expect(
        canvas.getByRole("button", { name: "Save changes" })
      ).toBeInTheDocument()
    })
  },
}

export const WithValidation: Story = {
  render: () => (
    <form className="flex flex-col gap-8">
      <FormSection title="Personal info">
        <Field>
          <FieldLabel htmlFor="wv-first">
            <FieldTitle>First name</FieldTitle>
          </FieldLabel>
          <FieldContent>
            <Input
              id="wv-first"
              placeholder="First name"
              aria-invalid="true"
              className="border-destructive focus-visible:ring-destructive"
            />
            <FieldError>First name is required.</FieldError>
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="wv-email">
            <FieldTitle>Email address</FieldTitle>
          </FieldLabel>
          <FieldContent>
            <Input
              id="wv-email"
              type="email"
              placeholder="Email address"
              defaultValue="not-an-email"
              aria-invalid="true"
              className="border-destructive focus-visible:ring-destructive"
            />
            <FieldError>Enter a valid email address.</FieldError>
          </FieldContent>
        </Field>
      </FormSection>
      <Button type="submit" className="self-end">
        Save changes
      </Button>
    </form>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T1528" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Validation errors render below fields", async () => {
      expect(canvas.getByText("First name is required.")).toBeInTheDocument()
      expect(
        canvas.getByText("Enter a valid email address.")
      ).toBeInTheDocument()
    })
  },
}

const STEPS = [
  { label: "Personal info", id: 1 },
  { label: "Role & Access", id: 2 },
  { label: "Review", id: 3 },
]

function StepIndicator({
  step,
  current,
}: {
  step: (typeof STEPS)[number]
  current: number
}) {
  const done = step.id < current
  const active = step.id === current

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={
          "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold " +
          (done
            ? "bg-positive/20 text-positive"
            : active
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground")
        }
      >
        {done ? "✓" : step.id}
      </div>
      <span className="text-xs text-muted-foreground">{step.label}</span>
    </div>
  )
}

export const MultiStepForm: Story = {
  render: () => {
    const [step, setStep] = useState(1)
    const [submitting, setSubmitting] = useState(false)
    const [done, setDone] = useState(false)

    function handleSubmit() {
      setSubmitting(true)
      setTimeout(() => {
        setSubmitting(false)
        setDone(true)
      }, 1000)
    }

    if (done) {
      return (
        <div className="w-[520px]">
          <Alert variant="positive">
            <AlertTitle>Profile saved</AlertTitle>
            <AlertDescription>
              Your account has been set up successfully.
            </AlertDescription>
          </Alert>
          <Button
            variant="ghost"
            className="mt-4"
            onClick={() => {
              setStep(1)
              setDone(false)
            }}
          >
            Start over
          </Button>
        </div>
      )
    }

    return (
      <div className="flex w-[520px] flex-col gap-6">
        <div className="flex items-start justify-between">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <StepIndicator step={s} current={step} />
              {i < STEPS.length - 1 && (
                <div className="mx-2 mt-[-16px] h-px w-12 bg-border" />
              )}
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Step {step} of {STEPS.length}
        </p>

        {step === 1 && (
          <FormSection title="Personal info">
            <Field>
              <FieldLabel htmlFor="ms-first">
                <FieldTitle>First name</FieldTitle>
              </FieldLabel>
              <FieldContent>
                <Input id="ms-first" placeholder="First name" />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="ms-last">
                <FieldTitle>Last name</FieldTitle>
              </FieldLabel>
              <FieldContent>
                <Input id="ms-last" placeholder="Last name" />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="ms-email">
                <FieldTitle>Email address</FieldTitle>
              </FieldLabel>
              <FieldContent>
                <Input id="ms-email" type="email" placeholder="Email address" />
              </FieldContent>
            </Field>
          </FormSection>
        )}

        {step === 2 && (
          <FormSection title="Role & Access">
            <Field>
              <FieldLabel htmlFor="ms-role">
                <FieldTitle>Role</FieldTitle>
              </FieldLabel>
              <FieldContent>
                <Select>
                  <SelectTrigger id="ms-role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
            <Field orientation="horizontal">
              <FieldLabel htmlFor="ms-notifications">
                <FieldTitle>Email notifications</FieldTitle>
                <FieldDescription>
                  Receive alerts for pipeline events.
                </FieldDescription>
              </FieldLabel>
              <FieldContent>
                <Switch id="ms-notifications" />
              </FieldContent>
            </Field>
          </FormSection>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-3 rounded-lg border p-4 text-sm">
            <p className="font-semibold">Review your information</p>
            <p className="text-muted-foreground">
              Confirm the details above are correct before saving your profile.
            </p>
          </div>
        )}

        <div className="flex justify-between">
          <Button
            variant="outline"
            disabled={step === 1}
            onClick={() => setStep((s) => s - 1)}
          >
            Back
          </Button>
          {step < STEPS.length ? (
            <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Spinner size="sm" className="mr-2" />}
              Submit
            </Button>
          )}
        </div>
      </div>
    )
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1526" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Step 1 renders with step indicator", async () => {
      expect(canvas.getByText("Step 1 of 3")).toBeInTheDocument()
      expect(canvas.getByPlaceholderText("First name")).toBeInTheDocument()
    })

    await step("Clicking Next advances to step 2", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Next" }))
      expect(canvas.getByText("Step 2 of 3")).toBeInTheDocument()
      expect(canvas.getByText("Role & Access")).toBeInTheDocument()
    })

    await step("Clicking Back returns to step 1", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Back" }))
      expect(canvas.getByText("Step 1 of 3")).toBeInTheDocument()
    })
  },
}
