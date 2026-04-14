import * as React from "react"
import { flushSync } from "react-dom"
import { createRoot } from "react-dom/client"
import { describe, expect, it } from "vitest"

import { useDataTable } from "./data-table"

describe("useDataTable", () => {
  it("throws when used outside a DataTable provider", () => {
    let error: Error | undefined
    function ThrowingComponent() {
      try {
        useDataTable()
      } catch (e) {
        error = e as Error
      }
      return null
    }

    const container = document.createElement("div")
    const root = createRoot(container)
    flushSync(() => {
      root.render(React.createElement(ThrowingComponent))
    })

    expect(error).toBeDefined()
    expect(error!.message).toBe("useDataTable must be used within a <DataTable>")

    root.unmount()
  })
})
