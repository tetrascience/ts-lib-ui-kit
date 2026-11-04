import * as React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PromptInput } from "../prompt-input";

/*
 * UXT-77 review: PromptInput attaches its drag-and-drop listeners through its own
 * form ref. A consumer `ref` used to replace that ref, so with `globalDrop` off the
 * listeners never attached and dropping a file made the browser open it.
 */
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

/** A drag carrying files, as the browser dispatches it over a drop target. */
function fileDrag(type: "dragover" | "drop") {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "dataTransfer", { value: { types: ["Files"], files: [] } });
  return event;
}

describe("PromptInput with a consumer ref", () => {
  it("hands the form to the consumer and still intercepts file drags on it", () => {
    const ref = React.createRef<HTMLFormElement>();
    act(() =>
      root.render(
        <PromptInput ref={ref} onSubmit={vi.fn()}>
          <textarea aria-label="Message" />
        </PromptInput>,
      ),
    );
    const form = container.querySelector("form");
    expect(ref.current).toBe(form);

    for (const type of ["dragover", "drop"] as const) {
      const event = fileDrag(type);
      form?.dispatchEvent(event);
      expect(event.defaultPrevented, `${type} should be intercepted`).toBe(true);
    }
  });
});
