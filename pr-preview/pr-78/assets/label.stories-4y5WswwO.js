import{j as e}from"./iframe-14YYbrss.js";import{I as d}from"./input-CUCTLqrj.js";import{L as c}from"./label-CEqn5uJp.js";import"./preload-helper-BbFkF2Um.js";const{expect:t,within:l}=__STORYBOOK_MODULE_TEST__,u={title:"Components/Label",component:c,parameters:{layout:"centered"},tags:["autodocs"]},n={render:()=>e.jsxs("div",{className:"grid w-[320px] gap-2",children:[e.jsx(c,{htmlFor:"storybook-email",children:"Email address"}),e.jsx(d,{id:"storybook-email",placeholder:"name@company.com"})]}),parameters:{zephyr:{testCaseId:"SW-T1268"}},play:async({canvasElement:o,step:r})=>{const a=l(o);await r("Label and associated input render",async()=>{t(a.getByText("Email address")).toBeInTheDocument(),t(a.getByPlaceholderText("name@company.com")).toBeInTheDocument()})}},s={render:()=>e.jsxs("div",{className:"grid w-[320px] gap-2",children:[e.jsx(c,{htmlFor:"storybook-disabled",children:"Workspace"}),e.jsx(d,{id:"storybook-disabled",disabled:!0,value:"Production"})]}),parameters:{zephyr:{testCaseId:"SW-T1269"}},play:async({canvasElement:o,step:r})=>{const a=l(o);await r("Label and disabled input render",async()=>{t(a.getByText("Workspace")).toBeInTheDocument(),t(a.getByDisplayValue("Production")).toBeInTheDocument()})}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid w-[320px] gap-2">
      <Label htmlFor="storybook-email">Email address</Label>
      <Input id="storybook-email" placeholder="name@company.com" />
    </div>,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1268"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Label and associated input render", async () => {
      expect(canvas.getByText("Email address")).toBeInTheDocument();
      expect(canvas.getByPlaceholderText("name@company.com")).toBeInTheDocument();
    });
  }
}`,...n.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid w-[320px] gap-2">
      <Label htmlFor="storybook-disabled">Workspace</Label>
      <Input id="storybook-disabled" disabled value="Production" />
    </div>,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1269"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Label and disabled input render", async () => {
      expect(canvas.getByText("Workspace")).toBeInTheDocument();
      expect(canvas.getByDisplayValue("Production")).toBeInTheDocument();
    });
  }
}`,...s.parameters?.docs?.source}}};const b=["Default","DisabledField"];export{n as Default,s as DisabledField,b as __namedExportsOrder,u as default};
