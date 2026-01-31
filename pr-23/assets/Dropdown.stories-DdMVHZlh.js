import{j as e}from"./jsx-runtime-CDt2p4po.js";import{r as K}from"./index-GiUgBvb1.js";import{D as r}from"./Dropdown-B2J4SVee.js";import"./styled-components.browser.esm-Ctfm6iBV.js";import"./Icon-CuK57VyF.js";const $={title:"Atoms/Dropdown",component:r,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{disabled:{control:{type:"boolean"}},error:{control:{type:"boolean"}},size:{control:{type:"select"},options:["small","xsmall"]}}},o=[{value:"v0.0.1",label:"v0.0.1"},{value:"v0.0.2",label:"v0.0.2"},{value:"v0.0.3",label:"v0.0.3"},{value:"v0.0.4",label:"v0.0.4",disabled:!0},{value:"v0.0.5",label:"v0.0.5"}],a={args:{options:o,placeholder:"Placeholder",size:"small"}},s={args:{options:o,placeholder:"Placeholder",size:"xsmall"}},l={args:{options:o,placeholder:"Placeholder",size:"small"}},n={args:{options:o,value:"v0.0.1",placeholder:"Placeholder"}},t={args:{options:o,value:"v0.0.1",disabled:!0,placeholder:"Placeholder"}},i={args:{options:o,error:!0,placeholder:"Placeholder"}},p={args:{options:o,placeholder:"Placeholder"}},d={args:{options:[],placeholder:"No options available"}},L=()=>{const[m,H]=K.useState("v0.0.1");return e.jsxs("div",{style:{width:"200px"},children:[e.jsxs("p",{children:["Selected value: ",m]}),e.jsx(r,{options:o,value:m,onChange:J=>H(J),placeholder:"Select version"})]})},c={render:()=>e.jsx(L,{})},h={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",width:"200px"},children:[e.jsxs("div",{children:[e.jsx("h4",{children:"Small (36px)"}),e.jsx(r,{options:o,placeholder:"Placeholder",size:"small"})]}),e.jsxs("div",{children:[e.jsx("h4",{children:"Extra Small (32px)"}),e.jsx(r,{options:o,placeholder:"Placeholder",size:"xsmall"})]}),e.jsxs("div",{children:[e.jsx("h4",{children:"With Value"}),e.jsx(r,{options:o,value:"v0.0.1",placeholder:"Placeholder"})]}),e.jsxs("div",{children:[e.jsx("h4",{children:"With Error"}),e.jsx(r,{options:o,placeholder:"Placeholder",error:!0})]}),e.jsxs("div",{children:[e.jsx("h4",{children:"Disabled"}),e.jsx(r,{options:o,placeholder:"Placeholder",disabled:!0})]}),e.jsxs("div",{children:[e.jsx("h4",{children:"With Disabled Option Selected"}),e.jsx(r,{options:o,value:"v0.0.4",placeholder:"Placeholder"})]}),e.jsxs("div",{children:[e.jsx("h4",{children:"No Data"}),e.jsx(r,{options:[],placeholder:"No options available"})]})]})};var u,v,x;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    options: sampleOptions,
    placeholder: "Placeholder",
    size: "small"
  }
}`,...(x=(v=a.parameters)==null?void 0:v.docs)==null?void 0:x.source}}};var g,j,b;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    options: sampleOptions,
    placeholder: "Placeholder",
    size: "xsmall"
  }
}`,...(b=(j=s.parameters)==null?void 0:j.docs)==null?void 0:b.source}}};var D,P,S;l.parameters={...l.parameters,docs:{...(D=l.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    options: sampleOptions,
    placeholder: "Placeholder",
    size: "small"
  }
}`,...(S=(P=l.parameters)==null?void 0:P.docs)==null?void 0:S.source}}};var O,w,W;n.parameters={...n.parameters,docs:{...(O=n.parameters)==null?void 0:O.docs,source:{originalSource:`{
  args: {
    options: sampleOptions,
    value: "v0.0.1",
    placeholder: "Placeholder"
  }
}`,...(W=(w=n.parameters)==null?void 0:w.docs)==null?void 0:W.source}}};var z,E,f;t.parameters={...t.parameters,docs:{...(z=t.parameters)==null?void 0:z.docs,source:{originalSource:`{
  args: {
    options: sampleOptions,
    value: "v0.0.1",
    disabled: true,
    placeholder: "Placeholder"
  }
}`,...(f=(E=t.parameters)==null?void 0:E.docs)==null?void 0:f.source}}};var y,N,V;i.parameters={...i.parameters,docs:{...(y=i.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    options: sampleOptions,
    error: true,
    placeholder: "Placeholder"
  }
}`,...(V=(N=i.parameters)==null?void 0:N.docs)==null?void 0:V.source}}};var I,A,T;p.parameters={...p.parameters,docs:{...(I=p.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    options: sampleOptions,
    placeholder: "Placeholder"
  }
}`,...(T=(A=p.parameters)==null?void 0:A.docs)==null?void 0:T.source}}};var X,_,C;d.parameters={...d.parameters,docs:{...(X=d.parameters)==null?void 0:X.docs,source:{originalSource:`{
  args: {
    options: [],
    placeholder: "No options available"
  }
}`,...(C=(_=d.parameters)==null?void 0:_.docs)==null?void 0:C.source}}};var R,k,q;c.parameters={...c.parameters,docs:{...(R=c.parameters)==null?void 0:R.docs,source:{originalSource:`{
  render: () => <InteractiveExample />
}`,...(q=(k=c.parameters)==null?void 0:k.docs)==null?void 0:q.source}}};var B,F,G;h.parameters={...h.parameters,docs:{...(B=h.parameters)==null?void 0:B.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    width: "200px"
  }}>
            <div>
                <h4>Small (36px)</h4>
                <Dropdown options={sampleOptions} placeholder="Placeholder" size="small" />
            </div>

            <div>
                <h4>Extra Small (32px)</h4>
                <Dropdown options={sampleOptions} placeholder="Placeholder" size="xsmall" />
            </div>

            <div>
                <h4>With Value</h4>
                <Dropdown options={sampleOptions} value="v0.0.1" placeholder="Placeholder" />
            </div>

            <div>
                <h4>With Error</h4>
                <Dropdown options={sampleOptions} placeholder="Placeholder" error={true} />
            </div>

            <div>
                <h4>Disabled</h4>
                <Dropdown options={sampleOptions} placeholder="Placeholder" disabled={true} />
            </div>

            <div>
                <h4>With Disabled Option Selected</h4>
                <Dropdown options={sampleOptions} value="v0.0.4" // This is a disabled option
      placeholder="Placeholder" />
            </div>

            <div>
                <h4>No Data</h4>
                <Dropdown options={[]} placeholder="No options available" />
            </div>
        </div>
}`,...(G=(F=h.parameters)==null?void 0:F.docs)==null?void 0:G.source}}};const ee=["Default","XSmall","Small","WithValue","Disabled","WithError","WithDisabledOption","NoData","Interactive","AllVariants"];export{h as AllVariants,a as Default,t as Disabled,c as Interactive,d as NoData,l as Small,p as WithDisabledOption,i as WithError,n as WithValue,s as XSmall,ee as __namedExportsOrder,$ as default};
