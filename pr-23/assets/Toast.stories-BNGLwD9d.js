import{j as e}from"./jsx-runtime-CDt2p4po.js";import{a as w}from"./styled-components.browser.esm-Ctfm6iBV.js";import{T as t}from"./Toast-BkT690EI.js";import"./index-GiUgBvb1.js";import"./Icon-CuK57VyF.js";const A={title:"Atoms/Toast",component:t,parameters:{layout:"centered"},argTypes:{type:{control:{type:"select"},options:["info","success","warning","danger","default"]},heading:{control:"text"},description:{control:"text"}}},x=w.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 400px;
`,n={args:{type:"default",heading:"Heading",description:"Description"}},i={render:()=>e.jsxs(x,{children:[e.jsx(t,{type:"default",heading:"Heading",description:"Description"}),e.jsx(t,{type:"info",heading:"Heading",description:"Description"}),e.jsx(t,{type:"success",heading:"Heading",description:"Description"}),e.jsx(t,{type:"warning",heading:"Heading",description:"Description"}),e.jsx(t,{type:"danger",heading:"Heading",description:"Description"})]})},o={args:{type:"info",heading:"Heading without description"}},s={args:{type:"warning",heading:"This is a heading with a very long text that might wrap to multiple lines in some cases",description:"And this is a description with very long text content that will definitely wrap to multiple lines to demonstrate how the component handles long content in both heading and description."}};var a,r,d;n.parameters={...n.parameters,docs:{...(a=n.parameters)==null?void 0:a.docs,source:{originalSource:`{
  args: {
    type: "default",
    heading: "Heading",
    description: "Description"
  }
}`,...(d=(r=n.parameters)==null?void 0:r.docs)==null?void 0:d.source}}};var p,c,g;i.parameters={...i.parameters,docs:{...(p=i.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: () => <ToastContainer>
      <Toast type="default" heading="Heading" description="Description" />
      <Toast type="info" heading="Heading" description="Description" />
      <Toast type="success" heading="Heading" description="Description" />
      <Toast type="warning" heading="Heading" description="Description" />
      <Toast type="danger" heading="Heading" description="Description" />
    </ToastContainer>
}`,...(g=(c=i.parameters)==null?void 0:c.docs)==null?void 0:g.source}}};var l,h,m;o.parameters={...o.parameters,docs:{...(l=o.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    type: "info",
    heading: "Heading without description"
  }
}`,...(m=(h=o.parameters)==null?void 0:h.docs)==null?void 0:m.source}}};var u,y,f;s.parameters={...s.parameters,docs:{...(u=s.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    type: "warning",
    heading: "This is a heading with a very long text that might wrap to multiple lines in some cases",
    description: "And this is a description with very long text content that will definitely wrap to multiple lines to demonstrate how the component handles long content in both heading and description."
  }
}`,...(f=(y=s.parameters)==null?void 0:y.docs)==null?void 0:f.source}}};const C=["Default","AllTypes","WithoutDescription","LongContent"];export{i as AllTypes,n as Default,s as LongContent,o as WithoutDescription,C as __namedExportsOrder,A as default};
