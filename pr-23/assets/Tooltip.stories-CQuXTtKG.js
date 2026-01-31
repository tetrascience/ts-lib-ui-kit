import{j as o}from"./jsx-runtime-CDt2p4po.js";import{a as D}from"./styled-components.browser.esm-Ctfm6iBV.js";import{T as e}from"./Tooltip-DeRvpXCR.js";import"./index-GiUgBvb1.js";const C={title:"Atoms/Tooltip",component:e,parameters:{layout:"centered"},argTypes:{content:{control:"text"},placement:{control:{type:"select"},options:["top","right","bottom","left"]},delay:{control:"number"}}},t=D.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--blue-900);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
`,y=D.div`
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  justify-content: center;
  margin: 50px;
`,n={args:{content:"This is a tooltip content",placement:"top",children:o.jsx(t,{children:"Hover me"})}},l={render:()=>o.jsxs(y,{children:[o.jsx(e,{content:"Tooltip on top",placement:"top",children:o.jsx(t,{children:"Top"})}),o.jsx(e,{content:"Tooltip on right",placement:"right",children:o.jsx(t,{children:"Right"})}),o.jsx(e,{content:"Tooltip on bottom",placement:"bottom",children:o.jsx(t,{children:"Bottom"})}),o.jsx(e,{content:"Tooltip on left",placement:"left",children:o.jsx(t,{children:"Left"})})]})},r={args:{content:"This is a tooltip with a very long content that will wrap into multiple lines to demonstrate how the tooltip handles long text content.",placement:"top",children:o.jsx(t,{children:"Hover for long content"})}},i={args:{content:"This tooltip appears with a 1 second delay",placement:"top",delay:1e3,children:o.jsx(t,{children:"Delayed Tooltip"})}};var p,a,s;n.parameters={...n.parameters,docs:{...(p=n.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    content: "This is a tooltip content",
    placement: "top",
    children: <TooltipDemo>Hover me</TooltipDemo>
  }
}`,...(s=(a=n.parameters)==null?void 0:a.docs)==null?void 0:s.source}}};var c,m,d;l.parameters={...l.parameters,docs:{...(c=l.parameters)==null?void 0:c.docs,source:{originalSource:`{
  render: () => <TooltipContainer>
      <Tooltip content="Tooltip on top" placement="top">
        <TooltipDemo>Top</TooltipDemo>
      </Tooltip>
      <Tooltip content="Tooltip on right" placement="right">
        <TooltipDemo>Right</TooltipDemo>
      </Tooltip>
      <Tooltip content="Tooltip on bottom" placement="bottom">
        <TooltipDemo>Bottom</TooltipDemo>
      </Tooltip>
      <Tooltip content="Tooltip on left" placement="left">
        <TooltipDemo>Left</TooltipDemo>
      </Tooltip>
    </TooltipContainer>
}`,...(d=(m=l.parameters)==null?void 0:m.docs)==null?void 0:d.source}}};var T,h,g;r.parameters={...r.parameters,docs:{...(T=r.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    content: "This is a tooltip with a very long content that will wrap into multiple lines to demonstrate how the tooltip handles long text content.",
    placement: "top",
    children: <TooltipDemo>Hover for long content</TooltipDemo>
  }
}`,...(g=(h=r.parameters)==null?void 0:h.docs)==null?void 0:g.source}}};var u,x,f;i.parameters={...i.parameters,docs:{...(u=i.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    content: "This tooltip appears with a 1 second delay",
    placement: "top",
    delay: 1000,
    children: <TooltipDemo>Delayed Tooltip</TooltipDemo>
  }
}`,...(f=(x=i.parameters)==null?void 0:x.docs)==null?void 0:f.source}}};const H=["Default","AllPlacements","WithLongContent","CustomDelay"];export{l as AllPlacements,i as CustomDelay,n as Default,r as WithLongContent,H as __namedExportsOrder,C as default};
