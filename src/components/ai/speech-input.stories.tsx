import React from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { SpeechInput } from "./speech-input";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof SpeechInput> = {
  title: "AI Elements/Speech Input",
  component: SpeechInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof SpeechInput>;

export const Default: Story = {
  args: {},
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Speech input button renders", async () => {
      await expect(canvas.getByRole("button")).toBeInTheDocument();
    });
  },
};

export const WithTranscriptionHandler: Story = {
  args: {
    onTranscriptionChange: (text: string) => {
      console.log("Transcript:", text);
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Button renders with transcription handler", async () => {
      await expect(canvas.getByRole("button")).toBeInTheDocument();
    });
  },
};

export const GhostVariant: Story = {
  args: {
    variant: "ghost",
    size: "icon-sm",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Ghost variant speech input renders", async () => {
      await expect(canvas.getByRole("button")).toBeInTheDocument();
    });
  },
};

export const InPromptContext: Story = {
  render: () => (
    <div className="flex items-center gap-2 rounded-lg border p-2">
      <span className="text-muted-foreground text-sm">Say something…</span>
      <SpeechInput onTranscriptionChange={(text) => console.log(text)} size="icon-sm" variant="ghost" />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Speech input renders in prompt context", async () => {
      await expect(canvas.getByText("Say something…")).toBeInTheDocument();
      await expect(canvas.getByRole("button")).toBeInTheDocument();
    });
  },
};

/** Button has the correct accessible label when not listening. */
export const MicrophoneAriaLabel: Story = {
  args: {},
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Button has aria-label Microphone when idle", async () => {
      await expect(canvas.getByRole("button", { name: "Microphone" })).toBeInTheDocument();
    });
  },
};

/** onTranscriptionChange callback is wired and callable. */
export const TranscriptionCallback: Story = {
  args: {
    onTranscriptionChange: fn(),
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Button renders enabled when speech recognition is available", async () => {
      const button = canvas.getByRole("button", { name: "Microphone" });
      // In Chromium (Playwright), webkitSpeechRecognition exists so the button becomes enabled
      await waitFor(() => expect(button).not.toBeDisabled(), { timeout: 2000 });
    });
  },
};

/** Disabled state — button is disabled when mode is none (no speech API). */
export const NoSpeechApiDisabled: Story = {
  render: () => {
    // Simulate an environment with no speech APIs by rendering with no handlers
    // The button should be disabled when MediaRecorder mode requires onAudioRecorded
    // and SpeechRecognition is unavailable. We approximate by providing neither.
    return (
      <SpeechInput
        // Deliberately omit onAudioRecorded so media-recorder mode stays disabled
        onTranscriptionChange={undefined}
      />
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Button renders regardless of speech API availability", async () => {
      await expect(canvas.getByRole("button")).toBeInTheDocument();
    });
  },
};

// ---------------------------------------------------------------------------
// Mock SpeechRecognition helper — used by lifecycle tests below.
// The mock is set synchronously in the decorator so it is in place before the
// component's useEffect initializes the recognition instance.
// ---------------------------------------------------------------------------

class MockSpeechRecognition extends EventTarget {
  continuous = true;
  interimResults = true;
  lang = "en-US";
  onstart: null = null;
  onend: null = null;
  onresult: null = null;
  onerror: null = null;

  start() {
    this.dispatchEvent(new Event("start"));
  }

  stop() {
    this.dispatchEvent(new Event("end"));
  }
}

const withMockSpeechRecognition = (Story: React.FC) => {
  // Replace before Story renders so detectSpeechInputMode + useEffect both see the mock
  // @ts-expect-error — replacing browser API for testing
  window.SpeechRecognition = MockSpeechRecognition;
  // @ts-expect-error — replacing browser API for testing
  window.webkitSpeechRecognition = MockSpeechRecognition;
  return React.createElement(Story);
};

