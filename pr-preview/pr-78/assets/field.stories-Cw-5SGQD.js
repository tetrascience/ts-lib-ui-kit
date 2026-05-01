import{j as n,c as r}from"./iframe-14YYbrss.js";import{c as I}from"./index-B8eA1Gpy.js";import{L as D}from"./label-CEqn5uJp.js";import{I as f}from"./input-CUCTLqrj.js";import"./preload-helper-BbFkF2Um.js";function T({className:a,...e}){return n.jsx("fieldset",{"data-slot":"field-set",className:r("flex flex-col gap-4 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",a),...e})}function B({className:a,variant:e="legend",...t}){return n.jsx("legend",{"data-slot":"field-legend","data-variant":e,className:r("mb-1.5 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base",a),...t})}function v({className:a,...e}){return n.jsx("div",{"data-slot":"field-group",className:r("group/field-group @container/field-group flex w-full flex-col gap-5 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4",a),...e})}const w=I("group/field flex w-full gap-2 data-[invalid=true]:text-destructive",{variants:{orientation:{vertical:"flex-col *:w-full [&>.sr-only]:w-auto",horizontal:"flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",responsive:"flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px"}},defaultVariants:{orientation:"vertical"}});function m({className:a,orientation:e="vertical",...t}){return n.jsx("div",{role:"group","data-slot":"field","data-orientation":e,className:r(w({orientation:e}),a),...t})}function u({className:a,...e}){return n.jsx("div",{"data-slot":"field-content",className:r("group/field-content flex flex-1 flex-col gap-0.5 leading-snug",a),...e})}function x({className:a,...e}){return n.jsx(D,{"data-slot":"field-label",className:r("group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50 has-data-checked:border-primary/30 has-data-checked:bg-primary/5 has-[>[data-slot=field]]:rounded-lg has-[>[data-slot=field]]:border *:data-[slot=field]:p-2.5 dark:has-data-checked:border-primary/20 dark:has-data-checked:bg-primary/10","has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",a),...e})}function h({className:a,...e}){return n.jsx("div",{"data-slot":"field-label",className:r("flex w-fit items-center gap-2 text-sm leading-snug font-medium group-data-[disabled=true]/field:opacity-50",a),...e})}function g({className:a,...e}){return n.jsx("p",{"data-slot":"field-description",className:r("text-left text-sm leading-normal font-normal text-muted-foreground group-has-data-horizontal/field:text-balance [[data-variant=legend]+&]:-mt-1.5","last:mt-0 nth-last-2:-mt-1","[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",a),...e})}m.__docgenInfo={description:"",methods:[],displayName:"Field",props:{orientation:{defaultValue:{value:'"vertical"',computed:!1},required:!1}}};x.__docgenInfo={description:"",methods:[],displayName:"FieldLabel"};g.__docgenInfo={description:"",methods:[],displayName:"FieldDescription"};v.__docgenInfo={description:"",methods:[],displayName:"FieldGroup"};B.__docgenInfo={description:"",methods:[],displayName:"FieldLegend",props:{variant:{required:!1,tsType:{name:"union",raw:'"legend" | "label"',elements:[{name:"literal",value:'"legend"'},{name:"literal",value:'"label"'}]},description:"",defaultValue:{value:'"legend"',computed:!1}}}};T.__docgenInfo={description:"",methods:[],displayName:"FieldSet"};u.__docgenInfo={description:"",methods:[],displayName:"FieldContent"};h.__docgenInfo={description:"",methods:[],displayName:"FieldTitle"};const{expect:o,within:s}=__STORYBOOK_MODULE_TEST__,E={title:"Components/Field",component:m,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{orientation:{control:{type:"select"},options:["vertical","horizontal","responsive"]}},args:{orientation:"vertical"}};function y(a){return n.jsx("div",{className:"w-[420px]",children:n.jsxs(m,{...a,children:[n.jsx(x,{htmlFor:"field-story-input",children:n.jsx(h,{children:"Project name"})}),n.jsxs(u,{children:[n.jsx(f,{id:"field-story-input",placeholder:"Enter a project name"}),n.jsx(g,{children:"Used in dashboards and reports."})]})]})})}function b(a){return n.jsx("div",{className:"w-[420px]",children:n.jsxs(T,{children:[n.jsx(B,{variant:a,children:"Workspace details"}),n.jsx(v,{children:n.jsxs(m,{children:[n.jsx(x,{htmlFor:"field-legend-input",children:n.jsx(h,{children:"Name"})}),n.jsxs(u,{children:[n.jsx(f,{id:"field-legend-input",placeholder:"My workspace"}),n.jsx(g,{children:"Visible to all collaborators."})]})]})})]})})}const l={render:y,parameters:{zephyr:{testCaseId:"SW-T1239"}},play:async({canvasElement:a,step:e})=>{const t=s(a);await e("Label and input render",async()=>{o(t.getByText("Project name")).toBeInTheDocument(),o(t.getByRole("textbox")).toBeInTheDocument(),o(t.getByPlaceholderText("Enter a project name")).toBeInTheDocument()}),await e("Helper text renders",async()=>{o(t.getByText("Used in dashboards and reports.")).toBeInTheDocument()})}},d={args:{orientation:"horizontal"},render:y,parameters:{zephyr:{testCaseId:"SW-T1240"}},play:async({canvasElement:a,step:e})=>{const t=s(a);await e("Label and input render",async()=>{o(t.getByText("Project name")).toBeInTheDocument(),o(t.getByRole("textbox")).toBeInTheDocument(),o(t.getByPlaceholderText("Enter a project name")).toBeInTheDocument()}),await e("Helper text renders",async()=>{o(t.getByText("Used in dashboards and reports.")).toBeInTheDocument()})}},c={args:{orientation:"responsive"},render:y,parameters:{zephyr:{testCaseId:"SW-T1241"}},play:async({canvasElement:a,step:e})=>{const t=s(a);await e("Label and input render",async()=>{o(t.getByText("Project name")).toBeInTheDocument(),o(t.getByRole("textbox")).toBeInTheDocument(),o(t.getByPlaceholderText("Enter a project name")).toBeInTheDocument()}),await e("Helper text renders",async()=>{o(t.getByText("Used in dashboards and reports.")).toBeInTheDocument()})}},i={render:()=>b("legend"),parameters:{zephyr:{testCaseId:"SW-T1242"}},play:async({canvasElement:a,step:e})=>{const t=s(a);await e("Legend and field render",async()=>{o(t.getByText("Workspace details")).toBeInTheDocument(),o(t.getByText("Name")).toBeInTheDocument(),o(t.getByRole("textbox")).toBeInTheDocument(),o(t.getByPlaceholderText("My workspace")).toBeInTheDocument()}),await e("Field description renders",async()=>{o(t.getByText("Visible to all collaborators.")).toBeInTheDocument()})}},p={render:()=>b("label"),parameters:{zephyr:{testCaseId:"SW-T1243"}},play:async({canvasElement:a,step:e})=>{const t=s(a);await e("Legend label and field render",async()=>{o(t.getByText("Workspace details")).toBeInTheDocument(),o(t.getByText("Name")).toBeInTheDocument(),o(t.getByRole("textbox")).toBeInTheDocument(),o(t.getByPlaceholderText("My workspace")).toBeInTheDocument()}),await e("Field description renders",async()=>{o(t.getByText("Visible to all collaborators.")).toBeInTheDocument()})}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: renderField,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1239"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Label and input render", async () => {
      expect(canvas.getByText("Project name")).toBeInTheDocument();
      expect(canvas.getByRole("textbox")).toBeInTheDocument();
      expect(canvas.getByPlaceholderText("Enter a project name")).toBeInTheDocument();
    });
    await step("Helper text renders", async () => {
      expect(canvas.getByText("Used in dashboards and reports.")).toBeInTheDocument();
    });
  }
}`,...l.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: "horizontal"
  },
  render: renderField,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1240"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Label and input render", async () => {
      expect(canvas.getByText("Project name")).toBeInTheDocument();
      expect(canvas.getByRole("textbox")).toBeInTheDocument();
      expect(canvas.getByPlaceholderText("Enter a project name")).toBeInTheDocument();
    });
    await step("Helper text renders", async () => {
      expect(canvas.getByText("Used in dashboards and reports.")).toBeInTheDocument();
    });
  }
}`,...d.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: "responsive"
  },
  render: renderField,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1241"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Label and input render", async () => {
      expect(canvas.getByText("Project name")).toBeInTheDocument();
      expect(canvas.getByRole("textbox")).toBeInTheDocument();
      expect(canvas.getByPlaceholderText("Enter a project name")).toBeInTheDocument();
    });
    await step("Helper text renders", async () => {
      expect(canvas.getByText("Used in dashboards and reports.")).toBeInTheDocument();
    });
  }
}`,...c.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => renderLegend("legend"),
  parameters: {
    zephyr: {
      testCaseId: "SW-T1242"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Legend and field render", async () => {
      expect(canvas.getByText("Workspace details")).toBeInTheDocument();
      expect(canvas.getByText("Name")).toBeInTheDocument();
      expect(canvas.getByRole("textbox")).toBeInTheDocument();
      expect(canvas.getByPlaceholderText("My workspace")).toBeInTheDocument();
    });
    await step("Field description renders", async () => {
      expect(canvas.getByText("Visible to all collaborators.")).toBeInTheDocument();
    });
  }
}`,...i.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => renderLegend("label"),
  parameters: {
    zephyr: {
      testCaseId: "SW-T1243"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Legend label and field render", async () => {
      expect(canvas.getByText("Workspace details")).toBeInTheDocument();
      expect(canvas.getByText("Name")).toBeInTheDocument();
      expect(canvas.getByRole("textbox")).toBeInTheDocument();
      expect(canvas.getByPlaceholderText("My workspace")).toBeInTheDocument();
    });
    await step("Field description renders", async () => {
      expect(canvas.getByText("Visible to all collaborators.")).toBeInTheDocument();
    });
  }
}`,...p.parameters?.docs?.source}}};const k=["Vertical","Horizontal","Responsive","Legend","Label"];export{d as Horizontal,p as Label,i as Legend,c as Responsive,l as Vertical,k as __namedExportsOrder,E as default};
