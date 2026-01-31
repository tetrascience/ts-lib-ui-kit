import{j as t}from"./jsx-runtime-CDt2p4po.js";import{r as f}from"./index-GiUgBvb1.js";import{a as e}from"./Icon-CuK57VyF.js";import{S as p}from"./Sidebar-lTcm0vcq.js";import"./styled-components.browser.esm-Ctfm6iBV.js";const S={title:"Molecules/Sidebar",component:p,parameters:{layout:"fullscreen"},tags:["autodocs"],decorators:[i=>t.jsx("div",{style:{height:"100vh"},children:t.jsx(i,{})})]},g=[{icon:e.SEARCH_DOCUMENT,label:"Search"},{icon:e.SEARCH_SQL,label:"SQL Search"},{icon:e.LAMP,label:"Projects"},{icon:e.PIPELINE,label:"Pipelines"},{icon:e.COMPUTER,label:"Data & AI Workspace"},{icon:e.CUBE,label:"Artifacts"},{icon:e.DATABASE,label:"Data Sources"},{icon:e.PIE_CHART,label:"Health Monitoring"},{icon:e.BULK_CHECK,label:"Bulk Actions"},{icon:e.CODE,label:"Attribute Management"},{icon:e.GEAR,label:"Administration"}],s={args:{items:g,activeItem:"Pipelines"}},n=()=>{const[i,I]=f.useState("Pipelines"),v=a=>{I(a),console.log(`Clicked on: ${a}`)};return t.jsxs("div",{style:{display:"flex",height:"100%"},children:[t.jsx(p,{items:g,activeItem:i,onItemClick:v}),t.jsx("div",{style:{padding:"20px",backgroundColor:"#f5f7f9",flex:1,display:"flex",alignItems:"center",justifyContent:"center"},children:t.jsxs("div",{style:{fontSize:"18px",color:"#333",textAlign:"center"},children:[t.jsxs("p",{children:["Selected navigation: ",t.jsx("strong",{children:i})]}),t.jsx("p",{children:"Click on sidebar items to navigate"})]})})]})};n.__docgenInfo={description:"",methods:[],displayName:"Interactive"};var o,r,l;s.parameters={...s.parameters,docs:{...(o=s.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    items: sidebarItems,
    activeItem: "Pipelines"
  }
}`,...(l=(r=s.parameters)==null?void 0:r.docs)==null?void 0:l.source}}};var c,d,m;n.parameters={...n.parameters,docs:{...(c=n.parameters)==null?void 0:c.docs,source:{originalSource:`() => {
  const [activeItem, setActiveItem] = useState("Pipelines");
  const handleItemClick = (label: string) => {
    setActiveItem(label);
    console.log(\`Clicked on: \${label}\`);
  };
  return <div style={{
    display: "flex",
    height: "100%"
  }}>
      <Sidebar items={sidebarItems} activeItem={activeItem} onItemClick={handleItemClick} />
      <div style={{
      padding: "20px",
      backgroundColor: "#f5f7f9",
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
        <div style={{
        fontSize: "18px",
        color: "#333",
        textAlign: "center"
      }}>
          <p>
            Selected navigation: <strong>{activeItem}</strong>
          </p>
          <p>Click on sidebar items to navigate</p>
        </div>
      </div>
    </div>;
}`,...(m=(d=n.parameters)==null?void 0:d.docs)==null?void 0:m.source}}};const A=["Default","Interactive"];export{s as Default,n as Interactive,A as __namedExportsOrder,S as default};