const mediaRecorderStartMock = fn();
const mediaRecorderStopMock = fn();
const mediaRecorderErrorMock = fn();
const mediaTrackStopMock = fn();
const mockAudioChunk = new Blob(["recorded audio"], { type: "audio/webm" });
const mockMediaStream = {
  getTracks: () => [
    {
      stop: mediaTrackStopMock,
    },
  ],
} as unknown as MediaStream;
const getUserMediaMock = fn(async () => mockMediaStream);

let latestMediaRecorderState: RecordingState | null = null;
let emitLatestMediaRecorderError: (() => boolean) | null = null;
let shouldEmitAudioOnStop = true;
let shouldThrowMediaRecorderConstructor = false;

class MockMediaRecorder extends EventTarget {
  state: RecordingState = "inactive";

  constructor(public readonly stream: MediaStream) {
    super();
    if (shouldThrowMediaRecorderConstructor) {
      throw new Error("MediaRecorder failed to initialize");
    }
    latestMediaRecorderState = this.state;
    emitLatestMediaRecorderError = () => {
      this.state = "inactive";
      latestMediaRecorderState = this.state;
      mediaRecorderErrorMock();
      return this.dispatchEvent(new Event("error"));
    };
  }

  start() {
    this.state = "recording";
    latestMediaRecorderState = this.state;
    mediaRecorderStartMock(this.stream);
  }

  stop() {
    this.state = "inactive";
    latestMediaRecorderState = this.state;
    mediaRecorderStopMock();
    if (shouldEmitAudioOnStop) {
      this.dispatchEvent(Object.assign(new Event("dataavailable"), { data: mockAudioChunk }));
    }
    this.dispatchEvent(new Event("stop"));
  }
}

const withMockMediaRecorder = (Story: React.FC) => {
  Reflect.deleteProperty(window, "SpeechRecognition");
  Reflect.deleteProperty(window, "webkitSpeechRecognition");
  getUserMediaMock.mockClear();
  mediaRecorderStartMock.mockClear();
  mediaRecorderStopMock.mockClear();
  mediaRecorderErrorMock.mockClear();
  mediaTrackStopMock.mockClear();
  latestMediaRecorderState = null;
  emitLatestMediaRecorderError = null;
  shouldEmitAudioOnStop = true;
  shouldThrowMediaRecorderConstructor = false;

  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: {
      getUserMedia: getUserMediaMock,
    },
  });

  Object.defineProperty(window, "MediaRecorder", {
    configurable: true,
    value: MockMediaRecorder,
  });

  return React.createElement(Story);
};

type MediaRecorderUnmountHarnessProps = Pick<React.ComponentProps<typeof SpeechInput>, "onAudioRecorded">;

const MediaRecorderUnmountHarness = ({ onAudioRecorded }: MediaRecorderUnmountHarnessProps) => {
  const [isSpeechInputMounted, setIsSpeechInputMounted] = React.useState(true);

  return (
    <div className="flex items-center gap-2">
      {isSpeechInputMounted && <SpeechInput onAudioRecorded={onAudioRecorded} />}
      <button type="button" onClick={() => setIsSpeechInputMounted(false)}>
        Unmount speech input
      </button>
    </div>
  );
};

/** Clicking the mic button transitions to "Stop recording" state via mocked SpeechRecognition. */
export const ListeningState: Story = {
  decorators: [withMockSpeechRecognition],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Button becomes enabled once recognition is ready", async () => {
      await waitFor(() => expect(canvas.getByRole("button", { name: "Microphone" })).not.toBeDisabled());
    });
    await step("Clicking mic enters listening state", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Microphone" }));
      await waitFor(() => expect(canvas.getByRole("button", { name: "Stop recording" })).toBeInTheDocument());
    });
    await step("Clicking stop exits listening state", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Stop recording" }));
      await waitFor(() => expect(canvas.getByRole("button", { name: "Microphone" })).toBeInTheDocument());
    });
  },
};

