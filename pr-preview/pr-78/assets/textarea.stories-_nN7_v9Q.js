import{j as d,c as p}from"./iframe-14YYbrss.js";import"./preload-helper-BbFkF2Um.js";function o({className:e,...a}){return d.jsx("textarea",{"data-slot":"textarea",className:p("flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",e),...a})}o.__docgenInfo={description:"",methods:[],displayName:"Textarea"};const{expect:s,within:c}=__STORYBOOK_MODULE_TEST__,v={title:"Components/Textarea",component:o,parameters:{layout:"centered"},tags:["autodocs"],args:{placeholder:"Add any notes for reviewers",rows:5}};function l(e){return d.jsx(o,{...e,className:"w-[360px]"})}const n={render:l,parameters:{zephyr:{testCaseId:"SW-T1314"}},play:async({canvasElement:e,step:a})=>{const t=c(e);await a("Textarea renders",async()=>{s(t.getByRole("textbox")).toBeInTheDocument()}),await a("Placeholder is shown",async()=>{s(t.getByPlaceholderText("Add any notes for reviewers")).toBeInTheDocument()})}},r={args:{disabled:!0,value:"Review complete. Changes approved."},render:l,parameters:{zephyr:{testCaseId:"SW-T1315"}},play:async({canvasElement:e,step:a})=>{const t=c(e);await a("Disabled textarea renders with value",async()=>{const i=t.getByRole("textbox");s(i).toBeDisabled(),s(i).toHaveValue("Review complete. Changes approved.")})}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: renderTextarea,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1314"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Textarea renders", async () => {
      expect(canvas.getByRole("textbox")).toBeInTheDocument();
    });
    await step("Placeholder is shown", async () => {
      expect(canvas.getByPlaceholderText("Add any notes for reviewers")).toBeInTheDocument();
    });
  }
}`,...n.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    value: "Review complete. Changes approved."
  },
  render: renderTextarea,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1315"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Disabled textarea renders with value", async () => {
      const field = canvas.getByRole("textbox");
      expect(field).toBeDisabled();
      expect(field).toHaveValue("Review complete. Changes approved.");
    });
  }
}`,...r.parameters?.docs?.source}}};const x=["Default","Disabled"];export{n as Default,r as Disabled,x as __namedExportsOrder,v as default};
