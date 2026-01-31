import{j as e}from"./jsx-runtime-CDt2p4po.js";import{r as u}from"./index-GiUgBvb1.js";import{C as l}from"./Checkbox-DJ5m03ZR.js";import"./styled-components.browser.esm-Ctfm6iBV.js";import"./Icon-CuK57VyF.js";const K={title:"Atoms/Checkbox",component:l,parameters:{layout:"centered"},tags:["autodocs"]},d={args:{checked:!1,label:"Unchecked option"}},o={args:{checked:!0,label:"Checked option"}},r={args:{checked:!1}},n={args:{checked:!1,disabled:!0,label:"Disabled option"}},t={args:{checked:!0,disabled:!0,label:"Disabled checked option"}},i={args:{checked:!1,label:"No padding option",noPadding:!0}},c=()=>{const[a,h]=u.useState(!1);return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"10px"},children:[e.jsx(l,{checked:a,onChange:p=>h(p),label:"Click me to toggle"}),e.jsxs("div",{children:["Checkbox is ",a?"checked":"unchecked"]})]})},s=()=>{const[a,h]=u.useState(!1),[p,q]=u.useState(!1);return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"10px",border:"1px dashed #ccc",width:"300px"},children:[e.jsx("div",{style:{borderBottom:"1px solid #eee"},children:e.jsx(l,{checked:a,onChange:k=>h(k),label:"With default padding"})}),e.jsx("div",{children:e.jsx(l,{checked:p,onChange:k=>q(k),label:"With no padding",noPadding:!0})})]})};c.__docgenInfo={description:"",methods:[],displayName:"Interactive"};s.__docgenInfo={description:"",methods:[],displayName:"ComparisonWithAndWithoutPadding"};var m,g,b;d.parameters={...d.parameters,docs:{...(m=d.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    checked: false,
    label: "Unchecked option"
  }
}`,...(b=(g=d.parameters)==null?void 0:g.docs)==null?void 0:b.source}}};var C,x,f;o.parameters={...o.parameters,docs:{...(C=o.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    checked: true,
    label: "Checked option"
  }
}`,...(f=(x=o.parameters)==null?void 0:x.docs)==null?void 0:f.source}}};var v,S,y;r.parameters={...r.parameters,docs:{...(v=r.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    checked: false
  }
}`,...(y=(S=r.parameters)==null?void 0:S.docs)==null?void 0:y.source}}};var D,W,j;n.parameters={...n.parameters,docs:{...(D=n.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    checked: false,
    disabled: true,
    label: "Disabled option"
  }
}`,...(j=(W=n.parameters)==null?void 0:W.docs)==null?void 0:j.source}}};var P,N,_;t.parameters={...t.parameters,docs:{...(P=t.parameters)==null?void 0:P.docs,source:{originalSource:`{
  args: {
    checked: true,
    disabled: true,
    label: "Disabled checked option"
  }
}`,...(_=(N=t.parameters)==null?void 0:N.docs)==null?void 0:_.source}}};var I,A,U;i.parameters={...i.parameters,docs:{...(I=i.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    checked: false,
    label: "No padding option",
    noPadding: true
  }
}`,...(U=(A=i.parameters)==null?void 0:A.docs)==null?void 0:U.source}}};var E,w,B;c.parameters={...c.parameters,docs:{...(E=c.parameters)==null?void 0:E.docs,source:{originalSource:`() => {
  const [checked, setChecked] = useState(false);
  return <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  }}>
      <Checkbox checked={checked} onChange={isChecked => setChecked(isChecked)} label="Click me to toggle" />
      <div>Checkbox is {checked ? "checked" : "unchecked"}</div>
    </div>;
}`,...(B=(w=c.parameters)==null?void 0:w.docs)==null?void 0:B.source}}};var L,O,R;s.parameters={...s.parameters,docs:{...(L=s.parameters)==null?void 0:L.docs,source:{originalSource:`() => {
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(false);
  return <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    border: "1px dashed #ccc",
    width: "300px"
  }}>
      <div style={{
      borderBottom: "1px solid #eee"
    }}>
        <Checkbox checked={checked1} onChange={isChecked => setChecked1(isChecked)} label="With default padding" />
      </div>
      <div>
        <Checkbox checked={checked2} onChange={isChecked => setChecked2(isChecked)} label="With no padding" noPadding={true} />
      </div>
    </div>;
}`,...(R=(O=s.parameters)==null?void 0:O.docs)==null?void 0:R.source}}};const M=["Unchecked","Checked","WithoutLabel","Disabled","DisabledChecked","NoPadding","Interactive","ComparisonWithAndWithoutPadding"];export{o as Checked,s as ComparisonWithAndWithoutPadding,n as Disabled,t as DisabledChecked,c as Interactive,i as NoPadding,d as Unchecked,r as WithoutLabel,M as __namedExportsOrder,K as default};
