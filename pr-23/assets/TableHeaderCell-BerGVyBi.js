import{j as e}from"./jsx-runtime-CDt2p4po.js";import{r as h}from"./index-GiUgBvb1.js";import{a}from"./styled-components.browser.esm-Ctfm6iBV.js";import{D as v}from"./Dropdown-B2J4SVee.js";const p=a.th`
  background-color: var(--grey-50);
  border-right: 1px solid var(--grey-200);
  border-bottom: 1px solid var(--grey-200);
  padding: 8px 12px;
  height: 35px;
  box-sizing: border-box;
  width: ${r=>r.width||"auto"};

  &:last-child {
    border-right: 1px solid var(--grey-200);
  }
`,y=a.div`
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: ${r=>r.$clickable?"pointer":"default"};
  user-select: none;
`,w=a.span`
  font-family: "Inter", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 13px;
  font-weight: 600;
  line-height: 18px;
  color: var(--grey-900);
  white-space: nowrap;
  flex-shrink: 0;
`,b=a.svg`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
`,T=a.div`
  padding: 10px 4px;
  height: 35px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: flex-start;

  & > div {
    height: 32px;
  }

  li {
    text-align: left;
  }
`,c=h.forwardRef(({children:r,sortable:t=!1,sortDirection:i=null,onSort:l,filterable:u=!1,filterOptions:f=[],filterValue:m,onFilterChange:g,width:n,className:s,...o},d)=>{const x=()=>{t&&l&&l()};return u?e.jsx(p,{ref:d,width:n,className:s,...o,children:e.jsx(T,{children:e.jsx(v,{options:f,value:m,onChange:g,placeholder:"Placeholder",size:"small",width:"100%"})})}):e.jsx(p,{ref:d,width:n,className:s,...o,children:e.jsxs(y,{$clickable:t,onClick:x,children:[e.jsx(w,{children:r}),t&&e.jsxs(b,{viewBox:"0 0 16 16",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:[e.jsx("path",{d:"M8 3.33337L10.6667 6.00004H5.33333L8 3.33337Z",fill:i==="asc"?"var(--grey-900)":"var(--grey-400)"}),e.jsx("path",{d:"M8 12.6667L5.33333 10H10.6667L8 12.6667Z",fill:i==="desc"?"var(--grey-900)":"var(--grey-400)"})]})]})})});c.displayName="TableHeaderCell";c.__docgenInfo={description:"",methods:[],displayName:"TableHeaderCell",props:{children:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},sortable:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},sortDirection:{required:!1,tsType:{name:"union",raw:'"asc" | "desc" | null',elements:[{name:"literal",value:'"asc"'},{name:"literal",value:'"desc"'},{name:"null"}]},description:"",defaultValue:{value:"null",computed:!1}},onSort:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},filterable:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},filterOptions:{required:!1,tsType:{name:"Array",elements:[{name:"DropdownOption"}],raw:"DropdownOption[]"},description:"",defaultValue:{value:"[]",computed:!1}},filterValue:{required:!1,tsType:{name:"string"},description:""},onFilterChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(value: string) => void",signature:{arguments:[{type:{name:"string"},name:"value"}],return:{name:"void"}}},description:""},width:{required:!1,tsType:{name:"string"},description:""},className:{required:!1,tsType:{name:"string"},description:""}}};export{c as T};
