import{j as e}from"./jsx-runtime-CDt2p4po.js";import{T as C}from"./ThemeProvider-BrrJ8DNK.js";import{r as me}from"./index-GiUgBvb1.js";import{a as x,r as t}from"./styled-components.browser.esm-Ctfm6iBV.js";const ie={small:t`
    padding: 12px;
  `,medium:t`
    padding: 16px;
  `,large:t`
    padding: 20px;
  `},pe={default:t`
    background-color: var(--theme-cardBackground, var(--white-900));
    border: 1px solid var(--theme-cardBorder, var(--grey-200));
  `,outlined:t`
    background-color: var(--theme-cardBackground, var(--white-900));
    border: 1px solid var(--theme-cardBorder, var(--grey-200));
  `,elevated:t`
    background-color: var(--theme-cardBackground, var(--white-900));
    border: 1px solid var(--theme-cardBorder, var(--grey-200));
    box-shadow: 0px 2px 4px var(--black-100);
  `},he=x.div`
  border-radius: var(--theme-radius-large, 16px);
  width: ${r=>r.$fullWidth?"100%":"auto"};
  ${r=>pe[r.$variant]}
  transition: all 0.2s ease;
`,ve=x.div`
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 20px;
  background-color: var(--grey-50);
  border-top-left-radius: var(--theme-radius-large, 16px);
  border-top-right-radius: var(--theme-radius-large, 16px);
  ${r=>ie[r.$size]}
`,ge=x.div`
  ${r=>ie[r.$size]}
`,a=me.forwardRef(({children:r,title:S,size:f="medium",variant:oe="default",className:se,fullWidth:le=!1,...ce},ue)=>e.jsxs(he,{ref:ue,$size:f,$variant:oe,$fullWidth:le,className:se,...ce,children:[S&&e.jsx(ve,{$size:f,children:S}),e.jsx(ge,{$size:f,children:r})]}));a.displayName="Card";a.__docgenInfo={description:"",methods:[],displayName:"Card",props:{children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},title:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},size:{required:!1,tsType:{name:"union",raw:'"small" | "medium" | "large"',elements:[{name:"literal",value:'"small"'},{name:"literal",value:'"medium"'},{name:"literal",value:'"large"'}]},description:"",defaultValue:{value:'"medium"',computed:!1}},variant:{required:!1,tsType:{name:"union",raw:'"default" | "outlined" | "elevated"',elements:[{name:"literal",value:'"default"'},{name:"literal",value:'"outlined"'},{name:"literal",value:'"elevated"'}]},description:"",defaultValue:{value:'"default"',computed:!1}},className:{required:!1,tsType:{name:"string"},description:""},fullWidth:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}}},composes:["Omit"]};const ye={title:"Atoms/Card",component:a,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{size:{control:"select",options:["small","medium","large"]},variant:{control:"select",options:["default","outlined","elevated"]},fullWidth:{control:"boolean"}}},n={args:{children:"Card content",title:"Card Title",size:"medium",variant:"default"}},d={args:{children:"Card content with outlined variant",title:"Outlined Card",size:"medium",variant:"outlined"}},i={args:{children:"Card content with elevated variant",title:"Elevated Card",size:"medium",variant:"elevated"}},o={args:{children:"Small card content",title:"Small Card",size:"small",variant:"default"}},s={args:{children:"Large card content",title:"Large Card",size:"large",variant:"default"}},l={args:{children:"Card with no title",size:"medium",variant:"default"}},c={args:{children:"This card will take full width of its container",title:"Full Width Card",size:"medium",variant:"default",fullWidth:!0},parameters:{layout:"padded"}},u={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"24px",width:"400px"},children:[e.jsx(a,{title:"Default Card",variant:"default",children:"Default variant content"}),e.jsx(a,{title:"Outlined Card",variant:"outlined",children:"Outlined variant content"}),e.jsx(a,{title:"Elevated Card",variant:"elevated",children:"Elevated variant content"})]})},m={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"24px",width:"400px"},children:[e.jsx(a,{title:"Small Card",size:"small",children:"Small size content"}),e.jsx(a,{title:"Medium Card",size:"medium",children:"Medium size content"}),e.jsx(a,{title:"Large Card",size:"large",children:"Large size content"})]})},p={args:{children:"Card with custom border color",title:"Custom Border Card",variant:"outlined"},decorators:[r=>e.jsx(C,{theme:{colors:{cardBorder:"#DC2626"}},children:e.jsx(r,{})})]},h={args:{children:"Card with custom background",title:"Custom Background Card"},decorators:[r=>e.jsx(C,{theme:{colors:{cardBackground:"#FEF3C7",cardBorder:"#F59E0B"}},children:e.jsx(r,{})})]},v={args:{children:"Card with sharp corners",title:"Sharp Corners Card"},decorators:[r=>e.jsx(C,{theme:{radius:{large:"4px"}},children:e.jsx(r,{})})]},g={args:{children:"Fully themed card with purple background and rounded corners",title:"Themed Card"},decorators:[r=>e.jsx(C,{theme:{colors:{cardBackground:"#F3E8FF",cardBorder:"#9333EA"},radius:{large:"24px"}},children:e.jsx(r,{})})]};var y,z,w;n.parameters={...n.parameters,docs:{...(y=n.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    children: "Card content",
    title: "Card Title",
    size: "medium",
    variant: "default"
  }
}`,...(w=(z=n.parameters)==null?void 0:z.docs)==null?void 0:w.source}}};var T,B,k;d.parameters={...d.parameters,docs:{...(T=d.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    children: "Card content with outlined variant",
    title: "Outlined Card",
    size: "medium",
    variant: "outlined"
  }
}`,...(k=(B=d.parameters)==null?void 0:B.docs)==null?void 0:k.source}}};var j,b,F;i.parameters={...i.parameters,docs:{...(j=i.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    children: "Card content with elevated variant",
    title: "Elevated Card",
    size: "medium",
    variant: "elevated"
  }
}`,...(F=(b=i.parameters)==null?void 0:b.docs)==null?void 0:F.source}}};var E,W,$;o.parameters={...o.parameters,docs:{...(E=o.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    children: "Small card content",
    title: "Small Card",
    size: "small",
    variant: "default"
  }
}`,...($=(W=o.parameters)==null?void 0:W.docs)==null?void 0:$.source}}};var D,L,O;s.parameters={...s.parameters,docs:{...(D=s.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    children: "Large card content",
    title: "Large Card",
    size: "large",
    variant: "default"
  }
}`,...(O=(L=s.parameters)==null?void 0:L.docs)==null?void 0:O.source}}};var R,N,P;l.parameters={...l.parameters,docs:{...(R=l.parameters)==null?void 0:R.docs,source:{originalSource:`{
  args: {
    children: "Card with no title",
    size: "medium",
    variant: "default"
  }
}`,...(P=(N=l.parameters)==null?void 0:N.docs)==null?void 0:P.source}}};var A,q,V;c.parameters={...c.parameters,docs:{...(A=c.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    children: "This card will take full width of its container",
    title: "Full Width Card",
    size: "medium",
    variant: "default",
    fullWidth: true
  },
  parameters: {
    layout: "padded"
  }
}`,...(V=(q=c.parameters)==null?void 0:q.docs)==null?void 0:V.source}}};var M,_,I;u.parameters={...u.parameters,docs:{...(M=u.parameters)==null?void 0:M.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    width: "400px"
  }}>
      <Card title="Default Card" variant="default">
        Default variant content
      </Card>
      <Card title="Outlined Card" variant="outlined">
        Outlined variant content
      </Card>
      <Card title="Elevated Card" variant="elevated">
        Elevated variant content
      </Card>
    </div>
}`,...(I=(_=u.parameters)==null?void 0:_.docs)==null?void 0:I.source}}};var G,H,J;m.parameters={...m.parameters,docs:{...(G=m.parameters)==null?void 0:G.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    width: "400px"
  }}>
      <Card title="Small Card" size="small">
        Small size content
      </Card>
      <Card title="Medium Card" size="medium">
        Medium size content
      </Card>
      <Card title="Large Card" size="large">
        Large size content
      </Card>
    </div>
}`,...(J=(H=m.parameters)==null?void 0:H.docs)==null?void 0:J.source}}};var K,Q,U;p.parameters={...p.parameters,docs:{...(K=p.parameters)==null?void 0:K.docs,source:{originalSource:`{
  args: {
    children: "Card with custom border color",
    title: "Custom Border Card",
    variant: "outlined"
  },
  decorators: [Story => <ThemeProvider theme={{
    colors: {
      cardBorder: "#DC2626"
    }
  }}>
        <Story />
      </ThemeProvider>]
}`,...(U=(Q=p.parameters)==null?void 0:Q.docs)==null?void 0:U.source}}};var X,Y,Z;h.parameters={...h.parameters,docs:{...(X=h.parameters)==null?void 0:X.docs,source:{originalSource:`{
  args: {
    children: "Card with custom background",
    title: "Custom Background Card"
  },
  decorators: [Story => <ThemeProvider theme={{
    colors: {
      cardBackground: "#FEF3C7",
      cardBorder: "#F59E0B"
    }
  }}>
        <Story />
      </ThemeProvider>]
}`,...(Z=(Y=h.parameters)==null?void 0:Y.docs)==null?void 0:Z.source}}};var ee,re,ae;v.parameters={...v.parameters,docs:{...(ee=v.parameters)==null?void 0:ee.docs,source:{originalSource:`{
  args: {
    children: "Card with sharp corners",
    title: "Sharp Corners Card"
  },
  decorators: [Story => <ThemeProvider theme={{
    radius: {
      large: "4px"
    }
  }}>
        <Story />
      </ThemeProvider>]
}`,...(ae=(re=v.parameters)==null?void 0:re.docs)==null?void 0:ae.source}}};var te,ne,de;g.parameters={...g.parameters,docs:{...(te=g.parameters)==null?void 0:te.docs,source:{originalSource:`{
  args: {
    children: "Fully themed card with purple background and rounded corners",
    title: "Themed Card"
  },
  decorators: [Story => <ThemeProvider theme={{
    colors: {
      cardBackground: "#F3E8FF",
      cardBorder: "#9333EA"
    },
    radius: {
      large: "24px"
    }
  }}>
        <Story />
      </ThemeProvider>]
}`,...(de=(ne=g.parameters)==null?void 0:ne.docs)==null?void 0:de.source}}};const ze=["Default","Outlined","Elevated","Small","Large","NoTitle","FullWidth","AllVariants","AllSizes","WithCustomBorder","WithCustomBackground","WithSharpCorners","WithFullTheme"];export{m as AllSizes,u as AllVariants,n as Default,i as Elevated,c as FullWidth,s as Large,l as NoTitle,d as Outlined,o as Small,h as WithCustomBackground,p as WithCustomBorder,g as WithFullTheme,v as WithSharpCorners,ze as __namedExportsOrder,ye as default};
