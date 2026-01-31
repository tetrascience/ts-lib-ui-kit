import{j as r}from"./jsx-runtime-CDt2p4po.js";import{a as s,r as t}from"./styled-components.browser.esm-Ctfm6iBV.js";const l={small:t`
    font-family: "Inter", sans-serif;
    font-size: 14px;
    font-style: normal;
    font-weight: 600;
    line-height: 20px;
  `,medium:t`
    font-family: "Inter", sans-serif;
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    line-height: 24px;
  `},d=s.button`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  background: transparent;
  border: none;
  outline: none;
  cursor: ${e=>e.disabled?"not-allowed":"pointer"};
  ${e=>l[e.size]}
  color: ${e=>e.disabled?"var(--grey-400)":e.$active?"var(--blue-900)":"var(--grey-500)"};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    color: var(--blue-900);
  }

  &:after {
    content: "";
    position: absolute;
    width: 100%;
    height: 3px;
    background-color: ${e=>e.disabled?"var(--grey-400)":"var(--blue-900)"};
    bottom: 0;
    left: 0;
    opacity: ${e=>e.$active?1:0};
    transition: opacity 0.2s ease;
  }

  &:focus {
    outline: none;
    box-shadow: none;
  }
`,u=({label:e,active:a=!1,disabled:n=!1,size:i="medium",onClick:o})=>r.jsx(d,{$active:a,disabled:n,size:i,onClick:o,children:e});u.__docgenInfo={description:"",methods:[],displayName:"Tab",props:{label:{required:!0,tsType:{name:"string"},description:""},active:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},disabled:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},size:{required:!1,tsType:{name:"union",raw:'"small" | "medium"',elements:[{name:"literal",value:'"small"'},{name:"literal",value:'"medium"'}]},description:"",defaultValue:{value:'"medium"',computed:!1}},onClick:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""}}};export{u as T};
