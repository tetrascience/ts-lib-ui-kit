import{j as t}from"./iframe-14YYbrss.js";import{C as c,a as u,b as l,d as p,c as m,e as y}from"./card-DFR04kUN.js";import"./preload-helper-BbFkF2Um.js";const{expect:a,within:i}=__STORYBOOK_MODULE_TEST__,B={title:"Components/Card",component:c,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{size:{control:{type:"select"},options:["default","sm"]}},args:{size:"default"}};function d(n){return t.jsx("div",{className:"w-[320px]",children:t.jsxs(c,{...n,children:[t.jsxs(u,{children:[t.jsx(l,{children:"Storage usage"}),t.jsx(p,{children:"Current workspace allocation"})]}),t.jsx(m,{children:"72% of your available storage is currently in use."}),t.jsx(y,{children:"Last updated 5 minutes ago"})]})})}const r={render:d,parameters:{zephyr:{testCaseId:"SW-T1212"}},play:async({canvasElement:n,step:s})=>{const e=i(n);await s("Card renders",async()=>{a(e.getByText("Storage usage")).toBeInTheDocument()}),await s("Header, body, and footer sections are visible",async()=>{a(e.getByText("Current workspace allocation")).toBeInTheDocument(),a(e.getByText("72% of your available storage is currently in use.")).toBeInTheDocument(),a(e.getByText("Last updated 5 minutes ago")).toBeInTheDocument()})}},o={args:{size:"sm"},render:d,parameters:{zephyr:{testCaseId:"SW-T1213"}},play:async({canvasElement:n,step:s})=>{const e=i(n);await s("Small card renders",async()=>{a(e.getByText("Storage usage")).toBeInTheDocument()}),await s("Header, body, and footer sections are visible",async()=>{a(e.getByText("Current workspace allocation")).toBeInTheDocument(),a(e.getByText("72% of your available storage is currently in use.")).toBeInTheDocument(),a(e.getByText("Last updated 5 minutes ago")).toBeInTheDocument()})}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: renderCard,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1212"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Card renders", async () => {
      expect(canvas.getByText("Storage usage")).toBeInTheDocument();
    });
    await step("Header, body, and footer sections are visible", async () => {
      expect(canvas.getByText("Current workspace allocation")).toBeInTheDocument();
      expect(canvas.getByText("72% of your available storage is currently in use.")).toBeInTheDocument();
      expect(canvas.getByText("Last updated 5 minutes ago")).toBeInTheDocument();
    });
  }
}`,...r.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    size: "sm"
  },
  render: renderCard,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1213"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Small card renders", async () => {
      expect(canvas.getByText("Storage usage")).toBeInTheDocument();
    });
    await step("Header, body, and footer sections are visible", async () => {
      expect(canvas.getByText("Current workspace allocation")).toBeInTheDocument();
      expect(canvas.getByText("72% of your available storage is currently in use.")).toBeInTheDocument();
      expect(canvas.getByText("Last updated 5 minutes ago")).toBeInTheDocument();
    });
  }
}`,...o.parameters?.docs?.source}}};const h=["Default","Small"];export{r as Default,o as Small,h as __namedExportsOrder,B as default};
