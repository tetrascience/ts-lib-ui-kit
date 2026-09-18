import { userEvent, within } from "storybook/test";

/**
 * Helpers for driving the Radix-backed `Select` primitive from play functions.
 *
 * `SelectContent` renders through a portal and only lands in the DOM after
 * Radix has mounted it, measured the trigger and run its entry animation. On a
 * loaded CI runner — under coverage instrumentation, sharing the box with the
 * Storybook dev server — that can take longer than Testing Library's 1000 ms
 * `asyncUtilTimeout`, so a bare `findByRole("option", …)` straight after
 * clicking the trigger is a race — the `Unable to find role="option"` flake
 * (SW-2624).
 *
 * These helpers keep the assertion exactly as strict — the option must still be
 * exposed to the accessibility tree under that accessible name — while removing
 * the timing exposure:
 *
 *  1. wait for the listbox itself, so the option query only starts once the
 *     portal is actually open, and
 *  2. scope the option query to that listbox, so a same-named element elsewhere
 *     in the document can never satisfy it.
 */

/** Portal mount + Radix position measurement + entry animation, with CI headroom. */
const SELECT_OPEN_TIMEOUT_MS = 5000;

/**
 * Click `trigger` and wait for its listbox to open. Returns the listbox so
 * callers can scope their own queries to it.
 */
export async function openSelect(trigger: HTMLElement): Promise<HTMLElement> {
  await userEvent.click(trigger);
  const body = within(trigger.ownerDocument.body);
  return await body.findByRole("listbox", {}, { timeout: SELECT_OPEN_TIMEOUT_MS });
}

/**
 * Open `trigger`, click the option matching `name`, and return that option.
 *
 * Replaces the flaky
 * `await userEvent.click(trigger); await body.findByRole("option", { name })`
 * pairing at every call site.
 */
export async function selectOption(trigger: HTMLElement, name: string | RegExp): Promise<HTMLElement> {
  const listbox = await openSelect(trigger);
  const option = await within(listbox).findByRole("option", { name }, { timeout: SELECT_OPEN_TIMEOUT_MS });
  await userEvent.click(option);
  return option;
}
