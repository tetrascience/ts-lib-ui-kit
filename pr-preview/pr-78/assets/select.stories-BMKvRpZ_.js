import{j as e}from"./iframe-14YYbrss.js";import{S as d,a as y,b as m,c as u,d as r,e as I,f as S,g as j}from"./select-B5d0bdmo.js";import"./preload-helper-BbFkF2Um.js";import"./chevron-down-DJZ_3i8R.js";import"./check-B_BC0xs5.js";import"./chevron-up-CzLCBlyb.js";import"./index-BdQq_4o_.js";import"./index-CzkjiSpZ.js";import"./index-SK9A3v17.js";import"./index-Bjo__dt-.js";import"./index-CoM-oBxn.js";const C={},{expect:n,userEvent:l,within:a}=__STORYBOOK_MODULE_TEST__,D=()=>typeof import.meta<"u"&&!!C?.VITEST,F={title:"Components/Select",component:d,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{size:{control:{type:"select"},options:["default","sm"]}},args:{size:"default"}};function R(s){return e.jsxs(y,{defaultValue:"workspace",children:[e.jsx(d,{...s,className:"w-[220px]",children:e.jsx(m,{placeholder:"Choose a destination"})}),e.jsxs(u,{children:[e.jsx(r,{value:"workspace",children:"Workspace"}),e.jsx(r,{value:"report",children:"Report"}),e.jsx(r,{value:"archive",children:"Archive"})]})]})}const h={render:R,parameters:{zephyr:{testCaseId:"SW-T1280"}},play:async({canvasElement:s,step:o})=>{const c=a(s),t=c.getByRole("combobox");await o("Select trigger renders with default value",async()=>{n(t).toBeInTheDocument(),n(c.getByText("Workspace")).toBeInTheDocument()}),await o("Trigger has chevron icon",async()=>{const i=t.querySelector("svg");n(i).toBeInTheDocument()}),D()&&(await o("Opens dropdown on click",async()=>{await l.click(t);const i=await a(document.body).findByRole("listbox");n(i).toBeInTheDocument();const p=a(i).getAllByRole("option");n(p).toHaveLength(3),n(p.map(f=>f.textContent?.replace(/\s+/g,""))).toEqual(["Workspace","Report","Archive"])}),await o("Current value has check indicator",async()=>{const i=a(document.body).getByRole("listbox"),p=a(i).getByRole("option",{name:"Workspace"});n(p).toHaveAttribute("data-state","checked")}),await o("Select a different item",async()=>{const i=a(document.body).getByRole("listbox");await l.click(a(i).getByRole("option",{name:"Report"})),n(c.getByText("Report")).toBeInTheDocument()}),await o("Dropdown closes after selection",async()=>{n(a(document.body).queryByRole("listbox")).not.toBeInTheDocument()}))}},b={args:{size:"sm"},render:R,parameters:{zephyr:{testCaseId:"SW-T1281"}},play:async({canvasElement:s,step:o})=>{const c=a(s),t=c.getByRole("combobox");await o("Select trigger renders with sm size attribute",async()=>{n(t).toBeInTheDocument(),n(t).toHaveAttribute("data-size","sm")}),await o("Selected value is shown",async()=>{n(c.getByText("Workspace")).toBeInTheDocument()}),D()&&await o("Opens and selects correctly at small size",async()=>{await l.click(t);const i=await a(document.body).findByRole("listbox");await l.click(a(i).getByRole("option",{name:"Archive"})),n(c.getByText("Archive")).toBeInTheDocument()})}};function k(s){return e.jsxs(y,{children:[e.jsx(d,{...s,className:"w-[220px]",children:e.jsx(m,{placeholder:"Choose a destination"})}),e.jsxs(u,{position:"popper",children:[e.jsx(r,{value:"workspace",children:"Workspace"}),e.jsx(r,{value:"report",children:"Report"}),e.jsx(r,{value:"archive",children:"Archive"})]})]})}const x={render:k,parameters:{zephyr:{testCaseId:"SW-T1282"}},play:async({canvasElement:s,step:o})=>{const c=a(s);await o("Shows placeholder before selection",async()=>{n(c.getByText("Choose a destination")).toBeInTheDocument()}),await o("Opens dropdown on click",async()=>{await l.click(c.getByRole("combobox"));const t=await a(document.body).findByRole("listbox");n(t).toBeInTheDocument()}),await o("Displays all options",async()=>{const t=a(document.body);n(t.getByText("Workspace")).toBeInTheDocument(),n(t.getByText("Report")).toBeInTheDocument(),n(t.getByText("Archive")).toBeInTheDocument()}),await o("Selects an item on click",async()=>{const t=a(document.body);await l.click(t.getByText("Report")),n(c.getByText("Report")).toBeInTheDocument()})}},g={render:k,parameters:{zephyr:{testCaseId:"SW-T1283"}},play:async({canvasElement:s,step:o})=>{const t=a(s).getByRole("combobox");await o("Trigger is focusable",async()=>{t.focus(),n(document.activeElement).toBe(t)}),await o("Opens with Space key and shows options",async()=>{await l.keyboard(" ");const i=await a(document.body).findByRole("listbox");n(i).toBeInTheDocument();const p=a(document.body).getAllByRole("option");n(p.length).toBe(3)}),await o("Closes with Escape",async()=>{await l.keyboard("{Escape}"),n(a(document.body).queryByRole("listbox")).not.toBeInTheDocument()})}};function E(s){return e.jsxs(y,{disabled:!0,children:[e.jsx(d,{...s,className:"w-[220px]",children:e.jsx(m,{placeholder:"Choose a destination"})}),e.jsxs(u,{children:[e.jsx(r,{value:"workspace",children:"Workspace"}),e.jsx(r,{value:"report",children:"Report"})]})]})}const w={render:E,parameters:{zephyr:{testCaseId:"SW-T1284"}},play:async({canvasElement:s,step:o})=>{const c=a(s);await o("Trigger is disabled",async()=>{const t=c.getByRole("combobox");n(t).toBeDisabled()})}};function W(s){return e.jsxs(y,{children:[e.jsx(d,{...s,className:"w-[220px]",children:e.jsx(m,{placeholder:"Choose a destination"})}),e.jsxs(u,{position:"popper",children:[e.jsx(r,{value:"workspace",children:"Workspace"}),e.jsx(r,{value:"report",disabled:!0,children:"Report (unavailable)"}),e.jsx(r,{value:"archive",children:"Archive"})]})]})}const B={render:W,parameters:{zephyr:{testCaseId:"SW-T1285"}},play:async({canvasElement:s,step:o})=>{const c=a(s);await o("Opens dropdown",async()=>{await l.click(c.getByRole("combobox"));const t=await a(document.body).findByRole("listbox");n(t).toBeInTheDocument()}),await o("Disabled item has correct attribute",async()=>{const i=a(document.body).getByRole("option",{name:"Report (unavailable)"});n(i).toHaveAttribute("data-disabled")})}};function z(s){return e.jsxs(y,{children:[e.jsx(d,{...s,className:"w-[220px]",children:e.jsx(m,{placeholder:"Choose a destination"})}),e.jsxs(u,{position:"popper",children:[e.jsxs(I,{children:[e.jsx(S,{children:"Data Targets"}),e.jsx(r,{value:"workspace",children:"Workspace"}),e.jsx(r,{value:"report",children:"Report"})]}),e.jsx(j,{}),e.jsxs(I,{children:[e.jsx(S,{children:"Storage"}),e.jsx(r,{value:"archive",children:"Archive"}),e.jsx(r,{value:"cold-storage",children:"Cold Storage"})]})]})]})}const T={render:z,parameters:{zephyr:{testCaseId:"SW-T1286"}},play:async({canvasElement:s,step:o})=>{const c=a(s);await o("Opens and shows groups with labels",async()=>{await l.click(c.getByRole("combobox"));const t=a(document.body);await t.findByRole("listbox"),n(t.getByText("Data Targets")).toBeInTheDocument(),n(t.getByText("Storage")).toBeInTheDocument()}),await o("Shows items in each group",async()=>{const t=a(document.body);n(t.getByText("Workspace")).toBeInTheDocument(),n(t.getByText("Cold Storage")).toBeInTheDocument()}),await o("Separator exists between groups",async()=>{const t=document.body.querySelector('[data-slot="select-separator"]');n(t).toBeTruthy()}),await o("Can select from second group",async()=>{const t=a(document.body);await l.click(t.getByText("Cold Storage")),n(c.getByText("Cold Storage")).toBeInTheDocument()})}};function A(s){const o=Array.from({length:20},(c,t)=>`Item ${t+1}`);return e.jsxs(y,{children:[e.jsx(d,{...s,className:"w-[220px]",children:e.jsx(m,{placeholder:"Select an item"})}),e.jsx(u,{position:"popper",children:o.map(c=>e.jsx(r,{value:c.toLowerCase().replace(/\s/g,"-"),children:c},c))})]})}const v={render:A,parameters:{zephyr:{testCaseId:"SW-T1287"}},play:async({canvasElement:s,step:o})=>{const c=a(s);await o("Opens with many items",async()=>{await l.click(c.getByRole("combobox"));const t=await a(document.body).findByRole("listbox");n(t).toBeInTheDocument()}),await o("First and last items are present",async()=>{const t=a(document.body);n(t.getByText("Item 1")).toBeInTheDocument(),n(t.getByText("Item 20")).toBeInTheDocument()}),await o("Can select an item from the list",async()=>{const t=a(document.body);await l.click(t.getByText("Item 15")),n(c.getByText("Item 15")).toBeInTheDocument()})}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: renderSelect,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1280"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");
    await step("Select trigger renders with default value", async () => {
      expect(trigger).toBeInTheDocument();
      expect(canvas.getByText("Workspace")).toBeInTheDocument();
    });
    await step("Trigger has chevron icon", async () => {
      const svg = trigger.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
    if (!isTestRunner()) return;
    await step("Opens dropdown on click", async () => {
      await userEvent.click(trigger);
      const listbox = await within(document.body).findByRole("listbox");
      expect(listbox).toBeInTheDocument();
      const options = within(listbox).getAllByRole("option");
      expect(options).toHaveLength(3);
      expect(options.map(o => o.textContent?.replace(/\\s+/g, ""))).toEqual(["Workspace", "Report", "Archive"]);
    });
    await step("Current value has check indicator", async () => {
      const listbox = within(document.body).getByRole("listbox");
      const selected = within(listbox).getByRole("option", {
        name: "Workspace"
      });
      expect(selected).toHaveAttribute("data-state", "checked");
    });
    await step("Select a different item", async () => {
      const listbox = within(document.body).getByRole("listbox");
      await userEvent.click(within(listbox).getByRole("option", {
        name: "Report"
      }));
      expect(canvas.getByText("Report")).toBeInTheDocument();
    });
    await step("Dropdown closes after selection", async () => {
      expect(within(document.body).queryByRole("listbox")).not.toBeInTheDocument();
    });
  }
}`,...h.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    size: "sm"
  },
  render: renderSelect,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1281"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");
    await step("Select trigger renders with sm size attribute", async () => {
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute("data-size", "sm");
    });
    await step("Selected value is shown", async () => {
      expect(canvas.getByText("Workspace")).toBeInTheDocument();
    });
    if (!isTestRunner()) return;
    await step("Opens and selects correctly at small size", async () => {
      await userEvent.click(trigger);
      const listbox = await within(document.body).findByRole("listbox");
      await userEvent.click(within(listbox).getByRole("option", {
        name: "Archive"
      }));
      expect(canvas.getByText("Archive")).toBeInTheDocument();
    });
  }
}`,...b.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: renderUncontrolledSelect,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1282"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Shows placeholder before selection", async () => {
      expect(canvas.getByText("Choose a destination")).toBeInTheDocument();
    });
    await step("Opens dropdown on click", async () => {
      await userEvent.click(canvas.getByRole("combobox"));
      const listbox = await within(document.body).findByRole("listbox");
      expect(listbox).toBeInTheDocument();
    });
    await step("Displays all options", async () => {
      const body = within(document.body);
      expect(body.getByText("Workspace")).toBeInTheDocument();
      expect(body.getByText("Report")).toBeInTheDocument();
      expect(body.getByText("Archive")).toBeInTheDocument();
    });
    await step("Selects an item on click", async () => {
      const body = within(document.body);
      await userEvent.click(body.getByText("Report"));
      expect(canvas.getByText("Report")).toBeInTheDocument();
    });
  }
}`,...x.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: renderUncontrolledSelect,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1283"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");
    await step("Trigger is focusable", async () => {
      trigger.focus();
      expect(document.activeElement).toBe(trigger);
    });
    await step("Opens with Space key and shows options", async () => {
      await userEvent.keyboard(" ");
      const listbox = await within(document.body).findByRole("listbox");
      expect(listbox).toBeInTheDocument();
      const options = within(document.body).getAllByRole("option");
      expect(options.length).toBe(3);
    });
    await step("Closes with Escape", async () => {
      await userEvent.keyboard("{Escape}");
      expect(within(document.body).queryByRole("listbox")).not.toBeInTheDocument();
    });
  }
}`,...g.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: renderDisabledSelect,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1284"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Trigger is disabled", async () => {
      const trigger = canvas.getByRole("combobox");
      expect(trigger).toBeDisabled();
    });
  }
}`,...w.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: renderDisabledItemSelect,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1285"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Opens dropdown", async () => {
      await userEvent.click(canvas.getByRole("combobox"));
      const listbox = await within(document.body).findByRole("listbox");
      expect(listbox).toBeInTheDocument();
    });
    await step("Disabled item has correct attribute", async () => {
      const body = within(document.body);
      const disabledOption = body.getByRole("option", {
        name: "Report (unavailable)"
      });
      expect(disabledOption).toHaveAttribute("data-disabled");
    });
  }
}`,...B.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: renderGroupedSelect,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1286"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Opens and shows groups with labels", async () => {
      await userEvent.click(canvas.getByRole("combobox"));
      const body = within(document.body);
      await body.findByRole("listbox");
      expect(body.getByText("Data Targets")).toBeInTheDocument();
      expect(body.getByText("Storage")).toBeInTheDocument();
    });
    await step("Shows items in each group", async () => {
      const body = within(document.body);
      expect(body.getByText("Workspace")).toBeInTheDocument();
      expect(body.getByText("Cold Storage")).toBeInTheDocument();
    });
    await step("Separator exists between groups", async () => {
      const separator = document.body.querySelector('[data-slot="select-separator"]');
      expect(separator).toBeTruthy();
    });
    await step("Can select from second group", async () => {
      const body = within(document.body);
      await userEvent.click(body.getByText("Cold Storage"));
      expect(canvas.getByText("Cold Storage")).toBeInTheDocument();
    });
  }
}`,...T.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: renderManyItemsSelect,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1287"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Opens with many items", async () => {
      await userEvent.click(canvas.getByRole("combobox"));
      const listbox = await within(document.body).findByRole("listbox");
      expect(listbox).toBeInTheDocument();
    });
    await step("First and last items are present", async () => {
      const body = within(document.body);
      expect(body.getByText("Item 1")).toBeInTheDocument();
      expect(body.getByText("Item 20")).toBeInTheDocument();
    });
    await step("Can select an item from the list", async () => {
      const body = within(document.body);
      await userEvent.click(body.getByText("Item 15"));
      expect(canvas.getByText("Item 15")).toBeInTheDocument();
    });
  }
}`,...v.parameters?.docs?.source}}};const Y=["Default","Small","OpenAndSelect","KeyboardNavigation","Disabled","DisabledItem","Grouped","ManyItems"];export{h as Default,w as Disabled,B as DisabledItem,T as Grouped,g as KeyboardNavigation,v as ManyItems,x as OpenAndSelect,b as Small,Y as __namedExportsOrder,F as default};
