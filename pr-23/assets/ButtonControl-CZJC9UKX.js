import{j as a}from"./jsx-runtime-CDt2p4po.js";import{a as n}from"./styled-components.browser.esm-Ctfm6iBV.js";const i=n.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: ${e=>e.selected?"var(--grey-100)":"var(--white-900)"};
  border: none;
  border-radius: 0;
  cursor: ${e=>e.disabled?"not-allowed":"pointer"};
  outline: none;
  transition: all 0.2s ease;
  padding: 0;

  &:hover:not(:disabled) {
    background-color: var(--grey-100);
  }

  &:active:not(:disabled) {
    background-color: var(--grey-100);
    outline: none;
  }

  &:focus,
  &:focus-visible {
    outline-color: var(--blue-600) !important;
  }

  &:disabled {
    opacity: 0.5;
    background-color: var(--grey-50);
    border-color: var(--grey-200);
  }

  svg {
    width: 20px;
    height: 20px;
    color: ${e=>e.disabled?"var(--grey-400)":"var(--blue-900)"};
  }
`,s=({icon:e,selected:r=!1,disabled:o=!1,onClick:t})=>a.jsx(i,{selected:r,disabled:o,onClick:o?void 0:t,children:e});s.__docgenInfo={description:"",methods:[],displayName:"ButtonControl",props:{icon:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},selected:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},disabled:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},onClick:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""}}};export{s as B};
