import{j as e}from"./iframe-14YYbrss.js";import{B as m}from"./button-BSJeE99h.js";import{R as g,C as u,a as x}from"./index-DkZdde6L.js";import{C as y}from"./chevron-down-DJZ_3i8R.js";import"./preload-helper-BbFkF2Um.js";import"./index-B8eA1Gpy.js";function l({...t}){return e.jsx(g,{"data-slot":"collapsible",...t})}function i({...t}){return e.jsx(u,{"data-slot":"collapsible-trigger",...t})}function c({...t}){return e.jsx(x,{"data-slot":"collapsible-content",...t})}l.__docgenInfo={description:"",methods:[],displayName:"Collapsible"};i.__docgenInfo={description:"",methods:[],displayName:"CollapsibleTrigger"};c.__docgenInfo={description:"",methods:[],displayName:"CollapsibleContent"};const{expect:s,within:d}=__STORYBOOK_MODULE_TEST__,B={title:"Components/Collapsible",component:l,parameters:{layout:"centered"},tags:["autodocs"]};function p(t=!1){return e.jsxs(l,{defaultOpen:t,className:"w-[360px] space-y-2",children:[e.jsxs("div",{className:"flex items-center justify-between rounded-lg border p-3",children:[e.jsxs("div",{children:[e.jsx("div",{className:"text-sm font-medium",children:"Release notes"}),e.jsx("div",{className:"text-sm text-muted-foreground",children:"Expand to preview the latest changes."})]}),e.jsx(i,{asChild:!0,children:e.jsxs(m,{size:"icon-sm",variant:"ghost",children:[e.jsx(y,{}),e.jsx("span",{className:"sr-only",children:"Toggle details"})]})})]}),e.jsx(c,{className:"rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground",children:"Added new UI primitives, Storybook coverage, and layout examples for interactive components."})]})}const o={render:()=>p(!1),parameters:{zephyr:{testCaseId:"SW-T1219"}},play:async({canvasElement:t,step:a})=>{const n=d(t);await a("Header and trigger render",async()=>{s(n.getByText("Release notes")).toBeInTheDocument(),s(n.getByRole("button",{name:/toggle details/i})).toBeInTheDocument()}),await a("Collapsed hint text visible",async()=>{s(n.getByText("Expand to preview the latest changes.")).toBeInTheDocument()})}},r={render:()=>p(!0),parameters:{zephyr:{testCaseId:"SW-T1220"}},play:async({canvasElement:t,step:a})=>{const n=d(t);await a("Trigger still present when open",async()=>{s(n.getByRole("button",{name:/toggle details/i})).toBeInTheDocument()}),await a("Expanded content visible",async()=>{s(n.getByText("Added new UI primitives, Storybook coverage, and layout examples for interactive components.")).toBeInTheDocument()})}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => renderCollapsible(false),
  parameters: {
    zephyr: {
      testCaseId: "SW-T1219"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Header and trigger render", async () => {
      expect(canvas.getByText("Release notes")).toBeInTheDocument();
      expect(canvas.getByRole("button", {
        name: /toggle details/i
      })).toBeInTheDocument();
    });
    await step("Collapsed hint text visible", async () => {
      expect(canvas.getByText("Expand to preview the latest changes.")).toBeInTheDocument();
    });
  }
}`,...o.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => renderCollapsible(true),
  parameters: {
    zephyr: {
      testCaseId: "SW-T1220"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Trigger still present when open", async () => {
      expect(canvas.getByRole("button", {
        name: /toggle details/i
      })).toBeInTheDocument();
    });
    await step("Expanded content visible", async () => {
      expect(canvas.getByText("Added new UI primitives, Storybook coverage, and layout examples for interactive components.")).toBeInTheDocument();
    });
  }
}`,...r.parameters?.docs?.source}}};const w=["Closed","Open"];export{o as Closed,r as Open,w as __namedExportsOrder,B as default};
