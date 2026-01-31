import{j as a}from"./jsx-runtime-CDt2p4po.js";import{L as f}from"./LineGraph-DuYVw2tG.js";import{r as b}from"./index-GiUgBvb1.js";import{a as e}from"./Icon-CuK57VyF.js";import{A as h}from"./AppHeader-CDCiTfxC.js";import{N as C}from"./Navbar-D-jVyHBM.js";import{S}from"./Sidebar-lTcm0vcq.js";import"./plotly-CNt8u1Bg.js";import"./colors-O2mrKcAp.js";import"./styled-components.browser.esm-Ctfm6iBV.js";import"./Button-tnMIwByE.js";const i=({userProfile:s,hostname:c,organization:l,children:m})=>{const p=[{icon:e.SEARCH_DOCUMENT,label:"Search"},{icon:e.SEARCH_SQL,label:"SQL Search"},{icon:e.LAMP,label:"Projects"},{icon:e.PIPELINE,label:"Pipelines"},{icon:e.COMPUTER,label:"Data & AI Workspace"},{icon:e.CUBE,label:"Artifacts"},{icon:e.DATABASE,label:"Data Sources"},{icon:e.PIE_CHART,label:"Health Monitoring"},{icon:e.BULK_CHECK,label:"Bulk Actions"},{icon:e.CODE,label:"Attribute Management"},{icon:e.GEAR,label:"Administration"}],[d,u]=b.useState("Pipelines"),g=A=>{u(A)},y=()=>{console.log("Home clicked")},x=()=>{console.log("Settings clicked")},D=()=>{console.log("User profile clicked")};return a.jsxs("div",{className:"app-layout",children:[a.jsx(C,{organization:l}),a.jsxs("div",{className:"content-container",children:[a.jsx(S,{items:p,activeItem:d,onItemClick:g}),a.jsxs("div",{className:"main-content",children:[a.jsx(h,{hostname:c,userProfile:s,onHomeClick:y,onSettingsClick:x,onUserProfileClick:D}),a.jsx("div",{className:"main-layout",children:m})]})]})]})};i.__docgenInfo={description:"",methods:[],displayName:"AppLayout",props:{userProfile:{required:!0,tsType:{name:"signature",type:"object",raw:`{
  name: string;
  avatar?: string;
}`,signature:{properties:[{key:"name",value:{name:"string",required:!0}},{key:"avatar",value:{name:"string",required:!1}}]}},description:""},hostname:{required:!0,tsType:{name:"string"},description:""},organization:{required:!0,tsType:{name:"signature",type:"object",raw:`{
  name: string;
  subtext?: string;
  logo?: React.ReactNode;
}`,signature:{properties:[{key:"name",value:{name:"string",required:!0}},{key:"subtext",value:{name:"string",required:!1}},{key:"logo",value:{name:"ReactReactNode",raw:"React.ReactNode",required:!1}}]}},description:""},children:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""}}};const H={title:"Organisms/AppLayout",component:i,parameters:{layout:"fullscreen"},args:{userProfile:{name:"John Doe",avatar:"https://via.placeholder.com/40x40"},hostname:"demo.tetrascience.com",organization:{name:"TetraScience",subtext:"Demo Organization"}}},n={args:{children:a.jsx(f,{dataSeries:[{name:"Data A",color:"#FF6B35",x:[200,300,400,500,600,700,800,900,1e3],y:[75,140,105,120,145,115,110,80,90]},{name:"Data B",color:"#FF471A",x:[200,300,400,500,600,700,800,900,1e3],y:[125,160,115,145,190,180,120,105,110]},{name:"Data C",color:"#008000",x:[200,300,400,500,600,700,800,900,1e3],y:[185,195,145,215,205,200,160,145,135]},{name:"Data D",color:"#0000FF",x:[200,300,400,500,600,700,800,900,1e3],y:[225,215,210,245,230,230,200,185,190]},{name:"Data E",color:"#FFD700",x:[200,300,400,500,600,700,800,900,1e3],y:[245,260,235,265,250,250,220,220,225]},{name:"Data F",color:"#800080",x:[200,300,400,500,600,700,800,900,1e3],y:[275,295,270,285,300,300,250,255,260]}]})}};var t,r,o;n.parameters={...n.parameters,docs:{...(t=n.parameters)==null?void 0:t.docs,source:{originalSource:`{
  args: {
    children: <LineGraph dataSeries={[{
      name: "Data A",
      color: "#FF6B35",
      x: [200, 300, 400, 500, 600, 700, 800, 900, 1000],
      y: [75, 140, 105, 120, 145, 115, 110, 80, 90]
    }, {
      name: "Data B",
      color: "#FF471A",
      x: [200, 300, 400, 500, 600, 700, 800, 900, 1000],
      y: [125, 160, 115, 145, 190, 180, 120, 105, 110]
    }, {
      name: "Data C",
      color: "#008000",
      x: [200, 300, 400, 500, 600, 700, 800, 900, 1000],
      y: [185, 195, 145, 215, 205, 200, 160, 145, 135]
    }, {
      name: "Data D",
      color: "#0000FF",
      x: [200, 300, 400, 500, 600, 700, 800, 900, 1000],
      y: [225, 215, 210, 245, 230, 230, 200, 185, 190]
    }, {
      name: "Data E",
      color: "#FFD700",
      x: [200, 300, 400, 500, 600, 700, 800, 900, 1000],
      y: [245, 260, 235, 265, 250, 250, 220, 220, 225]
    }, {
      name: "Data F",
      color: "#800080",
      x: [200, 300, 400, 500, 600, 700, 800, 900, 1000],
      y: [275, 295, 270, 285, 300, 300, 250, 255, 260]
    }]} />
  }
}`,...(o=(r=n.parameters)==null?void 0:r.docs)==null?void 0:o.source}}};const T=["Default"];export{n as Default,T as __namedExportsOrder,H as default};
