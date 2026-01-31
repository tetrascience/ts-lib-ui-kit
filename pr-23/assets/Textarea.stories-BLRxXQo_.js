import{j as i}from"./jsx-runtime-CDt2p4po.js";import{r as X}from"./index-GiUgBvb1.js";import{a as D,r as c}from"./styled-components.browser.esm-Ctfm6iBV.js";const A={xsmall:c`
    min-height: ${e=>e.rows?"auto":"80px"};
    padding: 10px;
  `,small:c`
    min-height: ${e=>e.rows?"auto":"100px"};
    padding: 12px;
  `},C=D.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  width: ${e=>e.$fullWidth?"100%":"auto"};
  gap: 8px;
`,B=D.textarea`
  width: 100%;
  border-radius: 6px;
  font-family: "Inter", sans-serif;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
  border: 1px solid
    ${e=>e.$error?"var(--red-error)":(e.disabled,"var(--grey-300)")};
  background-color: ${e=>e.disabled?"var(--grey-200)":"var(--white-900)"};
  color: ${e=>e.disabled?"var(--grey-400)":"var(--black-900)"};
  transition: all 0.2s;
  resize: vertical;
  font-size: 14px;

  ${e=>A[e.size||"small"]}

  &:hover:not(:disabled):not(:focus) {
    border-color: ${e=>e.$error?"var(--red-error)":"var(--blue-600)"};
  }

  &:focus {
    outline: none;
    box-shadow: 0px 0px 0px 1px var(--white-900),
      0px 0px 0px 3px var(--blue-600);
    border-color: ${e=>e.$error?"var(--red-error)":"var(--blue-600)"};
  }

  &:active {
    outline: none;
    box-shadow: 0px 0px 0px 2px var(--blue-200);
    border-color: ${e=>e.$error?"var(--red-error)":"var(--blue-600)"};
  }

  &:disabled {
    cursor: not-allowed;
    user-select: none;
    pointer-events: none;
  }

  &::placeholder {
    color: var(--grey-400);
  }
`,d=X.forwardRef(({size:e="small",error:F=!1,disabled:_=!1,fullWidth:I=!1,rows:N,...O},R)=>i.jsx(C,{$fullWidth:I,children:i.jsx(B,{ref:R,size:e,$error:F,disabled:_,rows:N,...O})}));d.displayName="Textarea";d.__docgenInfo={description:"",methods:[],displayName:"Textarea",props:{size:{required:!1,tsType:{name:"union",raw:'"xsmall" | "small"',elements:[{name:"literal",value:'"xsmall"'},{name:"literal",value:'"small"'}]},description:"",defaultValue:{value:'"small"',computed:!1}},error:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},disabled:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},fullWidth:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},rows:{required:!1,tsType:{name:"number"},description:""}},composes:["Omit"]};const K={title:"Atoms/Textarea",component:d,parameters:{layout:"centered"},tags:["autodocs"]},r={args:{placeholder:"Enter text here..."}},a={args:{placeholder:"Enter text here...",size:"xsmall"}},s={args:{placeholder:"Enter text here...",size:"small"}},t={args:{placeholder:"This textarea is disabled",disabled:!0}},o={args:{placeholder:"Enter text here...",error:!0}},l={args:{defaultValue:"This is a textarea with some initial value that shows how the text would look when filled in by the user.",rows:5}},n={args:{placeholder:"Full width textarea",fullWidth:!0},parameters:{layout:"padded"}};var p,u,m;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    placeholder: "Enter text here..."
  }
}`,...(m=(u=r.parameters)==null?void 0:u.docs)==null?void 0:m.source}}};var h,x,f;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    placeholder: "Enter text here...",
    size: "xsmall"
  }
}`,...(f=(x=a.parameters)==null?void 0:x.docs)==null?void 0:f.source}}};var g,b,v;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    placeholder: "Enter text here...",
    size: "small"
  }
}`,...(v=(b=s.parameters)==null?void 0:b.docs)==null?void 0:v.source}}};var w,y,$;t.parameters={...t.parameters,docs:{...(w=t.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    placeholder: "This textarea is disabled",
    disabled: true
  }
}`,...($=(y=t.parameters)==null?void 0:y.docs)==null?void 0:$.source}}};var T,E,S;o.parameters={...o.parameters,docs:{...(T=o.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    placeholder: "Enter text here...",
    error: true
  }
}`,...(S=(E=o.parameters)==null?void 0:E.docs)==null?void 0:S.source}}};var z,W,V;l.parameters={...l.parameters,docs:{...(z=l.parameters)==null?void 0:z.docs,source:{originalSource:`{
  args: {
    defaultValue: "This is a textarea with some initial value that shows how the text would look when filled in by the user.",
    rows: 5
  }
}`,...(V=(W=l.parameters)==null?void 0:W.docs)==null?void 0:V.source}}};var q,j,k;n.parameters={...n.parameters,docs:{...(q=n.parameters)==null?void 0:q.docs,source:{originalSource:`{
  args: {
    placeholder: "Full width textarea",
    fullWidth: true
  },
  parameters: {
    layout: "padded"
  }
}`,...(k=(j=n.parameters)==null?void 0:j.docs)==null?void 0:k.source}}};const L=["Default","XSmall","Small","Disabled","Error","WithValue","FullWidth"];export{r as Default,t as Disabled,o as Error,n as FullWidth,s as Small,l as WithValue,a as XSmall,L as __namedExportsOrder,K as default};
