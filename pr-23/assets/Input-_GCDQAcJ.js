import{j as r}from"./jsx-runtime-CDt2p4po.js";import{r as x}from"./index-GiUgBvb1.js";import{a as o,r as n}from"./styled-components.browser.esm-Ctfm6iBV.js";const u={xsmall:n`
    height: 32px;
    padding: ${e=>e.$hasIconLeft&&e.$hasIconRight?"0 32px 0 32px":e.$hasIconLeft?"0 10px 0 32px":e.$hasIconRight?"0 32px 0 10px":"0 10px"};
  `,small:n`
    height: 36px;
    padding: ${e=>e.$hasIconLeft&&e.$hasIconRight?"0 38px 0 38px":e.$hasIconLeft?"0 12px 0 38px":e.$hasIconRight?"0 38px 0 12px":"0 12px"};
  `},h=o.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 100%;
  gap: 8px;
`,f=o.input`
  width: 100%;
  border-radius: 6px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
  border: 1px solid
    ${e=>e.$error?"var(--red-error)":(e.disabled,"var(--grey-300)")};
  background-color: ${e=>e.disabled?"var(--grey-200)":"var(--white-900)"};
  color: ${e=>e.disabled?"var(--grey-400)":"var(--black-900)"};
  transition: all 0.2s;

  ${e=>u[e.size||"small"]}

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
`,i=o.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  color: var(--grey-400);
  ${e=>e.position==="left"?"left: 10px;":"right: 10px;"}
  ${e=>e.size==="xsmall"?"width: 16px; height: 16px;":"width: 20px; height: 20px;"}
`,p=x.forwardRef(({size:e="small",iconLeft:a,iconRight:t,error:l=!1,disabled:s=!1,...d},c)=>r.jsxs(h,{size:e,disabled:s,$error:l,children:[a&&r.jsx(i,{position:"left",size:e,children:a}),r.jsx(f,{ref:c,size:e,$hasIconLeft:!!a,$hasIconRight:!!t,$error:l,disabled:s,...d}),t&&r.jsx(i,{position:"right",size:e,children:t})]}));p.displayName="Input";p.__docgenInfo={description:"",methods:[],displayName:"Input",props:{size:{required:!1,tsType:{name:"union",raw:'"xsmall" | "small"',elements:[{name:"literal",value:'"xsmall"'},{name:"literal",value:'"small"'}]},description:"",defaultValue:{value:'"small"',computed:!1}},iconLeft:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},iconRight:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},error:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},disabled:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}}},composes:["Omit"]};export{p as I};
