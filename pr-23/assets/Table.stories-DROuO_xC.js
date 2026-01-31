import{j as t}from"./jsx-runtime-CDt2p4po.js";import{r as i}from"./index-GiUgBvb1.js";import{a as v}from"./styled-components.browser.esm-Ctfm6iBV.js";import{T as Pe}from"./TableCell-D_umdoex.js";import{T as Ie}from"./TableHeaderCell-BerGVyBi.js";import{C as X}from"./Checkbox-DJ5m03ZR.js";import"./Dropdown-B2J4SVee.js";import"./Icon-CuK57VyF.js";const Oe=v.div`
  width: 100%;
  border: 1px solid var(--grey-200);
  border-radius: 8px;
  overflow: visible;
  background-color: var(--white-900);
`,Ee=v.table`
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
`,He=v.tbody``,_e=v.tr`
  cursor: ${a=>a.$selectable?"pointer":"default"};

  &:hover {
    background-color: ${a=>a.$selectable?"var(--grey-50)":"transparent"};
  }
`,Ge=v(Pe)`
  width: 40px;
  padding: 10px 12px;
`,Je=v(Ie)`
  width: 40px;
  padding: 8px 12px;
`,Qe=v.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 10px 12px;
  height: 40px;
  background-color: var(--grey-50);
  border-top: 1px solid var(--grey-200);
`,Y=v.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid var(--grey-300);
  border-radius: 6px;
  background-color: var(--white-900);
  cursor: ${a=>a.disabled?"not-allowed":"pointer"};
  opacity: ${a=>a.disabled?.5:1};

  &:hover:not(:disabled) {
    background-color: var(--grey-50);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`,Ue=v.div`
  display: flex;
  align-items: center;
  gap: 0;
`,Xe=v.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background-color: ${a=>a.$active?"var(--grey-100)":"transparent"};
  font-family: "Inter", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 13px;
  font-weight: 500;
  line-height: 18px;
  color: var(--grey-600);
  cursor: pointer;

  &:hover:not(:disabled) {
    background-color: var(--grey-100);
  }
