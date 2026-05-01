import{j as e}from"./iframe-14YYbrss.js";import{B as l}from"./button-BSJeE99h.js";import{S as m,a as h,b as g,c as u,d as S,e as y}from"./sheet-Cu6TYjPq.js";import"./preload-helper-BbFkF2Um.js";import"./index-B8eA1Gpy.js";import"./x-B6L8IQUu.js";import"./index-CKyK_5sn.js";import"./index-Bjo__dt-.js";const{expect:t,within:x}=__STORYBOOK_MODULE_TEST__,v={title:"Components/Sheet",component:m,parameters:{layout:"centered",docs:{story:{inline:!1,iframeHeight:400}}},tags:["autodocs"],argTypes:{side:{control:{type:"select"},options:["top","right","bottom","left"]}},args:{side:"right"}};function d(c){return e.jsx("div",{className:"relative h-[380px] w-[640px] overflow-hidden rounded-xl border bg-background",children:e.jsx(h,{open:!0,children:e.jsxs(m,{...c,children:[e.jsxs(g,{children:[e.jsx(u,{children:"Workspace settings"}),e.jsx(S,{children:"Configure the workspace name, sharing options, and export defaults."})]}),e.jsxs("div",{className:"grid gap-3 px-4 text-sm text-muted-foreground",children:[e.jsx("div",{className:"rounded-lg border p-3",children:"Project name: TS UI Kit"}),e.jsx("div",{className:"rounded-lg border p-3",children:"Default destination: Reports"}),e.jsx("div",{className:"rounded-lg border p-3",children:"Sharing: Team only"})]}),e.jsx(y,{children:e.jsx(l,{children:"Save changes"})})]})})})}const p=async({canvasElement:c,step:i})=>{const r=x(c.ownerDocument.body);await i("Sheet content renders in portal",async()=>{t(r.getByText("Workspace settings")).toBeInTheDocument(),t(r.getByText("Configure the workspace name, sharing options, and export defaults.")).toBeInTheDocument()}),await i("Sheet actions",async()=>{t(r.getByRole("button",{name:"Save changes"})).toBeInTheDocument(),t(r.getByRole("button",{name:"Close"})).toBeInTheDocument()})},s={render:d,parameters:{zephyr:{testCaseId:"SW-T1284"}},play:p},a={args:{side:"left"},render:d,parameters:{zephyr:{testCaseId:"SW-T1285"}},play:p},n={args:{side:"top"},render:d,parameters:{zephyr:{testCaseId:"SW-T1286"}},play:p},o={args:{side:"bottom"},render:d,parameters:{zephyr:{testCaseId:"SW-T1287"}},play:p};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: renderSheet,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1284"
    }
  },
  play: playSheet
}`,...s.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    side: "left"
  },
  render: renderSheet,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1285"
    }
  },
  play: playSheet
}`,...a.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    side: "top"
  },
  render: renderSheet,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1286"
    }
  },
  play: playSheet
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    side: "bottom"
  },
  render: renderSheet,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1287"
    }
  },
  play: playSheet
}`,...o.parameters?.docs?.source}}};const w=["Right","Left","Top","Bottom"];export{o as Bottom,a as Left,s as Right,n as Top,w as __namedExportsOrder,v as default};
