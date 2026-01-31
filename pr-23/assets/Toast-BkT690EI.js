import{j as r}from"./jsx-runtime-CDt2p4po.js";import{a as s}from"./styled-components.browser.esm-Ctfm6iBV.js";import{I as n,a}from"./Icon-CuK57VyF.js";const t={info:{backgroundColor:"var(--blue-100)",borderColor:"var(--blue-600)",iconColor:"var(--blue-600)"},success:{backgroundColor:"var(--green-bg)",borderColor:"var(--green-success)",iconColor:"var(--green-success)"},warning:{backgroundColor:"var(--orange-bg)",borderColor:"var(--orange-caution)",iconColor:"var(--orange-caution)"},danger:{backgroundColor:"var(--red-bg)",borderColor:"var(--red-error)",iconColor:"var(--red-error)"},default:{backgroundColor:"var(--white-900)",borderColor:"var(--grey-300)",iconColor:"var(--grey-600)"}},c=s.div`
  display: flex;
  padding: 8px;
  gap: 8px;
  align-items: flex-start;
  border-radius: 8px;
  background-color: ${e=>t[e.type].backgroundColor};
  border: 1px solid ${e=>t[e.type].borderColor};
  width: 100%;
  box-sizing: border-box;
`,d=s.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`,u=s.h3`
  margin: 0;
  color: var(--black-900);
  font-family: "Inter", sans-serif;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
`,g=s.p`
  margin: 0;
  color: var(--grey-500);
  text-overflow: ellipsis;
  font-family: "Inter", sans-serif;
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px;
`,f=({color:e})=>r.jsx(n,{name:a.INFORMATION_CIRCLE,fill:e}),p=({color:e})=>r.jsx(n,{name:a.CHECK_CIRCLE,fill:e}),m=({color:e})=>r.jsx(n,{name:a.EXCLAMATION_TRIANGLE,fill:e}),x=({color:e})=>r.jsx(n,{name:a.EXCLAMATION_CIRCLE,fill:e}),C=({color:e})=>r.jsx(n,{name:a.EXCLAMATION_TRIANGLE,fill:e}),v=(e,o)=>{switch(e){case"info":return r.jsx(f,{color:o});case"success":return r.jsx(p,{color:o});case"warning":return r.jsx(m,{color:o});case"danger":return r.jsx(x,{color:o});default:return r.jsx(C,{color:o})}},b=({type:e="default",heading:o,description:i,className:l})=>r.jsxs(c,{type:e,className:l,children:[v(e,t[e].iconColor),r.jsxs(d,{children:[r.jsx(u,{children:o}),i&&r.jsx(g,{children:i})]})]});b.__docgenInfo={description:"",methods:[],displayName:"Toast",props:{type:{required:!1,tsType:{name:"union",raw:'"info" | "success" | "warning" | "danger" | "default"',elements:[{name:"literal",value:'"info"'},{name:"literal",value:'"success"'},{name:"literal",value:'"warning"'},{name:"literal",value:'"danger"'},{name:"literal",value:'"default"'}]},description:"",defaultValue:{value:'"default"',computed:!1}},heading:{required:!0,tsType:{name:"string"},description:""},description:{required:!1,tsType:{name:"string"},description:""},className:{required:!1,tsType:{name:"string"},description:""}}};export{b as T};
