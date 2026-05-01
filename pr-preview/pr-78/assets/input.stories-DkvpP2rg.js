import{j as u}from"./iframe-14YYbrss.js";import{I as l}from"./input-CUCTLqrj.js";import"./preload-helper-BbFkF2Um.js";const{expect:a,within:i}=__STORYBOOK_MODULE_TEST__,x={title:"Components/Input",component:l,parameters:{layout:"centered"},tags:["autodocs"],args:{placeholder:"Enter a value",type:"text"}};function c(e){return u.jsx(l,{...e,className:"w-[320px]"})}const s={render:c,parameters:{zephyr:{testCaseId:"SW-T1257"}},play:async({canvasElement:e,step:n})=>{const t=i(e);await n("Text input renders",async()=>{a(t.getByRole("textbox")).toBeInTheDocument(),a(t.getByPlaceholderText("Enter a value")).toBeInTheDocument()})}},r={args:{disabled:!0,value:"Build completed"},render:c,parameters:{zephyr:{testCaseId:"SW-T1258"}},play:async({canvasElement:e,step:n})=>{const t=i(e);await n("Disabled input renders with value",async()=>{const p=t.getByRole("textbox");a(p).toBeDisabled(),a(p).toHaveValue("Build completed")})}},o={args:{type:"file"},render:c,parameters:{zephyr:{testCaseId:"SW-T1259"}},play:async({canvasElement:e,step:n})=>{await n("File input renders",async()=>{const t=e.querySelector('input[type="file"]');a(t).toBeInTheDocument()})}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: renderInput,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1257"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Text input renders", async () => {
      expect(canvas.getByRole("textbox")).toBeInTheDocument();
      expect(canvas.getByPlaceholderText("Enter a value")).toBeInTheDocument();
    });
  }
}`,...s.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    value: "Build completed"
  },
  render: renderInput,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1258"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Disabled input renders with value", async () => {
      const input = canvas.getByRole("textbox");
      expect(input).toBeDisabled();
      expect(input).toHaveValue("Build completed");
    });
  }
}`,...r.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    type: "file"
  },
  render: renderInput,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1259"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    await step("File input renders", async () => {
      const fileInput = canvasElement.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();
    });
  }
}`,...o.parameters?.docs?.source}}};const v=["Default","Disabled","File"];export{s as Default,r as Disabled,o as File,v as __namedExportsOrder,x as default};
