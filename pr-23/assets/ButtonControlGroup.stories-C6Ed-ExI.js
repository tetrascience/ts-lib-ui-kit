import{j as n}from"./jsx-runtime-CDt2p4po.js";import{r as E}from"./index-GiUgBvb1.js";import{a as T}from"./styled-components.browser.esm-Ctfm6iBV.js";import{B as V}from"./ButtonControl-CZJC9UKX.js";const _=T.div`
  display: flex;
  flex-direction: ${t=>t.$vertical?"column":"row"};
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--grey-200);

  & > *:not(:last-child) {
    ${t=>t.$vertical?"border-bottom: 1px solid var(--grey-200);":"border-right: 1px solid var(--grey-200);"}
  }

  ${t=>t.$vertical&&`
    width: 40px;
  `}
`,k=T.div`
  &:first-child {
    button {
      ${t=>t.$vertical?"border-top-right-radius: 6px;border-top-left-radius: 6px;":"border-top-left-radius: 6px;border-bottom-left-radius: 6px;"}
    }
  }

  &:last-child {
    button {
      ${t=>t.$vertical?"border-bottom-right-radius: 6px;border-bottom-left-radius: 6px;":"border-top-right-radius: 6px;border-bottom-right-radius: 6px;"}
    }
  }
`,p=({controls:t,selectedId:a,onChange:l,vertical:u=!0,disabled:b=!1})=>{const q=r=>{b||l==null||l(r)};return n.jsx(_,{$vertical:u,children:t.map(r=>n.jsx(k,{$vertical:u,children:n.jsx(V,{icon:r.icon,selected:a===r.id,disabled:b||r.disabled,onClick:()=>q(r.id)})},r.id))})};p.__docgenInfo={description:"",methods:[],displayName:"ButtonControlGroup",props:{controls:{required:!0,tsType:{name:"Array",elements:[{name:"ButtonControlItem"}],raw:"ButtonControlItem[]"},description:""},selectedId:{required:!1,tsType:{name:"string"},description:""},onChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(id: string) => void",signature:{arguments:[{type:{name:"string"},name:"id"}],return:{name:"void"}}},description:""},vertical:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"true",computed:!1}},disabled:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}}}};const N={title:"Molecules/ButtonControlGroup",component:p,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{vertical:{control:{type:"boolean"}},disabled:{control:{type:"boolean"}}}},e=()=>n.jsx("svg",{width:"20",height:"20",viewBox:"0 0 20 20",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:n.jsx("rect",{x:"4",y:"4",width:"12",height:"12",rx:"2",fill:"currentColor"})}),o={args:{controls:[{id:"btn1",icon:n.jsx(e,{})},{id:"btn2",icon:n.jsx(e,{})},{id:"btn3",icon:n.jsx(e,{})},{id:"btn4",icon:n.jsx(e,{})}],selectedId:"btn3",vertical:!0}},i={args:{controls:[{id:"btn1",icon:n.jsx(e,{})},{id:"btn2",icon:n.jsx(e,{})},{id:"btn3",icon:n.jsx(e,{})},{id:"btn4",icon:n.jsx(e,{})}],selectedId:"btn2",vertical:!1}},s={args:{controls:[{id:"btn1",icon:n.jsx(e,{})},{id:"btn2",icon:n.jsx(e,{})},{id:"btn3",icon:n.jsx(e,{})},{id:"btn4",icon:n.jsx(e,{})}],selectedId:"btn3",disabled:!0}},c={args:{controls:[{id:"btn1",icon:n.jsx(e,{})},{id:"btn2",icon:n.jsx(e,{})},{id:"btn3",icon:n.jsx(e,{}),disabled:!0},{id:"btn4",icon:n.jsx(e,{})}],selectedId:"btn2"}},D=()=>{const[t,a]=E.useState("btn1");return n.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px"},children:[n.jsx("h3",{children:"Click buttons to change selection"}),n.jsx(p,{controls:[{id:"btn1",icon:n.jsx(e,{})},{id:"btn2",icon:n.jsx(e,{})},{id:"btn3",icon:n.jsx(e,{})},{id:"btn4",icon:n.jsx(e,{})}],selectedId:t,onChange:a})]})},d={render:()=>n.jsx(D,{})};var m,x,g;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    controls: [{
      id: "btn1",
      icon: <Icon />
    }, {
      id: "btn2",
      icon: <Icon />
    }, {
      id: "btn3",
      icon: <Icon />
    }, {
      id: "btn4",
      icon: <Icon />
    }],
    selectedId: "btn3",
    vertical: true
  }
}`,...(g=(x=o.parameters)==null?void 0:x.docs)==null?void 0:g.source}}};var I,f,j;i.parameters={...i.parameters,docs:{...(I=i.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    controls: [{
      id: "btn1",
      icon: <Icon />
    }, {
      id: "btn2",
      icon: <Icon />
    }, {
      id: "btn3",
      icon: <Icon />
    }, {
      id: "btn4",
      icon: <Icon />
    }],
    selectedId: "btn2",
    vertical: false
  }
}`,...(j=(f=i.parameters)==null?void 0:f.docs)==null?void 0:j.source}}};var v,h,y;s.parameters={...s.parameters,docs:{...(v=s.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    controls: [{
      id: "btn1",
      icon: <Icon />
    }, {
      id: "btn2",
      icon: <Icon />
    }, {
      id: "btn3",
      icon: <Icon />
    }, {
      id: "btn4",
      icon: <Icon />
    }],
    selectedId: "btn3",
    disabled: true
  }
}`,...(y=(h=s.parameters)==null?void 0:h.docs)==null?void 0:y.source}}};var G,w,$;c.parameters={...c.parameters,docs:{...(G=c.parameters)==null?void 0:G.docs,source:{originalSource:`{
  args: {
    controls: [{
      id: "btn1",
      icon: <Icon />
    }, {
      id: "btn2",
      icon: <Icon />
    }, {
      id: "btn3",
      icon: <Icon />,
      disabled: true
    }, {
      id: "btn4",
      icon: <Icon />
    }],
    selectedId: "btn2"
  }
}`,...($=(w=c.parameters)==null?void 0:w.docs)==null?void 0:$.source}}};var B,C,S;d.parameters={...d.parameters,docs:{...(B=d.parameters)==null?void 0:B.docs,source:{originalSource:`{
  render: () => <InteractiveGroupExample />
}`,...(S=(C=d.parameters)==null?void 0:C.docs)==null?void 0:S.source}}};const O=["VerticalGroup","HorizontalGroup","DisabledGroup","MixedStateGroup","Interactive"];export{s as DisabledGroup,i as HorizontalGroup,d as Interactive,c as MixedStateGroup,o as VerticalGroup,O as __namedExportsOrder,N as default};
