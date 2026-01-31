import{j as t}from"./jsx-runtime-CDt2p4po.js";import{r as v}from"./index-GiUgBvb1.js";import{a as M}from"./styled-components.browser.esm-Ctfm6iBV.js";import{M as V}from"./MenuItem-CxQrVaPL.js";import"./Checkbox-DJ5m03ZR.js";import"./Icon-CuK57VyF.js";const B=M.div`
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0px 4px 12px 0px var(--black-100),
    0px 2px 4px -2px var(--black-100);
  background-color: var(--white-900);
  border: 1px solid var(--grey-200);
`,F=M.div`
  padding: 8px 16px;
  font-family: "Inter", sans-serif;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px;
  color: var(--grey-600);
  border-bottom: 1px solid var(--grey-200);
`,G=M.div`
  display: flex;
  flex-direction: column;
`,i=({title:l,items:p,onItemClick:m,onItemCheckChange:d,activeItemId:I=null,className:x})=>{const s=e=>{m&&m(e)},b=(e,n)=>{d&&d(e,n)};return t.jsxs(B,{className:x,children:[l&&t.jsx(F,{children:l}),t.jsx(G,{children:p.map(e=>t.jsx(V,{label:e.label,checked:e.checked,showCheckbox:e.showCheckbox,active:I===e.id||e.active,onClick:()=>s(e.id),onCheckChange:n=>b(e.id,n)},e.id))})]})};i.__docgenInfo={description:"",methods:[],displayName:"Menu",props:{title:{required:!1,tsType:{name:"string"},description:""},items:{required:!0,tsType:{name:"Array",elements:[{name:"MenuItemData"}],raw:"MenuItemData[]"},description:""},onItemClick:{required:!1,tsType:{name:"signature",type:"function",raw:"(itemId: string) => void",signature:{arguments:[{type:{name:"string"},name:"itemId"}],return:{name:"void"}}},description:""},onItemCheckChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(itemId: string, checked: boolean) => void",signature:{arguments:[{type:{name:"string"},name:"itemId"},{type:{name:"boolean"},name:"checked"}],return:{name:"void"}}},description:""},activeItemId:{required:!1,tsType:{name:"union",raw:"string | null",elements:[{name:"string"},{name:"null"}]},description:"",defaultValue:{value:"null",computed:!1}},className:{required:!1,tsType:{name:"string"},description:""}}};const X={title:"Molecules/Menu",component:i,parameters:{layout:"centered"},tags:["autodocs"]},g=[{id:"item1",label:"Menu Item 1",showCheckbox:!1},{id:"item2",label:"Menu Item 2",showCheckbox:!1},{id:"item3",label:"Menu Item 3",showCheckbox:!1}],H=[{id:"item1",label:"Menu Item 1",showCheckbox:!0,checked:!1},{id:"item2",label:"Menu Item 2",showCheckbox:!0,checked:!0},{id:"item3",label:"Menu Item 3",showCheckbox:!0,checked:!1}],o={args:{items:g}},c={args:{title:"Title",items:g}},u={args:{title:"Title",items:H}},h={args:{title:"Title",items:g,activeItemId:"item2"}},a=()=>{const[l,p]=v.useState(null),[m,d]=v.useState([{id:"item1",label:"Menu Item 1",showCheckbox:!0,checked:!1},{id:"item2",label:"Menu Item 2",showCheckbox:!0,checked:!0},{id:"item3",label:"Menu Item 3",showCheckbox:!0,checked:!1}]),I=s=>{p(s)},x=(s,b)=>{d(e=>e.map(n=>n.id===s?{...n,checked:b}:n))};return t.jsx("div",{style:{width:"300px"},children:t.jsx(i,{title:"Interactive Menu",items:m,activeItemId:l,onItemClick:I,onItemCheckChange:x})})},r=()=>t.jsxs("div",{style:{display:"flex",gap:"20px"},children:[t.jsx("div",{style:{width:"300px"},children:t.jsx(i,{title:"Title",items:[{id:"item1",label:"Menu Item 1"},{id:"item2",label:"Menu Item 2"}]})}),t.jsx("div",{style:{width:"300px"},children:t.jsx(i,{title:"Title",items:[{id:"item1",label:"Menu Item 1"},{id:"item2",label:"Menu Item 2"},{id:"item3",label:"Menu Item 3"}]})}),t.jsx("div",{style:{width:"300px"},children:t.jsx(i,{title:"Title",items:[{id:"item1",label:"Menu Item 1"},{id:"item2",label:"Menu Item 2"},{id:"item3",label:"Menu Item 3"},{id:"item4",label:"Menu Item 4"}]})})]});a.__docgenInfo={description:"",methods:[],displayName:"Interactive"};r.__docgenInfo={description:"",methods:[],displayName:"MultipleMenus"};var k,f,C;o.parameters={...o.parameters,docs:{...(k=o.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    items: defaultItems
  }
}`,...(C=(f=o.parameters)==null?void 0:f.docs)==null?void 0:C.source}}};var y,w,T;c.parameters={...c.parameters,docs:{...(y=c.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    title: "Title",
    items: defaultItems
  }
}`,...(T=(w=c.parameters)==null?void 0:w.docs)==null?void 0:T.source}}};var j,S,W;u.parameters={...u.parameters,docs:{...(j=u.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    title: "Title",
    items: itemsWithCheckboxes
  }
}`,...(W=(S=u.parameters)==null?void 0:S.docs)==null?void 0:W.source}}};var _,q,A;h.parameters={...h.parameters,docs:{...(_=h.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    title: "Title",
    items: defaultItems,
    activeItemId: "item2"
  }
}`,...(A=(q=h.parameters)==null?void 0:q.docs)==null?void 0:A.source}}};var D,N,E;a.parameters={...a.parameters,docs:{...(D=a.parameters)==null?void 0:D.docs,source:{originalSource:`() => {
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [items, setItems] = useState<MenuItemData[]>([{
    id: "item1",
    label: "Menu Item 1",
    showCheckbox: true,
    checked: false
  }, {
    id: "item2",
    label: "Menu Item 2",
    showCheckbox: true,
    checked: true
  }, {
    id: "item3",
    label: "Menu Item 3",
    showCheckbox: true,
    checked: false
  }]);
  const handleItemClick = (itemId: string) => {
    setActiveItemId(itemId);
  };
  const handleItemCheckChange = (itemId: string, checked: boolean) => {
    setItems(prevItems => prevItems.map(item => item.id === itemId ? {
      ...item,
      checked
    } : item));
  };
  return <div style={{
    width: "300px"
  }}>
      <Menu title="Interactive Menu" items={items} activeItemId={activeItemId} onItemClick={handleItemClick} onItemCheckChange={handleItemCheckChange} />
    </div>;
}`,...(E=(N=a.parameters)==null?void 0:N.docs)==null?void 0:E.source}}};var z,O,R;r.parameters={...r.parameters,docs:{...(z=r.parameters)==null?void 0:z.docs,source:{originalSource:`() => {
  return <div style={{
    display: "flex",
    gap: "20px"
  }}>
      <div style={{
      width: "300px"
    }}>
        <Menu title="Title" items={[{
        id: "item1",
        label: "Menu Item 1"
      }, {
        id: "item2",
        label: "Menu Item 2"
      }]} />
      </div>
      <div style={{
      width: "300px"
    }}>
        <Menu title="Title" items={[{
        id: "item1",
        label: "Menu Item 1"
      }, {
        id: "item2",
        label: "Menu Item 2"
      }, {
        id: "item3",
        label: "Menu Item 3"
      }]} />
      </div>
      <div style={{
      width: "300px"
    }}>
        <Menu title="Title" items={[{
        id: "item1",
        label: "Menu Item 1"
      }, {
        id: "item2",
        label: "Menu Item 2"
      }, {
        id: "item3",
        label: "Menu Item 3"
      }, {
        id: "item4",
        label: "Menu Item 4"
      }]} />
      </div>
    </div>;
}`,...(R=(O=r.parameters)==null?void 0:O.docs)==null?void 0:R.source}}};const Y=["Default","WithTitle","WithCheckboxes","WithActiveItem","Interactive","MultipleMenus"];export{o as Default,a as Interactive,r as MultipleMenus,h as WithActiveItem,u as WithCheckboxes,c as WithTitle,Y as __namedExportsOrder,X as default};
