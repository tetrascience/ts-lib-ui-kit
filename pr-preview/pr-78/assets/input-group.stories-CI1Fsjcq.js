import{j as r}from"./iframe-14YYbrss.js";import{I as B,a as T,b as x,c as I,d as S}from"./input-group-CYOZ_nWh.js";import{S as v}from"./search-5w6eG1Tc.js";import"./preload-helper-BbFkF2Um.js";import"./index-B8eA1Gpy.js";import"./button-BSJeE99h.js";import"./input-CUCTLqrj.js";const{expect:a,within:s}=__STORYBOOK_MODULE_TEST__,P={title:"Components/InputGroup",component:B,parameters:{layout:"centered"},tags:["autodocs"]};function h(e){const t=r.jsx(x,{align:e,children:r.jsx(S,{children:"https://"})});return r.jsx("div",{className:"w-[320px]",children:r.jsxs(B,{children:[(e==="inline-start"||e==="block-start")&&t,r.jsx(T,{placeholder:"app.tetrascience.com"}),(e==="inline-end"||e==="block-end")&&t]})})}function y(e){const t=e==="icon-xs"||e==="icon-sm";return r.jsx("div",{className:"w-[320px]",children:r.jsxs(B,{children:[r.jsx(T,{placeholder:"Search"}),r.jsx(x,{align:"inline-end",children:r.jsx(I,{size:e,children:t?r.jsx(v,{}):"Go"})})]})})}const c={render:()=>h("inline-start"),parameters:{zephyr:{testCaseId:"SW-T1247"}},play:async({canvasElement:e,step:t})=>{const n=s(e);await t("Addon prefix and input render",async()=>{a(n.getByText("https://")).toBeInTheDocument(),a(n.getByPlaceholderText("app.tetrascience.com")).toBeInTheDocument()})}},o={render:()=>h("inline-end"),parameters:{zephyr:{testCaseId:"SW-T1248"}},play:async({canvasElement:e,step:t})=>{const n=s(e);await t("Addon suffix and input render",async()=>{a(n.getByText("https://")).toBeInTheDocument(),a(n.getByPlaceholderText("app.tetrascience.com")).toBeInTheDocument()})}},p={render:()=>h("block-start"),parameters:{zephyr:{testCaseId:"SW-T1249"}},play:async({canvasElement:e,step:t})=>{const n=s(e);await t("Block-start addon and input render",async()=>{a(n.getByText("https://")).toBeInTheDocument(),a(n.getByPlaceholderText("app.tetrascience.com")).toBeInTheDocument()})}},d={render:()=>h("block-end"),parameters:{zephyr:{testCaseId:"SW-T1250"}},play:async({canvasElement:e,step:t})=>{const n=s(e);await t("Block-end addon and input render",async()=>{a(n.getByText("https://")).toBeInTheDocument(),a(n.getByPlaceholderText("app.tetrascience.com")).toBeInTheDocument()})}},m={render:()=>y("xs"),parameters:{zephyr:{testCaseId:"SW-T1251"}},play:async({canvasElement:e,step:t})=>{const n=s(e);await t("Search input and Go button render",async()=>{a(n.getByPlaceholderText("Search")).toBeInTheDocument(),a(n.getByRole("button",{name:"Go"})).toBeInTheDocument()})}},u={render:()=>y("sm"),parameters:{zephyr:{testCaseId:"SW-T1252"}},play:async({canvasElement:e,step:t})=>{const n=s(e);await t("Search input and Go button render",async()=>{a(n.getByPlaceholderText("Search")).toBeInTheDocument(),a(n.getByRole("button",{name:"Go"})).toBeInTheDocument()})}},i={render:()=>y("icon-xs"),parameters:{zephyr:{testCaseId:"SW-T1253"}},play:async({canvasElement:e,step:t})=>{const n=s(e);await t("Search input and icon suffix button render",async()=>{a(n.getByPlaceholderText("Search")).toBeInTheDocument(),a(n.getByRole("button")).toBeInTheDocument()})}},l={render:()=>y("icon-sm"),parameters:{zephyr:{testCaseId:"SW-T1254"}},play:async({canvasElement:e,step:t})=>{const n=s(e);await t("Search input and icon suffix button render",async()=>{a(n.getByPlaceholderText("Search")).toBeInTheDocument(),a(n.getByRole("button")).toBeInTheDocument()})}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => renderAddon("inline-start"),
  parameters: {
    zephyr: {
      testCaseId: "SW-T1247"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Addon prefix and input render", async () => {
      expect(canvas.getByText("https://")).toBeInTheDocument();
      expect(canvas.getByPlaceholderText("app.tetrascience.com")).toBeInTheDocument();
    });
  }
}`,...c.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => renderAddon("inline-end"),
  parameters: {
    zephyr: {
      testCaseId: "SW-T1248"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Addon suffix and input render", async () => {
      expect(canvas.getByText("https://")).toBeInTheDocument();
      expect(canvas.getByPlaceholderText("app.tetrascience.com")).toBeInTheDocument();
    });
  }
}`,...o.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => renderAddon("block-start"),
  parameters: {
    zephyr: {
      testCaseId: "SW-T1249"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Block-start addon and input render", async () => {
      expect(canvas.getByText("https://")).toBeInTheDocument();
      expect(canvas.getByPlaceholderText("app.tetrascience.com")).toBeInTheDocument();
    });
  }
}`,...p.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => renderAddon("block-end"),
  parameters: {
    zephyr: {
      testCaseId: "SW-T1250"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Block-end addon and input render", async () => {
      expect(canvas.getByText("https://")).toBeInTheDocument();
      expect(canvas.getByPlaceholderText("app.tetrascience.com")).toBeInTheDocument();
    });
  }
}`,...d.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => renderButton("xs"),
  parameters: {
    zephyr: {
      testCaseId: "SW-T1251"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Search input and Go button render", async () => {
      expect(canvas.getByPlaceholderText("Search")).toBeInTheDocument();
      expect(canvas.getByRole("button", {
        name: "Go"
      })).toBeInTheDocument();
    });
  }
}`,...m.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => renderButton("sm"),
  parameters: {
    zephyr: {
      testCaseId: "SW-T1252"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Search input and Go button render", async () => {
      expect(canvas.getByPlaceholderText("Search")).toBeInTheDocument();
      expect(canvas.getByRole("button", {
        name: "Go"
      })).toBeInTheDocument();
    });
  }
}`,...u.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => renderButton("icon-xs"),
  parameters: {
    zephyr: {
      testCaseId: "SW-T1253"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Search input and icon suffix button render", async () => {
      expect(canvas.getByPlaceholderText("Search")).toBeInTheDocument();
      expect(canvas.getByRole("button")).toBeInTheDocument();
    });
  }
}`,...i.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => renderButton("icon-sm"),
  parameters: {
    zephyr: {
      testCaseId: "SW-T1254"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Search input and icon suffix button render", async () => {
      expect(canvas.getByPlaceholderText("Search")).toBeInTheDocument();
      expect(canvas.getByRole("button")).toBeInTheDocument();
    });
  }
}`,...l.parameters?.docs?.source}}};const W=["InlineStart","InlineEnd","BlockStart","BlockEnd","ButtonXs","ButtonSm","ButtonIconXs","ButtonIconSm"];export{d as BlockEnd,p as BlockStart,l as ButtonIconSm,i as ButtonIconXs,u as ButtonSm,m as ButtonXs,o as InlineEnd,c as InlineStart,W as __namedExportsOrder,P as default};
