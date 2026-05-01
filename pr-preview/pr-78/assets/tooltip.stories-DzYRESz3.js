import{y,j as c,z as u,B as T,E as g}from"./iframe-14YYbrss.js";import{B as h}from"./button-BSJeE99h.js";import"./preload-helper-BbFkF2Um.js";import"./index-B8eA1Gpy.js";const{expect:t,within:s}=__STORYBOOK_MODULE_TEST__,v={title:"Components/Tooltip",component:y,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{side:{control:{type:"select"},options:["top","right","bottom","left"]}},args:{side:"top",sideOffset:8}};function m(e){return c.jsx(u,{children:c.jsx("div",{className:"flex h-[180px] w-[260px] items-center justify-center rounded-xl border bg-background",children:c.jsxs(T,{open:!0,children:[c.jsx(g,{asChild:!0,children:c.jsx(h,{variant:"outline",children:"Export status"})}),c.jsx(y,{...e,children:"Last synced 3 minutes ago"})]})})})}const i={render:m,parameters:{zephyr:{testCaseId:"SW-T1326"}},play:async({canvasElement:e,step:n})=>{const a=s(e),r=s(e.ownerDocument.body);await n("Tooltip trigger renders",async()=>{t(a.getByRole("button",{name:"Export status"})).toBeInTheDocument()}),await n("Tooltip content is visible in portal",async()=>{const o=r.getAllByText("Last synced 3 minutes ago");t(o.length).toBeGreaterThan(0),t(o[0]).toBeInTheDocument()})}},p={args:{side:"right"},render:m,parameters:{zephyr:{testCaseId:"SW-T1327"}},play:async({canvasElement:e,step:n})=>{const a=s(e),r=s(e.ownerDocument.body);await n("Tooltip trigger renders",async()=>{t(a.getByRole("button",{name:"Export status"})).toBeInTheDocument()}),await n("Tooltip content is visible in portal",async()=>{const o=r.getAllByText("Last synced 3 minutes ago");t(o.length).toBeGreaterThan(0),t(o[0]).toBeInTheDocument()})}},d={args:{side:"bottom"},render:m,parameters:{zephyr:{testCaseId:"SW-T1328"}},play:async({canvasElement:e,step:n})=>{const a=s(e),r=s(e.ownerDocument.body);await n("Tooltip trigger renders",async()=>{t(a.getByRole("button",{name:"Export status"})).toBeInTheDocument()}),await n("Tooltip content is visible in portal",async()=>{const o=r.getAllByText("Last synced 3 minutes ago");t(o.length).toBeGreaterThan(0),t(o[0]).toBeInTheDocument()})}},l={args:{side:"left"},render:m,parameters:{zephyr:{testCaseId:"SW-T1329"}},play:async({canvasElement:e,step:n})=>{const a=s(e),r=s(e.ownerDocument.body);await n("Tooltip trigger renders",async()=>{t(a.getByRole("button",{name:"Export status"})).toBeInTheDocument()}),await n("Tooltip content is visible in portal",async()=>{const o=r.getAllByText("Last synced 3 minutes ago");t(o.length).toBeGreaterThan(0),t(o[0]).toBeInTheDocument()})}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: renderTooltip,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1326"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await step("Tooltip trigger renders", async () => {
      expect(canvas.getByRole("button", {
        name: "Export status"
      })).toBeInTheDocument();
    });
    await step("Tooltip content is visible in portal", async () => {
      const nodes = body.getAllByText("Last synced 3 minutes ago");
      expect(nodes.length).toBeGreaterThan(0);
      expect(nodes[0]).toBeInTheDocument();
    });
  }
}`,...i.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    side: "right"
  },
  render: renderTooltip,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1327"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await step("Tooltip trigger renders", async () => {
      expect(canvas.getByRole("button", {
        name: "Export status"
      })).toBeInTheDocument();
    });
    await step("Tooltip content is visible in portal", async () => {
      const nodes = body.getAllByText("Last synced 3 minutes ago");
      expect(nodes.length).toBeGreaterThan(0);
      expect(nodes[0]).toBeInTheDocument();
    });
  }
}`,...p.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    side: "bottom"
  },
  render: renderTooltip,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1328"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await step("Tooltip trigger renders", async () => {
      expect(canvas.getByRole("button", {
        name: "Export status"
      })).toBeInTheDocument();
    });
    await step("Tooltip content is visible in portal", async () => {
      const nodes = body.getAllByText("Last synced 3 minutes ago");
      expect(nodes.length).toBeGreaterThan(0);
      expect(nodes[0]).toBeInTheDocument();
    });
  }
}`,...d.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    side: "left"
  },
  render: renderTooltip,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1329"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await step("Tooltip trigger renders", async () => {
      expect(canvas.getByRole("button", {
        name: "Export status"
      })).toBeInTheDocument();
    });
    await step("Tooltip content is visible in portal", async () => {
      const nodes = body.getAllByText("Last synced 3 minutes ago");
      expect(nodes.length).toBeGreaterThan(0);
      expect(nodes[0]).toBeInTheDocument();
    });
  }
}`,...l.parameters?.docs?.source}}};const D=["Top","Right","Bottom","Left"];export{d as Bottom,l as Left,p as Right,i as Top,D as __namedExportsOrder,v as default};
