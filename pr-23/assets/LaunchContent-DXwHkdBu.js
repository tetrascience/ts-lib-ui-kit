import{j as e}from"./jsx-runtime-CDt2p4po.js";import{r as o}from"./index-GiUgBvb1.js";import{a as s}from"./styled-components.browser.esm-Ctfm6iBV.js";import{B as L}from"./Button-tnMIwByE.js";import{C as D}from"./CodeEditor-fKz404PR.js";import{D as N}from"./Dropdown-B2J4SVee.js";import{T as l}from"./Toast-BkT690EI.js";import{T as k}from"./Toggle-CQJXPAWi.js";const q=s.div``,E=s.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  background-color: var(--grey-100);
`,P=s.h1`
  color: var(--black-900);
  font-family: "Inter", sans-serif;
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: 28px;
  margin: 0;
`,V=s.div`
  display: flex;
  align-items: center;
  gap: 16px;
`,M=s.div`
  display: flex;
  align-items: center;
`,z=s.div`
  width: 1px;
  height: 20px;
  background-color: var(--grey-200);
`,B=`protocolSchema: v3
name: v3
description: No description
config: {}
steps: []`,d=s.div`
  position: relative;
  width: 100%;
  max-width: 100%;
  margin-bottom: 16px;
`,O=({initialCode:f=B,onDeploy:c,versions:g=["v0.0.7","v0.0.6","v0.0.5"],currentVersion:i="v0.0.7",onVersionChange:h=()=>{}})=>{const[v,y]=o.useState(f),[p,x]=o.useState(!0),[r,u]=o.useState(!1),[T,m]=o.useState(!1),[j,n]=o.useState(!1),[C,a]=o.useState(!1),b=t=>{t!==void 0&&y(t)},w=t=>{navigator.clipboard.writeText(t)},S=t=>{console.log("Launching code:",t)},I=()=>{u(!0),m(!0),n(!1),a(!1),setTimeout(()=>{m(!1),Math.random()>.3?(n(!0),a(!1)):(n(!1),a(!0)),u(!1),c&&c(),setTimeout(()=>{n(!1),a(!1)},5e3)},3e3)};return e.jsxs(q,{children:[e.jsxs(E,{children:[e.jsx(P,{children:"Launch"}),e.jsxs(V,{children:[e.jsx(k,{checked:p,onChange:x,label:"Overwrite Mode",disabled:r}),e.jsx(z,{}),e.jsx(M,{children:e.jsx(N,{options:g.map(t=>({label:t,value:t})),value:i,onChange:t=>h(t),width:"150px",size:"small",disabled:r})}),e.jsx(L,{variant:"primary",size:"medium",onClick:I,disabled:r,children:"Deploy"})]})]}),T&&e.jsx(d,{children:e.jsx(l,{type:"info",heading:"Building Protocol: Status=IN_PROGRESS, Phase=FINALIZING"})}),j&&e.jsx(d,{children:e.jsx(l,{type:"success",heading:`Pipeline visual-pipeline-builder-protocol-${i}-pipeline deployed successfully! Deployment complete`})}),C&&e.jsx(d,{children:e.jsx(l,{type:"danger",heading:`Failed to deploy pipeline visual-pipeline-builder-protocol-${i}-pipeline. Please try again.`})}),e.jsx(D,{value:v,onChange:b,language:"yaml",theme:"light",width:"100%",onCopy:w,onLaunch:S,disabled:!p})]})};O.__docgenInfo={description:"",methods:[],displayName:"LaunchContent",props:{initialCode:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:`\`protocolSchema: v3
name: v3
description: No description
config: {}
steps: []\``,computed:!1}},onDeploy:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},versions:{required:!1,tsType:{name:"Array",elements:[{name:"string"}],raw:"string[]"},description:"",defaultValue:{value:'["v0.0.7", "v0.0.6", "v0.0.5"]',computed:!1}},currentVersion:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"v0.0.7"',computed:!1}},onVersionChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(version: string) => void",signature:{arguments:[{type:{name:"string"},name:"version"}],return:{name:"void"}}},description:"",defaultValue:{value:"() => {}",computed:!1}}}};export{O as L};
