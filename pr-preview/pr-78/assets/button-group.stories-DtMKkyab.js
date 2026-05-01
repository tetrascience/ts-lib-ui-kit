import{j as o,c,S as g}from"./iframe-14YYbrss.js";import{B as i}from"./button-BSJeE99h.js";import{c as y}from"./index-B8eA1Gpy.js";import{S as v}from"./separator-BG8Oc9DV.js";import{C as B}from"./calendar-BFP8ip0r.js";import{C as T}from"./chevron-down-DJZ_3i8R.js";import"./preload-helper-BbFkF2Um.js";const f=y("flex w-fit items-stretch *:focus-visible:relative *:focus-visible:z-10 has-[>[data-slot=button-group]]:gap-2 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-lg [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1",{variants:{orientation:{horizontal:"[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none [&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-lg!",vertical:"flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none [&>[data-slot]:not(:has(~[data-slot]))]:rounded-b-lg!"}},defaultVariants:{orientation:"horizontal"}});function l({className:n,orientation:t,...e}){return o.jsx("div",{role:"group","data-slot":"button-group","data-orientation":t,className:c(f({orientation:t}),n),...e})}function u({className:n,asChild:t=!1,...e}){const h=t?g:"div";return o.jsx(h,{className:c("flex items-center gap-2 rounded-lg border bg-muted px-2.5 text-sm font-medium [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",n),...e})}function d({className:n,orientation:t="vertical",...e}){return o.jsx(v,{"data-slot":"button-group-separator",orientation:t,className:c("relative self-stretch bg-input data-horizontal:mx-px data-horizontal:w-auto data-vertical:my-px data-vertical:h-auto",n),...e})}l.__docgenInfo={description:"",methods:[],displayName:"ButtonGroup"};d.__docgenInfo={description:"",methods:[],displayName:"ButtonGroupSeparator",props:{orientation:{defaultValue:{value:'"vertical"',computed:!1},required:!1}}};u.__docgenInfo={description:"",methods:[],displayName:"ButtonGroupText",props:{asChild:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}}}};const{expect:a,within:p}=__STORYBOOK_MODULE_TEST__,_={title:"Components/ButtonGroup",component:l,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{orientation:{control:{type:"select"},options:["horizontal","vertical"]}},args:{orientation:"horizontal"}};function m(n){const t=n?.orientation==="vertical";return o.jsxs(l,{...n,children:[o.jsx(i,{variant:"outline",children:"Today"}),o.jsx(i,{variant:"outline",children:"This week"}),o.jsx(i,{variant:"outline",children:"This month"}),o.jsx(d,{orientation:t?"horizontal":"vertical"}),o.jsxs(u,{children:[o.jsx(B,{}),"Range",o.jsx(T,{className:"size-4"})]})]})}const r={render:m,parameters:{zephyr:{testCaseId:"SW-T1200"}},play:async({canvasElement:n,step:t})=>{const e=p(n);await t("Button group renders",async()=>{a(e.getByRole("group")).toBeInTheDocument()}),await t("Multiple segment buttons are visible",async()=>{a(e.getByRole("button",{name:"Today"})).toBeInTheDocument(),a(e.getByRole("button",{name:"This week"})).toBeInTheDocument(),a(e.getByRole("button",{name:"This month"})).toBeInTheDocument()})}},s={args:{orientation:"vertical"},render:m,parameters:{zephyr:{testCaseId:"SW-T1201"}},play:async({canvasElement:n,step:t})=>{const e=p(n);await t("Vertical button group renders",async()=>{a(e.getByRole("group")).toBeInTheDocument()}),await t("Multiple segment buttons are visible",async()=>{a(e.getByRole("button",{name:"Today"})).toBeInTheDocument(),a(e.getByRole("button",{name:"This week"})).toBeInTheDocument(),a(e.getByRole("button",{name:"This month"})).toBeInTheDocument()})}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: renderGroup,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1200"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Button group renders", async () => {
      expect(canvas.getByRole("group")).toBeInTheDocument();
    });
    await step("Multiple segment buttons are visible", async () => {
      expect(canvas.getByRole("button", {
        name: "Today"
      })).toBeInTheDocument();
      expect(canvas.getByRole("button", {
        name: "This week"
      })).toBeInTheDocument();
      expect(canvas.getByRole("button", {
        name: "This month"
      })).toBeInTheDocument();
    });
  }
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: "vertical"
  },
  render: renderGroup,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1201"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Vertical button group renders", async () => {
      expect(canvas.getByRole("group")).toBeInTheDocument();
    });
    await step("Multiple segment buttons are visible", async () => {
      expect(canvas.getByRole("button", {
        name: "Today"
      })).toBeInTheDocument();
      expect(canvas.getByRole("button", {
        name: "This week"
      })).toBeInTheDocument();
      expect(canvas.getByRole("button", {
        name: "This month"
      })).toBeInTheDocument();
    });
  }
}`,...s.parameters?.docs?.source}}};const S=["Horizontal","Vertical"];export{r as Horizontal,s as Vertical,S as __namedExportsOrder,_ as default};
