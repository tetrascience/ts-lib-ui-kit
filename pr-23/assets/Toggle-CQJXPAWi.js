import{j as o}from"./jsx-runtime-CDt2p4po.js";import{r as d}from"./index-GiUgBvb1.js";import{a as t}from"./styled-components.browser.esm-Ctfm6iBV.js";const u=t.div`
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: ${({disabled:e})=>e?.6:1};
  cursor: ${({disabled:e})=>e?"not-allowed":"pointer"};
`,x=t.div`
  position: relative;
  width: 32px;
  height: 20px;
  background-color: ${({checked:e})=>e?"var(--blue-600)":"var(--grey-500)"};
  border-radius: 100px;
  border: 2px solid var(--black-200);
  transition: all 0.2s ease;
  cursor: ${({disabled:e})=>e?"not-allowed":"pointer"};
  box-sizing: border-box;
`,g=t.div`
  position: absolute;
  top: 0px;
  left: ${({checked:e})=>e?"12px":"0px"};
  width: 16px;
  height: 16px;
  background-color: var(--white-900);
  border-radius: 50%;
  box-shadow: 0 1px 3px var(--black-300);
  transition: all 0.2s ease;
`,f=t.span`
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
  user-select: none;
  pointer-events: none;
  color: var(--grey-500);
`,m=({checked:e=!1,onChange:r,disabled:s=!1,label:i,className:l})=>{const[a,c]=d.useState(e),p=()=>{if(s)return;const n=!a;c(n),r==null||r(n)};return o.jsxs(u,{disabled:s,className:l,onClick:p,children:[o.jsx(x,{checked:a,disabled:s,children:o.jsx(g,{checked:a})}),i&&o.jsx(f,{children:i})]})};m.__docgenInfo={description:"",methods:[],displayName:"Toggle",props:{checked:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},onChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(checked: boolean) => void",signature:{arguments:[{type:{name:"boolean"},name:"checked"}],return:{name:"void"}}},description:""},disabled:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},label:{required:!1,tsType:{name:"string"},description:""},className:{required:!1,tsType:{name:"string"},description:""}}};export{m as T};
