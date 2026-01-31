import{j as l}from"./jsx-runtime-CDt2p4po.js";import{r as o}from"./index-GiUgBvb1.js";import{a as c}from"./styled-components.browser.esm-Ctfm6iBV.js";import{I as $,a as T}from"./Icon-CuK57VyF.js";const R=c.div`
  position: relative;
  width: ${e=>e.width||"100%"};
`,A=c.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: ${e=>e.size==="xsmall"?"34px":"38px"};
  padding: 0 12px;
  background-color: ${e=>e.disabled?"var(--grey-100)":"var(--white-900)"};
  border: 1px solid
    ${e=>e.$error?"var(--red-error)":e.disabled?"var(--grey-200)":e.open?"var(--blue-600)":"var(--grey-300)"};
  border-radius: 6px;
  outline: none;
  cursor: ${e=>e.disabled?"not-allowed":"pointer"};
  user-select: ${e=>e.disabled?"none":"auto"};
  transition: all 0.2s ease;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  text-align: left;
  color: ${e=>e.disabled?"var(--grey-400)":e.open?"var(--black-900)":"var(--grey-400)"};

  &:hover:not(:disabled) {
    border-color: ${e=>e.$error?"var(--red-error)":"var(--blue-600)"};
    color: var(--black-900) !important;
  }

  &:disabled {
    color: var(--grey-400) !important;
    border-color: var(--grey-300);
  }

  &:active:not(:disabled) {
    color: var(--black-900) !important;
  }

  &:focus {
    outline: none;
    box-shadow: ${e=>e.$error?"0px 0px 0px 3px var(--red-bg)":"0px 0px 0px 1px var(--white-900), 0px 0px 0px 3px var(--blue-600)"};
    border-color: ${e=>e.$error?"var(--red-error)":"var(--blue-600)"};
  }
`,B=c.div`
  width: 20px;
  height: 20px;
  transform: ${e=>e.open?"rotate(180deg)":"rotate(0deg)"};
  transition: transform 0.2s ease;
  color: var(--grey-600);
  display: flex;
  align-items: center;
  justify-content: center;
