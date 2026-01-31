import{j as e}from"./jsx-runtime-CDt2p4po.js";import{r as d}from"./index-GiUgBvb1.js";import{a as o}from"./styled-components.browser.esm-Ctfm6iBV.js";import{B as x}from"./Button-tnMIwByE.js";import{C as w}from"./CodeEditor-fKz404PR.js";import{D as V}from"./Dropdown-B2J4SVee.js";import{T as C}from"./Toggle-CQJXPAWi.js";import"./iframe-BAqoMiQf.js";import"./Icon-CuK57VyF.js";import"./Tooltip-DeRvpXCR.js";const T=o.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0;
  gap: 16px;
  width: 928px;
  background: transparent;
`,j=o.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 928px;
  height: 36px;
`,D=o.span`
  font-family: "Inter", sans-serif;
  font-weight: 600;
  font-size: 18px;
  line-height: 28px;
  color: var(--black-900);
`,Y=o.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  justify-content: flex-end;
`,M=o.div`
  width: 1px;
  height: 20px;
  background: var(--grey-200);
`,S=o.div`
  width: 100%;
`,b=o(C)`
  min-width: 176px;
`,N=o(V)``,c=({title:t,newVersionMode:r,onToggleNewVersionMode:i,versionOptions:s,selectedVersion:a,onVersionChange:l,onDeploy:y,yaml:v,onYamlChange:h})=>e.jsxs(T,{children:[e.jsxs(j,{children:[e.jsx(D,{children:t}),e.jsxs(Y,{children:[e.jsx(b,{checked:r,onChange:i,label:"New Version Mode"}),e.jsx(M,{}),e.jsx(N,{options:s,value:a,onChange:l,size:"small",width:"120px"}),e.jsx(x,{variant:"primary",size:"medium",onClick:y,children:"Deploy"})]})]}),e.jsx(S,{children:e.jsx(w,{value:v,onChange:f=>h(f??""),language:"yaml",theme:"light",onCopy:()=>{},onLaunch:()=>{}})})]});c.__docgenInfo={description:"",methods:[],displayName:"ProtocolYamlCard",props:{title:{required:!0,tsType:{name:"string"},description:""},newVersionMode:{required:!0,tsType:{name:"boolean"},description:""},onToggleNewVersionMode:{required:!0,tsType:{name:"signature",type:"function",raw:"(checked: boolean) => void",signature:{arguments:[{type:{name:"boolean"},name:"checked"}],return:{name:"void"}}},description:""},versionOptions:{required:!0,tsType:{name:"Array",elements:[{name:"DropdownOption"}],raw:"DropdownOption[]"},description:""},selectedVersion:{required:!0,tsType:{name:"string"},description:""},onVersionChange:{required:!0,tsType:{name:"signature",type:"function",raw:"(value: string) => void",signature:{arguments:[{type:{name:"string"},name:"value"}],return:{name:"void"}}},description:""},onDeploy:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},yaml:{required:!0,tsType:{name:"string"},description:""},onYamlChange:{required:!0,tsType:{name:"signature",type:"function",raw:"(value: string) => void",signature:{arguments:[{type:{name:"string"},name:"value"}],return:{name:"void"}}},description:""}}};const L={title:"Molecules/ProtocolYamlCard",component:c},p=[{value:"v0.0.1",label:"v0.0.1"},{value:"v0.0.0",label:"v0.0.0"}],k=`protocolSchema: v3
name: v3
description: No description
config: {}
steps: []
`,n=()=>{const[t,r]=d.useState(!1),[i,s]=d.useState(p[0].value),[a,l]=d.useState(k);return e.jsx(c,{title:"Protocol Yaml",newVersionMode:t,onToggleNewVersionMode:r,versionOptions:p,selectedVersion:i,onVersionChange:s,onDeploy:()=>alert("Deploy clicked!"),yaml:a,onYamlChange:l})};n.__docgenInfo={description:"",methods:[],displayName:"Default"};var m,u,g;n.parameters={...n.parameters,docs:{...(m=n.parameters)==null?void 0:m.docs,source:{originalSource:`() => {
  const [newVersionMode, setNewVersionMode] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(versionOptions[0].value);
  const [yaml, setYaml] = useState(initialYaml);
  return <ProtocolYamlCard title="Protocol Yaml" newVersionMode={newVersionMode} onToggleNewVersionMode={setNewVersionMode} versionOptions={versionOptions} selectedVersion={selectedVersion} onVersionChange={setSelectedVersion} onDeploy={() => alert("Deploy clicked!")} yaml={yaml} onYamlChange={setYaml} />;
}`,...(g=(u=n.parameters)==null?void 0:u.docs)==null?void 0:g.source}}};const R=["Default"];export{n as Default,R as __namedExportsOrder,L as default};
