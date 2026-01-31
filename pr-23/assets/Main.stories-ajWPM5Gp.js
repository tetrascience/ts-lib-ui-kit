import{j as e}from"./jsx-runtime-CDt2p4po.js";import{r as c}from"./index-GiUgBvb1.js";import{a as t}from"./styled-components.browser.esm-Ctfm6iBV.js";import{B as Q}from"./Button-tnMIwByE.js";import{a as n,I as r}from"./Icon-CuK57VyF.js";import{A as V}from"./AppHeader-CDCiTfxC.js";import{C as X}from"./CardSidebar-TD4t0nzp.js";import{L as K}from"./LaunchContent-DXwHkdBu.js";import{N as $}from"./Navbar-D-jVyHBM.js";import{P as J}from"./ProtocolConfiguration-Ck09OXdA.js";import{S as Y}from"./Sidebar-lTcm0vcq.js";import{T as C}from"./TabGroup-Mxn4iKrA.js";import"./CodeEditor-fKz404PR.js";import"./iframe-BAqoMiQf.js";import"./Tooltip-DeRvpXCR.js";import"./Dropdown-B2J4SVee.js";import"./Toast-BkT690EI.js";import"./Toggle-CQJXPAWi.js";import"./Tab-4ycdXO_T.js";const Z=t.div`
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
`,ee=t.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`,ie=t.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`,te=t.div`
  display: flex;
  flex-direction: column;
  background-color: var(--white-900);
  flex: 1;
  overflow: hidden;
`,ne=t.div`
  border-bottom: 1px solid var(--grey-200);
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`,m=t.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 0;
  background-color: var(--white-900);
`,u=t.h2`
  font-family: "Inter", sans-serif;
  font-size: 20px;
  font-weight: 500;
  color: var(--black-900);
  margin: 0;
`,oe=t.div`
  display: flex;
  gap: 8px;
`,k=t(Q)`
  border-radius: 4px;
  width: 32px;
  height: 32px;
`,re=t.div`
  width: 360px;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px 24px;
  overflow: hidden;
  max-height: 100%;
`,ae=t.div`
  flex: 1;
  height: 100%;
  background-color: var(--grey-100);
  display: flex;
  flex-direction: column;
`,se=t.div`
  padding: 16px 24px 0 24px;
`,g=t.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex: 1;
  margin-top: 8px;
  max-height: calc(100vh - 240px);
`,f=t.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
`,b=t.div`
  color: var(--grey-400);
  font-size: 14px;
  font-weight: 500;
`,v=t.div`
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }
`,j=t(X)``,le=t.div`
  padding: 24px;
  margin-top: -1px;
  flex: 1;
  border-top: 1px solid var(--grey-200);
`,ce=t.div`
  height: 100%;
  border: 1px solid var(--grey-200);
  border-radius: 8px;
  overflow: hidden;