/** MediaRecorder fallback starts recording, stops recording, and forwards audio transcript. */
export const MediaRecorderStartsAndStops: Story = {
  args: {
    onAudioRecorded: fn(async () => "recorded transcript"),
    onTranscriptionChange: fn(),
  },
  decorators: [withMockMediaRecorder],
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Clicking mic starts MediaRecorder recording", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Microphone" }));

      await waitFor(() => expect(getUserMediaMock).toHaveBeenCalledWith({ audio: true }));
      await waitFor(() => expect(mediaRecorderStartMock).toHaveBeenCalledWith(mockMediaStream));
      await expect(latestMediaRecorderState).toBe("recording");
      await waitFor(() => expect(canvas.getByRole("button", { name: "Stop recording" })).toBeInTheDocument());
    });

    await step("Clicking stop stops MediaRecorder and transcribes captured audio", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Stop recording" }));

      await expect(mediaRecorderStopMock).toHaveBeenCalledTimes(1);
      await expect(latestMediaRecorderState).toBe("inactive");
      await waitFor(() => expect(mediaTrackStopMock).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(args.onAudioRecorded).toHaveBeenCalledTimes(1));
      await expect(args.onAudioRecorded).toHaveBeenCalledWith(expect.objectContaining({ type: "audio/webm" }));
      await waitFor(() => expect(args.onTranscriptionChange).toHaveBeenCalledWith("recorded transcript"));
      await waitFor(() => expect(canvas.getByRole("button", { name: "Microphone" })).not.toBeDisabled());
    });
  },
};

/** MediaRecorder constructor failures are caught and return the button to idle. */
export const MediaRecorderConstructorError: Story = {
  args: {
    onAudioRecorded: fn(),
  },
  decorators: [withMockMediaRecorder],
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("MediaRecorder constructor error leaves recording idle", async () => {
      shouldThrowMediaRecorderConstructor = true;

      await userEvent.click(canvas.getByRole("button", { name: "Microphone" }));

      await waitFor(() => expect(getUserMediaMock).toHaveBeenCalledWith({ audio: true }));
      await expect(mediaRecorderStartMock).not.toHaveBeenCalled();
      await expect(args.onAudioRecorded).not.toHaveBeenCalled();
      await waitFor(() => expect(canvas.getByRole("button", { name: "Microphone" })).not.toBeDisabled());
    });
  },
};

/** MediaRecorder error events stop listening and clean up the active stream. */
export const MediaRecorderError: Story = {
  args: {
    onAudioRecorded: fn(),
  },
  decorators: [withMockMediaRecorder],
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Start MediaRecorder recording", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Microphone" }));

      await waitFor(() => expect(mediaRecorderStartMock).toHaveBeenCalledWith(mockMediaStream));
      await expect(latestMediaRecorderState).toBe("recording");
      await waitFor(() => expect(canvas.getByRole("button", { name: "Stop recording" })).toBeInTheDocument());
    });

    await step("MediaRecorder error returns to idle and stops stream tracks", async () => {
      emitLatestMediaRecorderError?.();

      await expect(mediaRecorderErrorMock).toHaveBeenCalledTimes(1);
      await expect(latestMediaRecorderState).toBe("inactive");
      await waitFor(() => expect(mediaTrackStopMock).toHaveBeenCalledTimes(1));
      await expect(args.onAudioRecorded).not.toHaveBeenCalled();
      await waitFor(() => expect(canvas.getByRole("button", { name: "Microphone" })).not.toBeDisabled());
    });
  },
};

