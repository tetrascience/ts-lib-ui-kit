import * as React from "react"
import { flushSync } from "react-dom"
import { createRoot } from "react-dom/client"
import { describe, it, expect, beforeEach, afterEach } from "vitest"

import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "./table"

let container: HTMLDivElement
let root: ReturnType<typeof createRoot>

beforeEach(() => {
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  flushSync(() => root.unmount())
  container.remove()
})

function render(ui: React.ReactElement) {
  flushSync(() => root.render(ui))
  return container
}

// ---------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------

describe("Table", () => {
  it("renders a table-container div and a table element", () => {
    render(<Table />)
    const wrapper = container.querySelector("[data-slot='table-container']")
    expect(wrapper).toBeTruthy()
    expect(container.querySelector("table[data-slot='table']")).toBeTruthy()
  })

  it("default layout — no table-fixed class", () => {
    render(<Table />)
    const table = container.querySelector("table")!
    expect(table.className).not.toContain("table-fixed")
  })

  it("layout='fixed' adds table-fixed class", () => {
    render(<Table layout="fixed" />)
    const table = container.querySelector("table")!
    expect(table.className).toContain("table-fixed")
  })

  it("layout='auto' does NOT add table-fixed class", () => {
    render(<Table layout="auto" />)
    const table = container.querySelector("table")!
    expect(table.className).not.toContain("table-fixed")
  })

  it("variant='card' adds rounded-lg border bg-card to container", () => {
    render(<Table variant="card" />)
    const wrapper = container.querySelector("[data-slot='table-container']")!
    expect(wrapper.className).toContain("rounded-lg")
    expect(wrapper.className).toContain("border")
    expect(wrapper.className).toContain("bg-card")
  })

  it("variant='default' does NOT add card styles", () => {
    render(<Table variant="default" />)
    const wrapper = container.querySelector("[data-slot='table-container']")!
    expect(wrapper.className).not.toContain("rounded-lg")
    expect(wrapper.className).not.toContain("bg-card")
  })

  it("no variant does NOT add card styles", () => {
    render(<Table />)
    const wrapper = container.querySelector("[data-slot='table-container']")!
    expect(wrapper.className).not.toContain("rounded-lg")
  })

  it("containerClassName is applied to the wrapper div", () => {
    render(<Table containerClassName="my-custom-container" />)
    const wrapper = container.querySelector("[data-slot='table-container']")!
    expect(wrapper.className).toContain("my-custom-container")
  })

  it("className is applied to the table element", () => {
    render(<Table className="my-table-class" />)
    const table = container.querySelector("table")!
    expect(table.className).toContain("my-table-class")
  })

  it("forwards extra props to the table element", () => {
    render(<Table data-testid="my-table" />)
    expect(container.querySelector("[data-testid='my-table']")).toBeTruthy()
  })

  it("renders children inside the table", () => {
    render(
      <Table>
        <tbody>
          <tr>
            <td>cell content</td>
          </tr>
        </tbody>
      </Table>,
    )
    expect(container.textContent).toContain("cell content")
  })
})

// ---------------------------------------------------------------------------
// TableHeader
// ---------------------------------------------------------------------------

describe("TableHeader", () => {
  it("renders a thead with data-slot='table-header'", () => {
    render(
      <table>
        <TableHeader />
      </table>,
    )
    expect(container.querySelector("thead[data-slot='table-header']")).toBeTruthy()
  })

  it("default variant has bg-muted/50 class", () => {
    render(
      <table>
        <TableHeader />
      </table>,
    )
    const thead = container.querySelector("thead")!
    expect(thead.className).toContain("bg-muted/50")
  })

  it("variant='sticky' adds sticky top-0 z-10 bg-background", () => {
    render(
      <table>
        <TableHeader variant="sticky" />
      </table>,
    )
    const thead = container.querySelector("thead")!
    expect(thead.className).toContain("sticky")
    expect(thead.className).toContain("top-0")
    expect(thead.className).toContain("z-10")
    expect(thead.className).toContain("bg-background")
  })

  it("variant='default' does NOT add sticky classes", () => {
    render(
      <table>
        <TableHeader variant="default" />
      </table>,
    )
    const thead = container.querySelector("thead")!
    expect(thead.className).not.toContain("sticky")
  })

  it("className is forwarded", () => {
    render(
      <table>
        <TableHeader className="extra-header-class" />
      </table>,
    )
    const thead = container.querySelector("thead")!
    expect(thead.className).toContain("extra-header-class")
  })
})

// ---------------------------------------------------------------------------
// TableBody
// ---------------------------------------------------------------------------

describe("TableBody", () => {
  it("renders a tbody with data-slot='table-body'", () => {
    render(
      <table>
        <TableBody />
      </table>,
    )
    expect(container.querySelector("tbody[data-slot='table-body']")).toBeTruthy()
  })

  it("className is forwarded", () => {
    render(
      <table>
        <TableBody className="body-class" />
      </table>,
    )
    const tbody = container.querySelector("tbody")!
    expect(tbody.className).toContain("body-class")
  })

  it("renders children", () => {
    render(
      <table>
        <TableBody>
          <tr>
            <td>row1</td>
          </tr>
        </TableBody>
      </table>,
    )
    expect(container.textContent).toContain("row1")
  })
})

