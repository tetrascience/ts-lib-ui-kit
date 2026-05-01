import{j as a,S as D,c as r}from"./iframe-14YYbrss.js";import{B as b}from"./button-BSJeE99h.js";import{c as f}from"./index-B8eA1Gpy.js";import{F as j}from"./file-text-OcFovPEr.js";import{S as E}from"./star-zsBEvrKc.js";import{E as C}from"./ellipsis-5QsaIXE-.js";import"./preload-helper-BbFkF2Um.js";const S=f("group/item flex w-full flex-wrap items-center rounded-lg border text-sm transition-colors duration-100 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [a]:transition-colors [a]:hover:bg-muted",{variants:{variant:{default:"border-transparent",outline:"border-border",muted:"border-transparent bg-muted/50"},size:{default:"gap-2.5 px-3 py-2.5",sm:"gap-2.5 px-3 py-2.5",xs:"gap-2 px-2.5 py-2 in-data-[slot=dropdown-menu-content]:p-0"}},defaultVariants:{variant:"default",size:"default"}});function h({className:t,variant:e="default",size:n="default",asChild:T=!1,...B}){const z=T?D:"div";return a.jsx(z,{"data-slot":"item","data-variant":e,"data-size":n,className:r(S({variant:e,size:n,className:t})),...B})}const _=f("flex shrink-0 items-center justify-center gap-2 group-has-data-[slot=item-description]/item:translate-y-0.5 group-has-data-[slot=item-description]/item:self-start [&_svg]:pointer-events-none",{variants:{variant:{default:"bg-transparent",icon:"[&_svg:not([class*='size-'])]:size-4",image:"size-10 overflow-hidden rounded-sm group-data-[size=sm]/item:size-8 group-data-[size=xs]/item:size-6 [&_img]:size-full [&_img]:object-cover"}},defaultVariants:{variant:"default"}});function y({className:t,variant:e="default",...n}){return a.jsx("div",{"data-slot":"item-media","data-variant":e,className:r(_({variant:e,className:t})),...n})}function x({className:t,...e}){return a.jsx("div",{"data-slot":"item-content",className:r("flex flex-1 flex-col gap-1 group-data-[size=xs]/item:gap-0 [&+[data-slot=item-content]]:flex-none",t),...e})}function g({className:t,...e}){return a.jsx("div",{"data-slot":"item-title",className:r("line-clamp-1 flex w-fit items-center gap-2 text-sm leading-snug font-medium underline-offset-4",t),...e})}function v({className:t,...e}){return a.jsx("p",{"data-slot":"item-description",className:r("line-clamp-2 text-left text-sm leading-normal font-normal text-muted-foreground group-data-[size=xs]/item:text-xs [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",t),...e})}function I({className:t,...e}){return a.jsx("div",{"data-slot":"item-actions",className:r("flex items-center gap-2",t),...e})}function w({className:t,...e}){return a.jsx("div",{"data-slot":"item-header",className:r("flex basis-full items-center justify-between gap-2",t),...e})}h.__docgenInfo={description:"",methods:[],displayName:"Item",props:{asChild:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},variant:{defaultValue:{value:'"default"',computed:!1},required:!1},size:{defaultValue:{value:'"default"',computed:!1},required:!1}}};y.__docgenInfo={description:"",methods:[],displayName:"ItemMedia",props:{variant:{defaultValue:{value:'"default"',computed:!1},required:!1}}};x.__docgenInfo={description:"",methods:[],displayName:"ItemContent"};I.__docgenInfo={description:"",methods:[],displayName:"ItemActions"};g.__docgenInfo={description:"",methods:[],displayName:"ItemTitle"};v.__docgenInfo={description:"",methods:[],displayName:"ItemDescription"};w.__docgenInfo={description:"",methods:[],displayName:"ItemHeader"};const{expect:s,within:i}=__STORYBOOK_MODULE_TEST__,P={title:"Components/Item",component:h,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{variant:{control:{type:"select"},options:["default","outline","muted"]},size:{control:{type:"select"},options:["default","sm","xs"]}},args:{variant:"default",size:"default"}};function o(t){return a.jsxs(h,{...t,className:"w-[440px]",children:[a.jsx(y,{variant:"icon",children:a.jsx(j,{})}),a.jsxs(x,{children:[a.jsxs(w,{children:[a.jsx(g,{children:"Quarterly analytics summary"}),a.jsxs(I,{children:[a.jsx(E,{className:"size-4 text-muted-foreground"}),a.jsxs(b,{size:"icon-xs",variant:"ghost",children:[a.jsx(C,{}),a.jsx("span",{className:"sr-only",children:"More actions"})]})]})]}),a.jsx(v,{children:"Review the latest dashboard exports and share them with the team."})]})]})}const c={render:o,parameters:{zephyr:{testCaseId:"SW-T1260"}},play:async({canvasElement:t,step:e})=>{const n=i(t);await e("Item title, description, and actions render",async()=>{s(n.getByText("Quarterly analytics summary")).toBeInTheDocument(),s(n.getByText("Review the latest dashboard exports and share them with the team.")).toBeInTheDocument(),s(n.getByText("More actions")).toBeInTheDocument()})}},m={args:{variant:"outline"},render:o,parameters:{zephyr:{testCaseId:"SW-T1261"}},play:async({canvasElement:t,step:e})=>{const n=i(t);await e("Item title and description render",async()=>{s(n.getByText("Quarterly analytics summary")).toBeInTheDocument(),s(n.getByText("Review the latest dashboard exports and share them with the team.")).toBeInTheDocument()})}},d={args:{variant:"muted"},render:o,parameters:{zephyr:{testCaseId:"SW-T1262"}},play:async({canvasElement:t,step:e})=>{const n=i(t);await e("Item title and description render",async()=>{s(n.getByText("Quarterly analytics summary")).toBeInTheDocument(),s(n.getByText("Review the latest dashboard exports and share them with the team.")).toBeInTheDocument()})}},l={args:{size:"sm"},render:o,parameters:{zephyr:{testCaseId:"SW-T1263"}},play:async({canvasElement:t,step:e})=>{const n=i(t);await e("Item title and description render",async()=>{s(n.getByText("Quarterly analytics summary")).toBeInTheDocument(),s(n.getByText("Review the latest dashboard exports and share them with the team.")).toBeInTheDocument()})}},p={args:{size:"xs"},render:o,parameters:{zephyr:{testCaseId:"SW-T1264"}},play:async({canvasElement:t,step:e})=>{const n=i(t);await e("Item title and description render",async()=>{s(n.getByText("Quarterly analytics summary")).toBeInTheDocument(),s(n.getByText("Review the latest dashboard exports and share them with the team.")).toBeInTheDocument()})}},u={render:()=>a.jsxs(h,{variant:"outline",className:"w-[440px]",children:[a.jsx(y,{variant:"image",children:a.jsx("img",{alt:"Preview",src:"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' rx='8' fill='%23d4d4d8'/%3E%3Cpath d='M18 54l12-12 10 10 14-18 8 20H18z' fill='%239ca3af'/%3E%3Ccircle cx='28' cy='26' r='6' fill='white'/%3E%3C/svg%3E"})}),a.jsxs(x,{children:[a.jsx(g,{children:"Generated preview image"}),a.jsx(v,{children:"Item media can also render thumbnail images for richer list layouts."})]})]}),parameters:{zephyr:{testCaseId:"SW-T1265"}},play:async({canvasElement:t,step:e})=>{const n=i(t);await e("Image media item title and description render",async()=>{s(n.getByText("Generated preview image")).toBeInTheDocument(),s(n.getByText("Item media can also render thumbnail images for richer list layouts.")).toBeInTheDocument()}),await e("Preview image is present",async()=>{s(n.getByRole("img",{name:"Preview"})).toBeInTheDocument()})}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: renderItem,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1260"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Item title, description, and actions render", async () => {
      expect(canvas.getByText("Quarterly analytics summary")).toBeInTheDocument();
      expect(canvas.getByText("Review the latest dashboard exports and share them with the team.")).toBeInTheDocument();
      expect(canvas.getByText("More actions")).toBeInTheDocument();
    });
  }
}`,...c.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "outline"
  },
  render: renderItem,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1261"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Item title and description render", async () => {
      expect(canvas.getByText("Quarterly analytics summary")).toBeInTheDocument();
      expect(canvas.getByText("Review the latest dashboard exports and share them with the team.")).toBeInTheDocument();
    });
  }
}`,...m.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "muted"
  },
  render: renderItem,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1262"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Item title and description render", async () => {
      expect(canvas.getByText("Quarterly analytics summary")).toBeInTheDocument();
      expect(canvas.getByText("Review the latest dashboard exports and share them with the team.")).toBeInTheDocument();
    });
  }
}`,...d.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    size: "sm"
  },
  render: renderItem,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1263"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Item title and description render", async () => {
      expect(canvas.getByText("Quarterly analytics summary")).toBeInTheDocument();
      expect(canvas.getByText("Review the latest dashboard exports and share them with the team.")).toBeInTheDocument();
    });
  }
}`,...l.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    size: "xs"
  },
  render: renderItem,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1264"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Item title and description render", async () => {
      expect(canvas.getByText("Quarterly analytics summary")).toBeInTheDocument();
      expect(canvas.getByText("Review the latest dashboard exports and share them with the team.")).toBeInTheDocument();
    });
  }
}`,...p.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <Item variant="outline" className="w-[440px]">
      <ItemMedia variant="image">
        <img alt="Preview" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' rx='8' fill='%23d4d4d8'/%3E%3Cpath d='M18 54l12-12 10 10 14-18 8 20H18z' fill='%239ca3af'/%3E%3Ccircle cx='28' cy='26' r='6' fill='white'/%3E%3C/svg%3E" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Generated preview image</ItemTitle>
        <ItemDescription>
          Item media can also render thumbnail images for richer list layouts.
        </ItemDescription>
      </ItemContent>
    </Item>,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1265"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Image media item title and description render", async () => {
      expect(canvas.getByText("Generated preview image")).toBeInTheDocument();
      expect(canvas.getByText("Item media can also render thumbnail images for richer list layouts.")).toBeInTheDocument();
    });
    await step("Preview image is present", async () => {
      expect(canvas.getByRole("img", {
        name: "Preview"
      })).toBeInTheDocument();
    });
  }
}`,...u.parameters?.docs?.source}}};const q=["Default","Outline","Muted","Small","ExtraSmall","ImageMedia"];export{c as Default,p as ExtraSmall,u as ImageMedia,d as Muted,m as Outline,l as Small,q as __namedExportsOrder,P as default};
