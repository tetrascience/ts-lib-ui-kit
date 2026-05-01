import{j as e}from"./iframe-14YYbrss.js";import{S as c}from"./separator-BG8Oc9DV.js";import"./preload-helper-BbFkF2Um.js";const{expect:t,within:i}=__STORYBOOK_MODULE_TEST__,l={title:"Components/Separator",component:c,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{orientation:{control:{type:"select"},options:["horizontal","vertical"]}},args:{orientation:"horizontal"}},n={render:()=>e.jsxs("div",{className:"w-[320px] space-y-3",children:[e.jsx("div",{className:"text-sm font-medium",children:"Overview"}),e.jsx(c,{}),e.jsx("div",{className:"text-sm text-muted-foreground",children:"Separate sections without adding visual weight."})]}),parameters:{zephyr:{testCaseId:"SW-T1282"}},play:async({canvasElement:a,step:s})=>{const r=i(a);await s("Component renders",async()=>{t(r.getByText("Overview")).toBeInTheDocument(),t(r.getByText("Separate sections without adding visual weight.")).toBeInTheDocument()}),await s("Separator is present",async()=>{t(a.querySelector('[data-slot="separator"]')).toBeInTheDocument()})}},o={render:()=>e.jsxs("div",{className:"flex h-12 items-center gap-4",children:[e.jsx("span",{className:"text-sm",children:"Activity"}),e.jsx(c,{orientation:"vertical"}),e.jsx("span",{className:"text-sm text-muted-foreground",children:"Deployments"})]}),parameters:{zephyr:{testCaseId:"SW-T1283"}},play:async({canvasElement:a,step:s})=>{const r=i(a);await s("Component renders",async()=>{t(r.getByText("Activity")).toBeInTheDocument(),t(r.getByText("Deployments")).toBeInTheDocument()}),await s("Separator is present",async()=>{t(a.querySelector('[data-slot="separator"]')).toBeInTheDocument()})}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-[320px] space-y-3">
      <div className="text-sm font-medium">Overview</div>
      <Separator />
      <div className="text-sm text-muted-foreground">Separate sections without adding visual weight.</div>
    </div>,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1282"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Component renders", async () => {
      expect(canvas.getByText("Overview")).toBeInTheDocument();
      expect(canvas.getByText("Separate sections without adding visual weight.")).toBeInTheDocument();
    });
    await step("Separator is present", async () => {
      expect(canvasElement.querySelector('[data-slot="separator"]')).toBeInTheDocument();
    });
  }
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex h-12 items-center gap-4">
      <span className="text-sm">Activity</span>
      <Separator orientation="vertical" />
      <span className="text-sm text-muted-foreground">Deployments</span>
    </div>,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1283"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Component renders", async () => {
      expect(canvas.getByText("Activity")).toBeInTheDocument();
      expect(canvas.getByText("Deployments")).toBeInTheDocument();
    });
    await step("Separator is present", async () => {
      expect(canvasElement.querySelector('[data-slot="separator"]')).toBeInTheDocument();
    });
  }
}`,...o.parameters?.docs?.source}}};const y=["Horizontal","Vertical"];export{n as Horizontal,o as Vertical,y as __namedExportsOrder,l as default};
