import{j as e}from"./iframe-14YYbrss.js";import{S as l}from"./skeleton-A5DdSu8W.js";import{T as u,a as x,b as y,c as w,d as S,e as b}from"./table-CAGB-JIG.js";import"./preload-helper-BbFkF2Um.js";const{expect:o,within:p}=__STORYBOOK_MODULE_TEST__,N={title:"Components/Skeleton",component:l,parameters:{layout:"centered"},tags:["autodocs"]},c={render:()=>e.jsx(l,{className:"h-8 w-[260px]"}),parameters:{zephyr:{testCaseId:"SW-T1296"}},play:async({canvasElement:a,step:t})=>{const s=p(a);await t("Skeleton renders",async()=>{const n=s.getAllByRole("generic").find(r=>r.getAttribute("data-slot")==="skeleton");o(n).toBeTruthy()}),await t("Skeleton uses shimmer placeholder",async()=>{const n=a.querySelector('[data-slot="skeleton"]');o(n?.className).toMatch(/shimmer/)})}},d={render:()=>e.jsxs("div",{className:"grid w-[320px] gap-2",children:[e.jsx(l,{className:"h-4 w-full"}),e.jsx(l,{className:"h-4 w-full"}),e.jsx(l,{className:"h-4 w-4/5"}),e.jsx(l,{className:"h-4 w-3/5"})]}),play:async({canvasElement:a,step:t})=>{const s=p(a);await t("Text skeleton lines render",async()=>{const n=s.getAllByRole("generic").filter(r=>r.getAttribute("data-slot")==="skeleton");o(n).toHaveLength(4)})},parameters:{zephyr:{testCaseId:"SW-T1403"}}},i={render:()=>e.jsxs("div",{className:"flex w-[320px] items-center gap-4 rounded-xl border p-4",children:[e.jsx(l,{className:"size-12 rounded-full"}),e.jsxs("div",{className:"grid flex-1 gap-2",children:[e.jsx(l,{className:"h-4 w-1/2"}),e.jsx(l,{className:"h-4 w-3/4"})]})]}),parameters:{zephyr:{testCaseId:"SW-T1297"}},play:async({canvasElement:a,step:t})=>{const s=p(a);await t("Skeleton placeholders render",async()=>{const n=s.getAllByRole("generic").filter(r=>r.getAttribute("data-slot")==="skeleton");o(n).toHaveLength(3)}),await t("Profile card container",async()=>{o(a.querySelector(".rounded-xl.border")).toBeTruthy()})}},m={render:()=>{const a=["Name","Status","Created","Actions"];return e.jsx("div",{className:"w-[600px]",children:e.jsxs(u,{children:[e.jsx(x,{children:e.jsx(y,{children:a.map(s=>e.jsx(w,{children:s},s))})}),e.jsx(S,{children:Array.from({length:5},(s,n)=>e.jsx(y,{children:a.map((r,h)=>e.jsx(b,{children:e.jsx(l,{className:`h-4 ${h===0?"w-32":h===3?"w-16":"w-24"}`})},r))},n))})]})})},play:async({canvasElement:a,step:t})=>{await t("Table header renders",async()=>{const s=a.querySelectorAll('[data-slot="table-head"]');o(s).toHaveLength(4)}),await t("Skeleton cells render in table body",async()=>{const s=a.querySelectorAll('[data-slot="table-body"] [data-slot="skeleton"]');o(s).toHaveLength(20)})},parameters:{zephyr:{testCaseId:"SW-T1404"}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <Skeleton className="h-8 w-[260px]" />,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1296"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Skeleton renders", async () => {
      const skeleton = canvas.getAllByRole("generic").find(el => el.getAttribute("data-slot") === "skeleton");
      expect(skeleton).toBeTruthy();
    });
    await step("Skeleton uses shimmer placeholder", async () => {
      const el = canvasElement.querySelector('[data-slot="skeleton"]');
      expect(el?.className).toMatch(/shimmer/);
    });
  }
}`,...c.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid w-[320px] gap-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-3/5" />
    </div>,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Text skeleton lines render", async () => {
      const skeletons = canvas.getAllByRole("generic").filter(el => el.getAttribute("data-slot") === "skeleton");
      expect(skeletons).toHaveLength(4);
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1403"
    }
  }
}`,...d.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex w-[320px] items-center gap-4 rounded-xl border p-4">
      <Skeleton className="size-12 rounded-full" />
      <div className="grid flex-1 gap-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1297"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Skeleton placeholders render", async () => {
      const slots = canvas.getAllByRole("generic").filter(el => el.getAttribute("data-slot") === "skeleton");
      expect(slots).toHaveLength(3);
    });
    await step("Profile card container", async () => {
      expect(canvasElement.querySelector(".rounded-xl.border")).toBeTruthy();
    });
  }
}`,...i.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => {
    const columns = ["Name", "Status", "Created", "Actions"];
    const rows = 5;
    return <div className="w-[600px]">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(col => <TableHead key={col}>{col}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({
            length: rows
          }, (_, rowIdx) => <TableRow key={rowIdx}>
                {columns.map((col, colIdx) => <TableCell key={col}>
                    <Skeleton className={\`h-4 \${colIdx === 0 ? "w-32" : colIdx === 3 ? "w-16" : "w-24"}\`} />
                  </TableCell>)}
              </TableRow>)}
          </TableBody>
        </Table>
      </div>;
  },
  play: async ({
    canvasElement,
    step
  }) => {
    await step("Table header renders", async () => {
      const headers = canvasElement.querySelectorAll('[data-slot="table-head"]');
      expect(headers).toHaveLength(4);
    });
    await step("Skeleton cells render in table body", async () => {
      const skeletons = canvasElement.querySelectorAll('[data-slot="table-body"] [data-slot="skeleton"]');
      expect(skeletons).toHaveLength(20);
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1404"
    }
  }
}`,...m.parameters?.docs?.source}}};const f=["Default","Text","ProfileCard","TableSkeleton"];export{c as Default,i as ProfileCard,m as TableSkeleton,d as Text,f as __namedExportsOrder,N as default};
