import{j as n}from"./jsx-runtime-CDt2p4po.js";import{R as g}from"./index-GiUgBvb1.js";import{A as h}from"./AppHeader-CDCiTfxC.js";import"./styled-components.browser.esm-Ctfm6iBV.js";import"./Button-tnMIwByE.js";import"./Icon-CuK57VyF.js";const H={title:"Molecules/AppHeader",component:h,parameters:{layout:"fullscreen"},tags:["autodocs"]},o={args:{hostname:"localhost:3000",userProfile:{name:"Chris Calo"}}},i={args:{hostname:"localhost:3000",userProfile:{name:"Chris Calo",avatar:"https://i.pravatar.cc/300"}}},t=()=>{const[a,e]=g.useState(null),C=()=>{e("Home icon clicked"),setTimeout(()=>e(null),2e3)},k=()=>{e("Settings icon clicked"),setTimeout(()=>e(null),2e3)},x=()=>{e("User profile clicked"),setTimeout(()=>e(null),2e3)};return n.jsxs("div",{style:{width:"100vw"},children:[n.jsx(h,{hostname:"app.example.com",userProfile:{name:"Chris Calo",avatar:"https://i.pravatar.cc/300"},onHomeClick:C,onSettingsClick:k,onUserProfileClick:x}),a&&n.jsx("div",{style:{padding:"12px 16px",marginTop:"16px",backgroundColor:"#f0f9ff",border:"1px solid #deebff",borderRadius:"4px",fontFamily:"Inter, sans-serif",fontSize:"14px"},children:a}),n.jsx("div",{style:{padding:"16px",fontFamily:"Inter, sans-serif",fontSize:"14px",marginTop:"32px",color:"#6a737d"},children:n.jsx("p",{children:"Click on any of the buttons above to see the interactions."})})]})};t.__docgenInfo={description:"",methods:[],displayName:"Interactive"};var s,r,c;o.parameters={...o.parameters,docs:{...(s=o.parameters)==null?void 0:s.docs,source:{originalSource:`{
  args: {
    hostname: "localhost:3000",
    userProfile: {
      name: "Chris Calo"
    }
  }
}`,...(c=(r=o.parameters)==null?void 0:r.docs)==null?void 0:c.source}}};var l,d,p;i.parameters={...i.parameters,docs:{...(l=i.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    hostname: "localhost:3000",
    userProfile: {
      name: "Chris Calo",
      avatar: "https://i.pravatar.cc/300"
    }
  }
}`,...(p=(d=i.parameters)==null?void 0:d.docs)==null?void 0:p.source}}};var m,u,f;t.parameters={...t.parameters,docs:{...(m=t.parameters)==null?void 0:m.docs,source:{originalSource:`() => {
  const [clickedAction, setClickedAction] = React.useState<string | null>(null);
  const handleHomeClick = () => {
    setClickedAction("Home icon clicked");
    setTimeout(() => setClickedAction(null), 2000);
  };
  const handleSettingsClick = () => {
    setClickedAction("Settings icon clicked");
    setTimeout(() => setClickedAction(null), 2000);
  };
  const handleProfileClick = () => {
    setClickedAction("User profile clicked");
    setTimeout(() => setClickedAction(null), 2000);
  };
  return <div style={{
    width: "100vw"
  }}>
      <AppHeader hostname="app.example.com" userProfile={{
      name: "Chris Calo",
      avatar: "https://i.pravatar.cc/300"
    }} onHomeClick={handleHomeClick} onSettingsClick={handleSettingsClick} onUserProfileClick={handleProfileClick} />

      {clickedAction && <div style={{
      padding: "12px 16px",
      marginTop: "16px",
      backgroundColor: "#f0f9ff",
      border: "1px solid #deebff",
      borderRadius: "4px",
      fontFamily: "Inter, sans-serif",
      fontSize: "14px"
    }}>
          {clickedAction}
        </div>}

      <div style={{
      padding: "16px",
      fontFamily: "Inter, sans-serif",
      fontSize: "14px",
      marginTop: "32px",
      color: "#6a737d"
    }}>
        <p>Click on any of the buttons above to see the interactions.</p>
      </div>
    </div>;
}`,...(f=(u=t.parameters)==null?void 0:u.docs)==null?void 0:f.source}}};const T=["Default","WithAvatar","Interactive"];export{o as Default,t as Interactive,i as WithAvatar,T as __namedExportsOrder,H as default};
