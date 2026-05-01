import{w as l,j as n,x as t}from"./iframe-14YYbrss.js";import{B as s}from"./button-BSJeE99h.js";import"./preload-helper-BbFkF2Um.js";import"./index-B8eA1Gpy.js";const{expect:r,within:u}=__STORYBOOK_MODULE_TEST__,x={title:"Components/Sonner",component:l,parameters:{layout:"centered"},tags:["autodocs"]};function c(o){t.dismiss();const a="Workspace export queued",e="The latest run will be delivered to the reporting destination shortly.";switch(o){case"success":{t.success(a,{description:e});break}case"error":{t.error("Export failed",{description:"The destination credentials need to be refreshed."});break}case"warning":{t.warning("Retry required",{description:"One downstream connector reported a transient error."});break}case"info":{t.info("Sync in progress",{description:e});break}default:t(a,{description:e})}}function d(o){return n.jsxs("div",{className:"flex w-[420px] flex-col gap-3 rounded-xl border bg-background p-4",children:[n.jsx("p",{className:"text-sm text-muted-foreground",children:"Trigger each toast state to preview the local Sonner styling."}),n.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[n.jsx(s,{onClick:()=>c("default"),variant:"outline",children:"Default"}),n.jsx(s,{onClick:()=>c("success"),variant:"outline",children:"Success"}),n.jsx(s,{onClick:()=>c("error"),variant:"outline",children:"Error"}),n.jsx(s,{onClick:()=>c("warning"),variant:"outline",children:"Warning"}),n.jsx(s,{className:"col-span-2",onClick:()=>c("info"),variant:"outline",children:"Info"})]}),n.jsx(l,{...o,richColors:!0})]})}const i={render:d,parameters:{zephyr:{testCaseId:"SW-T1301"}},play:async({canvasElement:o,step:a})=>{const e=u(o);await a("Toast trigger buttons render",async()=>{r(e.getByRole("button",{name:"Default"})).toBeInTheDocument(),r(e.getByRole("button",{name:"Success"})).toBeInTheDocument(),r(e.getByRole("button",{name:"Error"})).toBeInTheDocument(),r(e.getByRole("button",{name:"Warning"})).toBeInTheDocument(),r(e.getByRole("button",{name:"Info"})).toBeInTheDocument()}),await a("Instructions render",async()=>{r(e.getByText("Trigger each toast state to preview the local Sonner styling.")).toBeInTheDocument()})}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: renderToaster,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1301"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Toast trigger buttons render", async () => {
      expect(canvas.getByRole("button", {
        name: "Default"
      })).toBeInTheDocument();
      expect(canvas.getByRole("button", {
        name: "Success"
      })).toBeInTheDocument();
      expect(canvas.getByRole("button", {
        name: "Error"
      })).toBeInTheDocument();
      expect(canvas.getByRole("button", {
        name: "Warning"
      })).toBeInTheDocument();
      expect(canvas.getByRole("button", {
        name: "Info"
      })).toBeInTheDocument();
    });
    await step("Instructions render", async () => {
      expect(canvas.getByText("Trigger each toast state to preview the local Sonner styling.")).toBeInTheDocument();
    });
  }
}`,...i.parameters?.docs?.source}}};const T=["Default"];export{i as Default,T as __namedExportsOrder,x as default};