// ---------------------------------------------------------------------------
// TableFooter
// ---------------------------------------------------------------------------

describe("TableFooter", () => {
  it("renders a tfoot with data-slot='table-footer'", () => {
    render(
      <table>
        <TableFooter />
      </table>,
    )
    expect(container.querySelector("tfoot[data-slot='table-footer']")).toBeTruthy()
  })

  it("has border-t bg-muted/50 font-medium classes", () => {
    render(
      <table>
        <TableFooter />
      </table>,
    )
    const tfoot = container.querySelector("tfoot")!
    expect(tfoot.className).toContain("border-t")
    expect(tfoot.className).toContain("bg-muted/50")
    expect(tfoot.className).toContain("font-medium")
  })

  it("className is forwarded", () => {
    render(
      <table>
        <TableFooter className="footer-class" />
      </table>,
    )
    const tfoot = container.querySelector("tfoot")!
    expect(tfoot.className).toContain("footer-class")
  })

  it("renders children", () => {
    render(
      <table>
        <TableFooter>
          <tr>
            <td>footer content</td>
          </tr>
        </TableFooter>
      </table>,
    )
    expect(container.textContent).toContain("footer content")
  })
})

// ---------------------------------------------------------------------------
// TableRow
// ---------------------------------------------------------------------------

describe("TableRow", () => {
  it("renders a tr with data-slot='table-row'", () => {
    render(
      <table>
        <tbody>
          <TableRow />
        </tbody>
      </table>,
    )
    expect(container.querySelector("tr[data-slot='table-row']")).toBeTruthy()
  })

  it("has transition-colors and hover classes", () => {
    render(
      <table>
        <tbody>
          <TableRow />
        </tbody>
      </table>,
    )
    const tr = container.querySelector("tr")!
    expect(tr.className).toContain("transition-colors")
    expect(tr.className).toContain("border-b")
  })

  it("className is forwarded", () => {
    render(
      <table>
        <tbody>
          <TableRow className="row-class" />
        </tbody>
      </table>,
    )
    const tr = container.querySelector("tr")!
    expect(tr.className).toContain("row-class")
  })

  it("renders children", () => {
    render(
      <table>
        <tbody>
          <TableRow>
            <td>row content</td>
          </TableRow>
        </tbody>
      </table>,
    )
    expect(container.textContent).toContain("row content")
  })

  it("forwards extra props", () => {
    render(
      <table>
        <tbody>
          <TableRow data-state="selected" />
        </tbody>
      </table>,
    )
    const tr = container.querySelector("tr")!
    expect(tr.dataset["state"]).toBe("selected")
  })
})

// ---------------------------------------------------------------------------
// TableHead
// ---------------------------------------------------------------------------

describe("TableHead", () => {
  it("renders a th with data-slot='table-head'", () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHead />
          </tr>
        </thead>
      </table>,
    )
    expect(container.querySelector("th[data-slot='table-head']")).toBeTruthy()
  })

  it("default variant has h-12 px-4 text-left classes", () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHead />
          </tr>
        </thead>
      </table>,
    )
    const th = container.querySelector("th")!
    expect(th.className).toContain("h-12")
    expect(th.className).toContain("px-4")
    expect(th.className).toContain("text-left")
  })

  it("variant='numeric' adds text-right class", () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHead variant="numeric" />
          </tr>
        </thead>
      </table>,
    )
    const th = container.querySelector("th")!
    expect(th.className).toContain("text-right")
  })

  it("variant='action' adds w-10 class", () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHead variant="action" />
          </tr>
        </thead>
      </table>,
    )
    const th = container.querySelector("th")!
    expect(th.className).toContain("w-10")
  })

  it("variant='default' does not add numeric/action-specific classes", () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHead variant="default" />
          </tr>
        </thead>
      </table>,
    )
    const th = container.querySelector("th")!
    expect(th.className).not.toContain("text-right")
    expect(th.className).not.toContain("w-10")
  })

  it("truncate=true adds truncate class", () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHead truncate />
          </tr>
        </thead>
      </table>,
    )
    const th = container.querySelector("th")!
    expect(th.className).toContain("truncate")
  })

  it("truncate=false does NOT add truncate class", () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHead truncate={false} />
          </tr>
        </thead>
      </table>,
    )
    const th = container.querySelector("th")!
    expect(th.className).not.toContain("truncate")
  })

  it("truncate undefined does NOT add truncate class", () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHead />
          </tr>
        </thead>
      </table>,
    )
    const th = container.querySelector("th")!
    expect(th.className).not.toContain("truncate")
  })

  it("className is forwarded", () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHead className="head-class" />
          </tr>
        </thead>
      </table>,
    )
    const th = container.querySelector("th")!
    expect(th.className).toContain("head-class")
  })

  it("renders children", () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHead>Header text</TableHead>
          </tr>
        </thead>
      </table>,
    )
    expect(container.textContent).toContain("Header text")
  })
})

