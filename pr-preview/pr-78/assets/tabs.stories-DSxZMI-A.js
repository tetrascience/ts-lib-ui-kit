import{r as p,u as W,j as n,P as w,b as $,d as _,e as H,f as G,c as B}from"./iframe-14YYbrss.js";import{c as K}from"./index-B8eA1Gpy.js";import{R as q,I as U,c as O}from"./index-_AbBFJ6v.js";import{u as Y}from"./index-SK9A3v17.js";import"./preload-helper-BbFkF2Um.js";import"./index-CzkjiSpZ.js";var I="Tabs",[J]=G(I,[O]),j=O(),[Q,C]=J(I),S=p.forwardRef((t,e)=>{const{__scopeTabs:a,value:s,onValueChange:c,defaultValue:d,orientation:o="horizontal",dir:u,activationMode:m="automatic",...b}=t,l=Y(u),[i,v]=W({prop:s,onChange:c,defaultProp:d??"",caller:I});return n.jsx(Q,{scope:a,baseId:$(),value:i,onValueChange:v,orientation:o,dir:l,activationMode:m,children:n.jsx(w.div,{dir:l,"data-orientation":o,...b,ref:e})})});S.displayName=I;var E="TabsList",N=p.forwardRef((t,e)=>{const{__scopeTabs:a,loop:s=!0,...c}=t,d=C(E,a),o=j(a);return n.jsx(q,{asChild:!0,...o,orientation:d.orientation,dir:d.dir,loop:s,children:n.jsx(w.div,{role:"tablist","aria-orientation":d.orientation,...c,ref:e})})});N.displayName=E;var k="TabsTrigger",V=p.forwardRef((t,e)=>{const{__scopeTabs:a,value:s,disabled:c=!1,...d}=t,o=C(k,a),u=j(a),m=L(o.baseId,s),b=P(o.baseId,s),l=s===o.value;return n.jsx(U,{asChild:!0,...u,focusable:!c,active:l,children:n.jsx(w.button,{type:"button",role:"tab","aria-selected":l,"aria-controls":b,"data-state":l?"active":"inactive","data-disabled":c?"":void 0,disabled:c,id:m,...d,ref:e,onMouseDown:_(t.onMouseDown,i=>{!c&&i.button===0&&i.ctrlKey===!1?o.onValueChange(s):i.preventDefault()}),onKeyDown:_(t.onKeyDown,i=>{[" ","Enter"].includes(i.key)&&o.onValueChange(s)}),onFocus:_(t.onFocus,()=>{const i=o.activationMode!=="manual";!l&&!c&&i&&o.onValueChange(s)})})})});V.displayName=k;var A="TabsContent",M=p.forwardRef((t,e)=>{const{__scopeTabs:a,value:s,forceMount:c,children:d,...o}=t,u=C(A,a),m=L(u.baseId,s),b=P(u.baseId,s),l=s===u.value,i=p.useRef(l);return p.useEffect(()=>{const v=requestAnimationFrame(()=>i.current=!1);return()=>cancelAnimationFrame(v)},[]),n.jsx(H,{present:c||l,children:({present:v})=>n.jsx(w.div,{"data-state":l?"active":"inactive","data-orientation":u.orientation,role:"tabpanel","aria-labelledby":m,hidden:!v,id:b,tabIndex:0,...o,ref:e,style:{...t.style,animationDuration:i.current?"0s":void 0},children:v&&d})})});M.displayName=A;function L(t,e){return`${t}-trigger-${e}`}function P(t,e){return`${t}-content-${e}`}var X=S,Z=N,ee=V,te=M;function z({className:t,orientation:e="horizontal",...a}){return n.jsx(X,{"data-slot":"tabs","data-orientation":e,className:B("group/tabs flex gap-2 data-horizontal:flex-col",t),...a})}const ae=K("group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none",{variants:{variant:{default:"bg-muted",line:"gap-1 bg-transparent"}},defaultVariants:{variant:"default"}});function F({className:t,variant:e="default",...a}){return n.jsx(Z,{"data-slot":"tabs-list","data-variant":e,className:B(ae({variant:e}),t),...a})}function T({className:t,...e}){return n.jsx(ee,{"data-slot":"tabs-trigger",className:B("relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4","group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent group-data-[variant=line]/tabs-list:data-active:text-primary dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:text-primary","data-active:bg-primary data-active:text-primary-foreground data-active:shadow-sm dark:data-active:bg-primary dark:data-active:text-primary-foreground","not-data-active:hover:bg-accent not-data-active:hover:text-accent-foreground","after:absolute after:bg-primary after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",t),...e})}function x({className:t,...e}){return n.jsx(te,{"data-slot":"tabs-content",className:B("flex-1 text-sm outline-none",t),...e})}z.__docgenInfo={description:"",methods:[],displayName:"Tabs",props:{orientation:{defaultValue:{value:'"horizontal"',computed:!1},required:!1}}};F.__docgenInfo={description:"",methods:[],displayName:"TabsList",props:{variant:{defaultValue:{value:'"default"',computed:!1},required:!1}}};T.__docgenInfo={description:"",methods:[],displayName:"TabsTrigger"};x.__docgenInfo={description:"",methods:[],displayName:"TabsContent"};const{expect:r,within:D}=__STORYBOOK_MODULE_TEST__,le={title:"Components/Tabs",component:z,parameters:{layout:"centered"},tags:["autodocs"]};function R(t,e){return n.jsxs(z,{defaultValue:"overview",orientation:e,className:e==="vertical"?"w-[520px]":"w-[420px]",children:[n.jsxs(F,{variant:t,children:[n.jsx(T,{value:"overview",children:"Overview"}),n.jsx(T,{value:"activity",children:"Activity"}),n.jsx(T,{value:"members",children:"Members"})]}),n.jsx(x,{value:"overview",className:"rounded-lg border p-4",children:"Overview content for the selected workspace."}),n.jsx(x,{value:"activity",className:"rounded-lg border p-4",children:"Recent activity and export history."}),n.jsx(x,{value:"members",className:"rounded-lg border p-4",children:"Team members and permissions."})]})}const g={render:()=>R("default","horizontal"),parameters:{zephyr:{testCaseId:"SW-T1310"}},play:async({canvasElement:t,step:e})=>{const a=D(t);await e("Tab list and tabs render",async()=>{r(a.getByRole("tablist")).toBeInTheDocument(),r(a.getByRole("tab",{name:"Overview"})).toBeInTheDocument(),r(a.getByRole("tab",{name:"Activity"})).toBeInTheDocument(),r(a.getByRole("tab",{name:"Members"})).toBeInTheDocument()}),await e("Default tab panel shows overview content",async()=>{r(a.getByRole("tab",{name:"Overview"})).toHaveAttribute("aria-selected","true"),r(a.getByText("Overview content for the selected workspace.")).toBeInTheDocument()})}},f={render:()=>R("line","horizontal"),parameters:{zephyr:{testCaseId:"SW-T1311"}},play:async({canvasElement:t,step:e})=>{const a=D(t);await e("Line variant tab list renders",async()=>{r(a.getByRole("tablist")).toBeInTheDocument(),r(a.getByRole("tab",{name:"Overview"})).toBeInTheDocument()}),await e("Overview panel is visible",async()=>{r(a.getByText("Overview content for the selected workspace.")).toBeInTheDocument()})}},y={render:()=>R("default","vertical"),parameters:{zephyr:{testCaseId:"SW-T1312"}},play:async({canvasElement:t,step:e})=>{const a=D(t);await e("Vertical tab list renders",async()=>{r(a.getByRole("tablist")).toBeInTheDocument(),r(a.getByRole("tab",{name:"Members"})).toBeInTheDocument()}),await e("Default vertical tab content shows",async()=>{r(a.getByText("Overview content for the selected workspace.")).toBeInTheDocument()})}},h={render:()=>R("line","vertical"),parameters:{zephyr:{testCaseId:"SW-T1313"}},play:async({canvasElement:t,step:e})=>{const a=D(t);await e("Vertical line tabs render",async()=>{r(a.getByRole("tablist")).toBeInTheDocument(),r(a.getByRole("tab",{name:"Activity"})).toBeInTheDocument()}),await e("Overview panel is visible",async()=>{r(a.getByText("Overview content for the selected workspace.")).toBeInTheDocument()})}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => renderTabs("default", "horizontal"),
  parameters: {
    zephyr: {
      testCaseId: "SW-T1310"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Tab list and tabs render", async () => {
      expect(canvas.getByRole("tablist")).toBeInTheDocument();
      expect(canvas.getByRole("tab", {
        name: "Overview"
      })).toBeInTheDocument();
      expect(canvas.getByRole("tab", {
        name: "Activity"
      })).toBeInTheDocument();
      expect(canvas.getByRole("tab", {
        name: "Members"
      })).toBeInTheDocument();
    });
    await step("Default tab panel shows overview content", async () => {
      expect(canvas.getByRole("tab", {
        name: "Overview"
      })).toHaveAttribute("aria-selected", "true");
      expect(canvas.getByText("Overview content for the selected workspace.")).toBeInTheDocument();
    });
  }
}`,...g.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => renderTabs("line", "horizontal"),
  parameters: {
    zephyr: {
      testCaseId: "SW-T1311"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Line variant tab list renders", async () => {
      expect(canvas.getByRole("tablist")).toBeInTheDocument();
      expect(canvas.getByRole("tab", {
        name: "Overview"
      })).toBeInTheDocument();
    });
    await step("Overview panel is visible", async () => {
      expect(canvas.getByText("Overview content for the selected workspace.")).toBeInTheDocument();
    });
  }
}`,...f.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => renderTabs("default", "vertical"),
  parameters: {
    zephyr: {
      testCaseId: "SW-T1312"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Vertical tab list renders", async () => {
      expect(canvas.getByRole("tablist")).toBeInTheDocument();
      expect(canvas.getByRole("tab", {
        name: "Members"
      })).toBeInTheDocument();
    });
    await step("Default vertical tab content shows", async () => {
      expect(canvas.getByText("Overview content for the selected workspace.")).toBeInTheDocument();
    });
  }
}`,...y.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => renderTabs("line", "vertical"),
  parameters: {
    zephyr: {
      testCaseId: "SW-T1313"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Vertical line tabs render", async () => {
      expect(canvas.getByRole("tablist")).toBeInTheDocument();
      expect(canvas.getByRole("tab", {
        name: "Activity"
      })).toBeInTheDocument();
    });
    await step("Overview panel is visible", async () => {
      expect(canvas.getByText("Overview content for the selected workspace.")).toBeInTheDocument();
    });
  }
}`,...h.parameters?.docs?.source}}};const de=["HorizontalDefault","HorizontalLine","VerticalDefault","VerticalLine"];export{g as HorizontalDefault,f as HorizontalLine,y as VerticalDefault,h as VerticalLine,de as __namedExportsOrder,le as default};
