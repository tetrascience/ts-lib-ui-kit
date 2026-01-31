import{j as e}from"./jsx-runtime-CDt2p4po.js";import{r as U}from"./index-GiUgBvb1.js";import{a as z}from"./styled-components.browser.esm-Ctfm6iBV.js";import{I as X}from"./Input-_GCDQAcJ.js";import{L as Y}from"./Label-CgQZm6So.js";import{S as $}from"./SupportiveText-Klu8_67U.js";import"./Icon-CuK57VyF.js";import"./Tooltip-DeRvpXCR.js";const ee=z.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`,re=z(Y)`
  margin-bottom: 2px;
`,d=U.forwardRef(({label:N,infoText:O,supportiveText:h,showSupportiveCheck:G=!1,className:J,...K},Q)=>e.jsxs(ee,{className:J,children:[e.jsx(re,{infoText:O,children:N}),e.jsx(X,{ref:Q,...K}),h&&e.jsx($,{showCheck:G,children:h})]}));d.displayName="FormField";d.__docgenInfo={description:"",methods:[],displayName:"FormField",props:{label:{required:!0,tsType:{name:"string"},description:""},infoText:{required:!1,tsType:{name:"string"},description:""},supportiveText:{required:!1,tsType:{name:"string"},description:""},showSupportiveCheck:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},className:{required:!1,tsType:{name:"string"},description:""}},composes:["Omit"]};const ce={title:"Molecules/FormField",component:d,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{size:{control:"select",options:["xsmall","small"],defaultValue:"small"},disabled:{control:"boolean"},error:{control:"boolean"},showSupportiveCheck:{control:"boolean"}}},r={args:{label:"Label",placeholder:"Placeholder"}},o={args:{label:"Label",infoText:"This is some helpful information about this field",placeholder:"Placeholder"}},l={args:{label:"Label",placeholder:"Placeholder",supportiveText:"Supportive Text"}},a={args:{label:"Label",placeholder:"Placeholder",supportiveText:"Supportive Text",showSupportiveCheck:!0}},t={args:{label:"Label",placeholder:"Placeholder",supportiveText:"Error message goes here",error:!0}},s={args:{label:"Label",placeholder:"Placeholder",supportiveText:"Supportive Text",iconLeft:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 16 16",fill:"none",children:e.jsx("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8ZM9 5C9 5.55228 8.55228 6 8 6C7.44772 6 7 5.55228 7 5C7 4.44772 7.44772 4 8 4C8.55228 4 9 4.44772 9 5ZM6.75 8C6.33579 8 6 8.33579 6 8.75C6 9.16421 6.33579 9.5 6.75 9.5H7.5V11.25C7.5 11.6642 7.83579 12 8.25 12C8.66421 12 9 11.6642 9 11.25V8.75C9 8.33579 8.66421 8 8.25 8H6.75Z",fill:"currentColor"})})}},i={args:{label:"Label",placeholder:"Placeholder",supportiveText:"Supportive Text",iconRight:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 16 16",fill:"none",children:e.jsx("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M12.8536 5.35355C13.0488 5.15829 13.0488 4.84171 12.8536 4.64645C12.6583 4.45118 12.3417 4.45118 12.1464 4.64645L8 8.79289L3.85355 4.64645C3.65829 4.45118 3.34171 4.45118 3.14645 4.64645C2.95118 4.84171 2.95118 5.15829 3.14645 5.35355L7.64645 9.85355C7.84171 10.0488 8.15829 10.0488 8.35355 9.85355L12.8536 5.35355Z",fill:"currentColor"})})}},n={args:{label:"Label",placeholder:"Placeholder",supportiveText:"This field is disabled",disabled:!0}},p={args:{label:"Label",infoText:"Additional information about this field",placeholder:"Placeholder",supportiveText:"Supportive Text with information",size:"small"}},c={args:{label:"Label",placeholder:"Placeholder",iconRight:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 16 16",fill:"none",children:e.jsx("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M12.8536 5.35355C13.0488 5.15829 13.0488 4.84171 12.8536 4.64645C12.6583 4.45118 12.3417 4.45118 12.1464 4.64645L8 8.79289L3.85355 4.64645C3.65829 4.45118 3.34171 4.45118 3.14645 4.64645C2.95118 4.84171 2.95118 5.15829 3.14645 5.35355L7.64645 9.85355C7.84171 10.0488 8.15829 10.0488 8.35355 9.85355L12.8536 5.35355Z",fill:"currentColor"})}),supportiveText:"Select an option from the dropdown"}};var u,m,g;r.parameters={...r.parameters,docs:{...(u=r.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    label: "Label",
    placeholder: "Placeholder"
  }
}`,...(g=(m=r.parameters)==null?void 0:m.docs)==null?void 0:g.source}}};var v,f,x;o.parameters={...o.parameters,docs:{...(v=o.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    label: "Label",
    infoText: "This is some helpful information about this field",
    placeholder: "Placeholder"
  }
}`,...(x=(f=o.parameters)==null?void 0:f.docs)==null?void 0:x.source}}};var C,b,w;l.parameters={...l.parameters,docs:{...(C=l.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    label: "Label",
    placeholder: "Placeholder",
    supportiveText: "Supportive Text"
  }
}`,...(w=(b=l.parameters)==null?void 0:b.docs)==null?void 0:w.source}}};var T,L,S;a.parameters={...a.parameters,docs:{...(T=a.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    label: "Label",
    placeholder: "Placeholder",
    supportiveText: "Supportive Text",
    showSupportiveCheck: true
  }
}`,...(S=(L=a.parameters)==null?void 0:L.docs)==null?void 0:S.source}}};var P,R,j;t.parameters={...t.parameters,docs:{...(P=t.parameters)==null?void 0:P.docs,source:{originalSource:`{
  args: {
    label: "Label",
    placeholder: "Placeholder",
    supportiveText: "Error message goes here",
    error: true
  }
}`,...(j=(R=t.parameters)==null?void 0:R.docs)==null?void 0:j.source}}};var W,y,M;s.parameters={...s.parameters,docs:{...(W=s.parameters)==null?void 0:W.docs,source:{originalSource:`{
  args: {
    label: "Label",
    placeholder: "Placeholder",
    supportiveText: "Supportive Text",
    iconLeft: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8ZM9 5C9 5.55228 8.55228 6 8 6C7.44772 6 7 5.55228 7 5C7 4.44772 7.44772 4 8 4C8.55228 4 9 4.44772 9 5ZM6.75 8C6.33579 8 6 8.33579 6 8.75C6 9.16421 6.33579 9.5 6.75 9.5H7.5V11.25C7.5 11.6642 7.83579 12 8.25 12C8.66421 12 9 11.6642 9 11.25V8.75C9 8.33579 8.66421 8 8.25 8H6.75Z" fill="currentColor" />
      </svg>
  }
}`,...(M=(y=s.parameters)==null?void 0:y.docs)==null?void 0:M.source}}};var F,Z,I;i.parameters={...i.parameters,docs:{...(F=i.parameters)==null?void 0:F.docs,source:{originalSource:`{
  args: {
    label: "Label",
    placeholder: "Placeholder",
    supportiveText: "Supportive Text",
    iconRight: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M12.8536 5.35355C13.0488 5.15829 13.0488 4.84171 12.8536 4.64645C12.6583 4.45118 12.3417 4.45118 12.1464 4.64645L8 8.79289L3.85355 4.64645C3.65829 4.45118 3.34171 4.45118 3.14645 4.64645C2.95118 4.84171 2.95118 5.15829 3.14645 5.35355L7.64645 9.85355C7.84171 10.0488 8.15829 10.0488 8.35355 9.85355L12.8536 5.35355Z" fill="currentColor" />
      </svg>
  }
}`,...(I=(Z=i.parameters)==null?void 0:Z.docs)==null?void 0:I.source}}};var k,E,B;n.parameters={...n.parameters,docs:{...(k=n.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    label: "Label",
    placeholder: "Placeholder",
    supportiveText: "This field is disabled",
    disabled: true
  }
}`,...(B=(E=n.parameters)==null?void 0:E.docs)==null?void 0:B.source}}};var V,q,A;p.parameters={...p.parameters,docs:{...(V=p.parameters)==null?void 0:V.docs,source:{originalSource:`{
  args: {
    label: "Label",
    infoText: "Additional information about this field",
    placeholder: "Placeholder",
    supportiveText: "Supportive Text with information",
    size: "small"
  }
}`,...(A=(q=p.parameters)==null?void 0:q.docs)==null?void 0:A.source}}};var D,H,_;c.parameters={...c.parameters,docs:{...(D=c.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    label: "Label",
    placeholder: "Placeholder",
    iconRight: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M12.8536 5.35355C13.0488 5.15829 13.0488 4.84171 12.8536 4.64645C12.6583 4.45118 12.3417 4.45118 12.1464 4.64645L8 8.79289L3.85355 4.64645C3.65829 4.45118 3.34171 4.45118 3.14645 4.64645C2.95118 4.84171 2.95118 5.15829 3.14645 5.35355L7.64645 9.85355C7.84171 10.0488 8.15829 10.0488 8.35355 9.85355L12.8536 5.35355Z" fill="currentColor" />
      </svg>,
    supportiveText: "Select an option from the dropdown"
  }
}`,...(_=(H=c.parameters)==null?void 0:H.docs)==null?void 0:_.source}}};const de=["Default","WithInfoText","WithSupportiveText","WithSupportiveCheck","WithError","WithIconLeft","WithIconRight","Disabled","Complete","AsSelect"];export{c as AsSelect,p as Complete,r as Default,n as Disabled,t as WithError,s as WithIconLeft,i as WithIconRight,o as WithInfoText,a as WithSupportiveCheck,l as WithSupportiveText,de as __namedExportsOrder,ce as default};
