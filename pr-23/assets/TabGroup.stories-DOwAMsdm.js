import{j as l}from"./jsx-runtime-CDt2p4po.js";import{R as y}from"./index-GiUgBvb1.js";import{T as S}from"./TabGroup-Mxn4iKrA.js";import"./styled-components.browser.esm-Ctfm6iBV.js";import"./Tab-4ycdXO_T.js";const _={title:"Molecules/TabGroup",component:S,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{disabled:{control:{type:"boolean"}},size:{control:{type:"select"},options:["small","medium"]}}},a={args:{tabs:[{id:"tab1",label:"Pipeline Builder"},{id:"tab2",label:"Configuration"},{id:"tab3",label:"Launch"}],activeTab:"tab1"}},e={args:{tabs:[{id:"tab1",label:"Pipeline Builder"},{id:"tab2",label:"Configuration"},{id:"tab3",label:"Launch"}],activeTab:"tab2",size:"medium"}},t={args:{tabs:[{id:"tab1",label:"Pipeline Builder"},{id:"tab2",label:"Configuration"},{id:"tab3",label:"Launch"}],activeTab:"tab3",size:"small"}},n={args:{tabs:[{id:"tab1",label:"Pipeline Builder"},{id:"tab2",label:"Configuration"},{id:"tab3",label:"Launch"}],activeTab:"tab2",disabled:!0}},i={args:{tabs:[{id:"tab1",label:"Pipeline Builder"},{id:"tab2",label:"Configuration",disabled:!0},{id:"tab3",label:"Launch"}],activeTab:"tab3"}},z=()=>{const[j,D]=y.useState("tab1");return l.jsxs("div",{style:{width:"600px"},children:[l.jsx("h3",{children:"Click a tab to change active state"}),l.jsx(S,{tabs:[{id:"tab1",label:"Pipeline Builder"},{id:"tab2",label:"Configuration"},{id:"tab3",label:"Launch"}],activeTab:j,onChange:I=>D(I)})]})},r={render:()=>l.jsx(z,{})};var s,b,o;a.parameters={...a.parameters,docs:{...(s=a.parameters)==null?void 0:s.docs,source:{originalSource:`{
  args: {
    tabs: [{
      id: "tab1",
      label: "Pipeline Builder"
    }, {
      id: "tab2",
      label: "Configuration"
    }, {
      id: "tab3",
      label: "Launch"
    }],
    activeTab: "tab1"
  }
}`,...(o=(b=a.parameters)==null?void 0:b.docs)==null?void 0:o.source}}};var d,c,u;e.parameters={...e.parameters,docs:{...(d=e.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    tabs: [{
      id: "tab1",
      label: "Pipeline Builder"
    }, {
      id: "tab2",
      label: "Configuration"
    }, {
      id: "tab3",
      label: "Launch"
    }],
    activeTab: "tab2",
    size: "medium"
  }
}`,...(u=(c=e.parameters)==null?void 0:c.docs)==null?void 0:u.source}}};var p,m,g;t.parameters={...t.parameters,docs:{...(p=t.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    tabs: [{
      id: "tab1",
      label: "Pipeline Builder"
    }, {
      id: "tab2",
      label: "Configuration"
    }, {
      id: "tab3",
      label: "Launch"
    }],
    activeTab: "tab3",
    size: "small"
  }
}`,...(g=(m=t.parameters)==null?void 0:m.docs)==null?void 0:g.source}}};var h,v,T;n.parameters={...n.parameters,docs:{...(h=n.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    tabs: [{
      id: "tab1",
      label: "Pipeline Builder"
    }, {
      id: "tab2",
      label: "Configuration"
    }, {
      id: "tab3",
      label: "Launch"
    }],
    activeTab: "tab2",
    disabled: true
  }
}`,...(T=(v=n.parameters)==null?void 0:v.docs)==null?void 0:T.source}}};var f,C,x;i.parameters={...i.parameters,docs:{...(f=i.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    tabs: [{
      id: "tab1",
      label: "Pipeline Builder"
    }, {
      id: "tab2",
      label: "Configuration",
      disabled: true
    }, {
      id: "tab3",
      label: "Launch"
    }],
    activeTab: "tab3"
  }
}`,...(x=(C=i.parameters)==null?void 0:C.docs)==null?void 0:x.source}}};var B,L,P;r.parameters={...r.parameters,docs:{...(B=r.parameters)==null?void 0:B.docs,source:{originalSource:`{
  render: () => <InteractiveExample />
}`,...(P=(L=r.parameters)==null?void 0:L.docs)==null?void 0:P.source}}};const k=["Default","Medium","Small","Disabled","WithDisabledTab","Interactive"];export{a as Default,n as Disabled,r as Interactive,e as Medium,t as Small,i as WithDisabledTab,k as __namedExportsOrder,_ as default};
