import{j as e,c,S as x}from"./iframe-14YYbrss.js";import{C as g}from"./chevron-right-CDyisS10.js";import{E as y}from"./ellipsis-5QsaIXE-.js";import"./preload-helper-BbFkF2Um.js";function l({className:r,...n}){return e.jsx("nav",{"aria-label":"breadcrumb","data-slot":"breadcrumb",className:c(r),...n})}function u({className:r,...n}){return e.jsx("ol",{"data-slot":"breadcrumb-list",className:c("flex flex-wrap items-center gap-1.5 text-sm wrap-break-word text-muted-foreground",r),...n})}function s({className:r,...n}){return e.jsx("li",{"data-slot":"breadcrumb-item",className:c("inline-flex items-center gap-1",r),...n})}function m({asChild:r,className:n,...a}){const h=r?x:"a";return e.jsx(h,{"data-slot":"breadcrumb-link",className:c("transition-colors hover:text-foreground",n),...a})}function p({className:r,...n}){return e.jsx("span",{"data-slot":"breadcrumb-page",role:"link","aria-disabled":"true","aria-current":"page",className:c("font-normal text-foreground",r),...n})}function o({children:r,className:n,...a}){return e.jsx("li",{"data-slot":"breadcrumb-separator",role:"presentation","aria-hidden":"true",className:c("[&>svg]:size-3.5",n),...a,children:r??e.jsx(g,{})})}function B({className:r,...n}){return e.jsxs("span",{"data-slot":"breadcrumb-ellipsis",role:"presentation","aria-hidden":"true",className:c("flex size-5 items-center justify-center [&>svg]:size-4",r),...n,children:[e.jsx(y,{}),e.jsx("span",{className:"sr-only",children:"More"})]})}l.__docgenInfo={description:"",methods:[],displayName:"Breadcrumb"};u.__docgenInfo={description:"",methods:[],displayName:"BreadcrumbList"};s.__docgenInfo={description:"",methods:[],displayName:"BreadcrumbItem"};m.__docgenInfo={description:"",methods:[],displayName:"BreadcrumbLink",props:{asChild:{required:!1,tsType:{name:"boolean"},description:""}}};p.__docgenInfo={description:"",methods:[],displayName:"BreadcrumbPage"};o.__docgenInfo={description:"",methods:[],displayName:"BreadcrumbSeparator"};B.__docgenInfo={description:"",methods:[],displayName:"BreadcrumbEllipsis"};const{expect:t,within:b}=__STORYBOOK_MODULE_TEST__,v={title:"Components/Breadcrumb",component:l,parameters:{layout:"centered"},tags:["autodocs"]},i={render:()=>e.jsx(l,{children:e.jsxs(u,{children:[e.jsx(s,{children:e.jsx(m,{href:"#",children:"Workspace"})}),e.jsx(o,{}),e.jsx(s,{children:e.jsx(m,{href:"#",children:"UI Kit"})}),e.jsx(o,{}),e.jsx(s,{children:e.jsx(p,{children:"Storybook"})})]})}),parameters:{zephyr:{testCaseId:"SW-T1198"}},play:async({canvasElement:r,step:n})=>{const a=b(r);await n("Breadcrumb navigation renders",async()=>{t(a.getByRole("navigation",{name:"breadcrumb"})).toBeInTheDocument()}),await n("Trail links and current page are visible",async()=>{t(a.getByRole("link",{name:"Workspace"})).toBeInTheDocument(),t(a.getByRole("link",{name:"UI Kit"})).toBeInTheDocument(),t(a.getByRole("link",{name:"Storybook"})).toBeInTheDocument()})}},d={render:()=>e.jsx(l,{children:e.jsxs(u,{children:[e.jsx(s,{children:e.jsx(m,{href:"#",children:"Workspace"})}),e.jsx(o,{}),e.jsx(s,{children:e.jsx(B,{})}),e.jsx(o,{}),e.jsx(s,{children:e.jsx(m,{href:"#",children:"Components"})}),e.jsx(o,{}),e.jsx(s,{children:e.jsx(p,{children:"Hover Card"})})]})}),parameters:{zephyr:{testCaseId:"SW-T1199"}},play:async({canvasElement:r,step:n})=>{const a=b(r);await n("Breadcrumb with ellipsis renders",async()=>{t(a.getByRole("navigation",{name:"breadcrumb"})).toBeInTheDocument()}),await n("Collapsed trail shows links, ellipsis, and current page",async()=>{t(a.getByRole("link",{name:"Workspace"})).toBeInTheDocument(),t(a.getByText("More")).toBeInTheDocument(),t(a.getByRole("link",{name:"Components"})).toBeInTheDocument(),t(a.getByRole("link",{name:"Hover Card"})).toBeInTheDocument()})}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Workspace</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#">UI Kit</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Storybook</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1198"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Breadcrumb navigation renders", async () => {
      expect(canvas.getByRole("navigation", {
        name: "breadcrumb"
      })).toBeInTheDocument();
    });
    await step("Trail links and current page are visible", async () => {
      expect(canvas.getByRole("link", {
        name: "Workspace"
      })).toBeInTheDocument();
      expect(canvas.getByRole("link", {
        name: "UI Kit"
      })).toBeInTheDocument();
      expect(canvas.getByRole("link", {
        name: "Storybook"
      })).toBeInTheDocument();
    });
  }
}`,...i.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Workspace</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Hover Card</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1199"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Breadcrumb with ellipsis renders", async () => {
      expect(canvas.getByRole("navigation", {
        name: "breadcrumb"
      })).toBeInTheDocument();
    });
    await step("Collapsed trail shows links, ellipsis, and current page", async () => {
      expect(canvas.getByRole("link", {
        name: "Workspace"
      })).toBeInTheDocument();
      expect(canvas.getByText("More")).toBeInTheDocument();
      expect(canvas.getByRole("link", {
        name: "Components"
      })).toBeInTheDocument();
      expect(canvas.getByRole("link", {
        name: "Hover Card"
      })).toBeInTheDocument();
    });
  }
}`,...d.parameters?.docs?.source}}};const T=["Default","Collapsed"];export{d as Collapsed,i as Default,T as __namedExportsOrder,v as default};
