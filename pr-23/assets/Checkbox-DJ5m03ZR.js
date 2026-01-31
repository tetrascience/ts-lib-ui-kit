import{j as a}from"./jsx-runtime-CDt2p4po.js";import{r as m}from"./index-GiUgBvb1.js";import{a as n}from"./styled-components.browser.esm-Ctfm6iBV.js";import{I as h,a as x}from"./Icon-CuK57VyF.js";const b=n.label`
  display: inline-flex;
  align-items: center;
  cursor: ${e=>e.disabled?"not-allowed":"pointer"};
  opacity: ${e=>e.disabled?.6:1};
  padding: ${e=>e.$noPadding?"0":"12px 16px"};
  width: 100%;
`,g=n.input.attrs({type:"checkbox"})`
  position: absolute;
  opacity: 0;
  height: 0;
  width: 0;
`,y=n.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: ${e=>e.checked?"var(--blue-600)":"var(--white-900)"};
  border: 1px solid
    ${e=>e.checked?"var(--blue-600)":"var(--grey-300)"};
  border-radius: 3px;
  transition: all 0.2s;

  ${e=>!e.disabled&&`
		&:hover {
			border-color: var(--blue-600);
		}
	`}
`,v=()=>a.jsx(h,{name:x.CHECK_SQUARE,fill:"var(--blue-600)"}),k=n.span`
  margin-left: 10px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
`,l=m.forwardRef(({checked:e=!1,onChange:s,disabled:t=!1,className:d,onClick:i,label:r,noPadding:c=!1},p)=>{const u=o=>{!t&&s&&s(o.target.checked)},f=o=>{i&&i(o)};return a.jsxs(b,{className:d,disabled:t,$noPadding:c,onClick:f,children:[a.jsx(g,{ref:p,checked:e,onChange:u,disabled:t}),a.jsx(y,{checked:e,disabled:t,children:e&&a.jsx(v,{})}),r&&a.jsx(k,{children:r})]})});l.displayName="Checkbox";l.__docgenInfo={description:"",methods:[],displayName:"Checkbox",props:{checked:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},onChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(checked: boolean) => void",signature:{arguments:[{type:{name:"boolean"},name:"checked"}],return:{name:"void"}}},description:""},disabled:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},className:{required:!1,tsType:{name:"string"},description:""},onClick:{required:!1,tsType:{name:"signature",type:"function",raw:"(e: React.MouseEvent) => void",signature:{arguments:[{type:{name:"ReactMouseEvent",raw:"React.MouseEvent"},name:"e"}],return:{name:"void"}}},description:""},label:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},noPadding:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}}}};export{l as C};
