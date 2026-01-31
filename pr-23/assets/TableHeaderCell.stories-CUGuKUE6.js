import{j as e}from"./jsx-runtime-CDt2p4po.js";import{r as s}from"./index-GiUgBvb1.js";import{T as l}from"./TableHeaderCell-BerGVyBi.js";import"./styled-components.browser.esm-Ctfm6iBV.js";import"./Dropdown-B2J4SVee.js";import"./Icon-CuK57VyF.js";const M={title:"Atoms/TableHeaderCell",component:l,parameters:{layout:"padded"},tags:["autodocs"],argTypes:{sortDirection:{control:{type:"select"},options:[null,"asc","desc"]}}},o={render:t=>e.jsx("table",{style:{borderCollapse:"collapse",width:"100%"},children:e.jsx("thead",{children:e.jsx("tr",{children:e.jsx(l,{...t,children:"Header"})})})}),args:{children:"Header"}},i={render:()=>{const[t,r]=s.useState(null),n=()=>{r(t===null?"asc":t==="asc"?"desc":null)};return e.jsx("table",{style:{borderCollapse:"collapse",width:"100%"},children:e.jsx("thead",{children:e.jsx("tr",{children:e.jsx(l,{sortable:!0,sortDirection:t,onSort:n,children:"Sortable Header (Click me!)"})})})})}},d={render:()=>{const[t,r]=s.useState("");return e.jsx("table",{style:{borderCollapse:"collapse",width:"100%"},children:e.jsx("thead",{children:e.jsx("tr",{children:e.jsx(l,{filterable:!0,filterOptions:[{value:"option1",label:"Option 1"},{value:"option2",label:"Option 2"},{value:"option3",label:"Option 3"}],filterValue:t,onFilterChange:r,width:"200px"})})})})}},c={render:()=>{const[t,r]=s.useState(null),[n,a]=s.useState(null),p=b=>{t===b?n==="asc"?a("desc"):n==="desc"?(r(null),a(null)):a("asc"):(r(b),a("asc"))};return e.jsx("table",{style:{borderCollapse:"collapse",width:"100%"},children:e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx(l,{width:"80px"}),e.jsx(l,{children:"Name"}),e.jsx(l,{children:"Status"}),e.jsx(l,{sortable:!0,sortDirection:t==="date"?n:null,onSort:()=>p("date"),children:"Date"}),e.jsx(l,{sortable:!0,sortDirection:t==="count"?n:null,onSort:()=>p("count"),children:"Count"}),e.jsx(l,{children:"Description"}),e.jsx(l,{children:"Actions"})]})})})}},u={render:()=>{const[t,r]=s.useState(""),[n,a]=s.useState("");return e.jsx("table",{style:{borderCollapse:"collapse",width:"100%"},children:e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx(l,{width:"80px"}),e.jsx(l,{filterable:!0,filterOptions:[{value:"all",label:"All"},{value:"active",label:"Active"},{value:"inactive",label:"Inactive"}],filterValue:t,onFilterChange:r}),e.jsx(l,{filterable:!0,filterOptions:[{value:"all",label:"All Types"},{value:"type1",label:"Type 1"},{value:"type2",label:"Type 2"}],filterValue:n,onFilterChange:a}),e.jsx(l,{children:"Label"}),e.jsx(l,{children:"Label"}),e.jsx(l,{children:"Label"})]})})})}};var h,S,C;o.parameters={...o.parameters,docs:{...(h=o.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: args => <table style={{
    borderCollapse: "collapse",
    width: "100%"
  }}>
      <thead>
        <tr>
          <TableHeaderCell {...args}>Header</TableHeaderCell>
        </tr>
      </thead>
    </table>,
  args: {
    children: "Header"
  }
}`,...(C=(S=o.parameters)==null?void 0:S.docs)==null?void 0:C.source}}};var x,f,m;i.parameters={...i.parameters,docs:{...(x=i.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => {
    const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
    const handleSort = () => {
      if (sortDirection === null) {
        setSortDirection("asc");
      } else if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortDirection(null);
      }
    };
    return <table style={{
      borderCollapse: "collapse",
      width: "100%"
    }}>
        <thead>
          <tr>
            <TableHeaderCell sortable sortDirection={sortDirection} onSort={handleSort}>
              Sortable Header (Click me!)
            </TableHeaderCell>
          </tr>
        </thead>
      </table>;
  }
}`,...(m=(f=i.parameters)==null?void 0:f.docs)==null?void 0:m.source}}};var H,D,T;d.parameters={...d.parameters,docs:{...(H=d.parameters)==null?void 0:H.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState("");
    return <table style={{
      borderCollapse: "collapse",
      width: "100%"
    }}>
        <thead>
          <tr>
            <TableHeaderCell filterable filterOptions={[{
            value: "option1",
            label: "Option 1"
          }, {
            value: "option2",
            label: "Option 2"
          }, {
            value: "option3",
            label: "Option 3"
          }]} filterValue={value} onFilterChange={setValue} width="200px" />
          </tr>
        </thead>
      </table>;
  }
}`,...(T=(D=d.parameters)==null?void 0:D.docs)==null?void 0:T.source}}};var y,j,v;c.parameters={...c.parameters,docs:{...(y=c.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: () => {
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
    const handleSort = (key: string) => {
      if (sortKey === key) {
        if (sortDirection === "asc") {
          setSortDirection("desc");
        } else if (sortDirection === "desc") {
          setSortKey(null);
          setSortDirection(null);
        } else {
          setSortDirection("asc");
        }
      } else {
        setSortKey(key);
        setSortDirection("asc");
      }
    };
    return <table style={{
      borderCollapse: "collapse",
      width: "100%"
    }}>
        <thead>
          <tr>
            <TableHeaderCell width="80px" />
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell sortable sortDirection={sortKey === "date" ? sortDirection : null} onSort={() => handleSort("date")}>
              Date
            </TableHeaderCell>
            <TableHeaderCell sortable sortDirection={sortKey === "count" ? sortDirection : null} onSort={() => handleSort("count")}>
              Count
            </TableHeaderCell>
            <TableHeaderCell>Description</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </tr>
        </thead>
      </table>;
  }
}`,...(v=(j=c.parameters)==null?void 0:j.docs)==null?void 0:v.source}}};var w,g,O;u.parameters={...u.parameters,docs:{...(w=u.parameters)==null?void 0:w.docs,source:{originalSource:`{
  render: () => {
    const [filter1, setFilter1] = useState("");
    const [filter2, setFilter2] = useState("");
    return <table style={{
      borderCollapse: "collapse",
      width: "100%"
    }}>
        <thead>
          <tr>
            <TableHeaderCell width="80px" />
            <TableHeaderCell filterable filterOptions={[{
            value: "all",
            label: "All"
          }, {
            value: "active",
            label: "Active"
          }, {
            value: "inactive",
            label: "Inactive"
          }]} filterValue={filter1} onFilterChange={setFilter1} />
            <TableHeaderCell filterable filterOptions={[{
            value: "all",
            label: "All Types"
          }, {
            value: "type1",
            label: "Type 1"
          }, {
            value: "type2",
            label: "Type 2"
          }]} filterValue={filter2} onFilterChange={setFilter2} />
            <TableHeaderCell>Label</TableHeaderCell>
            <TableHeaderCell>Label</TableHeaderCell>
            <TableHeaderCell>Label</TableHeaderCell>
          </tr>
        </thead>
      </table>;
  }
}`,...(O=(g=u.parameters)==null?void 0:g.docs)==null?void 0:O.source}}};const W=["Default","Sortable","WithDropdown","MultipleHeaders","MixedHeadersWithDropdowns"];export{o as Default,u as MixedHeadersWithDropdowns,c as MultipleHeaders,i as Sortable,d as WithDropdown,W as __namedExportsOrder,M as default};
