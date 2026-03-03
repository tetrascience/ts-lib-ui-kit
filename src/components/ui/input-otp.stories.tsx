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
}

export const WithSeparator: Story = {
  render: (args) => renderOtp(args, true),
  parameters: {
    zephyr: { testCaseId: "SW-T1256" },
  },
}