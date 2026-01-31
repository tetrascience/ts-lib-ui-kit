import{j as i}from"./jsx-runtime-CDt2p4po.js";import{a as t}from"./styled-components.browser.esm-Ctfm6iBV.js";import{I as s}from"./Icon-CuK57VyF.js";const l=t.div`
  width: 104px;
  height: 100%;
  background-color: var(--blue-900);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
`,c=t.div`
  width: 100%;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  cursor: pointer;
  transition: background-color 0.2s ease;
  background-color: ${n=>n.$active?"var(--white-100)":"transparent"};

  &:hover {
    background-color: var(--white-50);
  }
`,d=t.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
  color: var(--white-900);
`,p=t.div`
  color: var(--white-900);
  text-align: center;
  font-family: "Inter", sans-serif;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px;
  text-align: center;
  padding: 0 8px;
`,m=({icon:n,label:a,active:r,onClick:o})=>i.jsxs(c,{$active:r,onClick:o,children:[i.jsx(d,{children:i.jsx(s,{name:n,fill:"var(--white-900)",width:"20",height:"20"})}),i.jsx(p,{children:a})]}),g=({items:n,activeItem:a,onItemClick:r})=>{const o=e=>{r&&r(e)};return i.jsx(l,{children:n.map(e=>i.jsx(m,{icon:e.icon,label:e.label,active:a===e.label,onClick:()=>o(e.label)},e.label))})};g.__docgenInfo={description:"",methods:[],displayName:"Sidebar",props:{items:{required:!0,tsType:{name:"Array",elements:[{name:"SidebarItemProps"}],raw:"SidebarItemProps[]"},description:""},activeItem:{required:!1,tsType:{name:"string"},description:""},onItemClick:{required:!1,tsType:{name:"signature",type:"function",raw:"(label: string) => void",signature:{arguments:[{type:{name:"string"},name:"label"}],return:{name:"void"}}},description:""}}};export{g as S};
