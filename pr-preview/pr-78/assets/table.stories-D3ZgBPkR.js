import{j as e,r as W}from"./iframe-14YYbrss.js";import{u as Y,m as J,c as X}from"./users-BDjn0sir.js";import{B as Z}from"./badge-Dh627mLH.js";import{B as $}from"./button-BSJeE99h.js";import{u as G,a as M,j as z,k as O,l as F,m as _,b as P,c as q,d as V,e as L}from"./combobox-DA91GQrk.js";import{a as ee,b as ae,c as ne,D as I}from"./dropdown-menu-B24EhkCn.js";import{T as b,f as U,a as T,b as m,c as d,d as w,e as h,g as te}from"./table-CAGB-JIG.js";import{E as re}from"./ellipsis-5QsaIXE-.js";import"./preload-helper-BbFkF2Um.js";import"./index-B8eA1Gpy.js";import"./input-group-CYOZ_nWh.js";import"./input-CUCTLqrj.js";import"./check-B_BC0xs5.js";import"./chevron-down-DJZ_3i8R.js";import"./x-B6L8IQUu.js";import"./index-CvEJXU9u.js";import"./index-B_XuWxj8.js";import"./index-CzkjiSpZ.js";import"./index-SK9A3v17.js";import"./index-Bjo__dt-.js";import"./index-_AbBFJ6v.js";const{expect:l,within:y}=__STORYBOOK_MODULE_TEST__;function se(r,t){if(r.length===0)return t;const a=r[0];return t.map(n=>n.align?n:typeof a[n.key]=="number"?{...n,align:"right"}:n)}const oe=[{name:"Clinical exports",owner:"Data Ops",status:"Active",runs:142},{name:"QC dashboard",owner:"Analytics",status:"Paused",runs:38},{name:"Audit trail",owner:"Compliance",status:"Active",runs:94}],le={Workspaces:{data:oe,columns:[{header:"Workspace",key:"name"},{header:"Owner",key:"owner"},{header:"Status",key:"status"},{header:"Runs",key:"runs"}]},Compounds:{data:X,columns:[{header:"Name",key:"name"},{header:"Formula",key:"formula"},{header:"Category",key:"category"},{header:"Purity (%)",key:"purity"},{header:"Status",key:"status"}]},Molecules:{data:J,columns:[{header:"ID",key:"id"},{header:"MW",key:"mw"},{header:"MPO Score",key:"mpoScore"},{header:"SA Score",key:"saScore"},{header:"cLogP",key:"clogp"}]},Users:{data:Y,columns:[{header:"Name",key:"name"},{header:"Email",key:"email"},{header:"Role",key:"role"},{header:"Department",key:"department"},{header:"Age",key:"age"}]}},ce=Object.fromEntries(Object.entries(le).map(([r,t])=>[r,{data:t.data,columns:se(t.data,t.columns)}]));function x(r){return ce[r.dataset??"Workspaces"]}function ie(r){return r.density??"default"}function v(r){return{"data-density":ie(r),...r.striped?{"data-striped":""}:{},variant:r.variant??"default"}}const Ee={title:"Components/Table",component:b,parameters:{layout:"padded"},tags:["autodocs"],argTypes:{dataset:{control:{type:"select"},options:["Workspaces","Compounds","Molecules","Users"]},density:{control:{type:"select"},options:["compact","default","relaxed"]},striped:{control:{type:"boolean"}},variant:{control:{type:"select"},options:["default","card"]}},args:{dataset:"Workspaces",density:"default",striped:!1,variant:"default"}},g={parameters:{zephyr:{testCaseId:"SW-T1308"}},render:r=>{const t=r,{data:a,columns:n}=x(t);return e.jsxs(b,{...v(t),children:[e.jsxs(U,{children:[t.dataset," — ",a.length," rows"]}),e.jsx(T,{children:e.jsx(m,{children:n.map(s=>e.jsx(d,{variant:s.align==="right"?"numeric":void 0,children:s.header},s.key))})}),e.jsx(w,{children:a.map((s,c)=>e.jsx(m,{children:n.map(o=>e.jsx(h,{variant:o.align==="right"?"numeric":void 0,children:String(s[o.key]??"")},o.key))},String(s.id??s.name??c)))})]})},play:async({canvasElement:r,step:t})=>{const a=y(r);await t("Table renders with headers and rows",async()=>{l(a.getByRole("table")).toBeInTheDocument();const n=a.getAllByRole("columnheader");l(n.length).toBeGreaterThanOrEqual(4)}),await t("Data rows render",async()=>{const n=a.getAllByRole("row");l(n.length).toBeGreaterThan(1)})}},B={parameters:{zephyr:{testCaseId:"SW-T1309"}},render:r=>{const t=r,{data:a,columns:n}=x(t);return e.jsxs(b,{...v(t),children:[e.jsxs(U,{children:[t.dataset," — ",a.length," rows"]}),e.jsx(T,{children:e.jsx(m,{children:n.map(s=>e.jsx(d,{variant:s.align==="right"?"numeric":void 0,children:s.header},s.key))})}),e.jsx(w,{children:a.map((s,c)=>e.jsx(m,{children:n.map(o=>e.jsx(h,{variant:o.align==="right"?"numeric":void 0,children:String(s[o.key]??"")},o.key))},String(s.id??s.name??c)))}),e.jsx(te,{children:e.jsxs(m,{children:[e.jsx(h,{colSpan:n.length-1,children:"Total rows"}),e.jsx(h,{variant:"numeric",children:a.length})]})})]})},play:async({canvasElement:r,step:t})=>{const a=y(r);await t("Table renders with footer row",async()=>{l(a.getByRole("table")).toBeInTheDocument(),l(a.getByRole("cell",{name:"Total rows"})).toBeInTheDocument()})}},k={args:{dataset:"Compounds",striped:!0},render:g.render,play:async({canvasElement:r,step:t})=>{const a=y(r);await t("Table has data-striped attribute",async()=>{const n=a.getByRole("table");l(n.closest("[data-striped]")).not.toBeNull()}),await t("Data rows render",async()=>{const n=a.getAllByRole("row");l(n.length).toBeGreaterThan(1)})},parameters:{zephyr:{testCaseId:"SW-T1448"}}},j={args:{density:"compact"},render:g.render,play:async({canvasElement:r,step:t})=>{const a=y(r);await t("Table has compact density attribute",async()=>{const n=a.getByRole("table");l(n.closest("[data-density='compact']")).not.toBeNull()}),await t("Headers and rows render",async()=>{l(a.getAllByRole("columnheader").length).toBeGreaterThanOrEqual(4),l(a.getAllByRole("row").length).toBeGreaterThan(1)})},parameters:{zephyr:{testCaseId:"SW-T1449"}}},R={args:{density:"relaxed"},render:g.render,play:async({canvasElement:r,step:t})=>{const a=y(r);await t("Table has relaxed density attribute",async()=>{const n=a.getByRole("table");l(n.closest("[data-density='relaxed']")).not.toBeNull()}),await t("Headers and rows render",async()=>{l(a.getAllByRole("columnheader").length).toBeGreaterThanOrEqual(4),l(a.getAllByRole("row").length).toBeGreaterThan(1)})},parameters:{zephyr:{testCaseId:"SW-T1450"}}},de={Active:"positive",Paused:"warning",Archived:"secondary",Inactive:"secondary"},S={play:async({canvasElement:r,step:t})=>{const a=y(r);await t("Table renders with headers",async()=>{l(a.getByRole("table")).toBeInTheDocument(),l(a.getByRole("columnheader",{name:"Status"})).toBeInTheDocument()}),await t("Status column renders Badge components",async()=>{const n=r.querySelectorAll("[data-slot='badge']");l(n.length).toBeGreaterThan(0)}),await t("Badge text matches expected status values",async()=>{const n=a.getAllByText("Active");l(n.length).toBeGreaterThan(0),l(n[0].closest("[data-slot='badge']")).not.toBeNull()})},render:r=>{const t=r,{data:a,columns:n}=x(t);return e.jsxs(b,{...v(t),children:[e.jsx(T,{children:e.jsx(m,{children:n.map(s=>e.jsx(d,{variant:s.align==="right"?"numeric":void 0,children:s.header},s.key))})}),e.jsx(w,{children:a.map((s,c)=>e.jsx(m,{children:n.map(o=>{const p=String(s[o.key]??"");return o.key==="status"?e.jsx(h,{children:e.jsx(Z,{variant:de[p]??"secondary",children:p})},o.key):e.jsx(h,{variant:o.align==="right"?"numeric":void 0,children:p},o.key)})},String(s.id??s.name??c)))})]})},parameters:{zephyr:{testCaseId:"SW-T1451"}}},C={render:r=>{const t=r,{data:a,columns:n}=x(t);return e.jsxs(b,{...v(t),children:[e.jsx(T,{children:e.jsxs(m,{children:[n.map(s=>e.jsx(d,{variant:s.align==="right"?"numeric":void 0,children:s.header},s.key)),e.jsx(d,{variant:"action",children:e.jsx("span",{className:"sr-only",children:"Actions"})})]})}),e.jsx(w,{children:a.map((s,c)=>{const o=String(s[n[0].key]??c);return e.jsxs(m,{children:[e.jsx(d,{scope:"row",children:o}),n.slice(1).map(p=>e.jsx(h,{variant:p.align==="right"?"numeric":void 0,children:String(s[p.key]??"")},p.key)),e.jsx(h,{variant:"action",children:e.jsxs(ee,{children:[e.jsx(ae,{asChild:!0,children:e.jsxs($,{size:"icon-xs",variant:"ghost",children:[e.jsx(re,{}),e.jsxs("span",{className:"sr-only",children:["Actions for ",o]})]})}),e.jsxs(ne,{align:"end",children:[e.jsx(I,{children:"Edit"}),e.jsx(I,{children:"Duplicate"}),e.jsx(I,{variant:"destructive",children:"Delete"})]})]})})]},String(s.id??s.name??c))})})]})},play:async({canvasElement:r,step:t})=>{const a=y(r);await t("First column cells are row headers (th elements)",async()=>{const n=a.getAllByRole("row")[1],s=y(n).getByRole("rowheader");l(s).toBeInTheDocument()}),await t("Action buttons are present",async()=>{const n=a.getAllByRole("button",{name:/Actions for/});l(n.length).toBeGreaterThan(0)})},parameters:{zephyr:{testCaseId:"SW-T1452"}}},D={render:r=>{const t=r,{data:a,columns:n}=x(t),s=a.length<15?[...a,...a,...a].map((c,o)=>({...c,_key:o})):a;return e.jsxs(b,{...v(t),containerClassName:"max-h-80 rounded-lg border",children:[e.jsx(T,{variant:"sticky",children:e.jsx(m,{children:n.map(c=>e.jsx(d,{variant:c.align==="right"?"numeric":void 0,children:c.header},c.key))})}),e.jsx(w,{children:s.map((c,o)=>e.jsx(m,{children:n.map(p=>e.jsx(h,{variant:p.align==="right"?"numeric":void 0,children:String(c[p.key]??"")},p.key))},c._key==null?String(c.id??c.name??o):String(c._key)))})]})},play:async({canvasElement:r,step:t})=>{const a=y(r);await t("Table renders with many rows",async()=>{l(a.getByRole("table")).toBeInTheDocument();const n=a.getAllByRole("row");l(n.length).toBeGreaterThan(5)}),await t("Header is visible after scrolling",async()=>{const n=r.querySelector(".max-h-80");n&&(n.scrollTop=400),l(a.getAllByRole("columnheader").length).toBeGreaterThan(0)})}};function me(r){const t=r,{data:a,columns:n}=x(t),s=[...new Set(a.map(i=>String(i.owner)))],c=[...new Set(a.map(i=>String(i.status)))],[o,p]=W.useState([]),[A,K]=W.useState([]),E=G(),N=G(),Q=a.filter(i=>{const u=o.length===0||o.includes(i.owner),H=A.length===0||A.includes(i.status);return u&&H});return e.jsxs(b,{children:[e.jsxs(T,{children:[e.jsxs(m,{children:[e.jsx(d,{children:"Workspace"}),e.jsx(d,{className:"min-w-[180px]",children:"Owner"}),e.jsx(d,{className:"min-w-[180px]",children:"Status"}),e.jsx(d,{children:"Type"}),e.jsx(d,{className:"text-right",children:"Runs"})]}),e.jsxs(m,{children:[e.jsx(d,{}),e.jsx(d,{className:"p-1 align-top",children:e.jsxs(M,{multiple:!0,items:s,value:o,onValueChange:p,children:[e.jsxs(z,{ref:E,className:"max-w-[200px]",children:[e.jsx(O,{children:i=>i.map(u=>e.jsx(F,{children:u},u))}),e.jsx(_,{placeholder:"Filter owner...",className:"text-xs"})]}),e.jsxs(P,{anchor:E,children:[e.jsx(q,{children:"No matches."}),e.jsx(V,{children:i=>e.jsx(L,{value:i,children:i},i)})]})]})}),e.jsx(d,{className:"p-1 align-top",children:e.jsxs(M,{multiple:!0,items:c,value:A,onValueChange:K,children:[e.jsxs(z,{ref:N,className:"max-w-[200px]",children:[e.jsx(O,{children:i=>i.map(u=>e.jsx(F,{children:u},u))}),e.jsx(_,{placeholder:"Filter status...",className:"text-xs"})]}),e.jsxs(P,{anchor:N,children:[e.jsx(q,{children:"No matches."}),e.jsx(V,{children:i=>e.jsx(L,{value:i,children:i},i)})]})]})}),e.jsx(d,{}),e.jsx(d,{})]})]}),e.jsx(w,{children:Q.map(i=>e.jsx(m,{children:n.map(u=>{const H=String(i[u.key]??"");return e.jsx(h,{variant:u.align==="right"?"numeric":void 0,children:H},u.key)})},String(i.id??i.name)))})]})}const f={render:r=>me(r),parameters:{zephyr:{testCaseId:"SW-T1453"}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  parameters: {
    zephyr: {
      testCaseId: "SW-T1308"
    }
  },
  render: args => {
    const a = args as Record<string, unknown>;
    const {
      data,
      columns
    } = getDataset(a);
    return <Table {...getTableProps(a)}>
        <TableCaption>{a.dataset as string} — {data.length} rows</TableCaption>
        <TableHeader>
          <TableRow>
            {columns.map(col => <TableHead key={col.key} variant={col.align === "right" ? "numeric" : undefined}>
                {col.header}
              </TableHead>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => <TableRow key={String(row["id"] ?? row["name"] ?? i)}>
              {columns.map(col => <TableCell key={col.key} variant={col.align === "right" ? "numeric" : undefined}>
                  {String(row[col.key] ?? "")}
                </TableCell>)}
            </TableRow>)}
        </TableBody>
      </Table>;
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Table renders with headers and rows", async () => {
      expect(canvas.getByRole("table")).toBeInTheDocument();
      const headers = canvas.getAllByRole("columnheader");
      expect(headers.length).toBeGreaterThanOrEqual(4);
    });
    await step("Data rows render", async () => {
      const rows = canvas.getAllByRole("row");
      expect(rows.length).toBeGreaterThan(1);
    });
  }
}`,...g.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  parameters: {
    zephyr: {
      testCaseId: "SW-T1309"
    }
  },
  render: args => {
    const a = args as Record<string, unknown>;
    const {
      data,
      columns
    } = getDataset(a);
    return <Table {...getTableProps(a)}>
        <TableCaption>{a.dataset as string} — {data.length} rows</TableCaption>
        <TableHeader>
          <TableRow>
            {columns.map(col => <TableHead key={col.key} variant={col.align === "right" ? "numeric" : undefined}>
                {col.header}
              </TableHead>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => <TableRow key={String(row["id"] ?? row["name"] ?? i)}>
              {columns.map(col => <TableCell key={col.key} variant={col.align === "right" ? "numeric" : undefined}>
                  {String(row[col.key] ?? "")}
                </TableCell>)}
            </TableRow>)}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={columns.length - 1}>
              Total rows
            </TableCell>
            <TableCell variant="numeric">{data.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>;
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Table renders with footer row", async () => {
      expect(canvas.getByRole("table")).toBeInTheDocument();
      expect(canvas.getByRole("cell", {
        name: "Total rows"
      })).toBeInTheDocument();
    });
  }
}`,...B.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    dataset: "Compounds",
    striped: true
  },
  render: Default.render,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Table has data-striped attribute", async () => {
      const table = canvas.getByRole("table");
      expect(table.closest("[data-striped]")).not.toBeNull();
    });
    await step("Data rows render", async () => {
      const rows = canvas.getAllByRole("row");
      expect(rows.length).toBeGreaterThan(1);
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1448"
    }
  }
}`,...k.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    density: "compact"
  },
  render: Default.render,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Table has compact density attribute", async () => {
      const table = canvas.getByRole("table");
      expect(table.closest("[data-density='compact']")).not.toBeNull();
    });
    await step("Headers and rows render", async () => {
      expect(canvas.getAllByRole("columnheader").length).toBeGreaterThanOrEqual(4);
      expect(canvas.getAllByRole("row").length).toBeGreaterThan(1);
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1449"
    }
  }
}`,...j.parameters?.docs?.source}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    density: "relaxed"
  },
  render: Default.render,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Table has relaxed density attribute", async () => {
      const table = canvas.getByRole("table");
      expect(table.closest("[data-density='relaxed']")).not.toBeNull();
    });
    await step("Headers and rows render", async () => {
      expect(canvas.getAllByRole("columnheader").length).toBeGreaterThanOrEqual(4);
      expect(canvas.getAllByRole("row").length).toBeGreaterThan(1);
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1450"
    }
  }
}`,...R.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Table renders with headers", async () => {
      expect(canvas.getByRole("table")).toBeInTheDocument();
      expect(canvas.getByRole("columnheader", {
        name: "Status"
      })).toBeInTheDocument();
    });
    await step("Status column renders Badge components", async () => {
      const badges = canvasElement.querySelectorAll("[data-slot='badge']");
      expect(badges.length).toBeGreaterThan(0);
    });
    await step("Badge text matches expected status values", async () => {
      const activeBadges = canvas.getAllByText("Active");
      expect(activeBadges.length).toBeGreaterThan(0);
      expect(activeBadges[0].closest("[data-slot='badge']")).not.toBeNull();
    });
  },
  render: args => {
    const a = args as Record<string, unknown>;
    const {
      data,
      columns
    } = getDataset(a);
    return <Table {...getTableProps(a)}>
        <TableHeader>
          <TableRow>
            {columns.map(col => <TableHead key={col.key} variant={col.align === "right" ? "numeric" : undefined}>
                {col.header}
              </TableHead>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => <TableRow key={String(row["id"] ?? row["name"] ?? i)}>
              {columns.map(col => {
            const value = String(row[col.key] ?? "");
            if (col.key === "status") {
              return <TableCell key={col.key}>
                      <Badge variant={statusVariant[value] ?? "secondary"}>{value}</Badge>
                    </TableCell>;
            }
            return <TableCell key={col.key} variant={col.align === "right" ? "numeric" : undefined}>
                    {value}
                  </TableCell>;
          })}
            </TableRow>)}
        </TableBody>
      </Table>;
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1451"
    }
  }
}`,...S.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: args => {
    const a = args as Record<string, unknown>;
    const {
      data,
      columns
    } = getDataset(a);
    return <Table {...getTableProps(a)}>
        <TableHeader>
          <TableRow>
            {columns.map(col => <TableHead key={col.key} variant={col.align === "right" ? "numeric" : undefined}>
                {col.header}
              </TableHead>)}
            <TableHead variant="action">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => {
          const label = String(row[columns[0].key] ?? i);
          return <TableRow key={String(row["id"] ?? row["name"] ?? i)}>
                <TableHead scope="row">
                  {label}
                </TableHead>
                {columns.slice(1).map(col => <TableCell key={col.key} variant={col.align === "right" ? "numeric" : undefined}>
                    {String(row[col.key] ?? "")}
                  </TableCell>)}
                <TableCell variant="action">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon-xs" variant="ghost">
                        <MoreHorizontalIcon />
                        <span className="sr-only">Actions for {label}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem variant="destructive">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>;
        })}
        </TableBody>
      </Table>;
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("First column cells are row headers (th elements)", async () => {
      const firstRow = canvas.getAllByRole("row")[1];
      const rowHeader = within(firstRow).getByRole("rowheader");
      expect(rowHeader).toBeInTheDocument();
    });
    await step("Action buttons are present", async () => {
      const buttons = canvas.getAllByRole("button", {
        name: /Actions for/
      });
      expect(buttons.length).toBeGreaterThan(0);
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1452"
    }
  }
}`,...C.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: args => {
    const a = args as Record<string, unknown>;
    const {
      data: baseData,
      columns
    } = getDataset(a);

    // Duplicate data to ensure enough rows for scrolling
    const data = baseData.length < 15 ? [...baseData, ...baseData, ...baseData].map((row, i) => ({
      ...row,
      _key: i
    })) : baseData;
    return <Table {...getTableProps(a)} containerClassName="max-h-80 rounded-lg border">
        <TableHeader variant="sticky">
          <TableRow>
            {columns.map(col => <TableHead key={col.key} variant={col.align === "right" ? "numeric" : undefined}>
                {col.header}
              </TableHead>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => <TableRow key={(row as Record<string, unknown>)["_key"] == null ? String(row["id"] ?? row["name"] ?? i) : String((row as Record<string, unknown>)["_key"])}>
              {columns.map(col => <TableCell key={col.key} variant={col.align === "right" ? "numeric" : undefined}>
                  {String(row[col.key] ?? "")}
                </TableCell>)}
            </TableRow>)}
        </TableBody>
      </Table>;
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Table renders with many rows", async () => {
      expect(canvas.getByRole("table")).toBeInTheDocument();
      const rows = canvas.getAllByRole("row");
      expect(rows.length).toBeGreaterThan(5);
    });
    await step("Header is visible after scrolling", async () => {
      const scrollContainer = canvasElement.querySelector(".max-h-80");
      if (scrollContainer) {
        scrollContainer.scrollTop = 400;
      }
      expect(canvas.getAllByRole("columnheader").length).toBeGreaterThan(0);
    });
  }
}`,...D.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: args => TableHeaderFilterExample(args),
  parameters: {
    zephyr: {
      testCaseId: "SW-T1453"
    }
  }
}`,...f.parameters?.docs?.source}}};const Ne=["Default","WithFooter","Striped","CompactDensity","RelaxedDensity","CustomCells","RowActions","StickyHeader","TableHeaderFilter"];export{j as CompactDensity,S as CustomCells,g as Default,R as RelaxedDensity,C as RowActions,D as StickyHeader,k as Striped,f as TableHeaderFilter,B as WithFooter,Ne as __namedExportsOrder,Ee as default};
