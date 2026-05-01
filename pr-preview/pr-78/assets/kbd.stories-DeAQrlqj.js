import{j as t,c as d}from"./iframe-14YYbrss.js";import"./preload-helper-BbFkF2Um.js";function s({className:e,...n}){return t.jsx("kbd",{"data-slot":"kbd",className:d("pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm bg-muted px-1 font-sans text-xs font-medium text-muted-foreground select-none in-data-[slot=tooltip-content]:bg-background/20 in-data-[slot=tooltip-content]:text-background dark:in-data-[slot=tooltip-content]:bg-background/10 [&_svg:not([class*='size-'])]:size-3",e),...n})}function m({className:e,...n}){return t.jsx("kbd",{"data-slot":"kbd-group",className:d("inline-flex items-center gap-1",e),...n})}s.__docgenInfo={description:"",methods:[],displayName:"Kbd"};m.__docgenInfo={description:"",methods:[],displayName:"KbdGroup"};const{expect:c,within:p}=__STORYBOOK_MODULE_TEST__,l={title:"Components/Kbd",component:s,parameters:{layout:"centered"},tags:["autodocs"]},o={render:()=>t.jsx(s,{children:"⌘K"}),parameters:{zephyr:{testCaseId:"SW-T1266"}},play:async({canvasElement:e,step:n})=>{const a=p(e);await n("Keyboard shortcut text renders",async()=>{c(a.getByText("⌘K")).toBeInTheDocument()})}},r={render:()=>t.jsxs("div",{className:"flex items-center gap-2 text-sm text-muted-foreground",children:["Open command menu",t.jsxs(m,{children:[t.jsx(s,{children:"⌘"}),t.jsx(s,{children:"K"})]})]}),parameters:{zephyr:{testCaseId:"SW-T1267"}},play:async({canvasElement:e,step:n})=>{const a=p(e);await n("Label and grouped shortcut keys render",async()=>{c(a.getByText("Open command menu")).toBeInTheDocument(),c(a.getByText("⌘")).toBeInTheDocument(),c(a.getByText("K",{selector:"kbd"})).toBeInTheDocument()})}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <Kbd>⌘K</Kbd>,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1266"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Keyboard shortcut text renders", async () => {
      expect(canvas.getByText("⌘K")).toBeInTheDocument();
    });
  }
}`,...o.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-2 text-sm text-muted-foreground">
      Open command menu
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    </div>,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1267"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Label and grouped shortcut keys render", async () => {
      expect(canvas.getByText("Open command menu")).toBeInTheDocument();
      expect(canvas.getByText("⌘")).toBeInTheDocument();
      expect(canvas.getByText("K", {
        selector: "kbd"
      })).toBeInTheDocument();
    });
  }
}`,...r.parameters?.docs?.source}}};const x=["Default","Grouped"];export{o as Default,r as Grouped,x as __namedExportsOrder,l as default};
