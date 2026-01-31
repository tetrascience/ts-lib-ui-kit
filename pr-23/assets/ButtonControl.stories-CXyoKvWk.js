import{j as e}from"./jsx-runtime-CDt2p4po.js";import{B as a}from"./ButtonControl-CZJC9UKX.js";import"./index-GiUgBvb1.js";import"./styled-components.browser.esm-Ctfm6iBV.js";const B={title:"Atoms/ButtonControl",component:a,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{selected:{control:{type:"boolean"}},disabled:{control:{type:"boolean"}}}},o=()=>e.jsx("svg",{width:"20",height:"20",viewBox:"0 0 20 20",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:e.jsx("rect",{x:"4",y:"4",width:"12",height:"12",rx:"2",fill:"currentColor"})}),r={args:{icon:e.jsx(o,{})}},s={args:{icon:e.jsx(o,{}),selected:!0}},t={args:{icon:e.jsx(o,{}),disabled:!0}},n={render:()=>e.jsxs("div",{style:{display:"flex",gap:"12px"},children:[e.jsx(a,{icon:e.jsx(o,{})}),e.jsx(a,{icon:e.jsx(o,{}),selected:!0}),e.jsx(a,{icon:e.jsx(o,{}),disabled:!0})]})};var c,l,d;r.parameters={...r.parameters,docs:{...(c=r.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    icon: <Icon />
  }
}`,...(d=(l=r.parameters)==null?void 0:l.docs)==null?void 0:d.source}}};var i,p,u;s.parameters={...s.parameters,docs:{...(i=s.parameters)==null?void 0:i.docs,source:{originalSource:`{
  args: {
    icon: <Icon />,
    selected: true
  }
}`,...(u=(p=s.parameters)==null?void 0:p.docs)==null?void 0:u.source}}};var m,x,g;t.parameters={...t.parameters,docs:{...(m=t.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    icon: <Icon />,
    disabled: true
  }
}`,...(g=(x=t.parameters)==null?void 0:x.docs)==null?void 0:g.source}}};var j,b,f;n.parameters={...n.parameters,docs:{...(j=n.parameters)==null?void 0:j.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    gap: "12px"
  }}>
      <ButtonControl icon={<Icon />} />
      <ButtonControl icon={<Icon />} selected />
      <ButtonControl icon={<Icon />} disabled />
    </div>
}`,...(f=(b=n.parameters)==null?void 0:b.docs)==null?void 0:f.source}}};const I=["Default","Selected","Disabled","AllStates"];export{n as AllStates,r as Default,t as Disabled,s as Selected,I as __namedExportsOrder,B as default};