`,A=({userProfile:I,hostname:P,organization:D})=>{const R=[{icon:n.SEARCH_DOCUMENT,label:"Search"},{icon:n.SEARCH_SQL,label:"SQL Search"},{icon:n.LAMP,label:"Projects"},{icon:n.PIPELINE,label:"Pipelines"},{icon:n.COMPUTER,label:"Data & AI Workspace"},{icon:n.CUBE,label:"Artifacts"},{icon:n.DATABASE,label:"Data Sources"},{icon:n.PIE_CHART,label:"Health Monitoring"},{icon:n.BULK_CHECK,label:"Bulk Actions"},{icon:n.CODE,label:"Attribute Management"},{icon:n.GEAR,label:"Administration"}],B=[{id:"templates",label:"Templates"},{id:"protocol",label:"Protocol"},{id:"steps",label:"Steps"}],E=[{id:"pipelineBuilder",label:"Pipeline Builder"},{id:"configuration",label:"Configuration"},{id:"launch",label:"Launch"}],[L,N]=c.useState("Pipelines"),[a,H]=c.useState("templates"),[s,M]=c.useState("pipelineBuilder"),[l,U]=c.useState("1"),T=[{id:"1",title:"Tecan D300e and PerkinElmer EnVision to Dotmatics (v1)",description:"c901ejs",buttonText:"",linkText:""},{id:"2",title:"Bruker D8 Andvanced CRD Raw to IDS(Draft)",description:"c901ejs",buttonText:"",linkText:""},{id:"3",title:"Extract and Decorate(Draft)",description:"c901ejs",buttonText:"",linkText:""},{id:"4",title:"Intellict (Que3 Raw to IDS(Draft)",description:"c901ejs",buttonText:"",linkText:""},{id:"5",title:"Leica Aperio RAW to IDS(Draft)",description:"c901ejs",buttonText:"",linkText:""},{id:"6",title:"IDS to Benchling(Draft)",description:"c901ejs",buttonText:"",linkText:""},{id:"7",title:"Lorem Ipsum",description:"c901ejs",buttonText:"",linkText:""}],o=[],q=[],O=i=>{N(i)},_=i=>{H(i)},z=i=>{M(i)},W=()=>{console.log("Home clicked")},F=()=>{console.log("Settings clicked")},G=()=>{console.log("User profile clicked")},p=i=>{U(i===l?null:i)},x=i=>{console.log(`Using template: ${i}`)},h=i=>{console.log(`Viewing template: ${i}`)};return e.jsxs(Z,{children:[e.jsx($,{organization:D}),e.jsxs(ee,{children:[e.jsx(Y,{items:R,activeItem:L,onItemClick:O}),e.jsxs(ie,{children:[e.jsx(V,{hostname:P,userProfile:I,onHomeClick:W,onSettingsClick:F,onUserProfileClick:G}),e.jsx(te,{children:e.jsx(ne,{children:e.jsxs("div",{style:{display:"flex",height:"100%"},children:[e.jsxs(re,{children:[e.jsx(C,{tabs:B,activeTab:a,onChange:_}),a==="templates"&&e.jsxs(e.Fragment,{children:[e.jsxs(m,{children:[e.jsx(u,{children:"Templates"}),e.jsxs(oe,{children:[e.jsx(k,{variant:"tertiary",size:"small","aria-label":"Delete",noPadding:!0,children:e.jsx(r,{name:n.TRASH,width:"20",height:"20",fill:"var(--red-error)"})}),e.jsx(k,{variant:"primary",size:"small","aria-label":"Add",noPadding:!0,children:e.jsx(r,{name:n.PLUS,width:"20",height:"20",fill:"var(--white-900)"})})]})]}),e.jsx(g,{children:T.length>0?T.map(i=>e.jsx(v,{onClick:()=>p(i.id),children:e.jsx(j,{title:i.title,description:i.description,buttonText:i.buttonText,linkText:i.linkText,status:l===i.id?"active":"default",onButtonClick:()=>x(i.id),onLinkClick:()=>h(i.id)})},i.id)):e.jsxs(f,{children:[e.jsx(r,{name:n.INBOX,width:"40",height:"40",fill:"var(--grey-400)"}),e.jsx(b,{children:"No data"})]})})]}),a==="protocol"&&e.jsxs(e.Fragment,{children:[e.jsx(m,{children:e.jsxs(u,{children:["Protocol (",o.length,")"]})}),e.jsx(g,{children:o.length>0?o.map(i=>e.jsx(v,{onClick:()=>p(i.id),children:e.jsx(j,{title:i.title,description:i.description,status:l===i.id?"active":"default",onButtonClick:()=>x(i.id),onLinkClick:()=>h(i.id)})},i.id)):e.jsxs(f,{children:[e.jsx(r,{name:n.INBOX,width:"40",height:"40",fill:"var(--grey-400)"}),e.jsx(b,{children:"No data"})]})})]}),a==="steps"&&e.jsxs(e.Fragment,{children:[e.jsx(m,{children:e.jsxs(u,{children:["Task Scripts (",q.length,")"]})}),e.jsx(g,{children:o.length>0?o.map(i=>e.jsx(v,{onClick:()=>p(i.id),children:e.jsx(j,{title:i.title,description:i.description,status:l===i.id?"active":"default",onButtonClick:()=>x(i.id),onLinkClick:()=>h(i.id)})},i.id)):e.jsxs(f,{children:[e.jsx(r,{name:n.INBOX,width:"40",height:"40",fill:"var(--grey-400)"}),e.jsx(b,{children:"No data"})]})})]})]}),e.jsxs(ae,{children:[e.jsx(se,{children:e.jsx(C,{tabs:E,activeTab:s,onChange:z})}),e.jsxs(le,{children:[s==="pipelineBuilder"&&e.jsx(ce,{}),s==="configuration"&&e.jsx(J,{}),s==="launch"&&e.jsx(K,{})]})]})]})})})]})]})]})};A.__docgenInfo={description:"",methods:[],displayName:"Main",props:{userProfile:{required:!0,tsType:{name:"signature",type:"object",raw:`{
  name: string;
  avatar?: string;
}`,signature:{properties:[{key:"name",value:{name:"string",required:!0}},{key:"avatar",value:{name:"string",required:!1}}]}},description:""},hostname:{required:!0,tsType:{name:"string"},description:""},organization:{required:!0,tsType:{name:"signature",type:"object",raw:`{
  name: string;
  subtext?: string;
  logo?: React.ReactNode;
}`,signature:{properties:[{key:"name",value:{name:"string",required:!0}},{key:"subtext",value:{name:"string",required:!1}},{key:"logo",value:{name:"ReactReactNode",raw:"React.ReactNode",required:!1}}]}},description:""}}};const Pe={title:"Organisms/Main",component:A,parameters:{layout:"fullscreen"},tags:["autodocs"]},d={args:{hostname:"localhost:3000",userProfile:{name:"Chris Calo",avatar:void 0},organization:{name:"TetraScience",subtext:"tetrascience"}}};var y,S,w;d.parameters={...d.parameters,docs:{...(y=d.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    hostname: "localhost:3000",
    userProfile: {
      name: "Chris Calo",
      avatar: undefined
    },
    organization: {
      name: "TetraScience",
      subtext: "tetrascience"
    }
  }
}`,...(w=(S=d.parameters)==null?void 0:S.docs)==null?void 0:w.source}}};const De=["Default"];export{d as Default,De as __namedExportsOrder,Pe as default};