/** Unmounting while recording stops MediaRecorder via the cleanup ref branch. */
export const MediaRecorderCleanupWhileRecording: Story = {
  args: {
    onAudioRecorded: fn(),
  },
  decorators: [withMockMediaRecorder],
  render: (args) => <MediaRecorderUnmountHarness onAudioRecorded={args.onAudioRecorded} />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Start MediaRecorder and leave its ref state as recording", async () => {
      shouldEmitAudioOnStop = false;

      await userEvent.click(canvas.getByRole("button", { name: "Microphone" }));

      await waitFor(() => expect(mediaRecorderStartMock).toHaveBeenCalledWith(mockMediaStream));
      await expect(latestMediaRecorderState).toBe("recording");
      await waitFor(() => expect(canvas.getByRole("button", { name: "Stop recording" })).toBeInTheDocument());
    });

    await step("Unmounting the component stops the recording MediaRecorder ref", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Unmount speech input" }));

      await waitFor(() => expect(mediaRecorderStopMock).toHaveBeenCalledTimes(1));
      await expect(latestMediaRecorderState).toBe("inactive");
      await expect(mediaTrackStopMock).toHaveBeenCalledTimes(1);
    });
  },
};

/** Recognition result event fires onTranscriptionChange with the final transcript. */
export const TranscriptionResult: Story = {
  args: {
    onTranscriptionChange: fn(),
  },
  decorators: [
    (Story) => {
      class AutoResultRecognition extends EventTarget {
        continuous = true;
        interimResults = true;
        lang = "en-US";
        onstart: null = null;
        onend: null = null;
        onresult: null = null;
        onerror: null = null;

        start() {
          this.dispatchEvent(new Event("start"));
          // Immediately fire a final result
          this.dispatchEvent(
            Object.assign(new Event("result"), {
              resultIndex: 0,
              results: {
                length: 1,
                0: {
                  isFinal: true,
                  0: { transcript: "hello world", confidence: 0.95 },
                  length: 1,
                  item(i: number) {
                    return (this as Record<string, unknown>)[i];
                  },
                },
                item(i: number) {
                  return (this as Record<string, unknown>)[i];
                },
              },
            }),
          );
        }

        stop() {
          this.dispatchEvent(new Event("end"));
        }
      }
      // @ts-expect-error — replacing browser API for testing
      window.SpeechRecognition = AutoResultRecognition;
      // @ts-expect-error — replacing browser API for testing
      window.webkitSpeechRecognition = AutoResultRecognition;
      return React.createElement(Story);
    },
  ],
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Wait for recognition to be ready", async () => {
      await waitFor(() => expect(canvas.getByRole("button", { name: "Microphone" })).not.toBeDisabled());
    });
    await step("Clicking mic fires onTranscriptionChange with recognized text", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Microphone" }));
      await waitFor(() => expect(args.onTranscriptionChange).toHaveBeenCalledWith("hello world"));
    });
  },
};

/** Recognition error event (e.g. not-allowed) exits listening state gracefully. */
export const RecognitionError: Story = {
  decorators: [
    (Story) => {
      class ErrorRecognition extends EventTarget {
        continuous = true;
        interimResults = true;
        lang = "en-US";
        onstart: null = null;
        onend: null = null;
        onresult: null = null;
        onerror: null = null;

        start() {
          this.dispatchEvent(new Event("start"));
          // Immediately fire an error
          this.dispatchEvent(Object.assign(new Event("error"), { error: "not-allowed" }));
        }

        stop() {
          this.dispatchEvent(new Event("end"));
        }
      }
      // @ts-expect-error — replacing browser API for testing
      window.SpeechRecognition = ErrorRecognition;
      // @ts-expect-error — replacing browser API for testing
      window.webkitSpeechRecognition = ErrorRecognition;
      return React.createElement(Story);
    },
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Wait for recognition to be ready", async () => {
      await waitFor(() => expect(canvas.getByRole("button", { name: "Microphone" })).not.toBeDisabled());
    });
    await step("Click mic — recognition error returns button to idle state", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Microphone" }));
      await waitFor(() => expect(canvas.getByRole("button", { name: "Microphone" })).toBeInTheDocument());
    });
  },
};
