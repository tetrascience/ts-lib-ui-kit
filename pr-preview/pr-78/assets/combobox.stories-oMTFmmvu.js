import{j as a,r as _}from"./iframe-14YYbrss.js";import{B as Y}from"./badge-Dh627mLH.js";import{C as u,a as p,b as m,c as h,d as b,e as x,f as G,g as F,h as W,i as z,u as M,j as K,k as U,l as X,m as $}from"./combobox-DA91GQrk.js";import"./preload-helper-BbFkF2Um.js";import"./index-B8eA1Gpy.js";import"./button-BSJeE99h.js";import"./input-group-CYOZ_nWh.js";import"./input-CUCTLqrj.js";import"./check-B_BC0xs5.js";import"./chevron-down-DJZ_3i8R.js";import"./x-B6L8IQUu.js";import"./index-CvEJXU9u.js";const Q={},{expect:o,userEvent:r,within:c}=__STORYBOOK_MODULE_TEST__,w=["Next.js","SvelteKit","Nuxt","Remix","Astro"],g=[{label:"Frontend",items:["Next.js","Nuxt","SvelteKit"]},{label:"Full-stack",items:["Remix","RedwoodJS"]},{label:"Static",items:["Astro","Eleventy"]}],Z=[{value:"vite",label:"Vite",status:"stable"},{value:"turbopack",label:"Turbopack",status:"beta"},{value:"webpack",label:"Webpack",status:"deprecated"},{value:"esbuild",label:"esbuild",status:"stable"},{value:"rollup",label:"Rollup",status:"stable"}],ee={stable:"positive",beta:"info",deprecated:"warning"},d=()=>typeof import.meta<"u"&&!!Q?.VITEST,ue={title:"Components/Combobox",component:u,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{showTrigger:{control:{type:"boolean"}},showClear:{control:{type:"boolean"}}},args:{showTrigger:!0,showClear:!1}};function v(t,e){return a.jsxs(p,{items:w,children:[a.jsx(u,{...t,className:"w-[240px]",placeholder:"Choose a framework"}),a.jsxs(m,{...e,children:[a.jsx(h,{children:"No frameworks found."}),a.jsx(b,{children:s=>a.jsx(x,{value:s,children:s},s)})]})]})}const C={render:t=>v(t),parameters:{zephyr:{testCaseId:"SW-T1221"}},play:async({canvasElement:t,step:e})=>{const s=c(t),n=s.getByRole("combobox");await e("Combobox input and placeholder render",async()=>{o(n).toBeInTheDocument(),o(s.getByPlaceholderText("Choose a framework")).toBeInTheDocument()}),d()&&(await e("Opens dropdown on click and shows all items",async()=>{await r.click(n);const i=await s.findByRole("listbox");o(i).toBeInTheDocument();const l=c(i).getAllByRole("option");o(l).toHaveLength(5),o(l.map(y=>y.textContent)).toEqual(["Next.js","SvelteKit","Nuxt","Remix","Astro"])}),await e("Selects an item on click",async()=>{const i=s.getByRole("listbox"),l=c(i).getByRole("option",{name:"Remix"});await r.click(l),o(n).toHaveValue("Remix")}),await e("Dropdown closes after selection",async()=>{o(s.queryByRole("listbox")).not.toBeInTheDocument()}),await e("Clicking trigger chevron opens dropdown",async()=>{const i=t.querySelector('[data-slot="combobox-trigger"]');o(i).toBeInTheDocument(),await r.click(i);const l=await s.findByRole("listbox");o(l).toBeInTheDocument()}),await e("Clicking trigger again closes dropdown",async()=>{const i=t.querySelector('[data-slot="combobox-trigger"]');await r.click(i),o(s.queryByRole("listbox")).not.toBeInTheDocument()}),await e("Backspace on empty input removes last chip",async()=>{await r.click(n),o(n).toHaveValue(""),await r.keyboard("{Backspace}");const i=t.querySelectorAll('[data-slot="combobox-chip"]');o(i).toHaveLength(1),o(i[0]).toHaveTextContent("Next.js")}),await e("Can still add new items via keyboard",async()=>{await r.type(n,"Sv");const i=await s.findByRole("listbox"),l=c(i).getAllByRole("option");o(l).toHaveLength(1),await r.keyboard("{Enter}");const y=t.querySelectorAll('[data-slot="combobox-chip"]');o(y).toHaveLength(2)}),await e("Lowercase query matches capitalized item",async()=>{await r.type(n,"next");const i=await s.findByRole("listbox"),l=c(i).getAllByRole("option");o(l).toHaveLength(1),o(l[0]).toHaveTextContent("Next.js")}),await e("Uppercase query also matches",async()=>{await r.clear(n),await r.type(n,"REMIX");const i=await s.findByRole("listbox"),l=c(i).getAllByRole("option");o(l).toHaveLength(1),o(l[0]).toHaveTextContent("Remix")}),await e("Mixed case matches",async()=>{await r.clear(n),await r.type(n,"aStRo");const i=await s.findByRole("listbox"),l=c(i).getAllByRole("option");o(l).toHaveLength(1),o(l[0]).toHaveTextContent("Astro")}))}},B={args:{showClear:!0},render:t=>v(t),parameters:{zephyr:{testCaseId:"SW-T1222"}},play:async({canvasElement:t,step:e})=>{const s=c(t),n=s.getByRole("combobox");await e("Combobox renders with placeholder",async()=>{o(s.getByPlaceholderText("Choose a framework")).toBeInTheDocument()}),d()&&await e("Select an item then clear it",async()=>{await r.click(n);const i=await s.findByRole("listbox");await r.click(c(i).getByRole("option",{name:"Astro"})),o(n).toHaveValue("Astro");const l=t.querySelector('[data-slot="combobox-clear"]');await r.click(l),o(n).toHaveValue("")})}},R={args:{showTrigger:!1},render:t=>v(t),parameters:{zephyr:{testCaseId:"SW-T1223"}},play:async({canvasElement:t,step:e})=>{const s=c(t),n=s.getByRole("combobox");await e("Combobox input renders",async()=>{o(s.getByPlaceholderText("Choose a framework")).toBeInTheDocument(),o(n).toBeInTheDocument()}),await e("Dropdown trigger is hidden",async()=>{o(t.querySelector('[data-slot="combobox-trigger"]')).not.toBeInTheDocument()}),d()&&(await e("Still opens on typing",async()=>{await r.type(n,"Nu");const i=await s.findByRole("listbox"),l=c(i).getAllByRole("option");o(l).toHaveLength(1),o(l[0]).toHaveTextContent("Nuxt")}),await e("Selects filtered item",async()=>{const i=s.getByRole("listbox");await r.click(c(i).getByRole("option",{name:"Nuxt"})),o(n).toHaveValue("Nuxt")}))}},f={render:t=>v(t,{align:"end",side:"top"}),parameters:{zephyr:{testCaseId:"SW-T1224"}},play:async({canvasElement:t,step:e})=>{const s=c(t),n=s.getByRole("combobox");await e("Combobox renders for top alignment",async()=>{o(s.getByPlaceholderText("Choose a framework")).toBeInTheDocument(),o(n).toBeInTheDocument()}),d()&&(await e("Opens dropdown and positioner has side=top",async()=>{await r.click(n),await s.findByRole("listbox");const i=document.querySelector('[data-side="top"]');o(i).toBeInTheDocument()}),await e("Cleanup — close dropdown",async()=>{await r.keyboard("{Escape}")}))}};function te(){const t=M(),[e,s]=_.useState([]);return a.jsxs(p,{multiple:!0,items:w,value:e,onValueChange:s,children:[a.jsxs(K,{ref:t,className:"w-[280px]",children:[a.jsx(U,{children:n=>n.map(i=>a.jsx(X,{children:i},i))}),a.jsx($,{placeholder:"Select frameworks..."})]}),a.jsxs(m,{anchor:t,children:[a.jsx(h,{children:"No frameworks found."}),a.jsx(b,{children:n=>a.jsx(x,{value:n,children:n},n)})]})]})}const T={render:()=>a.jsx(te,{}),play:async({canvasElement:t,step:e})=>{const s=c(t),n=s.getByRole("combobox");await e("Chips container and input render",async()=>{o(s.getByPlaceholderText("Select frameworks...")).toBeInTheDocument(),o(n).toBeInTheDocument(),o(t.querySelector('[data-slot="combobox-chips"]')).toBeInTheDocument()}),d()&&(await e("Select multiple items",async()=>{await r.click(n);const i=await s.findByRole("listbox");await r.click(c(i).getByRole("option",{name:"Next.js"})),await r.click(c(i).getByRole("option",{name:"Remix"}))}),await e("Chips appear for selected items",async()=>{const i=t.querySelectorAll('[data-slot="combobox-chip"]');o(i).toHaveLength(2),o(i[0]).toHaveTextContent("Next.js"),o(i[1]).toHaveTextContent("Remix")}),await e("Remove chip via remove button",async()=>{const i=t.querySelectorAll('[data-slot="combobox-chip-remove"]');o(i.length).toBeGreaterThan(0),await r.click(i[0]);const l=t.querySelectorAll('[data-slot="combobox-chip"]');o(l).toHaveLength(1),o(l[0]).toHaveTextContent("Remix")}))}},S={render:t=>a.jsxs(p,{items:g,children:[a.jsx(u,{...t,className:"w-[240px]",placeholder:"Choose a framework"}),a.jsxs(m,{children:[a.jsx(h,{children:"No frameworks found."}),a.jsx(b,{children:g.map((e,s)=>a.jsxs(G,{items:e.items,children:[s>0&&a.jsx(z,{}),a.jsx(F,{children:e.label}),a.jsx(W,{children:n=>a.jsx(x,{value:n,children:n},n)})]},e.label))})]})]}),play:async({canvasElement:t,step:e})=>{const s=c(t),n=s.getByRole("combobox");await e("Combobox with groups renders",async()=>{o(s.getByPlaceholderText("Choose a framework")).toBeInTheDocument(),o(n).toBeInTheDocument()}),d()&&(await e("Opens dropdown and shows group labels",async()=>{await r.click(n);const i=await s.findByRole("listbox");o(i).toBeInTheDocument();const l=i.querySelectorAll('[data-slot="combobox-label"]');o(l).toHaveLength(3),o(l[0]).toHaveTextContent("Frontend"),o(l[1]).toHaveTextContent("Full-stack"),o(l[2]).toHaveTextContent("Static")}),await e("Shows separators between groups",async()=>{const l=s.getByRole("listbox").querySelectorAll('[data-slot="combobox-separator"]');o(l).toHaveLength(2)}),await e("All items across groups are present",async()=>{const i=s.getByRole("listbox"),l=c(i).getAllByRole("option");o(l).toHaveLength(8)}),await e("Select item from a group",async()=>{const i=s.getByRole("listbox");await r.click(c(i).getByRole("option",{name:"Eleventy"})),o(n).toHaveValue("Eleventy")}))}},k={render:t=>a.jsxs(p,{items:Z,itemToStringValue:e=>e.value,itemToStringLabel:e=>e.label,children:[a.jsx(u,{...t,className:"w-[260px]",placeholder:"Pick a build tool"}),a.jsxs(m,{children:[a.jsx(h,{children:"No tools found."}),a.jsx(b,{children:e=>a.jsxs(x,{value:e,children:[a.jsx("span",{className:"flex-1",children:e.label}),a.jsx(Y,{variant:ee[e.status],className:"ml-auto text-[10px]",children:e.status})]},e.value)})]})]}),play:async({canvasElement:t,step:e})=>{const s=c(t),n=s.getByRole("combobox");await e("Combobox renders with custom items placeholder",async()=>{o(s.getByPlaceholderText("Pick a build tool")).toBeInTheDocument(),o(n).toBeInTheDocument()}),d()&&(await e("Opens dropdown with custom rendered items",async()=>{await r.click(n);const i=await s.findByRole("listbox"),l=c(i).getAllByRole("option");o(l).toHaveLength(5)}),await e("Items display status badges",async()=>{const l=s.getByRole("listbox").querySelectorAll("[data-slot='badge']");o(l).toHaveLength(5),o(l[0]).toHaveTextContent("stable"),o(l[1]).toHaveTextContent("beta"),o(l[2]).toHaveTextContent("deprecated")}),await e("Selecting a custom item populates the input",async()=>{const i=s.getByRole("listbox");await r.click(c(i).getByRole("option",{name:/Turbopack/i})),o(n).toHaveValue("Turbopack")}))}},H={render:t=>a.jsxs(p,{items:w,children:[a.jsx(u,{...t,className:"w-[240px]",placeholder:"Choose a framework","aria-invalid":!0}),a.jsxs(m,{children:[a.jsx(h,{children:"No frameworks found."}),a.jsx(b,{children:e=>a.jsx(x,{value:e,children:e},e)})]})]}),play:async({canvasElement:t,step:e})=>{const s=c(t),n=s.getByRole("combobox");await e("Input has aria-invalid attribute",async()=>{o(n).toHaveAttribute("aria-invalid","true")}),await e("Input group has invalid styling cue",async()=>{const i=t.querySelector('[data-slot="input-group"]');o(i).toBeInTheDocument(),o(n).toHaveAttribute("aria-invalid","true")}),d()&&await e("Still functions — can open and select",async()=>{await r.click(n);const i=await s.findByRole("listbox");await r.click(c(i).getByRole("option",{name:"SvelteKit"})),o(n).toHaveValue("SvelteKit"),o(n).toHaveAttribute("aria-invalid","true")})}},I={render:t=>a.jsxs(p,{items:w,children:[a.jsx(u,{...t,className:"w-[240px]",placeholder:"Choose a framework",disabled:!0}),a.jsxs(m,{children:[a.jsx(h,{children:"No frameworks found."}),a.jsx(b,{children:e=>a.jsx(x,{value:e,children:e},e)})]})]}),play:async({canvasElement:t,step:e})=>{const s=c(t),n=s.getByRole("combobox");await e("Input is disabled",async()=>{o(n).toBeDisabled()}),await e("Click does not open dropdown",async()=>{await r.click(n,{pointerEventsCheck:0}),o(s.queryByRole("listbox")).not.toBeInTheDocument()})}},E={render:t=>a.jsxs(p,{items:w,autoHighlight:!0,children:[a.jsx(u,{...t,className:"w-[240px]",placeholder:"Start typing..."}),a.jsxs(m,{children:[a.jsx(h,{children:"No frameworks found."}),a.jsx(b,{children:e=>a.jsx(x,{value:e,children:e},e)})]})]}),play:async({canvasElement:t,step:e})=>{const s=c(t),n=s.getByRole("combobox");await e("Combobox with autoHighlight renders",async()=>{o(s.getByPlaceholderText("Start typing...")).toBeInTheDocument(),o(n).toBeInTheDocument()}),d()&&(await e("Typing opens dropdown with first item highlighted",async()=>{await r.type(n,"a");const i=await s.findByRole("listbox");o(i).toBeInTheDocument();const l=i.querySelector("[data-highlighted]");o(l).toBeInTheDocument()}),await e("Enter selects the highlighted item",async()=>{await r.keyboard("{Enter}"),o(n).toHaveValue("Astro")}))}},j={render:t=>v(t),play:async({canvasElement:t,step:e})=>{const s=c(t),n=s.getByRole("combobox");d()&&(await e("Type partial text to filter items",async()=>{await r.type(n,"Sv");const i=await s.findByRole("listbox"),l=c(i).getAllByRole("option");o(l).toHaveLength(1),o(l[0]).toHaveTextContent("SvelteKit")}),await e("Clear input to show all items again",async()=>{await r.clear(n),await r.click(n);const i=await s.findByRole("listbox"),l=c(i).getAllByRole("option");o(l).toHaveLength(5)}),await e("Type non-matching text shows empty state",async()=>{await r.type(n,"zzz");const i=await s.findByRole("listbox"),l=c(i).queryAllByRole("option");o(l).toHaveLength(0);const y=document.querySelector('[data-slot="combobox-empty"]');o(y).toBeInTheDocument()}))}},A={name:"Item / Default",render:()=>a.jsxs(p,{items:w,defaultOpen:!0,children:[a.jsx(u,{className:"w-[240px]",placeholder:"Pick one"}),a.jsx(m,{children:a.jsx(b,{children:t=>a.jsx(x,{value:t,children:t},t)})})]}),play:async({step:t})=>{const e=c(document.body);await t("Items render with role=option and data-slot",async()=>{const s=await e.findByRole("listbox"),n=c(s).getAllByRole("option");o(n).toHaveLength(5);for(const i of n)o(i).toHaveAttribute("data-slot","combobox-item")})}},L={name:"Item / Disabled",render:()=>a.jsxs(p,{items:w,defaultOpen:!0,children:[a.jsx(u,{className:"w-[240px]",placeholder:"Pick one"}),a.jsx(m,{children:a.jsx(b,{children:t=>a.jsx(x,{value:t,disabled:t==="Remix"||t==="Astro",children:t},t)})})]}),play:async({canvasElement:t,step:e})=>{const s=c(document.body),n=c(t);await e("Disabled items have data-disabled",async()=>{const i=await s.findByRole("listbox"),l=c(i).getByRole("option",{name:"Remix"}),y=c(i).getByRole("option",{name:"Astro"});o(l).toHaveAttribute("data-disabled",""),o(y).toHaveAttribute("data-disabled","")}),await e("Enabled items do not have data-disabled",async()=>{const i=s.getByRole("listbox"),l=c(i).getByRole("option",{name:"Next.js"});o(l).not.toHaveAttribute("data-disabled")}),d()&&await e("Clicking disabled item does not select",async()=>{const i=s.getByRole("listbox"),l=n.getByRole("combobox");await r.click(c(i).getByRole("option",{name:"Remix"})),o(l).not.toHaveValue("Remix")})}},D={name:"List / Scrollable",render:()=>{const t=Array.from({length:50},(e,s)=>`Item ${s+1}`);return a.jsxs(p,{items:t,defaultOpen:!0,children:[a.jsx(u,{className:"w-[240px]",placeholder:"Scroll me"}),a.jsx(m,{children:a.jsx(b,{children:e=>a.jsx(x,{value:e,children:e},e)})})]})},play:async({step:t})=>{const e=c(document.body);await t("All 50 items render in the list",async()=>{const s=await e.findByRole("listbox"),n=c(s).getAllByRole("option");o(n).toHaveLength(50)}),await t("List container is scrollable",async()=>{const s=document.querySelector('[data-slot="combobox-list"]');o(s).toBeInTheDocument(),o(s.scrollHeight).toBeGreaterThan(s.clientHeight)})}},N={name:"Group / Labels and collections",render:()=>a.jsxs(p,{items:g,defaultOpen:!0,children:[a.jsx(u,{className:"w-[240px]",placeholder:"Pick"}),a.jsx(m,{children:a.jsx(b,{children:g.map(t=>a.jsxs(G,{items:t.items,children:[a.jsx(F,{children:t.label}),a.jsx(W,{children:e=>a.jsx(x,{value:e,children:e},e)})]},t.label))})})]}),play:async({step:t})=>{const e=c(document.body);await t("Groups render with data-slot=combobox-group",async()=>{const n=(await e.findByRole("listbox")).querySelectorAll('[data-slot="combobox-group"]');o(n).toHaveLength(3)}),await t("Labels render with correct text",async()=>{const n=e.getByRole("listbox").querySelectorAll('[data-slot="combobox-label"]');o(n).toHaveLength(3),o(n[0]).toHaveTextContent("Frontend"),o(n[1]).toHaveTextContent("Full-stack"),o(n[2]).toHaveTextContent("Static")}),await t("Collections render items within their group",async()=>{const n=e.getByRole("listbox").querySelectorAll('[data-slot="combobox-group"]'),i=c(n[0]).getAllByRole("option");o(i.map(y=>y.textContent)).toEqual(["Next.js","Nuxt","SvelteKit"]);const l=c(n[2]).getAllByRole("option");o(l.map(y=>y.textContent)).toEqual(["Astro","Eleventy"])})}},q={name:"Separator / Between groups",render:()=>a.jsxs(p,{items:g,defaultOpen:!0,children:[a.jsx(u,{className:"w-[240px]",placeholder:"Pick"}),a.jsx(m,{children:a.jsx(b,{children:g.map((t,e)=>a.jsxs(G,{items:t.items,children:[e>0&&a.jsx(z,{}),a.jsx(F,{children:t.label}),a.jsx(W,{children:s=>a.jsx(x,{value:s,children:s},s)})]},t.label))})})]}),play:async({step:t})=>{const e=c(document.body);await t("Separators render between groups",async()=>{const n=(await e.findByRole("listbox")).querySelectorAll('[data-slot="combobox-separator"]');o(n).toHaveLength(2)}),await t("No separator before first group",async()=>{const l=e.getByRole("listbox").querySelectorAll('[data-slot="combobox-group"]')[0]?.previousElementSibling?.getAttribute("data-slot")==="combobox-separator";o(l).toBe(!1)})}},P={name:"Empty / No match",render:()=>a.jsxs(p,{items:[],defaultOpen:!0,children:[a.jsx(u,{className:"w-[240px]",placeholder:"Type something..."}),a.jsxs(m,{children:[a.jsx(h,{children:"No frameworks found."}),a.jsx(b,{children:t=>a.jsx(x,{value:t,children:t},t)})]})]}),play:async({step:t})=>{await t("Empty message is visible when no items exist",async()=>{const e=document.querySelector('[data-slot="combobox-empty"]');o(e).toBeInTheDocument(),o(e).toHaveTextContent("No frameworks found.")})}};function J({showRemove:t=!0}){const e=M(),[s,n]=_.useState(["Next.js","Remix"]);return a.jsxs(p,{multiple:!0,items:w,value:s,onValueChange:n,children:[a.jsxs(K,{ref:e,className:"w-[280px]",children:[a.jsx(U,{children:i=>i.map(l=>a.jsx(X,{showRemove:t,children:l},l))}),a.jsx($,{placeholder:"Select..."})]}),a.jsxs(m,{anchor:e,children:[a.jsx(h,{children:"No frameworks found."}),a.jsx(b,{children:i=>a.jsx(x,{value:i,children:i},i)})]})]})}const V={name:"Chip / Default",render:()=>a.jsx(J,{}),play:async({canvasElement:t,step:e})=>{const s=c(t);await e("Chips render with data-slot and text",async()=>{const n=t.querySelectorAll('[data-slot="combobox-chip"]');o(n).toHaveLength(2),o(n[0]).toHaveTextContent("Next.js"),o(n[1]).toHaveTextContent("Remix")}),await e("Each chip has a remove button",async()=>{const n=t.querySelectorAll('[data-slot="combobox-chip-remove"]');o(n).toHaveLength(2)}),d()&&(await e("Clicking remove removes the chip",async()=>{const n=t.querySelectorAll('[data-slot="combobox-chip-remove"]');await r.click(n[0]);const i=t.querySelectorAll('[data-slot="combobox-chip"]');o(i).toHaveLength(1),o(i[0]).toHaveTextContent("Remix")}),await e("Adding a new item creates a new chip",async()=>{const n=s.getByRole("combobox");await r.click(n);const i=await s.findByRole("listbox");await r.click(c(i).getByRole("option",{name:"Astro"}));const l=t.querySelectorAll('[data-slot="combobox-chip"]');o(l).toHaveLength(2),o(l[1]).toHaveTextContent("Astro")}))}},O={name:"Chip / Without remove button",render:()=>a.jsx(J,{showRemove:!1}),play:async({canvasElement:t,step:e})=>{await e("Chips render without remove buttons",async()=>{const s=t.querySelectorAll('[data-slot="combobox-chip"]');o(s).toHaveLength(2);const n=t.querySelectorAll('[data-slot="combobox-chip-remove"]');o(n).toHaveLength(0)})}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: args => renderCombobox(args),
  parameters: {
    zephyr: {
      testCaseId: "SW-T1221"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox");
    await step("Combobox input and placeholder render", async () => {
      expect(input).toBeInTheDocument();
      expect(canvas.getByPlaceholderText("Choose a framework")).toBeInTheDocument();
    });
    if (!isTestRunner()) return;
    await step("Opens dropdown on click and shows all items", async () => {
      await userEvent.click(input);
      const listbox = await canvas.findByRole("listbox");
      expect(listbox).toBeInTheDocument();
      const options = within(listbox).getAllByRole("option");
      expect(options).toHaveLength(5);
      expect(options.map(o => o.textContent)).toEqual(["Next.js", "SvelteKit", "Nuxt", "Remix", "Astro"]);
    });
    await step("Selects an item on click", async () => {
      const listbox = canvas.getByRole("listbox");
      const option = within(listbox).getByRole("option", {
        name: "Remix"
      });
      await userEvent.click(option);
      expect(input).toHaveValue("Remix");
    });
    await step("Dropdown closes after selection", async () => {
      expect(canvas.queryByRole("listbox")).not.toBeInTheDocument();
    });
    await step("Clicking trigger chevron opens dropdown", async () => {
      const trigger = canvasElement.querySelector('[data-slot="combobox-trigger"]') as HTMLElement;
      expect(trigger).toBeInTheDocument();
      await userEvent.click(trigger);
      const listbox = await canvas.findByRole("listbox");
      expect(listbox).toBeInTheDocument();
    });
    await step("Clicking trigger again closes dropdown", async () => {
      const trigger = canvasElement.querySelector('[data-slot="combobox-trigger"]') as HTMLElement;
      await userEvent.click(trigger);
      expect(canvas.queryByRole("listbox")).not.toBeInTheDocument();
    });
    await step("Backspace on empty input removes last chip", async () => {
      await userEvent.click(input);
      expect(input).toHaveValue("");
      await userEvent.keyboard("{Backspace}");
      const chips = canvasElement.querySelectorAll('[data-slot="combobox-chip"]');
      expect(chips).toHaveLength(1);
      expect(chips[0]).toHaveTextContent("Next.js");
    });
    await step("Can still add new items via keyboard", async () => {
      await userEvent.type(input, "Sv");
      const listbox = await canvas.findByRole("listbox");
      const options = within(listbox).getAllByRole("option");
      expect(options).toHaveLength(1);
      await userEvent.keyboard("{Enter}");
      const chips = canvasElement.querySelectorAll('[data-slot="combobox-chip"]');
      expect(chips).toHaveLength(2);
    });
    await step("Lowercase query matches capitalized item", async () => {
      await userEvent.type(input, "next");
      const listbox = await canvas.findByRole("listbox");
      const options = within(listbox).getAllByRole("option");
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent("Next.js");
    });
    await step("Uppercase query also matches", async () => {
      await userEvent.clear(input);
      await userEvent.type(input, "REMIX");
      const listbox = await canvas.findByRole("listbox");
      const options = within(listbox).getAllByRole("option");
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent("Remix");
    });
    await step("Mixed case matches", async () => {
      await userEvent.clear(input);
      await userEvent.type(input, "aStRo");
      const listbox = await canvas.findByRole("listbox");
      const options = within(listbox).getAllByRole("option");
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent("Astro");
    });
  }
}`,...C.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    showClear: true
  },
  render: args => renderCombobox(args),
  parameters: {
    zephyr: {
      testCaseId: "SW-T1222"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox");
    await step("Combobox renders with placeholder", async () => {
      expect(canvas.getByPlaceholderText("Choose a framework")).toBeInTheDocument();
    });
    if (!isTestRunner()) return;
    await step("Select an item then clear it", async () => {
      await userEvent.click(input);
      const listbox = await canvas.findByRole("listbox");
      await userEvent.click(within(listbox).getByRole("option", {
        name: "Astro"
      }));
      expect(input).toHaveValue("Astro");
      const clearButton = canvasElement.querySelector('[data-slot="combobox-clear"]') as HTMLElement;
      await userEvent.click(clearButton);
      expect(input).toHaveValue("");
    });
  }
}`,...B.parameters?.docs?.source}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    showTrigger: false
  },
  render: args => renderCombobox(args),
  parameters: {
    zephyr: {
      testCaseId: "SW-T1223"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox");
    await step("Combobox input renders", async () => {
      expect(canvas.getByPlaceholderText("Choose a framework")).toBeInTheDocument();
      expect(input).toBeInTheDocument();
    });
    await step("Dropdown trigger is hidden", async () => {
      expect(canvasElement.querySelector('[data-slot="combobox-trigger"]')).not.toBeInTheDocument();
    });
    if (!isTestRunner()) return;
    await step("Still opens on typing", async () => {
      await userEvent.type(input, "Nu");
      const listbox = await canvas.findByRole("listbox");
      const options = within(listbox).getAllByRole("option");
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent("Nuxt");
    });
    await step("Selects filtered item", async () => {
      const listbox = canvas.getByRole("listbox");
      await userEvent.click(within(listbox).getByRole("option", {
        name: "Nuxt"
      }));
      expect(input).toHaveValue("Nuxt");
    });
  }
}`,...R.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: args => renderCombobox(args, {
    align: "end",
    side: "top"
  }),
  parameters: {
    zephyr: {
      testCaseId: "SW-T1224"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox");
    await step("Combobox renders for top alignment", async () => {
      expect(canvas.getByPlaceholderText("Choose a framework")).toBeInTheDocument();
      expect(input).toBeInTheDocument();
    });
    if (!isTestRunner()) return;
    await step("Opens dropdown and positioner has side=top", async () => {
      await userEvent.click(input);
      await canvas.findByRole("listbox");
      const positioner = document.querySelector('[data-side="top"]');
      expect(positioner).toBeInTheDocument();
    });
    await step("Cleanup — close dropdown", async () => {
      await userEvent.keyboard("{Escape}");
    });
  }
}`,...f.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => <MultipleSelectionExample />,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox");
    await step("Chips container and input render", async () => {
      expect(canvas.getByPlaceholderText("Select frameworks...")).toBeInTheDocument();
      expect(input).toBeInTheDocument();
      expect(canvasElement.querySelector('[data-slot="combobox-chips"]')).toBeInTheDocument();
    });
    if (!isTestRunner()) return;
    await step("Select multiple items", async () => {
      await userEvent.click(input);
      const listbox = await canvas.findByRole("listbox");
      await userEvent.click(within(listbox).getByRole("option", {
        name: "Next.js"
      }));
      await userEvent.click(within(listbox).getByRole("option", {
        name: "Remix"
      }));
    });
    await step("Chips appear for selected items", async () => {
      const chips = canvasElement.querySelectorAll('[data-slot="combobox-chip"]');
      expect(chips).toHaveLength(2);
      expect(chips[0]).toHaveTextContent("Next.js");
      expect(chips[1]).toHaveTextContent("Remix");
    });
    await step("Remove chip via remove button", async () => {
      const removeButtons = canvasElement.querySelectorAll('[data-slot="combobox-chip-remove"]');
      expect(removeButtons.length).toBeGreaterThan(0);
      await userEvent.click(removeButtons[0] as HTMLElement);
      const chips = canvasElement.querySelectorAll('[data-slot="combobox-chip"]');
      expect(chips).toHaveLength(1);
      expect(chips[0]).toHaveTextContent("Remix");
    });
  }
}`,...T.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: args => <Combobox items={groupedFrameworks}>
      <ComboboxInput {...args} className="w-[240px]" placeholder="Choose a framework" />
      <ComboboxContent>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList>
          {groupedFrameworks.map((group, gi) => <ComboboxGroup key={group.label} items={group.items}>
              {gi > 0 && <ComboboxSeparator />}
              <ComboboxLabel>{group.label}</ComboboxLabel>
              <ComboboxCollection>
                {item => <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>}
              </ComboboxCollection>
            </ComboboxGroup>)}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox");
    await step("Combobox with groups renders", async () => {
      expect(canvas.getByPlaceholderText("Choose a framework")).toBeInTheDocument();
      expect(input).toBeInTheDocument();
    });
    if (!isTestRunner()) return;
    await step("Opens dropdown and shows group labels", async () => {
      await userEvent.click(input);
      const listbox = await canvas.findByRole("listbox");
      expect(listbox).toBeInTheDocument();
      const labels = listbox.querySelectorAll('[data-slot="combobox-label"]');
      expect(labels).toHaveLength(3);
      expect(labels[0]).toHaveTextContent("Frontend");
      expect(labels[1]).toHaveTextContent("Full-stack");
      expect(labels[2]).toHaveTextContent("Static");
    });
    await step("Shows separators between groups", async () => {
      const listbox = canvas.getByRole("listbox");
      const separators = listbox.querySelectorAll('[data-slot="combobox-separator"]');
      expect(separators).toHaveLength(2);
    });
    await step("All items across groups are present", async () => {
      const listbox = canvas.getByRole("listbox");
      const options = within(listbox).getAllByRole("option");
      expect(options).toHaveLength(8);
    });
    await step("Select item from a group", async () => {
      const listbox = canvas.getByRole("listbox");
      await userEvent.click(within(listbox).getByRole("option", {
        name: "Eleventy"
      }));
      expect(input).toHaveValue("Eleventy");
    });
  }
}`,...S.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: args => <Combobox items={tools} itemToStringValue={(item: Tool) => item.value} itemToStringLabel={(item: Tool) => item.label}>
      <ComboboxInput {...args} className="w-[260px]" placeholder="Pick a build tool" />
      <ComboboxContent>
        <ComboboxEmpty>No tools found.</ComboboxEmpty>
        <ComboboxList>
          {(item: Tool) => <ComboboxItem key={item.value} value={item}>
              <span className="flex-1">{item.label}</span>
              <Badge variant={statusVariant[item.status]} className="ml-auto text-[10px]">
                {item.status}
              </Badge>
            </ComboboxItem>}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox");
    await step("Combobox renders with custom items placeholder", async () => {
      expect(canvas.getByPlaceholderText("Pick a build tool")).toBeInTheDocument();
      expect(input).toBeInTheDocument();
    });
    if (!isTestRunner()) return;
    await step("Opens dropdown with custom rendered items", async () => {
      await userEvent.click(input);
      const listbox = await canvas.findByRole("listbox");
      const options = within(listbox).getAllByRole("option");
      expect(options).toHaveLength(5);
    });
    await step("Items display status badges", async () => {
      const listbox = canvas.getByRole("listbox");
      const badges = listbox.querySelectorAll("[data-slot='badge']");
      expect(badges).toHaveLength(5);
      expect(badges[0]).toHaveTextContent("stable");
      expect(badges[1]).toHaveTextContent("beta");
      expect(badges[2]).toHaveTextContent("deprecated");
    });
    await step("Selecting a custom item populates the input", async () => {
      const listbox = canvas.getByRole("listbox");
      await userEvent.click(within(listbox).getByRole("option", {
        name: /Turbopack/i
      }));
      expect(input).toHaveValue("Turbopack");
    });
  }
}`,...k.parameters?.docs?.source}}};H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: args => <Combobox items={frameworks}>
      <ComboboxInput {...args} className="w-[240px]" placeholder="Choose a framework" aria-invalid />
      <ComboboxContent>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList>
          {item => <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox");
    await step("Input has aria-invalid attribute", async () => {
      expect(input).toHaveAttribute("aria-invalid", "true");
    });
    await step("Input group has invalid styling cue", async () => {
      const inputGroup = canvasElement.querySelector('[data-slot="input-group"]');
      expect(inputGroup).toBeInTheDocument();
      expect(input).toHaveAttribute("aria-invalid", "true");
    });
    if (!isTestRunner()) return;
    await step("Still functions — can open and select", async () => {
      await userEvent.click(input);
      const listbox = await canvas.findByRole("listbox");
      await userEvent.click(within(listbox).getByRole("option", {
        name: "SvelteKit"
      }));
      expect(input).toHaveValue("SvelteKit");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });
  }
}`,...H.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: args => <Combobox items={frameworks}>
      <ComboboxInput {...args} className="w-[240px]" placeholder="Choose a framework" disabled />
      <ComboboxContent>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList>
          {item => <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox");
    await step("Input is disabled", async () => {
      expect(input).toBeDisabled();
    });
    await step("Click does not open dropdown", async () => {
      await userEvent.click(input, {
        pointerEventsCheck: 0
      });
      expect(canvas.queryByRole("listbox")).not.toBeInTheDocument();
    });
  }
}`,...I.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: args => <Combobox items={frameworks} autoHighlight>
      <ComboboxInput {...args} className="w-[240px]" placeholder="Start typing..." />
      <ComboboxContent>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList>
          {item => <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox");
    await step("Combobox with autoHighlight renders", async () => {
      expect(canvas.getByPlaceholderText("Start typing...")).toBeInTheDocument();
      expect(input).toBeInTheDocument();
    });
    if (!isTestRunner()) return;
    await step("Typing opens dropdown with first item highlighted", async () => {
      await userEvent.type(input, "a");
      const listbox = await canvas.findByRole("listbox");
      expect(listbox).toBeInTheDocument();
      const highlighted = listbox.querySelector("[data-highlighted]");
      expect(highlighted).toBeInTheDocument();
    });
    await step("Enter selects the highlighted item", async () => {
      await userEvent.keyboard("{Enter}");
      expect(input).toHaveValue("Astro");
    });
  }
}`,...E.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: args => renderCombobox(args),
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox");
    if (!isTestRunner()) return;
    await step("Type partial text to filter items", async () => {
      await userEvent.type(input, "Sv");
      const listbox = await canvas.findByRole("listbox");
      const options = within(listbox).getAllByRole("option");
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent("SvelteKit");
    });
    await step("Clear input to show all items again", async () => {
      await userEvent.clear(input);
      await userEvent.click(input);
      const listbox = await canvas.findByRole("listbox");
      const options = within(listbox).getAllByRole("option");
      expect(options).toHaveLength(5);
    });
    await step("Type non-matching text shows empty state", async () => {
      await userEvent.type(input, "zzz");
      const listbox = await canvas.findByRole("listbox");
      const options = within(listbox).queryAllByRole("option");
      expect(options).toHaveLength(0);
      const empty = document.querySelector('[data-slot="combobox-empty"]');
      expect(empty).toBeInTheDocument();
    });
  }
}`,...j.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  name: "Item / Default",
  render: () => <Combobox items={frameworks} defaultOpen>
      <ComboboxInput className="w-[240px]" placeholder="Pick one" />
      <ComboboxContent>
        <ComboboxList>
          {item => <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>,
  play: async ({
    step
  }) => {
    const body = within(document.body);
    await step("Items render with role=option and data-slot", async () => {
      const listbox = await body.findByRole("listbox");
      const options = within(listbox).getAllByRole("option");
      expect(options).toHaveLength(5);
      for (const opt of options) {
        expect(opt).toHaveAttribute("data-slot", "combobox-item");
      }
    });
  }
}`,...A.parameters?.docs?.source}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  name: "Item / Disabled",
  render: () => <Combobox items={frameworks} defaultOpen>
      <ComboboxInput className="w-[240px]" placeholder="Pick one" />
      <ComboboxContent>
        <ComboboxList>
          {item => <ComboboxItem key={item} value={item} disabled={item === "Remix" || item === "Astro"}>
              {item}
            </ComboboxItem>}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>,
  play: async ({
    canvasElement,
    step
  }) => {
    const body = within(document.body);
    const canvas = within(canvasElement);
    await step("Disabled items have data-disabled", async () => {
      const listbox = await body.findByRole("listbox");
      const remix = within(listbox).getByRole("option", {
        name: "Remix"
      });
      const astro = within(listbox).getByRole("option", {
        name: "Astro"
      });
      expect(remix).toHaveAttribute("data-disabled", "");
      expect(astro).toHaveAttribute("data-disabled", "");
    });
    await step("Enabled items do not have data-disabled", async () => {
      const listbox = body.getByRole("listbox");
      const next = within(listbox).getByRole("option", {
        name: "Next.js"
      });
      expect(next).not.toHaveAttribute("data-disabled");
    });
    if (!isTestRunner()) return;
    await step("Clicking disabled item does not select", async () => {
      const listbox = body.getByRole("listbox");
      const input = canvas.getByRole("combobox");
      await userEvent.click(within(listbox).getByRole("option", {
        name: "Remix"
      }));
      expect(input).not.toHaveValue("Remix");
    });
  }
}`,...L.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  name: "List / Scrollable",
  render: () => {
    const manyItems = Array.from({
      length: 50
    }, (_, i) => \`Item \${i + 1}\`);
    return <Combobox items={manyItems} defaultOpen>
        <ComboboxInput className="w-[240px]" placeholder="Scroll me" />
        <ComboboxContent>
          <ComboboxList>
            {item => <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>;
  },
  play: async ({
    step
  }) => {
    const body = within(document.body);
    await step("All 50 items render in the list", async () => {
      const listbox = await body.findByRole("listbox");
      const options = within(listbox).getAllByRole("option");
      expect(options).toHaveLength(50);
    });
    await step("List container is scrollable", async () => {
      const list = document.querySelector('[data-slot="combobox-list"]');
      expect(list).toBeInTheDocument();
      expect(list!.scrollHeight).toBeGreaterThan(list!.clientHeight);
    });
  }
}`,...D.parameters?.docs?.source}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  name: "Group / Labels and collections",
  render: () => <Combobox items={groupedFrameworks} defaultOpen>
      <ComboboxInput className="w-[240px]" placeholder="Pick" />
      <ComboboxContent>
        <ComboboxList>
          {groupedFrameworks.map(group => <ComboboxGroup key={group.label} items={group.items}>
              <ComboboxLabel>{group.label}</ComboboxLabel>
              <ComboboxCollection>
                {item => <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>}
              </ComboboxCollection>
            </ComboboxGroup>)}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>,
  play: async ({
    step
  }) => {
    const body = within(document.body);
    await step("Groups render with data-slot=combobox-group", async () => {
      const listbox = await body.findByRole("listbox");
      const groups = listbox.querySelectorAll('[data-slot="combobox-group"]');
      expect(groups).toHaveLength(3);
    });
    await step("Labels render with correct text", async () => {
      const listbox = body.getByRole("listbox");
      const labels = listbox.querySelectorAll('[data-slot="combobox-label"]');
      expect(labels).toHaveLength(3);
      expect(labels[0]).toHaveTextContent("Frontend");
      expect(labels[1]).toHaveTextContent("Full-stack");
      expect(labels[2]).toHaveTextContent("Static");
    });
    await step("Collections render items within their group", async () => {
      const listbox = body.getByRole("listbox");
      const groups = listbox.querySelectorAll('[data-slot="combobox-group"]');
      const frontendItems = within(groups[0] as HTMLElement).getAllByRole("option");
      expect(frontendItems.map(o => o.textContent)).toEqual(["Next.js", "Nuxt", "SvelteKit"]);
      const staticItems = within(groups[2] as HTMLElement).getAllByRole("option");
      expect(staticItems.map(o => o.textContent)).toEqual(["Astro", "Eleventy"]);
    });
  }
}`,...N.parameters?.docs?.source}}};q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  name: "Separator / Between groups",
  render: () => <Combobox items={groupedFrameworks} defaultOpen>
      <ComboboxInput className="w-[240px]" placeholder="Pick" />
      <ComboboxContent>
        <ComboboxList>
          {groupedFrameworks.map((group, gi) => <ComboboxGroup key={group.label} items={group.items}>
              {gi > 0 && <ComboboxSeparator />}
              <ComboboxLabel>{group.label}</ComboboxLabel>
              <ComboboxCollection>
                {item => <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>}
              </ComboboxCollection>
            </ComboboxGroup>)}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>,
  play: async ({
    step
  }) => {
    const body = within(document.body);
    await step("Separators render between groups", async () => {
      const listbox = await body.findByRole("listbox");
      const separators = listbox.querySelectorAll('[data-slot="combobox-separator"]');
      expect(separators).toHaveLength(2);
    });
    await step("No separator before first group", async () => {
      const listbox = body.getByRole("listbox");
      const groups = listbox.querySelectorAll('[data-slot="combobox-group"]');
      const firstChild = groups[0]?.previousElementSibling;
      const hasSepBefore = firstChild?.getAttribute("data-slot") === "combobox-separator";
      expect(hasSepBefore).toBe(false);
    });
  }
}`,...q.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  name: "Empty / No match",
  render: () => <Combobox items={[] as string[]} defaultOpen>
      <ComboboxInput className="w-[240px]" placeholder="Type something..." />
      <ComboboxContent>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>,
  play: async ({
    step
  }) => {
    await step("Empty message is visible when no items exist", async () => {
      const empty = document.querySelector('[data-slot="combobox-empty"]');
      expect(empty).toBeInTheDocument();
      expect(empty).toHaveTextContent("No frameworks found.");
    });
  }
}`,...P.parameters?.docs?.source}}};V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  name: "Chip / Default",
  render: () => <ChipPrePopulatedExample />,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chips render with data-slot and text", async () => {
      const chips = canvasElement.querySelectorAll('[data-slot="combobox-chip"]');
      expect(chips).toHaveLength(2);
      expect(chips[0]).toHaveTextContent("Next.js");
      expect(chips[1]).toHaveTextContent("Remix");
    });
    await step("Each chip has a remove button", async () => {
      const removes = canvasElement.querySelectorAll('[data-slot="combobox-chip-remove"]');
      expect(removes).toHaveLength(2);
    });
    if (!isTestRunner()) return;
    await step("Clicking remove removes the chip", async () => {
      const removes = canvasElement.querySelectorAll('[data-slot="combobox-chip-remove"]');
      await userEvent.click(removes[0] as HTMLElement);
      const chips = canvasElement.querySelectorAll('[data-slot="combobox-chip"]');
      expect(chips).toHaveLength(1);
      expect(chips[0]).toHaveTextContent("Remix");
    });
    await step("Adding a new item creates a new chip", async () => {
      const input = canvas.getByRole("combobox");
      await userEvent.click(input);
      const listbox = await canvas.findByRole("listbox");
      await userEvent.click(within(listbox).getByRole("option", {
        name: "Astro"
      }));
      const chips = canvasElement.querySelectorAll('[data-slot="combobox-chip"]');
      expect(chips).toHaveLength(2);
      expect(chips[1]).toHaveTextContent("Astro");
    });
  }
}`,...V.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  name: "Chip / Without remove button",
  render: () => <ChipPrePopulatedExample showRemove={false} />,
  play: async ({
    canvasElement,
    step
  }) => {
    await step("Chips render without remove buttons", async () => {
      const chips = canvasElement.querySelectorAll('[data-slot="combobox-chip"]');
      expect(chips).toHaveLength(2);
      const removes = canvasElement.querySelectorAll('[data-slot="combobox-chip-remove"]');
      expect(removes).toHaveLength(0);
    });
  }
}`,...O.parameters?.docs?.source}}};const de=["Default","WithClearButton","WithoutTrigger","TopAlignedEnd","MultipleSelection","Grouped","CustomItems","InvalidState","Disabled","AutoHighlight","TypeToFilter","ItemDefault","ItemDisabled","ListScrollable","GroupWithLabels","SeparatorBetweenGroups","EmptyState","ChipDefault","ChipWithoutRemove"];export{E as AutoHighlight,V as ChipDefault,O as ChipWithoutRemove,k as CustomItems,C as Default,I as Disabled,P as EmptyState,N as GroupWithLabels,S as Grouped,H as InvalidState,A as ItemDefault,L as ItemDisabled,D as ListScrollable,T as MultipleSelection,q as SeparatorBetweenGroups,f as TopAlignedEnd,j as TypeToFilter,B as WithClearButton,R as WithoutTrigger,de as __namedExportsOrder,ue as default};
