import { expect, within } from "storybook/test"

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "./input-otp"

import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta<typeof InputOTP> = {
  title: "Components/Input OTP",
  component: InputOTP,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    maxLength: 6,
    value: "123456",
  },
}

export default meta

type Story = StoryObj<typeof InputOTP>

function renderOtp(args: Story["args"], withSeparator = false) {
  return (
    <InputOTP {...args}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      {withSeparator && <InputOTPSeparator />}
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  )
}

export const Default: Story = {
  render: renderOtp,
  parameters: {
    zephyr: { testCaseId: "SW-T1255" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("OTP slots display entered digits", async () => {
      expect(canvas.getByText("1")).toBeInTheDocument()
      expect(canvas.getByText("2")).toBeInTheDocument()
      expect(canvas.getByText("3")).toBeInTheDocument()
      expect(canvas.getByText("4")).toBeInTheDocument()
      expect(canvas.getByText("5")).toBeInTheDocument()
      expect(canvas.getByText("6")).toBeInTheDocument()
    })
  },
}

export const WithSeparator: Story = {
  render: (args) => renderOtp(args, true),
  parameters: {
    zephyr: { testCaseId: "SW-T1256" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("OTP slots display entered digits", async () => {
      expect(canvas.getByText("1")).toBeInTheDocument()
      expect(canvas.getByText("6")).toBeInTheDocument()
    })

    await step("Separator between OTP groups is present", async () => {
      expect(canvas.getByRole("separator")).toBeInTheDocument()
    })
  },
}