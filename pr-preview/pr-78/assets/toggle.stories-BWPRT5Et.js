import{j as p}from"./iframe-14YYbrss.js";import{T as i}from"./toggle-Be65IcJN.js";import{B as d}from"./bold-pJrgafUu.js";import"./preload-helper-BbFkF2Um.js";import"./index-B8eA1Gpy.js";const{expect:c,within:l}=__STORYBOOK_MODULE_TEST__,v={title:"Components/Toggle",component:i,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{variant:{control:{type:"select"},options:["default","outline"]},size:{control:{type:"select"},options:["default","sm","lg"]}},args:{variant:"default",size:"default"}};function m(e){return p.jsxs(i,{...e,children:[p.jsx(d,{}),"Bold"]})}const t={render:m,parameters:{zephyr:{testCaseId:"SW-T1322"}},play:async({canvasElement:e,step:n})=>{const a=l(e);await n("Toggle button renders with label",async()=>{c(a.getByRole("button",{name:/bold/i})).toBeInTheDocument()})}},s={args:{variant:"outline"},render:m,parameters:{zephyr:{testCaseId:"SW-T1323"}},play:async({canvasElement:e,step:n})=>{const a=l(e);await n("Outline toggle renders",async()=>{c(a.getByRole("button",{name:/bold/i})).toBeInTheDocument()})}},r={args:{size:"sm"},render:m,parameters:{zephyr:{testCaseId:"SW-T1324"}},play:async({canvasElement:e,step:n})=>{const a=l(e);await n("Small toggle renders",async()=>{c(a.getByRole("button",{name:/bold/i})).toBeInTheDocument()})}},o={args:{size:"lg"},render:m,parameters:{zephyr:{testCaseId:"SW-T1325"}},play:async({canvasElement:e,step:n})=>{const a=l(e);await n("Large toggle renders",async()=>{c(a.getByRole("button",{name:/bold/i})).toBeInTheDocument()})}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: renderToggle,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1322"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Toggle button renders with label", async () => {
      expect(canvas.getByRole("button", {
        name: /bold/i
      })).toBeInTheDocument();
    });
  }
}`,...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "outline"
  },
  render: renderToggle,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1323"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Outline toggle renders", async () => {
      expect(canvas.getByRole("button", {
        name: /bold/i
      })).toBeInTheDocument();
    });
  }
}`,...s.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    size: "sm"
  },
  render: renderToggle,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1324"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Small toggle renders", async () => {
      expect(canvas.getByRole("button", {
        name: /bold/i
      })).toBeInTheDocument();
    });
  }
}`,...r.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    size: "lg"
  },
  render: renderToggle,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1325"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Large toggle renders", async () => {
      expect(canvas.getByRole("button", {
        name: /bold/i
      })).toBeInTheDocument();
    });
  }
}`,...o.parameters?.docs?.source}}};const b=["Default","Outline","Small","Large"];export{t as Default,o as Large,s as Outline,r as Small,b as __namedExportsOrder,v as default};