`,K=c.div`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  flex: 1;
  text-align: left;
  display: block;
  max-width: calc(100% - 24px);

  .dropdown-menu-item {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
`,W=c.ul`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: ${e=>e.menuWidth||"calc(100% - 2px)"};
  max-height: 200px;
  overflow-y: auto;
  background-color: var(--white-900);
  border: 1px solid var(--grey-200);
  border-radius: 6px;
  box-shadow: 0px 4px 8px var(--black-100);
  z-index: 10;
  padding: 4px 0;
  margin: 0;
  list-style: none;
`,_=c.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: var(--grey-400);
`,L=c.p`
  margin: 8px 0 0 0;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
`,F=c.li`
  padding: 8px 12px;
  cursor: ${e=>e.disabled?"not-allowed":"pointer"};
  background-color: ${e=>e.selected?"var(--blue-50)":"transparent"};
  color: ${e=>e.disabled?"var(--grey-400)":(e.selected,"var(--blue-900)")};
  font-family: "Inter", sans-serif;
  font-size: 14px;
  line-height: 20px;
  transition: background-color 0.2s ease;
  outline: none;

  &:hover:not(:disabled) {
    background-color: ${e=>e.selected?"var(--blue-50)":"var(--grey-50)"};
  }

  &:focus-visible {
    background-color: var(--blue-50);
    outline: 2px solid var(--blue-600);
    outline-offset: -2px;
  }
`,H=({options:e=[],value:x,placeholder:g="Select an option",disabled:v=!1,error:I=!1,size:j="small",onChange:m,onOpen:f,onClose:t,width:E,menuWidth:q})=>{const[a,u]=o.useState(!1),[p,h]=o.useState(x||""),b=o.useRef(null),d=o.useRef([]);o.useEffect(()=>{x!==void 0&&h(x)},[x]),o.useEffect(()=>{const r=i=>{b.current&&!b.current.contains(i.target)&&a&&(u(!1),t==null||t())};return document.addEventListener("mousedown",r),()=>{document.removeEventListener("mousedown",r)}},[a,t]),o.useEffect(()=>{a&&(d.current=d.current.slice(0,e.length))},[a,e.length]),o.useEffect(()=>{if(a&&d.current.length>0){const r=e.findIndex(n=>n.value===p),i=r>=0?r:0;setTimeout(()=>{var n;d.current[i]&&((n=d.current[i])==null||n.focus())},10)}},[a,e,p]);const N=()=>{if(!v){const r=!a;u(r),r?f==null||f():t==null||t()}},w=r=>{r.disabled||(h(r.value),u(!1),m==null||m(r.value),t==null||t())},V=(r,i)=>{var k,D;const n=e[i];switch(r.key){case"Enter":case" ":r.preventDefault(),n.disabled||w(n);break;case"ArrowDown":if(r.preventDefault(),i<e.length-1){let s=i+1;for(;s<e.length;){if(!e[s].disabled){(k=d.current[s])==null||k.focus();break}s++}}break;case"ArrowUp":if(r.preventDefault(),i>0){let s=i-1;for(;s>=0;){if(!e[s].disabled){(D=d.current[s])==null||D.focus();break}s--}}break;case"Escape":r.preventDefault(),u(!1),t==null||t();break;case"Tab":u(!1),t==null||t();break}},S=r=>{if(!v)switch(r.key){case"Enter":case" ":case"ArrowDown":r.preventDefault(),a||(u(!0),f==null||f());break;case"Escape":r.preventDefault(),a&&(u(!1),t==null||t());break}},y=e.find(r=>r.value===p),z=y?y.label:g;return l.jsxs(R,{ref:b,width:E,children:[l.jsxs(A,{type:"button",onClick:N,onKeyDown:S,open:a,disabled:v,$error:I,size:j,"aria-haspopup":"listbox","aria-expanded":a,"aria-label":g,children:[l.jsx(K,{children:z}),l.jsx(B,{open:a,children:l.jsx($,{name:T.CHEVRON_DOWN,fill:"var(--grey-600)"})})]}),a&&l.jsx(W,{role:"listbox","aria-labelledby":"dropdown-button",menuWidth:q,children:e.length>0?e.map((r,i)=>l.jsx(F,{ref:n=>{d.current[i]=n},selected:r.value===p,disabled:r.disabled,onClick:()=>w(r),onKeyDown:n=>V(n,i),tabIndex:r.disabled?-1:0,role:"option","aria-selected":r.value===p,"aria-disabled":r.disabled,children:r.label},r.value)):l.jsxs(_,{children:[l.jsx($,{name:T.INBOX,fill:"var(--grey-400)",width:"24px",height:"24px"}),l.jsx(L,{children:"No Data"})]})})]})};H.__docgenInfo={description:"",methods:[],displayName:"Dropdown",props:{options:{required:!1,tsType:{name:"Array",elements:[{name:"DropdownOption"}],raw:"DropdownOption[]"},description:"",defaultValue:{value:"[]",computed:!1}},value:{required:!1,tsType:{name:"string"},description:""},placeholder:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Select an option"',computed:!1}},disabled:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},error:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},size:{required:!1,tsType:{name:"union",raw:'"xsmall" | "small"',elements:[{name:"literal",value:'"xsmall"'},{name:"literal",value:'"small"'}]},description:"",defaultValue:{value:'"small"',computed:!1}},onChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(value: string) => void",signature:{arguments:[{type:{name:"string"},name:"value"}],return:{name:"void"}}},description:""},onOpen:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onClose:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},width:{required:!1,tsType:{name:"string"},description:""},menuWidth:{required:!1,tsType:{name:"string"},description:""}}};export{H as D};
