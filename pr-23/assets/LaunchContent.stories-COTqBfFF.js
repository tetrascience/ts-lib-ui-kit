import{j as n}from"./jsx-runtime-CDt2p4po.js";import{L as D}from"./LaunchContent-DXwHkdBu.js";import"./index-GiUgBvb1.js";import"./styled-components.browser.esm-Ctfm6iBV.js";import"./Button-tnMIwByE.js";import"./CodeEditor-fKz404PR.js";import"./iframe-BAqoMiQf.js";import"./Icon-CuK57VyF.js";import"./Tooltip-DeRvpXCR.js";import"./Dropdown-B2J4SVee.js";import"./Toast-BkT690EI.js";import"./Toggle-CQJXPAWi.js";const w={title:"Molecules/LaunchContent",component:D,parameters:{layout:"fullscreen"},tags:["autodocs"],decorators:[t=>n.jsx(n.Fragment,{children:n.jsx(t,{})})]},o={args:{initialCode:`protocolSchema: v3
name: v3
description: No description
config: {}
steps: []`,versions:["v0.0.7","v0.0.6","v0.0.5"],currentVersion:"v0.0.7"}},e={args:{...o.args,onDeploy:()=>console.log("Deploy clicked!"),onVersionChange:t=>console.log(`Version changed to ${t}`)}},s={args:{...o.args,onDeploy:()=>{console.log("Deploy complete!")}},play:async()=>{},parameters:{docs:{description:{story:'Click the "Deploy" button to see toast notifications showing deployment status and success.'}}}},r={args:{initialCode:"",versions:["v0.0.7","v0.0.6","v0.0.5"],currentVersion:"v0.0.7"}};var a,c,i;o.parameters={...o.parameters,docs:{...(a=o.parameters)==null?void 0:a.docs,source:{originalSource:`{
  args: {
    initialCode: \`protocolSchema: v3
name: v3
description: No description
config: {}
steps: []\`,
    versions: ["v0.0.7", "v0.0.6", "v0.0.5"],
    currentVersion: "v0.0.7"
  }
}`,...(i=(c=o.parameters)==null?void 0:c.docs)==null?void 0:i.source}}};var p,l,m;e.parameters={...e.parameters,docs:{...(p=e.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    onDeploy: () => console.log("Deploy clicked!"),
    onVersionChange: version => console.log(\`Version changed to \${version}\`)
  }
}`,...(m=(l=e.parameters)==null?void 0:l.docs)==null?void 0:m.source}}};var d,u,g;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    onDeploy: () => {
      console.log("Deploy complete!");
    }
  },
  play: async () => {},
  parameters: {
    docs: {
      description: {
        story: 'Click the "Deploy" button to see toast notifications showing deployment status and success.'
      }
    }
  }
}`,...(g=(u=s.parameters)==null?void 0:u.docs)==null?void 0:g.source}}};var v,y,h;r.parameters={...r.parameters,docs:{...(v=r.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    initialCode: "",
    versions: ["v0.0.7", "v0.0.6", "v0.0.5"],
    currentVersion: "v0.0.7"
  }
}`,...(h=(y=r.parameters)==null?void 0:y.docs)==null?void 0:h.source}}};const N=["Default","WithCallbacks","WithDeploymentFeedback","EmptyEditor"];export{o as Default,r as EmptyEditor,e as WithCallbacks,s as WithDeploymentFeedback,N as __namedExportsOrder,w as default};
