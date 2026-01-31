import{j as o}from"./jsx-runtime-CDt2p4po.js";import{r as g}from"./index-GiUgBvb1.js";import{a as n}from"./styled-components.browser.esm-Ctfm6iBV.js";import{C as x}from"./Checkbox-DJ5m03ZR.js";const h=n.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  gap: 10px;
  color: ${e=>e.$active?"var(--blue-900)":"var(--grey-600)"};
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  border-bottom: 1px solid var(--grey-200);
  background-color: ${e=>e.$active?"var(--grey-100)":"var(--white-900)"};
  padding: ${e=>e.$showCheckbox?"0":"12px 16px"};

  &:hover {
    background-color: ${e=>e.$active?"var(--grey-100)":"var(--grey-50)"};
  }

  &:last-child {
    border-bottom: none;
  }
`,v=n.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`,y=n.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex: 1;
  width: 100%;
`,l=g.forwardRef(({label:e,checked:c=!1,showCheckbox:a=!1,onClick:r,onCheckChange:s,active:d=!1,className:p},u)=>{const m=()=>{console.log("MenuItem clicked!"),r&&r()},f=t=>{console.log("Checkbox changed:",t),s&&s(t)},i=t=>{console.log("Checkbox clicked!"),t.stopPropagation()};return o.jsxs(h,{ref:u,$active:d,$showCheckbox:a,className:p,onClick:m,role:"button",tabIndex:0,children:[!a&&o.jsx(v,{children:e}),a&&o.jsx(y,{onClick:i,children:o.jsx(x,{checked:c,onChange:f,onClick:i,label:e})})]})});l.displayName="MenuItem";l.__docgenInfo={description:"",methods:[],displayName:"MenuItem",props:{label:{required:!0,tsType:{name:"string"},description:""},checked:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},showCheckbox:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},onClick:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onCheckChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(checked: boolean) => void",signature:{arguments:[{type:{name:"boolean"},name:"checked"}],return:{name:"void"}}},description:""},active:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},className:{required:!1,tsType:{name:"string"},description:""}}};export{l as M};