`;function m({columns:a,data:r,pageSize:o=10,rowKey:h,selectable:p=!1,onRowSelect:l,sortKey:c,sortDirection:R,onSort:T,currentPage:x,onPageChange:w,selectedRows:_,className:Ke}){const[Ne,G]=i.useState(null),[Be,F]=i.useState(null),[Ve,J]=i.useState(1),[$e,Q]=i.useState([]),[C,ze]=i.useState({}),W=c!==void 0,D=x!==void 0,q=_!==void 0,b=W?c:Ne,S=W?R:Be,g=D?x:Ve,M=q?_:$e,L=i.useMemo(()=>{let e=[...r];return Object.entries(C).forEach(([s,n])=>{n&&(e=e.filter(u=>{const d=u[s];return(d==null?void 0:d.toString())===n}))}),e},[r,C]),f=i.useMemo(()=>!b||!S?L:[...L].sort((e,s)=>{const n=e[b],u=s[b];if(n===u)return 0;let d=0;return typeof n=="number"&&typeof u=="number"?d=n-u:d=String(n).localeCompare(String(u)),S==="asc"?d:-d}),[L,b,S]),k=o===-1?1:Math.ceil(f.length/o),Re=i.useMemo(()=>{if(o===-1)return f;const e=(g-1)*o;return f.slice(e,e+o)},[f,g,o]);i.useEffect(()=>{D||J(1)},[C,b,S,D]);const Fe=e=>{W&&T?T(e,b===e&&S==="asc"?"desc":"asc"):b===e?S==="asc"?F("desc"):(G(null),F(null)):(G(e),F("asc"))},O=e=>{D&&w?w(e):J(e)},We=e=>{const s=e?[...f]:[];q&&l?l(s):(Q(s),l==null||l(s))},E=(e,s)=>h?typeof h=="function"?h(e):e[h]:s,U=(e,s)=>{let n;s?n=[...M,e]:n=M.filter(u=>u!==e),q&&l?l(n):(Q(n),l==null||l(n))},H=e=>M.some(s=>E(s,0)===E(e,0)),qe=f.length>0&&f.every(e=>H(e)),Me=(e,s)=>{ze(n=>({...n,[e]:s}))},Le=()=>{const e=[];if(k<=5)for(let n=1;n<=k;n++)e.push(n);else{e.push(1),g>3&&e.push("...");const n=Math.max(2,g-1),u=Math.min(k-1,g+1);for(let d=n;d<=u;d++)e.push(d);g<k-2&&e.push("..."),e.push(k)}return e};return t.jsxs(Oe,{className:Ke,children:[t.jsxs(Ee,{children:[t.jsx("thead",{children:t.jsxs("tr",{children:[p&&t.jsx(Je,{children:t.jsx(X,{checked:qe,onChange:We,noPadding:!0})}),a.map(e=>t.jsx(Ie,{width:e.width,sortable:e.sortable,sortDirection:b===e.key&&S||null,onSort:e.sortable?()=>Fe(e.key):void 0,filterable:e.filterable,filterOptions:e.filterOptions,filterValue:C[e.key]||"",onFilterChange:e.filterable?s=>Me(e.key,s):void 0,children:e.header},e.key))]})}),t.jsx(He,{children:Re.map((e,s)=>t.jsxs(_e,{$selectable:p,onClick:p?()=>U(e,!H(e)):void 0,children:[p&&t.jsx(Ge,{children:t.jsx(X,{checked:H(e),onChange:n=>U(e,n),noPadding:!0,onClick:n=>n.stopPropagation()})}),a.map(n=>{const u=e[n.key],d=n.render?n.render(u,e,s):u;return t.jsx(Pe,{align:n.align,children:d},n.key)})]},E(e,s)))})]}),o!==-1&&k>1&&t.jsxs(Qe,{children:[t.jsx(Y,{disabled:g===1,onClick:()=>O(g-1),"aria-label":"Previous page",children:t.jsx("svg",{viewBox:"0 0 20 20",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:t.jsx("path",{d:"M12.5 15L7.5 10L12.5 5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}),t.jsx(Ue,{children:Le().map((e,s)=>t.jsx(Xe,{$active:e===g,onClick:typeof e=="number"?()=>O(e):void 0,disabled:typeof e!="number",children:e},s))}),t.jsx(Y,{disabled:g===k,onClick:()=>O(g+1),"aria-label":"Next page",children:t.jsx("svg",{viewBox:"0 0 20 20",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:t.jsx("path",{d:"M7.5 15L12.5 10L7.5 5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})})]})]})}m.displayName="Table";m.__docgenInfo={description:"",methods:[],displayName:"Table",props:{columns:{required:!0,tsType:{name:"Array",elements:[{name:"TableColumn",elements:[{name:"T"}],raw:"TableColumn<T>"}],raw:"TableColumn<T>[]"},description:""},data:{required:!0,tsType:{name:"Array",elements:[{name:"T"}],raw:"T[]"},description:""},pageSize:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"10",computed:!1}},rowKey:{required:!1,tsType:{name:"union",raw:"keyof T | ((row: T) => string | number)",elements:[{name:"T"},{name:"unknown"}]},description:""},selectable:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},onRowSelect:{required:!1,tsType:{name:"signature",type:"function",raw:"(selectedRows: T[]) => void",signature:{arguments:[{type:{name:"Array",elements:[{name:"T"}],raw:"T[]"},name:"selectedRows"}],return:{name:"void"}}},description:""},sortKey:{required:!1,tsType:{name:"string"},description:""},sortDirection:{required:!1,tsType:{name:"union",raw:'"asc" | "desc"',elements:[{name:"literal",value:'"asc"'},{name:"literal",value:'"desc"'}]},description:""},onSort:{required:!1,tsType:{name:"signature",type:"function",raw:'(key: string, direction: "asc" | "desc") => void',signature:{arguments:[{type:{name:"string"},name:"key"},{type:{name:"union",raw:'"asc" | "desc"',elements:[{name:"literal",value:'"asc"'},{name:"literal",value:'"desc"'}]},name:"direction"}],return:{name:"void"}}},description:""},currentPage:{required:!1,tsType:{name:"number"},description:""},onPageChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(page: number) => void",signature:{arguments:[{type:{name:"number"},name:"page"}],return:{name:"void"}}},description:""},selectedRows:{required:!1,tsType:{name:"Array",elements:[{name:"T"}],raw:"T[]"},description:""},className:{required:!1,tsType:{name:"string"},description:""}}};const ot={title:"Molecules/Table",component:m,parameters:{layout:"padded"},tags:["autodocs"]},y=[{id:1,name:"Item 1",status:"Active",category:"Type A",value:100,date:"2024-01-15"},{id:2,name:"Item 2",status:"Inactive",category:"Type B",value:250,date:"2024-02-20"},{id:3,name:"Item 3",status:"Active",category:"Type A",value:75,date:"2024-01-30"},{id:4,name:"Item 4",status:"Pending",category:"Type C",value:180,date:"2024-03-10"},{id:5,name:"Item 5",status:"Active",category:"Type B",value:320,date:"2024-02-05"},{id:6,name:"Item 6",status:"Inactive",category:"Type A",value:95,date:"2024-01-25"},{id:7,name:"Item 7",status:"Active",category:"Type C",value:210,date:"2024-03-15"},{id:8,name:"Item 8",status:"Pending",category:"Type B",value:140,date:"2024-02-12"},{id:9,name:"Item 9",status:"Active",category:"Type A",value:290,date:"2024-01-18"},{id:10,name:"Item 10",status:"Inactive",category:"Type C",value:165,date:"2024-03-05"},{id:11,name:"Item 11",status:"Active",category:"Type B",value:125,date:"2024-02-28"},{id:12,name:"Item 12",status:"Pending",category:"Type A",value:310,date:"2024-01-22"},{id:13,name:"Item 13",status:"Active",category:"Type C",value:85,date:"2024-03-20"},{id:14,name:"Item 14",status:"Inactive",category:"Type B",value:240,date:"2024-02-15"},{id:15,name:"Item 15",status:"Active",category:"Type A",value:195,date:"2024-01-28"}],Ye=[{key:"name",header:"Name"},{key:"status",header:"Status"},{key:"value",header:"Value",align:"right"}],j={args:{columns:Ye,data:y.slice(0,5),pageSize:-1,rowKey:a=>a.id}},A={render:()=>{const a=[{key:"name",header:"Name",sortable:!0},{key:"status",header:"Status",sortable:!0},{key:"value",header:"Value",align:"right",sortable:!0},{key:"date",header:"Date",sortable:!0}];return t.jsx(m,{columns:a,data:y,pageSize:-1})}},P={render:()=>{const a=[{key:"name",header:"Name"},{key:"status",header:"Status",filterable:!0,filterOptions:[{value:"",label:"All"},{value:"Active",label:"Active"},{value:"Inactive",label:"Inactive"},{value:"Pending",label:"Pending"}]},{key:"category",header:"Category",filterable:!0,filterOptions:[{value:"",label:"All Categories"},{value:"Type A",label:"Type A"},{value:"Type B",label:"Type B"},{value:"Type C",label:"Type C"}]},{key:"value",header:"Value",align:"right"}];return t.jsx(m,{columns:a,data:y,pageSize:-1,rowKey:r=>r.id})}},I={render:()=>{const[a,r]=i.useState([]),o=y.slice(0,8),h=l=>{r(l),l.length===o.length&&alert(`${l.length} items selected`)},p=[{key:"name",header:"Name"},{key:"status",header:"Status"},{key:"value",header:"Value",align:"right"}];return t.jsxs("div",{children:[t.jsxs("div",{style:{marginBottom:"16px"},children:["Selected: ",a.length," row(s)"]}),t.jsx(m,{columns:p,data:o,rowKey:l=>l.id,selectable:!0,onRowSelect:h,pageSize:-1})]})}},K={render:()=>{const a=[{key:"name",header:"Name"},{key:"status",header:"Status"},{key:"value",header:"Value",align:"right"},{key:"date",header:"Date"}];return t.jsx(m,{columns:a,data:y,pageSize:5,rowKey:r=>r.id})}},N={render:()=>{const[a,r]=i.useState([]),o=5,h=Math.ceil(y.length/o),p=c=>{r(c),c.length===y.length&&alert(`${c.length} items selected, across ${h} pages`)},l=[{key:"id",header:"ID",width:"80px",sortable:!0},{key:"name",header:"Name",sortable:!0},{key:"status",header:"Status",sortable:!0,filterable:!0,filterOptions:[{value:"",label:"All"},{value:"Active",label:"Active"},{value:"Inactive",label:"Inactive"},{value:"Pending",label:"Pending"}]},{key:"category",header:"Category",filterable:!0,filterOptions:[{value:"",label:"All"},{value:"Type A",label:"Type A"},{value:"Type B",label:"Type B"},{value:"Type C",label:"Type C"}]},{key:"value",header:"Value",align:"right",sortable:!0,render:c=>`$${c.toLocaleString()}`},{key:"date",header:"Date",sortable:!0}];return t.jsxs("div",{children:[t.jsxs("div",{style:{marginBottom:"16px",fontFamily:"Inter"},children:[t.jsx("strong",{children:"Selected:"})," ",a.length," row(s)"]}),t.jsx(m,{columns:l,data:y,rowKey:c=>c.id,selectable:!0,onRowSelect:p,pageSize:o})]})}},B={render:()=>{const[a,r]=i.useState("name"),[o,h]=i.useState("asc"),[p,l]=i.useState(1),[c,R]=i.useState([]),T=[{key:"name",header:"Name",sortable:!0},{key:"status",header:"Status",sortable:!0},{key:"value",header:"Value",align:"right",sortable:!0},{key:"date",header:"Date",sortable:!0}];return t.jsxs("div",{children:[t.jsxs("div",{style:{marginBottom:"16px",fontFamily:"Inter",display:"flex",gap:"16px"},children:[t.jsxs("div",{children:[t.jsx("strong",{children:"Sort:"})," ",a," (",o,")"]}),t.jsxs("div",{children:[t.jsx("strong",{children:"Page:"})," ",p]}),t.jsxs("div",{children:[t.jsx("strong",{children:"Selected:"})," ",c.length]})]}),t.jsx(m,{columns:T,data:y,rowKey:x=>x.id,selectable:!0,sortKey:a,sortDirection:o,onSort:(x,w)=>{r(x),h(w)},currentPage:p,onPageChange:l,selectedRows:c,onRowSelect:R,pageSize:5})]})}},V={render:()=>{const a=[{key:"name",header:"Name"},{key:"status",header:"Status",render:r=>t.jsx("span",{style:{padding:"4px 8px",borderRadius:"4px",backgroundColor:r==="Active"?"var(--green-bg)":r==="Inactive"?"var(--red-bg)":"var(--orange-bg)",color:r==="Active"?"var(--green-success)":r==="Inactive"?"var(--red-error)":"var(--orange-caution)",fontWeight:500,fontSize:"12px"},children:r})},{key:"value",header:"Value",align:"right",sortable:!0,render:r=>t.jsxs("span",{style:{fontWeight:600},children:["$",r.toLocaleString()]})}];return t.jsx(m,{columns:a,data:y,pageSize:8,rowKey:r=>r.id})}},$={render:()=>{const a=[{key:"id",header:"ID",width:"80px"},{key:"name",header:"Name"},{key:"status",header:"Status"},{key:"value",header:"Value",align:"right"}];return t.jsx(m,{columns:a,data:y,pageSize:-1,rowKey:r=>r.id})}},z={render:()=>{const a=[{key:"name",header:"Name"},{key:"status",header:"Status"},{key:"value",header:"Value"}];return t.jsx(m,{columns:a,data:[],pageSize:10,rowKey:r=>r.id})}};var Z,ee,te;j.parameters={...j.parameters,docs:{...(Z=j.parameters)==null?void 0:Z.docs,source:{originalSource:`{
  args: {
    columns: basicColumns,
    data: sampleData.slice(0, 5),
    pageSize: -1,
    rowKey: (row: SampleData) => row.id
  }
}`,...(te=(ee=j.parameters)==null?void 0:ee.docs)==null?void 0:te.source}}};var ae,ne,re;A.parameters={...A.parameters,docs:{...(ae=A.parameters)==null?void 0:ae.docs,source:{originalSource:`{
  render: () => {
    const columns: TableColumn<SampleData>[] = [{
      key: "name",
      header: "Name",
      sortable: true
    }, {
      key: "status",
      header: "Status",
      sortable: true
    }, {
      key: "value",
      header: "Value",
      align: "right",
      sortable: true
    }, {
      key: "date",
      header: "Date",
      sortable: true
    }];
    return <Table columns={columns} data={sampleData} pageSize={-1} />;
  }
}`,...(re=(ne=A.parameters)==null?void 0:ne.docs)==null?void 0:re.source}}};var se,le,oe;P.parameters={...P.parameters,docs:{...(se=P.parameters)==null?void 0:se.docs,source:{originalSource:`{
  render: () => {
    const columns: TableColumn<SampleData>[] = [{
      key: "name",
      header: "Name"
    }, {
      key: "status",
      header: "Status",
      filterable: true,
      filterOptions: [{
        value: "",
        label: "All"
      }, {
        value: "Active",
        label: "Active"
      }, {
        value: "Inactive",
        label: "Inactive"
      }, {
        value: "Pending",
        label: "Pending"
      }]
    }, {
      key: "category",
      header: "Category",
      filterable: true,
      filterOptions: [{
        value: "",
        label: "All Categories"
      }, {
        value: "Type A",
        label: "Type A"
      }, {
        value: "Type B",
        label: "Type B"
      }, {
        value: "Type C",
        label: "Type C"
      }]
    }, {
      key: "value",
      header: "Value",
      align: "right"
    }];
    return <Table columns={columns} data={sampleData} pageSize={-1} rowKey={row => row.id} />;
  }
}`,...(oe=(le=P.parameters)==null?void 0:le.docs)==null?void 0:oe.source}}};var ie,de,ce;I.parameters={...I.parameters,docs:{...(ie=I.parameters)==null?void 0:ie.docs,source:{originalSource:`{
  render: () => {
    const [selected, setSelected] = useState<SampleData[]>([]);
    const dataSubset = sampleData.slice(0, 8);
    const handleRowSelect = (rows: SampleData[]) => {
      setSelected(rows);
      if (rows.length === dataSubset.length) {
        alert(\`\${rows.length} items selected\`);
      }
    };
    const columns: TableColumn<SampleData>[] = [{
      key: "name",
      header: "Name"
    }, {
      key: "status",
      header: "Status"
    }, {
      key: "value",
      header: "Value",
      align: "right"
    }];
    return <div>
        <div style={{
        marginBottom: "16px"
      }}>
          Selected: {selected.length} row(s)
        </div>
        <Table columns={columns} data={dataSubset} rowKey={row => row.id} selectable onRowSelect={handleRowSelect} pageSize={-1} />
      </div>;
  }
}`,...(ce=(de=I.parameters)==null?void 0:de.docs)==null?void 0:ce.source}}};var ue,me,pe;K.parameters={...K.parameters,docs:{...(ue=K.parameters)==null?void 0:ue.docs,source:{originalSource:`{
  render: () => {
    const columns: TableColumn<SampleData>[] = [{
      key: "name",
      header: "Name"
    }, {
      key: "status",
      header: "Status"
    }, {
      key: "value",
      header: "Value",
      align: "right"
    }, {
      key: "date",
      header: "Date"
    }];
    return <Table columns={columns} data={sampleData} pageSize={5} rowKey={row => row.id} />;
  }
}`,...(pe=(me=K.parameters)==null?void 0:me.docs)==null?void 0:pe.source}}};var ge,ye,he;N.parameters={...N.parameters,docs:{...(ge=N.parameters)==null?void 0:ge.docs,source:{originalSource:`{
  render: () => {
    const [selected, setSelected] = useState<SampleData[]>([]);
    const pageSize = 5;
    const totalPages = Math.ceil(sampleData.length / pageSize);
    const handleRowSelect = (rows: SampleData[]) => {
      setSelected(rows);
      if (rows.length === sampleData.length) {
        alert(\`\${rows.length} items selected, across \${totalPages} pages\`);
      }
    };
    const columns: TableColumn<SampleData>[] = [{
      key: "id",
      header: "ID",
      width: "80px",
      sortable: true
    }, {
      key: "name",
      header: "Name",
      sortable: true
    }, {
      key: "status",
      header: "Status",
      sortable: true,
      filterable: true,
      filterOptions: [{
        value: "",
        label: "All"
      }, {
        value: "Active",
        label: "Active"
      }, {
        value: "Inactive",
        label: "Inactive"
      }, {
        value: "Pending",
        label: "Pending"
      }]
    }, {
      key: "category",
      header: "Category",
      filterable: true,
      filterOptions: [{
        value: "",
        label: "All"
      }, {
        value: "Type A",
        label: "Type A"
      }, {
        value: "Type B",
        label: "Type B"
      }, {
        value: "Type C",
        label: "Type C"
      }]
    }, {
      key: "value",
      header: "Value",
      align: "right",
      sortable: true,
      render: value => \`$\${value.toLocaleString()}\`
    }, {
      key: "date",
      header: "Date",
      sortable: true
    }];
    return <div>
        <div style={{
        marginBottom: "16px",
        fontFamily: "Inter"
      }}>
          <strong>Selected:</strong> {selected.length} row(s)
        </div>
        <Table columns={columns} data={sampleData} rowKey={row => row.id} selectable onRowSelect={handleRowSelect} pageSize={pageSize} />
      </div>;
  }
}`,...(he=(ye=N.parameters)==null?void 0:ye.docs)==null?void 0:he.source}}};var ve,be,Se;B.parameters={...B.parameters,docs:{...(ve=B.parameters)==null?void 0:ve.docs,source:{originalSource:`{
  render: () => {
    const [sortKey, setSortKey] = useState<string>("name");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [selected, setSelected] = useState<SampleData[]>([]);
    const columns: TableColumn<SampleData>[] = [{
      key: "name",
      header: "Name",
      sortable: true
    }, {
      key: "status",
      header: "Status",
      sortable: true
    }, {
      key: "value",
      header: "Value",
      align: "right",
      sortable: true
    }, {
      key: "date",
      header: "Date",
      sortable: true
    }];
    return <div>
        <div style={{
        marginBottom: "16px",
        fontFamily: "Inter",
        display: "flex",
        gap: "16px"
      }}>
          <div>
            <strong>Sort:</strong> {sortKey} ({sortDirection})
          </div>
          <div>
            <strong>Page:</strong> {currentPage}
          </div>
          <div>
            <strong>Selected:</strong> {selected.length}
          </div>
        </div>
        <Table columns={columns} data={sampleData} rowKey={row => row.id} selectable sortKey={sortKey} sortDirection={sortDirection} onSort={(key, direction) => {
        setSortKey(key);
        setSortDirection(direction);
      }} currentPage={currentPage} onPageChange={setCurrentPage} selectedRows={selected} onRowSelect={setSelected} pageSize={5} />
      </div>;
  }
}`,...(Se=(be=B.parameters)==null?void 0:be.docs)==null?void 0:Se.source}}};var fe,ke,xe;V.parameters={...V.parameters,docs:{...(fe=V.parameters)==null?void 0:fe.docs,source:{originalSource:`{
  render: () => {
    const columns: TableColumn<SampleData>[] = [{
      key: "name",
      header: "Name"
    }, {
      key: "status",
      header: "Status",
      render: value => <span style={{
        padding: "4px 8px",
        borderRadius: "4px",
        backgroundColor: value === "Active" ? "var(--green-bg)" : value === "Inactive" ? "var(--red-bg)" : "var(--orange-bg)",
        color: value === "Active" ? "var(--green-success)" : value === "Inactive" ? "var(--red-error)" : "var(--orange-caution)",
        fontWeight: 500,
        fontSize: "12px"
      }}>
            {value}
          </span>
    }, {
      key: "value",
      header: "Value",
      align: "right",
      sortable: true,
      render: value => <span style={{
        fontWeight: 600
      }}>
            \${value.toLocaleString()}
          </span>
    }];
    return <Table columns={columns} data={sampleData} pageSize={8} rowKey={row => row.id} />;
  }
}`,...(xe=(ke=V.parameters)==null?void 0:ke.docs)==null?void 0:xe.source}}};var Te,we,Ce;$.parameters={...$.parameters,docs:{...(Te=$.parameters)==null?void 0:Te.docs,source:{originalSource:`{
  render: () => {
    const columns: TableColumn<SampleData>[] = [{
      key: "id",
      header: "ID",
      width: "80px"
    }, {
      key: "name",
      header: "Name"
    }, {
      key: "status",
      header: "Status"
    }, {
      key: "value",
      header: "Value",
      align: "right"
    }];
    return <Table columns={columns} data={sampleData} pageSize={-1} rowKey={row => row.id} />;
  }
}`,...(Ce=(we=$.parameters)==null?void 0:we.docs)==null?void 0:Ce.source}}};var De,je,Ae;z.parameters={...z.parameters,docs:{...(De=z.parameters)==null?void 0:De.docs,source:{originalSource:`{
  render: () => {
    const columns: TableColumn<SampleData>[] = [{
      key: "name",
      header: "Name"
    }, {
      key: "status",
      header: "Status"
    }, {
      key: "value",
      header: "Value"
    }];
    return <Table columns={columns} data={[]} pageSize={10} rowKey={row => row.id} />;
  }
}`,...(Ae=(je=z.parameters)==null?void 0:je.docs)==null?void 0:Ae.source}}};const it=["Basic","WithSorting","WithFiltering","WithSelection","WithPagination","FullyFeatured","ControlledMode","CustomCellRendering","NoPagination","EmptyState"];export{j as Basic,B as ControlledMode,V as CustomCellRendering,z as EmptyState,N as FullyFeatured,$ as NoPagination,P as WithFiltering,K as WithPagination,I as WithSelection,A as WithSorting,it as __namedExportsOrder,ot as default};
