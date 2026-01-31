import{j as o}from"./jsx-runtime-CDt2p4po.js";import{r as B}from"./index-GiUgBvb1.js";import{a as z}from"./styled-components.browser.esm-Ctfm6iBV.js";import{D as G}from"./Dropdown-B2J4SVee.js";import{L as H}from"./Label-CgQZm6So.js";import{S as J}from"./SupportiveText-Klu8_67U.js";import"./Icon-CuK57VyF.js";import"./Tooltip-DeRvpXCR.js";const K=z.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`,Q=z(H)`
  margin-bottom: 2px;
`,c=B.forwardRef(({label:I,infoText:N,supportiveText:d,showSupportiveCheck:A=!1,className:P,...R},M)=>o.jsxs(K,{className:P,ref:M,children:[o.jsx(Q,{infoText:N,children:I}),o.jsx(G,{...R}),d&&o.jsx(J,{showCheck:A,children:d})]}));c.displayName="SelectField";c.__docgenInfo={description:"",methods:[],displayName:"SelectField",props:{label:{required:!0,tsType:{name:"string"},description:""},infoText:{required:!1,tsType:{name:"string"},description:""},supportiveText:{required:!1,tsType:{name:"string"},description:""},showSupportiveCheck:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},className:{required:!1,tsType:{name:"string"},description:""}},composes:["Omit"]};const ae={title:"Molecules/SelectField",component:c,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{size:{control:"select",options:["xsmall","small"],defaultValue:"small"},disabled:{control:"boolean"},error:{control:"boolean"},showSupportiveCheck:{control:"boolean"}}},e=[{value:"option1",label:"Option 1"},{value:"option2",label:"Option 2"},{value:"option3",label:"Option 3"},{value:"option4",label:"Option 4",disabled:!0},{value:"option5",label:"Option 5"}],t={args:{label:"Label",placeholder:"Select an option",options:e}},a={args:{label:"Label",infoText:"This is some helpful information about this field",placeholder:"Select an option",options:e}},r={args:{label:"Label",placeholder:"Select an option",supportiveText:"Supportive Text",options:e}},s={args:{label:"Label",placeholder:"Select an option",supportiveText:"Supportive Text",showSupportiveCheck:!0,options:e}},l={args:{label:"Label",placeholder:"Select an option",supportiveText:"Error message goes here",error:!0,options:e}},n={args:{label:"Label",placeholder:"Select an option",supportiveText:"This field is disabled",disabled:!0,options:e}},p={args:{label:"Label",placeholder:"Select an option",supportiveText:"Option is pre-selected",options:e,value:"option2"}},i={args:{label:"Label",infoText:"Additional information about this select field",placeholder:"Select an option",supportiveText:"Please select an option from the dropdown",options:e,size:"small"}};var u,m,b;t.parameters={...t.parameters,docs:{...(u=t.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    label: "Label",
    placeholder: "Select an option",
    options: sampleOptions
  }
}`,...(b=(m=t.parameters)==null?void 0:m.docs)==null?void 0:b.source}}};var h,f,S;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    label: "Label",
    infoText: "This is some helpful information about this field",
    placeholder: "Select an option",
    options: sampleOptions
  }
}`,...(S=(f=a.parameters)==null?void 0:f.docs)==null?void 0:S.source}}};var x,g,T;r.parameters={...r.parameters,docs:{...(x=r.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    label: "Label",
    placeholder: "Select an option",
    supportiveText: "Supportive Text",
    options: sampleOptions
  }
}`,...(T=(g=r.parameters)==null?void 0:g.docs)==null?void 0:T.source}}};var v,L,O;s.parameters={...s.parameters,docs:{...(v=s.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    label: "Label",
    placeholder: "Select an option",
    supportiveText: "Supportive Text",
    showSupportiveCheck: true,
    options: sampleOptions
  }
}`,...(O=(L=s.parameters)==null?void 0:L.docs)==null?void 0:O.source}}};var y,w,C;l.parameters={...l.parameters,docs:{...(y=l.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    label: "Label",
    placeholder: "Select an option",
    supportiveText: "Error message goes here",
    error: true,
    options: sampleOptions
  }
}`,...(C=(w=l.parameters)==null?void 0:w.docs)==null?void 0:C.source}}};var W,D,k;n.parameters={...n.parameters,docs:{...(W=n.parameters)==null?void 0:W.docs,source:{originalSource:`{
  args: {
    label: "Label",
    placeholder: "Select an option",
    supportiveText: "This field is disabled",
    disabled: true,
    options: sampleOptions
  }
}`,...(k=(D=n.parameters)==null?void 0:D.docs)==null?void 0:k.source}}};var E,j,q;p.parameters={...p.parameters,docs:{...(E=p.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    label: "Label",
    placeholder: "Select an option",
    supportiveText: "Option is pre-selected",
    options: sampleOptions,
    value: "option2"
  }
}`,...(q=(j=p.parameters)==null?void 0:j.docs)==null?void 0:q.source}}};var F,V,_;i.parameters={...i.parameters,docs:{...(F=i.parameters)==null?void 0:F.docs,source:{originalSource:`{
  args: {
    label: "Label",
    infoText: "Additional information about this select field",
    placeholder: "Select an option",
    supportiveText: "Please select an option from the dropdown",
    options: sampleOptions,
    size: "small"
  }
}`,...(_=(V=i.parameters)==null?void 0:V.docs)==null?void 0:_.source}}};const re=["Default","WithInfoText","WithSupportiveText","WithSupportiveCheck","WithError","Disabled","WithDefaultValue","Complete"];export{i as Complete,t as Default,n as Disabled,p as WithDefaultValue,l as WithError,a as WithInfoText,s as WithSupportiveCheck,r as WithSupportiveText,re as __namedExportsOrder,ae as default};
