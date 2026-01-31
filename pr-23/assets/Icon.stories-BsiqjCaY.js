import{j as e}from"./jsx-runtime-CDt2p4po.js";import{a,I as x}from"./Icon-CuK57VyF.js";import"./index-GiUgBvb1.js";const A={title:"Atoms/Icon",component:x,parameters:{layout:"centered"},tags:["autodocs"]},o={args:{name:a.SEARCH,fill:"#4072D2"}},t={args:{name:a.SEARCH,width:"32",height:"32"}},n=()=>{const y=Object.values(a),S={display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:"24px",padding:"16px"},f={display:"flex",flexDirection:"column",alignItems:"center",padding:"16px",border:"1px solid #e1e7ef",borderRadius:"8px",backgroundColor:"#f9f9f9"},h={marginBottom:"8px"},C={fontSize:"12px",color:"#48566a",textAlign:"center",wordBreak:"break-word"};return e.jsx("div",{style:S,children:y.map(r=>e.jsxs("div",{style:f,children:[e.jsx("div",{style:h,children:e.jsx(x,{name:r,width:"24",height:"24"})}),e.jsx("div",{style:C,children:r})]},r))})};n.__docgenInfo={description:"",methods:[],displayName:"AllIcons"};var s,c,i;o.parameters={...o.parameters,docs:{...(s=o.parameters)==null?void 0:s.docs,source:{originalSource:`{
  args: {
    name: IconName.SEARCH,
    fill: "#4072D2"
  }
}`,...(i=(c=o.parameters)==null?void 0:c.docs)==null?void 0:i.source}}};var l,d,m;t.parameters={...t.parameters,docs:{...(l=t.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    name: IconName.SEARCH,
    width: "32",
    height: "32"
  }
}`,...(m=(d=t.parameters)==null?void 0:d.docs)==null?void 0:m.source}}};var p,g,u;n.parameters={...n.parameters,docs:{...(p=n.parameters)==null?void 0:p.docs,source:{originalSource:`() => {
  const allIcons = Object.values(IconName);
  const containerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "24px",
    padding: "16px"
  };
  const iconCardStyle = {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    padding: "16px",
    border: "1px solid #e1e7ef",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9"
  };
  const iconStyle = {
    marginBottom: "8px"
  };
  const labelStyle = {
    fontSize: "12px",
    color: "#48566a",
    textAlign: "center" as const,
    wordBreak: "break-word" as const
  };
  return <div style={containerStyle}>
            {allIcons.map(iconName => <div key={iconName} style={iconCardStyle}>
                    <div style={iconStyle}>
                        <Icon name={iconName} width="24" height="24" />
                    </div>
                    <div style={labelStyle}>{iconName}</div>
                </div>)}
        </div>;
}`,...(u=(g=n.parameters)==null?void 0:g.docs)==null?void 0:u.source}}};const j=["CustomColor","CustomSize","AllIcons"];export{n as AllIcons,o as CustomColor,t as CustomSize,j as __namedExportsOrder,A as default};
