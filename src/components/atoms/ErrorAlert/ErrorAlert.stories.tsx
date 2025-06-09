/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AxiosError } from "axios"; // Import type for creating mock errors
import { Button } from "../Button";
import { ErrorAlert } from "./ErrorAlert";

const action =
  (name: string) =>
  (...args: any[]) =>
    console.log(name, ...args);

// --- Mock AxiosError Factory ---
// A helper to create realistic-looking AxiosError objects for testing
const createMockAxiosError = (
  status: number,
  statusText: string,
  responseData: any,
  message: string = `Request failed with status code ${status}`,
  config: any = { url: "/api/data", method: "get" },
  request?: any, // Represents the XMLHttpRequest instance
  code?: string // e.g., 'ECONNABORTED'
): AxiosError => {
  const error = new Error(message) as AxiosError;
  error.isAxiosError = true;
  error.config = config;
  error.code = code;
  error.request = request; // Can be {} or undefined for response errors
  error.response = {
    data: responseData,
    status: status,
    statusText: statusText,
    headers: {},
    config: config,
  };
  // Simulate Error properties that AxiosError inherits
  error.name = "AxiosError";
  // Normally Axios doesn't provide a stack directly on the error object this way,
  // but we can add it for completeness in the story if desired.
  // error.stack = new Error().stack;
  return error;
};

const createMockNetworkError = (
  message: string = "Network Error",
  config: any = { url: "/api/data", method: "get" }
): AxiosError => {
  const error = new Error(message) as AxiosError;
  error.isAxiosError = true;
  error.config = config;
  error.request = {}; // Indicates request was made, but no response
  error.response = undefined;
  error.name = "AxiosError";
  error.code = "ERR_NETWORK"; // Common code for network issues
  return error;
};

// --- Storybook Meta ---
const meta: Meta<typeof ErrorAlert> = {
  title: "Atoms/ErrorAlert",
  component: ErrorAlert,
  tags: ["autodocs"],
  argTypes: {
    error: {
      control: "object",
      description: "The error object (Error, AxiosError, string, etc.)",
    },
    title: {
      control: "text",
      description: "Optional title for the error alert",
    },
    onClose: {
      action: "closed",
      description: "Callback function when the alert is closed",
    },
    showDetailsDefault: {
      control: "boolean",
      description: "Show details expanded by default",
    },
    noErrorContent: {
      control: "text",
      description: "Content to show when error is null/undefined",
    },
  },
  parameters: {
    // Optional: Add layout parameter if needed
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof ErrorAlert>;

// --- Stories ---

export const NoError: Story = {
  args: {
    error: null,
    title: "Status Indicator", // Example: use a different title when no error
    noErrorContent: "Everything is running smoothly.", // Example content for no error
  },
};

export const StandardError: Story = {
  args: {
    error: new Error("Something went wrong during processing."),
    title: "Processing Error",
    onClose: action("closed"),
  },
};

export const TypeErrorWithErrorStack: Story = {
  args: {
    error: (() => {
      try {
        // Intentionally cause a TypeError

        const x: any = null;
        x.doSomething(); // This will throw
      } catch (e) {
        return e;
      }
    })(),
    title: "Application Logic Error",
    onClose: action("closed"),
    showDetailsDefault: true,
  },
};

export const AxiosError404: Story = {
  args: {
    error: createMockAxiosError(
      404,
      "Not Found",
      { message: "The requested resource could not be found." },
      "Request failed with status code 404"
    ),
    title: "API Resource Not Found",
    onClose: action("closed"),
  },
};

export const AxiosError500WithStringData: Story = {
  args: {
    error: createMockAxiosError(
      500,
      "Internal Server Error",
      "An unexpected error occurred on the server.",
      "Request failed with status code 500"
    ),
    title: "Server Error",
    onClose: action("closed"),
  },
};

export const AxiosError400WithObjectData: Story = {
  args: {
    error: createMockAxiosError(
      400,
      "Bad Request",
      {
        code: "VALIDATION_ERROR",
        detail: "Username is required.",
        field: "username",
      },
      "Request failed with status code 400"
    ),
    title: "Validation Failed",
    onClose: action("closed"),
    showDetailsDefault: true,
  },
};

export const AxiosNetworkError: Story = {
  args: {
    error: createMockNetworkError(),
    title: "Connection Problem",
    onClose: action("closed"),
  },
};

export const StringError: Story = {
  args: {
    error: "Invalid user input provided.",
    title: "Input Error",
    onClose: action("closed"),
  },
};

export const ObjectError: Story = {
  args: {
    error: {
      code: 123,
      reason: "Custom error structure without standard message.",
      data: { info: "abc" },
    },
    title: "Custom Object Error",
    onClose: action("closed"),
    showDetailsDefault: true,
  },
};

// --- Interactive Example with State ---
export const Interactive: Story = {
  render: function InteractiveErrorHandler(args) {
    const [currentError, setCurrentError] = useState<unknown>(null);

    const triggerStandardError = () =>
      setCurrentError(new Error("A standard error occurred!"));
    const triggerAxiosError = () =>
      setCurrentError(
        createMockAxiosError(503, "Service Unavailable", {
          detail: "The service is temporarily down for maintenance.",
        })
      );
    const triggerNetworkError = () =>
      setCurrentError(createMockNetworkError("Failed to connect to backend."));
    const clearError = () => setCurrentError(null);

    return (
      <div>
        <div style={{ marginBottom: "16px" }}>
          <Button onClick={triggerStandardError} style={{ marginRight: "8px" }}>
            Trigger Standard Error
          </Button>
          <Button onClick={triggerAxiosError} style={{ marginRight: "8px" }}>
            Trigger Axios 503 Error
          </Button>
          <Button onClick={triggerNetworkError} style={{ marginRight: "8px" }}>
            Trigger Network Error
          </Button>
          <Button onClick={clearError} variant="primary">
            Clear Error
          </Button>
        </div>
        <ErrorAlert {...args} error={currentError} onClose={clearError} />
      </div>
    );
  },
  args: {
    // Default args for the interactive story - error will be controlled by state
    title: "Live Error Demo",
    showDetailsDefault: false,
    noErrorContent: "Click a button above to generate an error.",
  },
};