// ---------------------------------------------------------------------------
// TableCell
// ---------------------------------------------------------------------------

describe("TableCell", () => {
  it("renders a td with data-slot='table-cell'", () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell />
          </tr>
        </tbody>
      </table>,
    )
    expect(container.querySelector("td[data-slot='table-cell']")).toBeTruthy()
  })

  it("default variant has p-4 align-middle whitespace-nowrap", () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell />
          </tr>
        </tbody>
      </table>,
    )
    const td = container.querySelector("td")!
    expect(td.className).toContain("p-4")
    expect(td.className).toContain("align-middle")
    expect(td.className).toContain("whitespace-nowrap")
  })

  it("variant='numeric' adds text-right tabular-nums", () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell variant="numeric" />
          </tr>
        </tbody>
      </table>,
    )
    const td = container.querySelector("td")!
    expect(td.className).toContain("text-right")
    expect(td.className).toContain("tabular-nums")
  })

  it("variant='action' adds opacity-0 and transition-opacity", () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell variant="action" />
          </tr>
        </tbody>
      </table>,
    )
    const td = container.querySelector("td")!
    expect(td.className).toContain("opacity-0")
    expect(td.className).toContain("transition-opacity")
  })

  it("variant='default' does not add action/numeric-specific classes", () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell variant="default" />
          </tr>
        </tbody>
      </table>,
    )
    const td = container.querySelector("td")!
    expect(td.className).not.toContain("text-right")
    expect(td.className).not.toContain("opacity-0")
  })

  it("truncate=true adds truncate class", () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell truncate />
          </tr>
        </tbody>
      </table>,
    )
    const td = container.querySelector("td")!
    expect(td.className).toContain("truncate")
  })

  it("truncate=false does NOT add truncate class", () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell truncate={false} />
          </tr>
        </tbody>
      </table>,
    )
    const td = container.querySelector("td")!
    expect(td.className).not.toContain("truncate")
  })

  it("truncate undefined does NOT add truncate class", () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell />
          </tr>
        </tbody>
      </table>,
    )
    const td = container.querySelector("td")!
    expect(td.className).not.toContain("truncate")
  })

  it("className is forwarded", () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell className="cell-class" />
          </tr>
        </tbody>
      </table>,
    )
    const td = container.querySelector("td")!
    expect(td.className).toContain("cell-class")
  })

  it("renders children", () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell>cell data</TableCell>
          </tr>
        </tbody>
      </table>,
    )
    expect(container.textContent).toContain("cell data")
  })
})

// ---------------------------------------------------------------------------
// TableCaption
// ---------------------------------------------------------------------------

describe("TableCaption", () => {
  it("renders a caption with data-slot='table-caption'", () => {
    render(
      <table>
        <TableCaption />
      </table>,
    )
    expect(container.querySelector("caption[data-slot='table-caption']")).toBeTruthy()
  })

  it("has mt-4 text-sm text-muted-foreground classes", () => {
    render(
      <table>
        <TableCaption />
      </table>,
    )
    const caption = container.querySelector("caption")!
    expect(caption.className).toContain("mt-4")
    expect(caption.className).toContain("text-sm")
    expect(caption.className).toContain("text-muted-foreground")
  })

  it("className is forwarded", () => {
    render(
      <table>
        <TableCaption className="caption-class" />
      </table>,
    )
    const caption = container.querySelector("caption")!
    expect(caption.className).toContain("caption-class")
  })

  it("renders children", () => {
    render(
      <table>
        <TableCaption>A caption</TableCaption>
      </table>,
    )
    expect(container.textContent).toContain("A caption")
  })
})

// ---------------------------------------------------------------------------
// Full composition
// ---------------------------------------------------------------------------

describe("Table composition", () => {
  it("renders a complete table with all sub-components", () => {
    render(
      <Table>
        <TableCaption>Test Caption</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead variant="numeric">Score</TableHead>
            <TableHead variant="action">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Alice</TableCell>
            <TableCell variant="numeric">42</TableCell>
            <TableCell variant="action">Edit</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    )
    expect(container.textContent).toContain("Test Caption")
    expect(container.textContent).toContain("Name")
    expect(container.textContent).toContain("Score")
    expect(container.textContent).toContain("Alice")
    expect(container.textContent).toContain("42")
    expect(container.textContent).toContain("Total")
  })

  it("card variant with fixed layout renders correct classes", () => {
    render(<Table variant="card" layout="fixed" />)
    const wrapper = container.querySelector("[data-slot='table-container']")!
    const table = container.querySelector("table")!
    expect(wrapper.className).toContain("rounded-lg")
    expect(table.className).toContain("table-fixed")
  })
})
