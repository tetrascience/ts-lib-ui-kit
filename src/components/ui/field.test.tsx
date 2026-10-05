import * as React from "react"
import { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { FieldError, FieldSeparator } from "./field"

/*
 * FieldError's message selection and FieldSeparator's optional label. The
 * stories show fields in their happy state; these branches only appear with
 * validation errors or a labelled divider.
 */

;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true

let container: HTMLDivElement
let root: ReturnType<typeof createRoot>

beforeEach(() => {
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

const render = (ui: React.ReactElement) => act(() => root.render(ui))
const alert = () => container.querySelector('[data-slot="field-error"]')

describe("FieldError", () => {
  it("renders nothing without children or errors", () => {
    render(<FieldError errors={[]} />)
    expect(alert()).toBeNull()
  })

  it("prefers explicit children over the errors list", () => {
    render(<FieldError errors={[{ message: "ignored" }]}>Custom message</FieldError>)
    expect(alert()?.getAttribute("role")).toBe("alert")
    expect(alert()?.textContent).toBe("Custom message")
  })

  it("shows a single error inline, de-duplicating repeats", () => {
    render(<FieldError errors={[{ message: "Required" }, { message: "Required" }]} />)
    expect(alert()?.querySelector("ul")).toBeNull()
    expect(alert()?.textContent).toBe("Required")
  })

  it("lists several distinct errors, skipping entries without a message", () => {
    render(<FieldError errors={[{ message: "Too short" }, undefined, { message: "Must be a number" }]} />)
    const items = [...(alert()?.querySelectorAll("li") ?? [])].map((li) => li.textContent)
    expect(items).toEqual(["Too short", "Must be a number"])
  })

  it("forwards its ref to the alert element", () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<FieldError ref={ref} errors={[{ message: "Required" }]} />)
    expect(ref.current).toBe(alert())
  })
})

describe("FieldSeparator", () => {
  it("renders a bare divider without a label", () => {
    render(<FieldSeparator />)
    expect(container.querySelector('[data-slot="field-separator-content"]')).toBeNull()
  })

  it("renders its label over the divider", () => {
    render(<FieldSeparator>Or continue with</FieldSeparator>)
    expect(container.querySelector('[data-slot="field-separator-content"]')?.textContent).toBe("Or continue with")
  })
})
