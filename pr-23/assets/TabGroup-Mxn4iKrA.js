import{j as t}from"./jsx-runtime-CDt2p4po.js";import{r as m}from"./index-GiUgBvb1.js";import{a as p}from"./styled-components.browser.esm-Ctfm6iBV.js";import{T as u}from"./Tab-4ycdXO_T.js";const c=p.div`
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--grey-200);
  overflow-x: auto;

  &::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;
`,f=({tabs:r,activeTab:s,onChange:i,disabled:a=!1,size:o="medium"})=>{const[n,d]=m.useState(s||(r.length>0?r[0].id:"")),l=e=>{a||(d(e),i==null||i(e))};return t.jsx(c,{children:r.map(e=>t.jsx(u,{label:e.label,active:s?s===e.id:n===e.id,disabled:a||e.disabled,size:e.size||o,onClick:()=>l(e.id)},e.id))})};f.__docgenInfo={description:"",methods:[],displayName:"TabGroup",props:{tabs:{required:!0,tsType:{name:"Array",elements:[{name:"TabItem"}],raw:"TabItem[]"},description:""},activeTab:{required:!1,tsType:{name:"string"},description:""},onChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(tabId: string) => void",signature:{arguments:[{type:{name:"string"},name:"tabId"}],return:{name:"void"}}},description:""},disabled:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},size:{required:!1,tsType:{name:"TabSize"},description:"",defaultValue:{value:'"medium"',computed:!1}}}};export{f as T};
