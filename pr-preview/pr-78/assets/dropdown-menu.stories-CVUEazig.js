import{j as n}from"./iframe-14YYbrss.js";import{B as p}from"./button-BSJeE99h.js";import{D as i,a as d,b as l,c as y}from"./dropdown-menu-B24EhkCn.js";import"./preload-helper-BbFkF2Um.js";import"./index-B8eA1Gpy.js";import"./index-B_XuWxj8.js";import"./index-CzkjiSpZ.js";import"./index-SK9A3v17.js";import"./index-Bjo__dt-.js";import"./index-_AbBFJ6v.js";const{expect:t,within:c}=__STORYBOOK_MODULE_TEST__,R={title:"Components/DropdownMenu",component:i,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{variant:{control:{type:"select"},options:["default","destructive"]}}};function u(e){return n.jsxs(d,{open:!0,children:[n.jsx(l,{asChild:!0,children:n.jsx(p,{variant:"outline",children:"Open menu"})}),n.jsxs(y,{className:"w-48",children:[n.jsx(i,{...e,children:"Rename"}),n.jsx(i,{children:"Duplicate"})]})]})}const o={args:{children:"Rename",variant:"default"},render:u,parameters:{zephyr:{testCaseId:"SW-T1237"}},play:async({canvasElement:e,step:a})=>{const m=c(e),r=c(e.ownerDocument.body);await a("Menu trigger renders",async()=>{t(m.getByText("Open menu")).toBeInTheDocument()}),await a("Menu items render",async()=>{t(r.getByRole("menuitem",{name:"Rename"})).toBeInTheDocument(),t(r.getByRole("menuitem",{name:"Duplicate"})).toBeInTheDocument()})}},s={args:{children:"Delete",variant:"destructive"},render:u,parameters:{zephyr:{testCaseId:"SW-T1238"}},play:async({canvasElement:e,step:a})=>{const m=c(e),r=c(e.ownerDocument.body);await a("Menu trigger renders",async()=>{t(m.getByText("Open menu")).toBeInTheDocument()}),await a("Menu items render",async()=>{t(r.getByRole("menuitem",{name:"Rename"})).toBeInTheDocument(),t(r.getByRole("menuitem",{name:"Duplicate"})).toBeInTheDocument()})}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    children: "Rename",
    variant: "default"
  },
  render: renderMenu,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1237"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await step("Menu trigger renders", async () => {
      expect(canvas.getByText("Open menu")).toBeInTheDocument();
    });
    await step("Menu items render", async () => {
      expect(body.getByRole("menuitem", {
        name: "Rename"
      })).toBeInTheDocument();
      expect(body.getByRole("menuitem", {
        name: "Duplicate"
      })).toBeInTheDocument();
    });
  }
}`,...o.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    children: "Delete",
    variant: "destructive"
  },
  render: renderMenu,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1238"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await step("Menu trigger renders", async () => {
      expect(canvas.getByText("Open menu")).toBeInTheDocument();
    });
    await step("Menu items render", async () => {
      expect(body.getByRole("menuitem", {
        name: "Rename"
      })).toBeInTheDocument();
      expect(body.getByRole("menuitem", {
        name: "Duplicate"
      })).toBeInTheDocument();
    });
  }
}`,...s.parameters?.docs?.source}}};const b=["Default","Destructive"];export{o as Default,s as Destructive,b as __namedExportsOrder,R as default};
