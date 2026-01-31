import{j as e}from"./jsx-runtime-CDt2p4po.js";import{I as n,a as i}from"./Icon-CuK57VyF.js";import{r as s,a as Y}from"./styled-components.browser.esm-Ctfm6iBV.js";import"./index-GiUgBvb1.js";const Z={small:s`
    height: 22px;
  `,medium:s`
    height: 26px;
  `},ee={default:s`
    color: var(--black);
    background-color: var(--white);
    border: 1px solid var(--grey-300);
  `,primary:s`
    color: var(--blue-600);
    background-color: var(--blue-50);
    border: 1px solid var(--blue-600);
  `},ae=Y.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: "Inter", sans-serif;
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px;
  white-space: nowrap;
  padding: 2px 8px;
  border-radius: 6px;
  user-select: none;

  ${({$size:r})=>Z[r]}
  ${({$variant:r})=>ee[r]}
  
  ${({$disabled:r})=>r&&s`
      cursor: not-allowed;
      background-color: var(--white);
      border-color: var(--grey-300);
      color: var(--grey-300);
    `}
		
	svg {
    width: 16px;
    height: 16px;
  }
`,a=({children:r,size:M="medium",variant:Q="default",disabled:U=!1,iconLeft:f,iconRight:v,className:X})=>e.jsxs(ae,{$size:M,$variant:Q,$disabled:U,className:X,children:[f&&f,r,v&&v]});a.__docgenInfo={description:"",methods:[],displayName:"Badge",props:{children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},size:{required:!1,tsType:{name:"union",raw:'"small" | "medium"',elements:[{name:"literal",value:'"small"'},{name:"literal",value:'"medium"'}]},description:"",defaultValue:{value:'"medium"',computed:!1}},variant:{required:!1,tsType:{name:"union",raw:'"default" | "primary"',elements:[{name:"literal",value:'"default"'},{name:"literal",value:'"primary"'}]},description:"",defaultValue:{value:'"default"',computed:!1}},disabled:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},iconLeft:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},iconRight:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},className:{required:!1,tsType:{name:"string"},description:""}}};const te={title:"Atoms/Badge",component:a,tags:["autodocs"],argTypes:{children:{control:"text"},size:{control:{type:"select"},options:["small","medium"]},variant:{control:{type:"select"},options:["default","primary"]},disabled:{control:"boolean"},iconLeft:{control:"boolean"},iconRight:{control:"boolean"}}},t={args:{children:"Badge",variant:"default",size:"medium"}},d={args:{children:"Badge",variant:"primary",size:"medium"}},o={args:{children:"Badge",variant:"default",size:"small"}},l={args:{children:"Badge",variant:"primary",size:"small"}},m={args:{children:"Badge",variant:"default",size:"medium",disabled:!0}},c={args:{children:"Badge",variant:"primary",size:"medium",disabled:!0}},u={args:{children:"Search",variant:"default",size:"medium",iconLeft:e.jsx(n,{name:i.SEARCH})}},p={args:{children:"Next",variant:"primary",size:"medium",iconRight:e.jsx(n,{name:i.CLOSE})}},g={args:{children:"Navigate",variant:"default",size:"medium",iconLeft:e.jsx(n,{name:i.SEARCH}),iconRight:e.jsx(n,{name:i.CLOSE})}},h={render:()=>e.jsxs("div",{style:{display:"flex",gap:"16px",flexWrap:"wrap"},children:[e.jsx(a,{variant:"default",size:"medium",children:"Badge"}),e.jsx(a,{variant:"primary",size:"medium",children:"Badge"}),e.jsx(a,{variant:"default",size:"small",children:"Badge"}),e.jsx(a,{variant:"primary",size:"small",children:"Badge"}),e.jsx(a,{variant:"default",size:"medium",disabled:!0,children:"Badge"}),e.jsx(a,{variant:"primary",size:"medium",disabled:!0,children:"Badge"}),e.jsx(a,{variant:"default",size:"medium",iconLeft:e.jsx(n,{name:i.SEARCH}),children:"With Icon"}),e.jsx(a,{variant:"primary",size:"medium",iconRight:e.jsx(n,{name:i.CLOSE}),children:"With Icon"})]})};var y,B,x;t.parameters={...t.parameters,docs:{...(y=t.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    children: "Badge",
    variant: "default",
    size: "medium"
  }
}`,...(x=(B=t.parameters)==null?void 0:B.docs)==null?void 0:x.source}}};var z,S,b;d.parameters={...d.parameters,docs:{...(z=d.parameters)==null?void 0:z.docs,source:{originalSource:`{
  args: {
    children: "Badge",
    variant: "primary",
    size: "medium"
  }
}`,...(b=(S=d.parameters)==null?void 0:S.docs)==null?void 0:b.source}}};var R,I,j;o.parameters={...o.parameters,docs:{...(R=o.parameters)==null?void 0:R.docs,source:{originalSource:`{
  args: {
    children: "Badge",
    variant: "default",
    size: "small"
  }
}`,...(j=(I=o.parameters)==null?void 0:I.docs)==null?void 0:j.source}}};var N,L,w;l.parameters={...l.parameters,docs:{...(N=l.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    children: "Badge",
    variant: "primary",
    size: "small"
  }
}`,...(w=(L=l.parameters)==null?void 0:L.docs)==null?void 0:w.source}}};var E,C,W;m.parameters={...m.parameters,docs:{...(E=m.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    children: "Badge",
    variant: "default",
    size: "medium",
    disabled: true
  }
}`,...(W=(C=m.parameters)==null?void 0:C.docs)==null?void 0:W.source}}};var A,T,q;c.parameters={...c.parameters,docs:{...(A=c.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    children: "Badge",
    variant: "primary",
    size: "medium",
    disabled: true
  }
}`,...(q=(T=c.parameters)==null?void 0:T.docs)==null?void 0:q.source}}};var O,D,H;u.parameters={...u.parameters,docs:{...(O=u.parameters)==null?void 0:O.docs,source:{originalSource:`{
  args: {
    children: "Search",
    variant: "default",
    size: "medium",
    iconLeft: <Icon name={IconName.SEARCH} />
  }
}`,...(H=(D=u.parameters)==null?void 0:D.docs)==null?void 0:H.source}}};var P,$,V;p.parameters={...p.parameters,docs:{...(P=p.parameters)==null?void 0:P.docs,source:{originalSource:`{
  args: {
    children: "Next",
    variant: "primary",
    size: "medium",
    iconRight: <Icon name={IconName.CLOSE} />
  }
}`,...(V=($=p.parameters)==null?void 0:$.docs)==null?void 0:V.source}}};var k,_,F;g.parameters={...g.parameters,docs:{...(k=g.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    children: "Navigate",
    variant: "default",
    size: "medium",
    iconLeft: <Icon name={IconName.SEARCH} />,
    iconRight: <Icon name={IconName.CLOSE} />
  }
}`,...(F=(_=g.parameters)==null?void 0:_.docs)==null?void 0:F.source}}};var G,J,K;h.parameters={...h.parameters,docs:{...(G=h.parameters)==null?void 0:G.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    gap: "16px",
    flexWrap: "wrap"
  }}>
      <Badge variant="default" size="medium">
        Badge
      </Badge>
      <Badge variant="primary" size="medium">
        Badge
      </Badge>
      <Badge variant="default" size="small">
        Badge
      </Badge>
      <Badge variant="primary" size="small">
        Badge
      </Badge>
      <Badge variant="default" size="medium" disabled>
        Badge
      </Badge>
      <Badge variant="primary" size="medium" disabled>
        Badge
      </Badge>
      <Badge variant="default" size="medium" iconLeft={<Icon name={IconName.SEARCH} />}>
        With Icon
      </Badge>
      <Badge variant="primary" size="medium" iconRight={<Icon name={IconName.CLOSE} />}>
        With Icon
      </Badge>
    </div>
}`,...(K=(J=h.parameters)==null?void 0:J.docs)==null?void 0:K.source}}};const de=["Default","Primary","Small","SmallPrimary","Disabled","DisabledPrimary","WithLeftIcon","WithRightIcon","WithBothIcons","AllVariants"];export{h as AllVariants,t as Default,m as Disabled,c as DisabledPrimary,d as Primary,o as Small,l as SmallPrimary,g as WithBothIcons,u as WithLeftIcon,p as WithRightIcon,de as __namedExportsOrder,te as default};
