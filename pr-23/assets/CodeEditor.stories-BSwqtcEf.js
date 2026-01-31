import{j as f}from"./jsx-runtime-CDt2p4po.js";import{R as j}from"./index-GiUgBvb1.js";import{C as x}from"./CodeEditor-fKz404PR.js";import"./iframe-BAqoMiQf.js";import"./styled-components.browser.esm-Ctfm6iBV.js";import"./Button-tnMIwByE.js";import"./Icon-CuK57VyF.js";import"./Tooltip-DeRvpXCR.js";const M={title:"Atoms/CodeEditor",component:x,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{language:{control:{type:"select"},options:["python","javascript","json","markdown"]},theme:{control:{type:"select"},options:["dark","light"]},height:{control:{type:"number"}},width:{control:{type:"text"}},label:{control:{type:"text"}},onChange:{action:"changed"},onCopy:{action:"copied"},onLaunch:{action:"launched"}}},t={onCopy:e=>{navigator.clipboard.writeText(e),console.log("Code copied to clipboard")},onLaunch:e=>{console.log("Launching code:",e)}},o={args:{value:"print('Hello, world!')",language:"python",theme:"dark",height:400,width:"400px",label:"Description",...t}},n={args:{value:"console.log('Hello, world!')",language:"javascript",height:400,width:"400px",label:"Description",theme:"light",...t}},a={args:{value:`import React, { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);
  
  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

export default Counter;`,language:"javascript",height:400,width:"600px",label:"React Counter Component",theme:"dark",...t}},E=e=>{const[w,y]=j.useState(e.value);return f.jsx(x,{...e,value:w,onChange:b=>y(b??""),onCopy:e.onCopy||t.onCopy,onLaunch:e.onLaunch||t.onLaunch})},r={render:e=>f.jsx(E,{...e}),args:{value:"print('Hello, world!')",language:"python",height:400,width:"400px",label:"Description"}};var c,s,l;o.parameters={...o.parameters,docs:{...(c=o.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    value: "print('Hello, world!')",
    language: "python",
    theme: "dark",
    height: 400,
    width: "400px",
    label: "Description",
    ...defaultHandlers
  }
}`,...(l=(s=o.parameters)==null?void 0:s.docs)==null?void 0:l.source}}};var u,i,p;n.parameters={...n.parameters,docs:{...(u=n.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    value: "console.log('Hello, world!')",
    language: "javascript",
    height: 400,
    width: "400px",
    label: "Description",
    theme: "light",
    ...defaultHandlers
  }
}`,...(p=(i=n.parameters)==null?void 0:i.docs)==null?void 0:p.source}}};var d,h,m;a.parameters={...a.parameters,docs:{...(d=a.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    value: \`import React, { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    document.title = \\\`Count: \\\${count}\\\`;
  }, [count]);
  
  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

export default Counter;\`,
    language: "javascript",
    height: 400,
    width: "600px",
    label: "React Counter Component",
    theme: "dark",
    ...defaultHandlers
  }
}`,...(m=(h=a.parameters)==null?void 0:h.docs)==null?void 0:m.source}}};var g,C,v;r.parameters={...r.parameters,docs:{...(g=r.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: args => <InteractiveComponent {...args} />,
  args: {
    value: "print('Hello, world!')",
    language: "python",
    height: 400,
    width: "400px",
    label: "Description"
  }
}`,...(v=(C=r.parameters)==null?void 0:C.docs)==null?void 0:v.source}}};const T=["Default","LightMode","ReactJavascriptExample","Interactive"];export{o as Default,r as Interactive,n as LightMode,a as ReactJavascriptExample,T as __namedExportsOrder,M as default};
