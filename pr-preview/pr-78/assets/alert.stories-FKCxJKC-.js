import{j as e,T as m,I as g,C as T}from"./iframe-14YYbrss.js";import{A as s,b as o,a as i,c as h}from"./alert-Bm4-XRaT.js";import{B as v}from"./button-BSJeE99h.js";import{B}from"./bell-BujJDfEv.js";import"./preload-helper-BbFkF2Um.js";import"./index-B8eA1Gpy.js";const{expect:a,within:c}=__STORYBOOK_MODULE_TEST__,j={title:"Components/Alert",component:s,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{variant:{control:{type:"select"},options:["default","destructive","info","positive","warning"]}},args:{variant:"default"}},l={render:n=>e.jsx("div",{className:"w-[420px]",children:e.jsxs(s,{...n,children:[e.jsx(B,{}),e.jsx(o,{children:"Updates available"}),e.jsx(i,{children:"A new version of the UI kit is ready to review in Storybook."}),e.jsx(h,{children:e.jsx(v,{size:"sm",variant:"secondary",children:"Open"})})]})}),parameters:{zephyr:{testCaseId:"SW-T1184"}},play:async({canvasElement:n,step:r})=>{const t=c(n);await r("Alert has role and title",async()=>{a(t.getByRole("alert")).toBeInTheDocument(),a(t.getByText("Updates available")).toBeInTheDocument()}),await r("Description and action render",async()=>{a(t.getByText("A new version of the UI kit is ready to review in Storybook.")).toBeInTheDocument(),a(t.getByRole("button",{name:"Open"})).toBeInTheDocument()}),await r("Icon is present",async()=>{a(t.getByRole("alert").querySelector("svg")).toBeInTheDocument()})}},d={args:{variant:"destructive"},render:n=>e.jsx("div",{className:"w-[420px]",children:e.jsxs(s,{...n,children:[e.jsx(m,{}),e.jsx(o,{children:"Action required"}),e.jsx(i,{children:"This action can't be undone once the workspace is deleted."}),e.jsx(h,{children:e.jsx(v,{size:"sm",variant:"destructive",children:"Review"})})]})}),parameters:{zephyr:{testCaseId:"SW-T1185"}},play:async({canvasElement:n,step:r})=>{const t=c(n);await r("Destructive alert has role and title",async()=>{a(t.getByRole("alert")).toBeInTheDocument(),a(t.getByText("Action required")).toBeInTheDocument()}),await r("Description and action render",async()=>{a(t.getByText("This action can't be undone once the workspace is deleted.")).toBeInTheDocument(),a(t.getByRole("button",{name:"Review"})).toBeInTheDocument()}),await r("Icon is present",async()=>{a(t.getByRole("alert").querySelector("svg")).toBeInTheDocument()})}},p={args:{variant:"info"},render:n=>e.jsx("div",{className:"w-[420px]",children:e.jsxs(s,{...n,children:[e.jsx(g,{}),e.jsx(o,{children:"Did you know?"}),e.jsx(i,{children:"You can drag and drop files directly into the upload area to get started faster."})]})}),parameters:{zephyr:{testCaseId:"SW-T1186"}},play:async({canvasElement:n,step:r})=>{const t=c(n);await r("Info alert has role and title",async()=>{a(t.getByRole("alert")).toBeInTheDocument(),a(t.getByText("Did you know?")).toBeInTheDocument()}),await r("Description renders",async()=>{a(t.getByText("You can drag and drop files directly into the upload area to get started faster.")).toBeInTheDocument()})}},y={args:{variant:"positive"},render:n=>e.jsx("div",{className:"w-[420px]",children:e.jsxs(s,{...n,children:[e.jsx(T,{}),e.jsx(o,{children:"Pipeline complete"}),e.jsx(i,{children:"All 12 files were processed successfully and are ready for review."})]})}),parameters:{zephyr:{testCaseId:"SW-T1187"}},play:async({canvasElement:n,step:r})=>{const t=c(n);await r("Positive alert has role and title",async()=>{a(t.getByRole("alert")).toBeInTheDocument(),a(t.getByText("Pipeline complete")).toBeInTheDocument()}),await r("Description renders",async()=>{a(t.getByText("All 12 files were processed successfully and are ready for review.")).toBeInTheDocument()})}},u={args:{variant:"warning"},render:n=>e.jsx("div",{className:"w-[420px]",children:e.jsxs(s,{...n,children:[e.jsx(m,{}),e.jsx(o,{children:"Storage limit approaching"}),e.jsx(i,{children:"Your workspace has used 90% of its storage quota. Consider archiving older files."})]})}),parameters:{zephyr:{testCaseId:"SW-T1188"}},play:async({canvasElement:n,step:r})=>{const t=c(n);await r("Warning alert has role and title",async()=>{a(t.getByRole("alert")).toBeInTheDocument(),a(t.getByText("Storage limit approaching")).toBeInTheDocument()}),await r("Description renders",async()=>{a(t.getByText("Your workspace has used 90% of its storage quota. Consider archiving older files.")).toBeInTheDocument()})}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: args => <div className="w-[420px]">
      <Alert {...args}>
        <BellIcon />
        <AlertTitle>Updates available</AlertTitle>
        <AlertDescription>
          A new version of the UI kit is ready to review in Storybook.
        </AlertDescription>
        <AlertAction>
          <Button size="sm" variant="secondary">
            Open
          </Button>
        </AlertAction>
      </Alert>
    </div>,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1184"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Alert has role and title", async () => {
      expect(canvas.getByRole("alert")).toBeInTheDocument();
      expect(canvas.getByText("Updates available")).toBeInTheDocument();
    });
    await step("Description and action render", async () => {
      expect(canvas.getByText("A new version of the UI kit is ready to review in Storybook.")).toBeInTheDocument();
      expect(canvas.getByRole("button", {
        name: "Open"
      })).toBeInTheDocument();
    });
    await step("Icon is present", async () => {
      expect(canvas.getByRole("alert").querySelector("svg")).toBeInTheDocument();
    });
  }
}`,...l.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "destructive"
  },
  render: args => <div className="w-[420px]">
      <Alert {...args}>
        <TriangleAlertIcon />
        <AlertTitle>Action required</AlertTitle>
        <AlertDescription>
          This action can&apos;t be undone once the workspace is deleted.
        </AlertDescription>
        <AlertAction>
          <Button size="sm" variant="destructive">
            Review
          </Button>
        </AlertAction>
      </Alert>
    </div>,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1185"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Destructive alert has role and title", async () => {
      expect(canvas.getByRole("alert")).toBeInTheDocument();
      expect(canvas.getByText("Action required")).toBeInTheDocument();
    });
    await step("Description and action render", async () => {
      expect(canvas.getByText("This action can't be undone once the workspace is deleted.")).toBeInTheDocument();
      expect(canvas.getByRole("button", {
        name: "Review"
      })).toBeInTheDocument();
    });
    await step("Icon is present", async () => {
      expect(canvas.getByRole("alert").querySelector("svg")).toBeInTheDocument();
    });
  }
}`,...d.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "info"
  },
  render: args => <div className="w-[420px]">
      <Alert {...args}>
        <InfoIcon />
        <AlertTitle>Did you know?</AlertTitle>
        <AlertDescription>
          You can drag and drop files directly into the upload area to get
          started faster.
        </AlertDescription>
      </Alert>
    </div>,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1186"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Info alert has role and title", async () => {
      expect(canvas.getByRole("alert")).toBeInTheDocument();
      expect(canvas.getByText("Did you know?")).toBeInTheDocument();
    });
    await step("Description renders", async () => {
      expect(canvas.getByText("You can drag and drop files directly into the upload area to get started faster.")).toBeInTheDocument();
    });
  }
}`,...p.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "positive"
  },
  render: args => <div className="w-[420px]">
      <Alert {...args}>
        <CircleCheckIcon />
        <AlertTitle>Pipeline complete</AlertTitle>
        <AlertDescription>
          All 12 files were processed successfully and are ready for review.
        </AlertDescription>
      </Alert>
    </div>,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1187"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Positive alert has role and title", async () => {
      expect(canvas.getByRole("alert")).toBeInTheDocument();
      expect(canvas.getByText("Pipeline complete")).toBeInTheDocument();
    });
    await step("Description renders", async () => {
      expect(canvas.getByText("All 12 files were processed successfully and are ready for review.")).toBeInTheDocument();
    });
  }
}`,...y.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "warning"
  },
  render: args => <div className="w-[420px]">
      <Alert {...args}>
        <TriangleAlertIcon />
        <AlertTitle>Storage limit approaching</AlertTitle>
        <AlertDescription>
          Your workspace has used 90% of its storage quota. Consider archiving
          older files.
        </AlertDescription>
      </Alert>
    </div>,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1188"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Warning alert has role and title", async () => {
      expect(canvas.getByRole("alert")).toBeInTheDocument();
      expect(canvas.getByText("Storage limit approaching")).toBeInTheDocument();
    });
    await step("Description renders", async () => {
      expect(canvas.getByText("Your workspace has used 90% of its storage quota. Consider archiving older files.")).toBeInTheDocument();
    });
  }
}`,...u.parameters?.docs?.source}}};const S=["Default","Destructive","Info","Positive","Warning"];export{l as Default,d as Destructive,p as Info,y as Positive,u as Warning,S as __namedExportsOrder,j as default};
