import{j as p}from"./jsx-runtime-CDt2p4po.js";import{R as v}from"./index-GiUgBvb1.js";import{a as b,r}from"./styled-components.browser.esm-Ctfm6iBV.js";const f={small:r`
    height: 34px;
  `,medium:r`
    height: 38px;
  `},y={primary:r`
    color: var(--white-900);
    background-color: var(--theme-primary, var(--blue-900));
    border: 1px solid var(--theme-primary, var(--blue-900));

    &:hover:not(:disabled) {
      background-color: var(--theme-primaryHover, var(--blue-800));
      border-color: var(--theme-primaryHover, var(--blue-800));
    }

    &:focus:not(:disabled) {
      background-color: var(--theme-primaryHover, var(--blue-800));
    }

    &:active:not(:disabled) {
      background-color: var(--theme-primaryActive, var(--blue-800));
      border-color: var(--theme-primaryActive, var(--blue-800));
    }
  `,secondary:r`
    color: var(--blue-600);
    background-color: var(--white-900);
    border: 1px solid var(--blue-600);

    &:hover:not(:disabled) {
      background-color: var(--blue-100);
      border-color: var(--blue-600);
    }

    &:focus:not(:disabled) {
      background-color: var(--blue-100);
    }

    &:active:not(:disabled) {
      border-color: var(--blue-600);
      background-color: var(--blue-100);
    }
  `,tertiary:r`
    color: var(--black-900);
    background-color: var(--white-900);
    border: 1px solid var(--grey-300);

    &:hover:not(:disabled) {
      background-color: var(--grey-100);
      border: 1px solid var(--grey-300);
    }

    &:focus:not(:disabled) {
      background-color: var(--grey-100);
    }

    &:active:not(:disabled) {
      background-color: var(--grey-100);
    }
  `},g=(e,a)=>{if(a)return"0";switch(e){case"small":return"7px 10px";case"medium":default:return"9px 12px"}},h=b.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: var(--theme-radius-medium, 8px);
  font-family: "Inter", sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  min-height: 20px;
  width: ${e=>e.$fullWidth?"100%":"auto"};
  padding: ${e=>g(e.size||"medium",e.$noPadding)};
  user-select: none;

  ${e=>f[e.size||"medium"]}
  ${e=>y[e.variant||"primary"]}

	&:disabled {
    cursor: not-allowed;
    user-select: none;
    pointer-events: none;
    background-color: var(--grey-300);
    border-color: var(--grey-300);
    color: var(--white-900);
  }

  &:focus {
    outline: none;
    box-shadow: 0px 0px 0px 1px var(--white-900),
      0px 0px 0px 3px var(--blue-600);
  }
`,l=v.forwardRef(({children:e,variant:a="primary",size:i="medium",loading:d=!1,leftIcon:o,rightIcon:t,noPadding:n=!1,fullWidth:s=!1,disabled:u,...c},m)=>p.jsxs(h,{ref:m,variant:a,size:i,$noPadding:n,$fullWidth:s,disabled:u||d,...c,children:[o&&o,e,t&&t]}));l.displayName="Button";l.__docgenInfo={description:"",methods:[],displayName:"Button",props:{children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},variant:{required:!1,tsType:{name:"union",raw:'"primary" | "secondary" | "tertiary"',elements:[{name:"literal",value:'"primary"'},{name:"literal",value:'"secondary"'},{name:"literal",value:'"tertiary"'}]},description:"",defaultValue:{value:'"primary"',computed:!1}},size:{required:!1,tsType:{name:"union",raw:'"small" | "medium"',elements:[{name:"literal",value:'"small"'},{name:"literal",value:'"medium"'}]},description:"",defaultValue:{value:'"medium"',computed:!1}},loading:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},leftIcon:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},rightIcon:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},noPadding:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},fullWidth:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}}}};export{l as B};
