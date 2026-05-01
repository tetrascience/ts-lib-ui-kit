import{j as e,M as v,c as z}from"./iframe-14YYbrss.js";import{B as h}from"./button-BSJeE99h.js";import{c as B}from"./index-B8eA1Gpy.js";import"./preload-helper-BbFkF2Um.js";const f=B("animate-spin",{variants:{size:{sm:"size-5",default:"size-6",md:"size-8",lg:"size-12"}},defaultVariants:{size:"default"}});function t({className:n,size:a="default",...s}){return e.jsx(v,{"data-slot":"spinner","data-size":a,role:"status","aria-label":"Loading",className:z(f({size:a}),n),...s})}t.__docgenInfo={description:"",methods:[],displayName:"Spinner",props:{size:{defaultValue:{value:'"default"',computed:!1},required:!1}}};const{expect:r,within:o}=__STORYBOOK_MODULE_TEST__,L={title:"Components/Spinner",component:t,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{size:{control:{type:"select"},options:["sm","default","md","lg"],description:"Controls the spinner diameter. sm (20px) for inline use, default (24px) general purpose, md (32px) for panels, lg (48px) for full-page loading."}}},x=async({canvasElement:n,step:a})=>{const s=o(n);await a("Spinner renders with status role",async()=>{r(s.getByRole("status",{name:"Loading"})).toBeInTheDocument()}),await a("Spinner is an SVG element",async()=>{r(s.getByRole("status",{name:"Loading"}).tagName.toLowerCase()).toBe("svg")})},c={args:{size:"default"},parameters:{zephyr:{testCaseId:"SW-T1302"}},play:x},l={args:{size:"lg"},parameters:{zephyr:{testCaseId:"SW-T1303"}},play:x},p={args:{size:"sm"},play:x,parameters:{zephyr:{testCaseId:"SW-T1405"}}},d={args:{size:"md"},play:x,parameters:{zephyr:{testCaseId:"SW-T1406"}}},m={render:()=>e.jsxs("div",{className:"flex items-center gap-2 text-sm",children:[e.jsx(t,{size:"sm"}),e.jsx("span",{children:"Loading results..."})]}),play:async({canvasElement:n,step:a})=>{const s=o(n);await a("Spinner and text render together",async()=>{r(s.getByRole("status")).toBeInTheDocument(),r(s.getByText("Loading results...")).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1407"}}},u={render:()=>e.jsxs("div",{className:"flex min-h-[200px] w-[400px] flex-col items-center justify-center gap-3",children:[e.jsx(t,{size:"lg"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"Loading..."})]}),play:async({canvasElement:n,step:a})=>{const s=o(n);await a("Full page loader renders",async()=>{r(s.getByRole("status")).toBeInTheDocument(),r(s.getByText("Loading...")).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1408"}}},g={render:()=>e.jsxs("div",{className:"flex gap-4",children:[e.jsxs(h,{disabled:!0,children:[e.jsx(t,{size:"sm"}),"Saving..."]}),e.jsxs(h,{variant:"outline",disabled:!0,children:[e.jsx(t,{size:"sm"}),"Loading"]})]}),play:async({canvasElement:n,step:a})=>{const s=o(n);await a("Both buttons with spinners render",async()=>{const i=s.getAllByRole("status");r(i).toHaveLength(2)}),await a("Buttons are disabled while loading",async()=>{s.getAllByRole("button").forEach(S=>r(S).toBeDisabled())})},parameters:{zephyr:{testCaseId:"SW-T1409"}}},y={args:{size:"md"},render:({size:n})=>e.jsxs("div",{className:"flex items-center gap-6",children:[e.jsx(t,{size:n,className:"text-blue-500"}),e.jsx(t,{size:n,className:"text-green-500"}),e.jsx(t,{size:n,className:"text-orange-500"})]}),play:async({canvasElement:n,step:a})=>{const s=o(n);await a("Three custom-colored spinners render",async()=>{const i=s.getAllByRole("status");r(i).toHaveLength(3)})},parameters:{zephyr:{testCaseId:"SW-T1410"}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    size: "default"
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1302"
    }
  },
  play: playSpinner
}`,...c.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    size: "lg"
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1303"
    }
  },
  play: playSpinner
}`,...l.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    size: "sm"
  },
  play: playSpinner,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1405"
    }
  }
}`,...p.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    size: "md"
  },
  play: playSpinner,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1406"
    }
  }
}`,...d.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-2 text-sm">
      <Spinner size="sm" />
      <span>Loading results...</span>
    </div>,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Spinner and text render together", async () => {
      expect(canvas.getByRole("status")).toBeInTheDocument();
      expect(canvas.getByText("Loading results...")).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1407"
    }
  }
}`,...m.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex min-h-[200px] w-[400px] flex-col items-center justify-center gap-3">
      <Spinner size="lg" />
      <p className="text-muted-foreground text-sm">Loading...</p>
    </div>,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Full page loader renders", async () => {
      expect(canvas.getByRole("status")).toBeInTheDocument();
      expect(canvas.getByText("Loading...")).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1408"
    }
  }
}`,...u.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex gap-4">
      <Button disabled>
        <Spinner size="sm" />
        Saving...
      </Button>
      <Button variant="outline" disabled>
        <Spinner size="sm" />
        Loading
      </Button>
    </div>,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Both buttons with spinners render", async () => {
      const spinners = canvas.getAllByRole("status");
      expect(spinners).toHaveLength(2);
    });
    await step("Buttons are disabled while loading", async () => {
      const buttons = canvas.getAllByRole("button");
      buttons.forEach(btn => expect(btn).toBeDisabled());
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1409"
    }
  }
}`,...g.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    size: "md"
  },
  render: ({
    size
  }) => <div className="flex items-center gap-6">
      <Spinner size={size} className="text-blue-500" />
      <Spinner size={size} className="text-green-500" />
      <Spinner size={size} className="text-orange-500" />
    </div>,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Three custom-colored spinners render", async () => {
      const spinners = canvas.getAllByRole("status");
      expect(spinners).toHaveLength(3);
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1410"
    }
  }
}`,...y.parameters?.docs?.source}}};const b=["Default","Large","Small","Medium","InlineWithText","FullPageLoader","InsideButton","CustomColor"];export{y as CustomColor,c as Default,u as FullPageLoader,m as InlineWithText,g as InsideButton,l as Large,d as Medium,p as Small,b as __namedExportsOrder,L as default};
