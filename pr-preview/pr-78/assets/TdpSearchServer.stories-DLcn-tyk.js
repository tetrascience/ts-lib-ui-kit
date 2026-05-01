import{j as r,r as k}from"./iframe-14YYbrss.js";import{T as S}from"./TdpSearch-BsrgIuZl.js";import"./preload-helper-BbFkF2Um.js";import"./select-B5d0bdmo.js";import"./chevron-down-DJZ_3i8R.js";import"./check-B_BC0xs5.js";import"./chevron-up-CzLCBlyb.js";import"./index-BdQq_4o_.js";import"./index-CzkjiSpZ.js";import"./index-SK9A3v17.js";import"./index-Bjo__dt-.js";import"./index-CoM-oBxn.js";import"./button-BSJeE99h.js";import"./index-B8eA1Gpy.js";import"./table-CAGB-JIG.js";import"./arrow-up-B6U4VEKO.js";import"./chevron-left-C34xjuVG.js";import"./chevron-right-CDyisS10.js";import"./input-CUCTLqrj.js";import"./search-5w6eG1Tc.js";import"./alert-Bm4-XRaT.js";import"./circle-alert-DKEVX4i9.js";const f={took:15,timed_out:!1,_shards:{total:1,successful:1,skipped:0,failed:0},hits:{total:{value:42,relation:"eq"},max_score:1.5,hits:[{_index:"datalake",_id:"file-001",_score:1.5,_source:{id:"file-001",filePath:"/data/experiments/sample-001.csv",sourceType:"instrument-data",status:"processed",fileSize:2048576,createdAt:"2024-01-15T10:30:00Z"}},{_index:"datalake",_id:"file-002",_score:1.4,_source:{id:"file-002",filePath:"/data/experiments/sample-002.csv",sourceType:"manual-upload",status:"processed",fileSize:5242880,createdAt:"2024-01-15T11:45:00Z"}},{_index:"datalake",_id:"file-003",_score:1.3,_source:{id:"file-003",filePath:"/data/experiments/experiment-a.json",sourceType:"instrument-data",status:"pending",fileSize:1024e3,createdAt:"2024-01-15T14:20:00Z"}},{_index:"datalake",_id:"file-004",_score:1.2,_source:{id:"file-004",filePath:"/data/results/analysis-001.xlsx",sourceType:"pipeline-output",status:"processed",fileSize:3145728,createdAt:"2024-01-16T09:15:00Z"}},{_index:"datalake",_id:"file-005",_score:1.1,_source:{id:"file-005",filePath:"/data/experiments/sample-003.csv",sourceType:"instrument-data",status:"failed",fileSize:1536e3,createdAt:"2024-01-16T13:00:00Z"}},{_index:"datalake",_id:"file-006",_score:1,_source:{id:"file-006",filePath:"/data/raw/instrument-log.txt",sourceType:"manual-upload",status:"processed",fileSize:819200,createdAt:"2024-01-17T08:30:00Z"}},{_index:"datalake",_id:"file-007",_score:.9,_source:{id:"file-007",filePath:"/data/experiments/experiment-b.json",sourceType:"instrument-data",status:"processed",fileSize:2621440,createdAt:"2024-01-17T15:45:00Z"}},{_index:"datalake",_id:"file-008",_score:.8,_source:{id:"file-008",filePath:"/data/results/summary-report.pdf",sourceType:"pipeline-output",status:"processed",fileSize:4194304,createdAt:"2024-01-18T10:00:00Z"}},{_index:"datalake",_id:"file-009",_score:.7,_source:{id:"file-009",filePath:"/data/experiments/sample-004.csv",sourceType:"instrument-data",status:"processed",fileSize:1843200,createdAt:"2024-01-18T16:20:00Z"}},{_index:"datalake",_id:"file-010",_score:.6,_source:{id:"file-010",filePath:"/data/calibration/standards.xlsx",sourceType:"manual-upload",status:"processed",fileSize:2457600,createdAt:"2024-01-19T11:30:00Z"}}]}},{expect:a,within:i}=__STORYBOOK_MODULE_TEST__,I=({query:n,setQuery:t,onSearch:e,isLoading:s,placeholder:l})=>r.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:12},children:[r.jsxs("div",{style:{display:"flex",flex:1,alignItems:"center",gap:8,padding:"6px 12px",border:"1px solid var(--border, #d1d5db)",borderRadius:20,background:"var(--card, #f9fafb)"},children:[r.jsx("span",{style:{fontSize:14},children:"🔍"}),r.jsx("input",{value:n,onChange:d=>t(d.target.value),onKeyDown:d=>d.key==="Enter"&&e(),placeholder:l,style:{flex:1,border:"none",background:"transparent",outline:"none",fontSize:14}}),n&&r.jsx("button",{onClick:()=>t(""),style:{border:"none",background:"none",cursor:"pointer",fontSize:16,lineHeight:1},children:"x"})]}),r.jsx("button",{onClick:e,disabled:!n?.trim()||s,style:{padding:"7px 18px",borderRadius:20,border:"none",background:"var(--prinary, #4f46e5)",color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",opacity:!n?.trim()||s?.5:1},children:s?"…":"Search"})]}),w=n=>{const t=()=>(k.useEffect(()=>{const e=globalThis.fetch;return globalThis.fetch=async(s,l)=>{if(s.toString().includes("/api/search")){await new Promise(b=>setTimeout(b,400));let u=f.hits.hits;try{const g=(JSON.parse(l?.body??"{}").expression?.e??[]).filter(p=>p.field&&p.operator==="eq");g.length>0&&(u=u.filter(p=>g.every(x=>p._source?.[x.field]===x.value)))}catch{}const v={...f,hits:{...f.hits,total:{value:u.length,relation:"eq"},hits:u}};return new Response(JSON.stringify(v),{status:200,headers:{"Content-Type":"application/json"}})}return e(s,l)},()=>{globalThis.fetch=e}},[]),r.jsx(n,{}));return r.jsx(t,{})},T=[{key:"id",header:"ID",width:"120px"},{key:"filePath",header:"File Path",sortable:!0},{key:"sourceType",header:"Source Type",sortable:!0,render:n=>r.jsx("span",{style:{padding:"4px 8px",borderRadius:"4px",border:"1px solid var(--border)",fontWeight:500,fontSize:"12px",backgroundColor:"var(--muted)"},children:n||"unknown"})},{key:"status",header:"Status",sortable:!0},{key:"fileSize",header:"Size",align:"right",sortable:!0,render:n=>n?`${(n/1024/1024).toFixed(2)} MB`:"-"},{key:"createdAt",header:"Created At",sortable:!0}],B=[{key:"sourceType",label:"Source Type",options:[{value:"",label:"All Types"},{value:"instrument-data",label:"Instrument Data"},{value:"manual-upload",label:"Manual Upload"},{value:"pipeline-output",label:"Pipeline Output"}]},{key:"status",label:"Status",options:[{value:"",label:"All Statuses"},{value:"processed",label:"Processed"},{value:"pending",label:"Pending"},{value:"failed",label:"Failed"}]}],V={title:"TetraData Platform/Search/Server",component:S,decorators:[w],parameters:{layout:"padded",docs:{description:{component:"Server-side TdpSearch: calls `apiEndpoint` with cookies (or optional `authToken` / `orgSlug` headers). Backend uses `tdpSearchManager` from `@tetrascience-npm/tetrascience-react-ui/server`.\n\nMock returns sample data so stories work without a backend."}}},tags:["autodocs"]},h={args:{apiEndpoint:"/api/search",columns:[{key:"id",header:"ID",width:"120px"},{key:"filePath",header:"File Path",sortable:!0},{key:"sourceType",header:"Source Type",sortable:!0},{key:"status",header:"Status",sortable:!0},{key:"fileSize",header:"Size",sortable:!0},{key:"createdAt",header:"Created",sortable:!0}],defaultQuery:"sample-data",searchPlaceholder:"Search files..."},parameters:{zephyr:{testCaseId:"SW-T1120"}},play:async({canvasElement:n,step:t})=>{const e=i(n);await t("Search input renders",async()=>{const s=e.queryByRole("searchbox")??e.queryByRole("textbox");a(s).toBeInTheDocument()}),await t("Placeholder text is displayed",async()=>{a(e.getByPlaceholderText("Search files...")).toBeInTheDocument()}),await t("Search button is present",async()=>{a(e.getByRole("button",{name:/search/i})).toBeInTheDocument()}),await t("Search icon is visible in the bar",async()=>{a(e.getByRole("textbox").closest(".tdp-search__search-bar")).toBeTruthy()}),await t("Initial empty state prompts to search",async()=>{a(e.getByText("Enter a search query and click Search to get started.")).toBeInTheDocument()})}},y={args:{columns:T,filters:B,defaultQuery:"sample",defaultSort:{field:"createdAt",order:"desc"},pageSize:15,onSearch:()=>{}},parameters:{zephyr:{testCaseId:"SW-T1121"}},play:async({canvasElement:n,step:t})=>{const e=i(n);await t("Search input renders",async()=>{const s=e.queryByRole("searchbox")??e.queryByRole("textbox");a(s).toBeInTheDocument()}),await t("Default placeholder is displayed",async()=>{a(e.getByPlaceholderText("Enter search term...")).toBeInTheDocument()}),await t("Search button is present",async()=>{a(e.getByRole("button",{name:/search/i})).toBeInTheDocument()}),await t("Filter labels are displayed",async()=>{a(e.getByText("Source Type")).toBeInTheDocument(),a(e.getByText("Status")).toBeInTheDocument()}),await t("Filter comboboxes render",async()=>{a(e.getAllByRole("combobox").length).toBeGreaterThanOrEqual(2)}),await t("Initial empty state prompts to search",async()=>{a(e.getByText("Enter a search query and click Search to get started.")).toBeInTheDocument()})}},m={args:{columns:[{key:"id",header:"ID"},{key:"filePath",header:"File Path",sortable:!0},{key:"sourceType",header:"Source Type",sortable:!0},{key:"status",header:"Status",sortable:!0},{key:"fileSize",header:"Size",sortable:!0},{key:"createdAt",header:"Created",sortable:!0}],filters:B,defaultQuery:"sample",pageSize:10},parameters:{zephyr:{testCaseId:"SW-T1122"}},play:async({canvasElement:n,step:t})=>{const e=i(n);await t("Search input renders",async()=>{const s=e.queryByRole("searchbox")??e.queryByRole("textbox");a(s).toBeInTheDocument()}),await t("Default placeholder is displayed",async()=>{a(e.getByPlaceholderText("Enter search term...")).toBeInTheDocument()}),await t("Search button is present",async()=>{a(e.getByRole("button",{name:/search/i})).toBeInTheDocument()}),await t("Filter labels are displayed",async()=>{a(e.getByText("Source Type")).toBeInTheDocument(),a(e.getByText("Status")).toBeInTheDocument()}),await t("Filter comboboxes render",async()=>{a(e.getAllByRole("combobox").length).toBe(2)}),await t("Initial empty state prompts to search",async()=>{a(e.getByText("Enter a search query and click Search to get started.")).toBeInTheDocument()})}},o={args:{columns:[{key:"id",header:"ID",width:"100px",render:n=>r.jsx("code",{style:{fontSize:12,color:"var(--muted-foreground, #6b7280)",letterSpacing:"0.02em"},children:n})},{key:"filePath",header:"File Path",sortable:!0,render:n=>r.jsx("span",{style:{fontFamily:"'Fira Code', 'Source Code Pro', monospace",fontSize:13,color:"var(--primary, #1d4ed8)",textDecoration:"underline",textDecorationColor:"var(--primary, #bfdbfe)",textUnderlineOffset:2,cursor:"pointer"},children:n})},{key:"sourceType",header:"Source Type",sortable:!0,render:n=>{const e={"instrument-data":{bg:"var(--background)",fg:"var(--foreground)",border:"#bfdbfe"},"manual-upload":{bg:"var(--background)",fg:"var(--foreground)",border:"#fde68a"},"pipeline-output":{bg:"var(--background)",fg:"var(--foreground)",border:"#bbf7d0"}}[n]??{bg:"var(--background)",fg:"var(--foreground)",border:"#d1d5db"};return r.jsx("span",{style:{display:"inline-block",padding:"3px 10px",borderRadius:12,fontSize:12,fontWeight:600,backgroundColor:e.bg,color:e.fg,border:`1px solid ${e.border}`,whiteSpace:"nowrap"},children:(n??"unknown").replace(/-/g," ")})}},{key:"status",header:"Status",sortable:!0,render:n=>{const e={processed:{bg:"#f0fdf4",fg:"#15803d",dot:"#22c55e"},pending:{bg:"#fffbeb",fg:"#b45309",dot:"#f59e0b"},failed:{bg:"#fef2f2",fg:"#b91c1c",dot:"#ef4444"}}[n]??{bg:"#f3f4f6",fg:"#374151",dot:"#9ca3af"};return r.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:6,padding:"3px 10px",borderRadius:12,fontSize:12,fontWeight:600,backgroundColor:e.bg,color:e.fg},children:[r.jsx("span",{style:{width:7,height:7,borderRadius:"50%",backgroundColor:e.dot,flexShrink:0}}),n]})}},{key:"fileSize",header:"Size",align:"right",sortable:!0,render:n=>{if(!n)return r.jsx("span",{children:"—"});const t=n/1024/1024,s=Math.min(t/6*100,100);return r.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:8,minWidth:120},children:[r.jsx("span",{style:{flex:1,height:6,borderRadius:3,backgroundColor:"var(--muted, #f3f4f6)",overflow:"hidden"},children:r.jsx("span",{style:{display:"block",height:"100%",width:`${s}%`,borderRadius:3,backgroundColor:s>75?"#f59e0b":"var(--primary, #3b82f6)",transition:"width 0.3s ease"}})}),r.jsxs("span",{style:{fontSize:12,fontWeight:500,fontVariantNumeric:"tabular-nums"},children:[t.toFixed(1)," MB"]})]})}},{key:"createdAt",header:"Created",sortable:!0,render:n=>{if(!n)return"—";const t=new Date(n);return r.jsxs("span",{style:{fontSize:13},children:[t.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),r.jsx("span",{style:{marginLeft:6,fontSize:12},children:t.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})})]})}}],defaultQuery:"experiment",defaultSort:{field:"createdAt",order:"desc"},pageSize:10},parameters:{zephyr:{testCaseId:"SW-T1123"}},play:async({canvasElement:n,step:t})=>{const e=i(n);await t("Search input renders",async()=>{const s=e.queryByRole("searchbox")??e.queryByRole("textbox");a(s).toBeInTheDocument()}),await t("Default placeholder is displayed",async()=>{a(e.getByPlaceholderText("Enter search term...")).toBeInTheDocument()}),await t("Search button is present",async()=>{a(e.getByRole("button",{name:/search/i})).toBeInTheDocument()}),await t("Search icon is visible in the bar",async()=>{a(e.getByRole("textbox").closest(".tdp-search__search-bar")).toBeTruthy()}),await t("Initial empty state prompts to search",async()=>{a(e.getByText("Enter a search query and click Search to get started.")).toBeInTheDocument()})}},c={render:n=>r.jsx(S,{...n,renderSearchBar:t=>r.jsx(I,{...t})}),args:{columns:T,defaultQuery:"sample",pageSize:10},parameters:{zephyr:{testCaseId:"SW-T1124"}},play:async({canvasElement:n,step:t})=>{const e=i(n);await t("Custom search input renders",async()=>{const s=e.queryByRole("searchbox")??e.queryByRole("textbox");a(s).toBeInTheDocument()}),await t("Default placeholder is displayed",async()=>{a(e.getByPlaceholderText("Enter search term...")).toBeInTheDocument()}),await t("Search button is present",async()=>{a(e.getByRole("button",{name:/search/i})).toBeInTheDocument()}),await t("Custom magnifier icon is shown",async()=>{a(e.getByText("🔍")).toBeInTheDocument()}),await t("Initial empty state prompts to search",async()=>{a(e.getByText("Enter a search query and click Search to get started.")).toBeInTheDocument()})}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    apiEndpoint: "/api/search",
    columns: [{
      key: "id",
      header: "ID",
      width: "120px"
    }, {
      key: "filePath",
      header: "File Path",
      sortable: true
    }, {
      key: "sourceType",
      header: "Source Type",
      sortable: true
    }, {
      key: "status",
      header: "Status",
      sortable: true
    }, {
      key: "fileSize",
      header: "Size",
      sortable: true
    }, {
      key: "createdAt",
      header: "Created",
      sortable: true
    }],
    defaultQuery: "sample-data",
    searchPlaceholder: "Search files..."
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1120"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Search input renders", async () => {
      const searchInput = canvas.queryByRole("searchbox") ?? canvas.queryByRole("textbox");
      expect(searchInput).toBeInTheDocument();
    });
    await step("Placeholder text is displayed", async () => {
      expect(canvas.getByPlaceholderText("Search files...")).toBeInTheDocument();
    });
    await step("Search button is present", async () => {
      expect(canvas.getByRole("button", {
        name: /search/i
      })).toBeInTheDocument();
    });
    await step("Search icon is visible in the bar", async () => {
      expect(canvas.getByRole("textbox").closest(".tdp-search__search-bar")).toBeTruthy();
    });
    await step("Initial empty state prompts to search", async () => {
      expect(canvas.getByText("Enter a search query and click Search to get started.")).toBeInTheDocument();
    });
  }
}`,...h.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    columns,
    filters,
    defaultQuery: "sample",
    defaultSort: {
      field: "createdAt",
      order: "desc"
    },
    pageSize: 15,
    onSearch: () => {}
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1121"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Search input renders", async () => {
      const searchInput = canvas.queryByRole("searchbox") ?? canvas.queryByRole("textbox");
      expect(searchInput).toBeInTheDocument();
    });
    await step("Default placeholder is displayed", async () => {
      expect(canvas.getByPlaceholderText("Enter search term...")).toBeInTheDocument();
    });
    await step("Search button is present", async () => {
      expect(canvas.getByRole("button", {
        name: /search/i
      })).toBeInTheDocument();
    });
    await step("Filter labels are displayed", async () => {
      expect(canvas.getByText("Source Type")).toBeInTheDocument();
      expect(canvas.getByText("Status")).toBeInTheDocument();
    });
    await step("Filter comboboxes render", async () => {
      expect(canvas.getAllByRole("combobox").length).toBeGreaterThanOrEqual(2);
    });
    await step("Initial empty state prompts to search", async () => {
      expect(canvas.getByText("Enter a search query and click Search to get started.")).toBeInTheDocument();
    });
  }
}`,...y.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    columns: [{
      key: "id",
      header: "ID"
    }, {
      key: "filePath",
      header: "File Path",
      sortable: true
    }, {
      key: "sourceType",
      header: "Source Type",
      sortable: true
    }, {
      key: "status",
      header: "Status",
      sortable: true
    }, {
      key: "fileSize",
      header: "Size",
      sortable: true
    }, {
      key: "createdAt",
      header: "Created",
      sortable: true
    }],
    filters,
    defaultQuery: "sample",
    pageSize: 10
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1122"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Search input renders", async () => {
      const searchInput = canvas.queryByRole("searchbox") ?? canvas.queryByRole("textbox");
      expect(searchInput).toBeInTheDocument();
    });
    await step("Default placeholder is displayed", async () => {
      expect(canvas.getByPlaceholderText("Enter search term...")).toBeInTheDocument();
    });
    await step("Search button is present", async () => {
      expect(canvas.getByRole("button", {
        name: /search/i
      })).toBeInTheDocument();
    });
    await step("Filter labels are displayed", async () => {
      expect(canvas.getByText("Source Type")).toBeInTheDocument();
      expect(canvas.getByText("Status")).toBeInTheDocument();
    });
    await step("Filter comboboxes render", async () => {
      expect(canvas.getAllByRole("combobox").length).toBe(2);
    });
    await step("Initial empty state prompts to search", async () => {
      expect(canvas.getByText("Enter a search query and click Search to get started.")).toBeInTheDocument();
    });
  }
}`,...m.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    columns: [{
      key: "id",
      header: "ID",
      width: "100px",
      render: value => <code style={{
        fontSize: 12,
        color: "var(--muted-foreground, #6b7280)",
        letterSpacing: "0.02em"
      }}>{value}</code>
    }, {
      key: "filePath",
      header: "File Path",
      sortable: true,
      render: value => <span style={{
        fontFamily: "'Fira Code', 'Source Code Pro', monospace",
        fontSize: 13,
        color: "var(--primary, #1d4ed8)",
        textDecoration: "underline",
        textDecorationColor: "var(--primary, #bfdbfe)",
        textUnderlineOffset: 2,
        cursor: "pointer"
      }}>
            {value}
          </span>
    }, {
      key: "sourceType",
      header: "Source Type",
      sortable: true,
      render: value => {
        const colorMap: Record<string, {
          bg: string;
          fg: string;
          border: string;
        }> = {
          "instrument-data": {
            bg: "var(--background)",
            fg: "var(--foreground)",
            border: "#bfdbfe"
          },
          "manual-upload": {
            bg: "var(--background)",
            fg: "var(--foreground)",
            border: "#fde68a"
          },
          "pipeline-output": {
            bg: "var(--background)",
            fg: "var(--foreground)",
            border: "#bbf7d0"
          }
        };
        const colors = colorMap[value] ?? {
          bg: "var(--background)",
          fg: "var(--foreground)",
          border: "#d1d5db"
        };
        return <span style={{
          display: "inline-block",
          padding: "3px 10px",
          borderRadius: 12,
          fontSize: 12,
          fontWeight: 600,
          backgroundColor: colors.bg,
          color: colors.fg,
          border: \`1px solid \${colors.border}\`,
          whiteSpace: "nowrap"
        }}>
              {(value ?? "unknown").replace(/-/g, " ")}
            </span>;
      }
    }, {
      key: "status",
      header: "Status",
      sortable: true,
      render: value => {
        const statusMap: Record<string, {
          bg: string;
          fg: string;
          dot: string;
        }> = {
          processed: {
            bg: "#f0fdf4",
            fg: "#15803d",
            dot: "#22c55e"
          },
          pending: {
            bg: "#fffbeb",
            fg: "#b45309",
            dot: "#f59e0b"
          },
          failed: {
            bg: "#fef2f2",
            fg: "#b91c1c",
            dot: "#ef4444"
          }
        };
        const s = statusMap[value] ?? {
          bg: "#f3f4f6",
          fg: "#374151",
          dot: "#9ca3af"
        };
        return <span style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "3px 10px",
          borderRadius: 12,
          fontSize: 12,
          fontWeight: 600,
          backgroundColor: s.bg,
          color: s.fg
        }}>
              <span style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            backgroundColor: s.dot,
            flexShrink: 0
          }} />
              {value}
            </span>;
      }
    }, {
      key: "fileSize",
      header: "Size",
      align: "right" as const,
      sortable: true,
      render: value => {
        if (!value) return <span>—</span>;
        const mb = value / 1024 / 1024;
        const maxMb = 6;
        const pct = Math.min(mb / maxMb * 100, 100);
        return <span style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          minWidth: 120
        }}>
              <span style={{
            flex: 1,
            height: 6,
            borderRadius: 3,
            backgroundColor: "var(--muted, #f3f4f6)",
            overflow: "hidden"
          }}>
                <span style={{
              display: "block",
              height: "100%",
              width: \`\${pct}%\`,
              borderRadius: 3,
              backgroundColor: pct > 75 ? "#f59e0b" : "var(--primary, #3b82f6)",
              transition: "width 0.3s ease"
            }} />
              </span>
              <span style={{
            fontSize: 12,
            fontWeight: 500,
            fontVariantNumeric: "tabular-nums"
          }}>
                {mb.toFixed(1)} MB
              </span>
            </span>;
      }
    }, {
      key: "createdAt",
      header: "Created",
      sortable: true,
      render: value => {
        if (!value) return "—";
        const d = new Date(value);
        return <span style={{
          fontSize: 13
        }}>
              {d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
          })}
              <span style={{
            marginLeft: 6,
            fontSize: 12
          }}>
                {d.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit"
            })}
              </span>
            </span>;
      }
    }] as TdpSearchColumn[],
    defaultQuery: "experiment",
    defaultSort: {
      field: "createdAt",
      order: "desc"
    },
    pageSize: 10
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1123"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Search input renders", async () => {
      const searchInput = canvas.queryByRole("searchbox") ?? canvas.queryByRole("textbox");
      expect(searchInput).toBeInTheDocument();
    });
    await step("Default placeholder is displayed", async () => {
      expect(canvas.getByPlaceholderText("Enter search term...")).toBeInTheDocument();
    });
    await step("Search button is present", async () => {
      expect(canvas.getByRole("button", {
        name: /search/i
      })).toBeInTheDocument();
    });
    await step("Search icon is visible in the bar", async () => {
      expect(canvas.getByRole("textbox").closest(".tdp-search__search-bar")).toBeTruthy();
    });
    await step("Initial empty state prompts to search", async () => {
      expect(canvas.getByText("Enter a search query and click Search to get started.")).toBeInTheDocument();
    });
  }
}`,...o.parameters?.docs?.source},description:{story:"Demonstrates per-column custom renderers: colored status badges, source-type pills, monospace file paths, and human-readable sizes/dates.",...o.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: args => <TdpSearch {...args} renderSearchBar={props => <DemoSearchBar {...props} />} />,
  args: {
    columns,
    defaultQuery: "sample",
    pageSize: 10
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1124"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Custom search input renders", async () => {
      const searchInput = canvas.queryByRole("searchbox") ?? canvas.queryByRole("textbox");
      expect(searchInput).toBeInTheDocument();
    });
    await step("Default placeholder is displayed", async () => {
      expect(canvas.getByPlaceholderText("Enter search term...")).toBeInTheDocument();
    });
    await step("Search button is present", async () => {
      expect(canvas.getByRole("button", {
        name: /search/i
      })).toBeInTheDocument();
    });
    await step("Custom magnifier icon is shown", async () => {
      expect(canvas.getByText("🔍")).toBeInTheDocument();
    });
    await step("Initial empty state prompts to search", async () => {
      expect(canvas.getByText("Enter a search query and click Search to get started.")).toBeInTheDocument();
    });
  }
}`,...c.parameters?.docs?.source},description:{story:"Custom search bar via renderSearchBar — TdpSearch manages all state; only the input UI is swapped.",...c.parameters?.docs?.description}}};const H=["BasicUsage","FullFeatured","WithFilters","CustomRendering","CustomSearchBar"];export{h as BasicUsage,o as CustomRendering,c as CustomSearchBar,y as FullFeatured,m as WithFilters,H as __namedExportsOrder,V as default};
