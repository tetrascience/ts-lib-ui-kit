import { describe, expect, it } from "vitest";

import { transformStorySource } from "../../../.storybook/source-transform";

describe("transformStorySource", () => {
  it("extracts a single-line JSX render and drops play/parameters noise", () => {
    const source = `{
  render: () => <AccordionExample type="single" collapsible defaultValue="item-1" />,
  parameters: {
    zephyr: { testCaseId: "SW-T1180" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("renders", async () => {})
  },
}`;
    expect(transformStorySource(source)).toBe(
      '<AccordionExample type="single" collapsible defaultValue="item-1" />',
    );
  });

  it("extracts and unwraps a parenthesized multi-line JSX render", () => {
    const source = `{
  render: () => (
    <div className="w-96">
      <Breadcrumb>
        <BreadcrumbItem>Yes, raw JSX text with commas, (parens) and don't-style apostrophes</BreadcrumbItem>
      </Breadcrumb>
    </div>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T1" },
  },
}`;
    expect(transformStorySource(source)).toBe(
      `<div className="w-96">
  <Breadcrumb>
    <BreadcrumbItem>Yes, raw JSX text with commas, (parens) and don't-style apostrophes</BreadcrumbItem>
  </Breadcrumb>
</div>`,
    );
  });

  it("presents a block-body render (hooks demo) as a function component", () => {
    const source = `{
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>Hi</DialogContent>
      </Dialog>
    );
  },
  play: async () => {},
}`;
    expect(transformStorySource(source)).toBe(
      `function Example() {
  const [open, setOpen] = useState(true);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>Hi</DialogContent>
    </Dialog>
  );
}`,
    );
  });

  it("keeps the full block when render is the last property", () => {
    const source = `{
  parameters: { layout: "centered" },
  render: () => {
    const items = [1, 2];
    return <List items={items} />;
  }
}`;
    expect(transformStorySource(source)).toBe(
      `function Example() {
  const items = [1, 2];
  return <List items={items} />;
}`,
    );
  });

  it("handles a render value that starts on the following line", () => {
    const source = `{
  render: () =>
    renderCalendar({ mode: "single", selected: selectedDate }),
  parameters: {
    zephyr: { testCaseId: "SW-T2" },
  },
}`;
    expect(transformStorySource(source)).toBe(
      'renderCalendar({ mode: "single", selected: selectedDate })',
    );
  });

  it("is not fooled by template literals containing property-like lines", () => {
    const source = `{
  render: () => (
    <CodeBlock
      code={\`
  render: fake,
  play: also fake,
\`}
    />
  ),
  play: async () => {},
}`;
    expect(transformStorySource(source)).toBe(
      `<CodeBlock
  code={\`
  render: fake,
  play: also fake,
\`}
/>`,
    );
  });

  it("extracts a single-line story object", () => {
    expect(transformStorySource("{ render: () => <Skeleton /> }")).toBe(
      "<Skeleton />",
    );
  });

  it("normalizes CSF2 zero-arity function stories", () => {
    expect(transformStorySource("() => <Button>Save</Button>")).toBe(
      "<Button>Save</Button>",
    );
  });

  it("passes dynamic JSX snippets through unchanged", () => {
    const snippet = '<Button variant="outline">Save</Button>';
    expect(transformStorySource(snippet)).toBe(snippet);
  });

  it("passes story objects without a render property through unchanged", () => {
    const source = `{
  args: {
    variant: "outline",
  },
}`;
    expect(transformStorySource(source)).toBe(source);
  });

  it("leaves args-based renders alone (they get dynamic snippets)", () => {
    const source = `{
  render: (args) => <Button {...args} />,
  args: { variant: "outline" },
}`;
    expect(transformStorySource(source)).toBe(source);
  });
});
