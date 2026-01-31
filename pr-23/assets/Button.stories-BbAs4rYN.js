import{j as r}from"./jsx-runtime-CDt2p4po.js";import{I as a,a as n}from"./Icon-CuK57VyF.js";import{T as I}from"./ThemeProvider-BrrJ8DNK.js";import{B as yr}from"./Button-tnMIwByE.js";import"./index-GiUgBvb1.js";import"./styled-components.browser.esm-Ctfm6iBV.js";const Tr={title:"Atoms/Button",component:yr,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{variant:{control:{type:"select"},options:["primary","secondary","tertiary"]},size:{control:{type:"select"},options:["small","medium"]}}},o={args:{children:"Primary Button",variant:"primary"}},s={args:{children:"Secondary Button",variant:"secondary"}},t={args:{children:"Tertiary Button",variant:"tertiary"}},c={args:{children:"Small Button",size:"small"}},i={args:{children:"Medium Button",size:"medium"}},m={args:{children:"Disabled Button",disabled:!0}},d={args:{children:"Loading Button",loading:!0}},u={args:{children:"Search",leftIcon:r.jsx(a,{name:n.SEARCH})}},l={args:{children:"Next",rightIcon:r.jsx(a,{name:n.CHEVRON_DOWN})}},p={args:{children:"Search and Continue",leftIcon:r.jsx(a,{name:n.SEARCH}),rightIcon:r.jsx(a,{name:n.CHEVRON_DOWN})}},h={args:{leftIcon:r.jsx(a,{name:n.SEARCH}),"aria-label":"Search"}},y={args:{children:"Full Width Button",fullWidth:!0}},g={args:{children:"Red Theme Button",variant:"primary"},decorators:[e=>r.jsx(I,{theme:{colors:{primary:"#DC2626",primaryHover:"#B91C1C",primaryActive:"#991B1B"}},children:r.jsx(e,{})})]},S={args:{children:"Purple Theme Button",variant:"primary"},decorators:[e=>r.jsx(I,{theme:{colors:{primary:"#9333EA",primaryHover:"#7E22CE",primaryActive:"#6B21A8"}},children:r.jsx(e,{})})]},B={args:{children:"Sharp Corners Button",variant:"primary"},decorators:[e=>r.jsx(I,{theme:{radius:{medium:"4px"}},children:r.jsx(e,{})})]},v={args:{children:"Fully Custom Button",variant:"primary"},decorators:[e=>r.jsx(I,{theme:{colors:{primary:"#F59E0B",primaryHover:"#D97706",primaryActive:"#B45309"},radius:{medium:"20px"}},children:r.jsx(e,{})})]};var C,T,W;o.parameters={...o.parameters,docs:{...(C=o.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    children: "Primary Button",
    variant: "primary"
  }
}`,...(W=(T=o.parameters)==null?void 0:T.docs)==null?void 0:W.source}}};var x,E,R;s.parameters={...s.parameters,docs:{...(x=s.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    children: "Secondary Button",
    variant: "secondary"
  }
}`,...(R=(E=s.parameters)==null?void 0:E.docs)==null?void 0:R.source}}};var A,P,H;t.parameters={...t.parameters,docs:{...(A=t.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    children: "Tertiary Button",
    variant: "tertiary"
  }
}`,...(H=(P=t.parameters)==null?void 0:P.docs)==null?void 0:H.source}}};var N,f,j;c.parameters={...c.parameters,docs:{...(N=c.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    children: "Small Button",
    size: "small"
  }
}`,...(j=(f=c.parameters)==null?void 0:f.docs)==null?void 0:j.source}}};var D,O,F;i.parameters={...i.parameters,docs:{...(D=i.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    children: "Medium Button",
    size: "medium"
  }
}`,...(F=(O=i.parameters)==null?void 0:O.docs)==null?void 0:F.source}}};var b,L,_;m.parameters={...m.parameters,docs:{...(b=m.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    children: "Disabled Button",
    disabled: true
  }
}`,...(_=(L=m.parameters)==null?void 0:L.docs)==null?void 0:_.source}}};var z,M,V;d.parameters={...d.parameters,docs:{...(z=d.parameters)==null?void 0:z.docs,source:{originalSource:`{
  args: {
    children: "Loading Button",
    loading: true
  }
}`,...(V=(M=d.parameters)==null?void 0:M.docs)==null?void 0:V.source}}};var k,q,w;u.parameters={...u.parameters,docs:{...(k=u.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    children: "Search",
    leftIcon: <Icon name={IconName.SEARCH} />
  }
}`,...(w=(q=u.parameters)==null?void 0:q.docs)==null?void 0:w.source}}};var G,J,K;l.parameters={...l.parameters,docs:{...(G=l.parameters)==null?void 0:G.docs,source:{originalSource:`{
  args: {
    children: "Next",
    rightIcon: <Icon name={IconName.CHEVRON_DOWN} />
  }
}`,...(K=(J=l.parameters)==null?void 0:J.docs)==null?void 0:K.source}}};var Q,U,X;p.parameters={...p.parameters,docs:{...(Q=p.parameters)==null?void 0:Q.docs,source:{originalSource:`{
  args: {
    children: "Search and Continue",
    leftIcon: <Icon name={IconName.SEARCH} />,
    rightIcon: <Icon name={IconName.CHEVRON_DOWN} />
  }
}`,...(X=(U=p.parameters)==null?void 0:U.docs)==null?void 0:X.source}}};var Y,Z,$;h.parameters={...h.parameters,docs:{...(Y=h.parameters)==null?void 0:Y.docs,source:{originalSource:`{
  args: {
    leftIcon: <Icon name={IconName.SEARCH} />,
    "aria-label": "Search"
  }
}`,...($=(Z=h.parameters)==null?void 0:Z.docs)==null?void 0:$.source}}};var rr,er,ar;y.parameters={...y.parameters,docs:{...(rr=y.parameters)==null?void 0:rr.docs,source:{originalSource:`{
  args: {
    children: "Full Width Button",
    fullWidth: true
  }
}`,...(ar=(er=y.parameters)==null?void 0:er.docs)==null?void 0:ar.source}}};var nr,or,sr;g.parameters={...g.parameters,docs:{...(nr=g.parameters)==null?void 0:nr.docs,source:{originalSource:`{
  args: {
    children: "Red Theme Button",
    variant: "primary"
  },
  decorators: [Story => <ThemeProvider theme={{
    colors: {
      primary: "#DC2626",
      primaryHover: "#B91C1C",
      primaryActive: "#991B1B"
    }
  }}>
        <Story />
      </ThemeProvider>]
}`,...(sr=(or=g.parameters)==null?void 0:or.docs)==null?void 0:sr.source}}};var tr,cr,ir;S.parameters={...S.parameters,docs:{...(tr=S.parameters)==null?void 0:tr.docs,source:{originalSource:`{
  args: {
    children: "Purple Theme Button",
    variant: "primary"
  },
  decorators: [Story => <ThemeProvider theme={{
    colors: {
      primary: "#9333EA",
      primaryHover: "#7E22CE",
      primaryActive: "#6B21A8"
    }
  }}>
        <Story />
      </ThemeProvider>]
}`,...(ir=(cr=S.parameters)==null?void 0:cr.docs)==null?void 0:ir.source}}};var mr,dr,ur;B.parameters={...B.parameters,docs:{...(mr=B.parameters)==null?void 0:mr.docs,source:{originalSource:`{
  args: {
    children: "Sharp Corners Button",
    variant: "primary"
  },
  decorators: [Story => <ThemeProvider theme={{
    radius: {
      medium: "4px"
    }
  }}>
        <Story />
      </ThemeProvider>]
}`,...(ur=(dr=B.parameters)==null?void 0:dr.docs)==null?void 0:ur.source}}};var lr,pr,hr;v.parameters={...v.parameters,docs:{...(lr=v.parameters)==null?void 0:lr.docs,source:{originalSource:`{
  args: {
    children: "Fully Custom Button",
    variant: "primary"
  },
  decorators: [Story => <ThemeProvider theme={{
    colors: {
      primary: "#F59E0B",
      primaryHover: "#D97706",
      primaryActive: "#B45309"
    },
    radius: {
      medium: "20px"
    }
  }}>
        <Story />
      </ThemeProvider>]
}`,...(hr=(pr=v.parameters)==null?void 0:pr.docs)==null?void 0:hr.source}}};const Wr=["Primary","Secondary","Tertiary","Small","Medium","Disabled","Loading","WithLeftIcon","WithRightIcon","WithBothIcons","IconOnly","FullWidth","WithRedTheme","WithPurpleTheme","WithCustomRadius","WithFullCustomTheme"];export{m as Disabled,y as FullWidth,h as IconOnly,d as Loading,i as Medium,o as Primary,s as Secondary,c as Small,t as Tertiary,p as WithBothIcons,B as WithCustomRadius,v as WithFullCustomTheme,u as WithLeftIcon,S as WithPurpleTheme,g as WithRedTheme,l as WithRightIcon,Wr as __namedExportsOrder,Tr as default};
