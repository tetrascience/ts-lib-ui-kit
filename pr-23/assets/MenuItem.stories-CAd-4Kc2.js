import{j as t}from"./jsx-runtime-CDt2p4po.js";import{r as k}from"./index-GiUgBvb1.js";import{M as c}from"./MenuItem-CxQrVaPL.js";import"./styled-components.browser.esm-Ctfm6iBV.js";import"./Checkbox-DJ5m03ZR.js";import"./Icon-CuK57VyF.js";const Q={title:"Atoms/MenuItem",component:c,parameters:{layout:"centered"},tags:["autodocs"]},s={args:{label:"Menu Item",showCheckbox:!1,active:!1}},r={args:{label:"Menu Item with Checkbox",showCheckbox:!0,checked:!1},parameters:{docs:{description:{story:"When showCheckbox is true, the label is displayed as part of the Checkbox component."}}}},a={args:{label:"Checked Menu Item",showCheckbox:!0,checked:!0}},i={args:{label:"Active Menu Item",active:!0}},h={args:{label:"Active Checked Menu Item",showCheckbox:!0,checked:!0,active:!0}},o=()=>t.jsxs("div",{style:{width:"300px",border:"1px solid #eee",borderRadius:"8px",overflow:"hidden"},children:[t.jsx(c,{label:"Regular MenuItem (without checkbox)"}),t.jsx(c,{label:"MenuItem with Checkbox",showCheckbox:!0,checked:!1})]}),n=()=>{const[d,q]=k.useState(null),[m,z]=k.useState({item1:!1,item2:!0,item3:!1}),l=e=>{q(e)},u=(e,B)=>{z(F=>({...F,[e]:B}))};return t.jsxs("div",{style:{width:"300px",border:"1px solid #eee",borderRadius:"8px",overflow:"hidden"},children:[t.jsx(c,{label:"Menu Item 1",active:d==="item1",onClick:()=>l("item1"),showCheckbox:!0,checked:m.item1,onCheckChange:e=>u("item1",e)}),t.jsx(c,{label:"Menu Item 2",active:d==="item2",onClick:()=>l("item2"),showCheckbox:!0,checked:m.item2,onCheckChange:e=>u("item2",e)}),t.jsx(c,{label:"Menu Item 3",active:d==="item3",onClick:()=>l("item3"),showCheckbox:!0,checked:m.item3,onCheckChange:e=>u("item3",e)})]})};o.__docgenInfo={description:"",methods:[],displayName:"ComparisonWithAndWithoutCheckbox"};n.__docgenInfo={description:"",methods:[],displayName:"Interactive"};var C,p,b;s.parameters={...s.parameters,docs:{...(C=s.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    label: "Menu Item",
    showCheckbox: false,
    active: false
  }
}`,...(b=(p=s.parameters)==null?void 0:p.docs)==null?void 0:b.source}}};var x,I,v;r.parameters={...r.parameters,docs:{...(x=r.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    label: "Menu Item with Checkbox",
    showCheckbox: true,
    checked: false
  },
  parameters: {
    docs: {
      description: {
        story: "When showCheckbox is true, the label is displayed as part of the Checkbox component."
      }
    }
  }
}`,...(v=(I=r.parameters)==null?void 0:I.docs)==null?void 0:v.source}}};var g,w,M;a.parameters={...a.parameters,docs:{...(g=a.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    label: "Checked Menu Item",
    showCheckbox: true,
    checked: true
  }
}`,...(M=(w=a.parameters)==null?void 0:w.docs)==null?void 0:M.source}}};var f,A,W;i.parameters={...i.parameters,docs:{...(f=i.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    label: "Active Menu Item",
    active: true
  }
}`,...(W=(A=i.parameters)==null?void 0:A.docs)==null?void 0:W.source}}};var y,S,j;h.parameters={...h.parameters,docs:{...(y=h.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    label: "Active Checked Menu Item",
    showCheckbox: true,
    checked: true,
    active: true
  }
}`,...(j=(S=h.parameters)==null?void 0:S.docs)==null?void 0:j.source}}};var R,_,E;o.parameters={...o.parameters,docs:{...(R=o.parameters)==null?void 0:R.docs,source:{originalSource:`() => {
  return <div style={{
    width: "300px",
    border: "1px solid #eee",
    borderRadius: "8px",
    overflow: "hidden"
  }}>
            <MenuItem label="Regular MenuItem (without checkbox)" />
            <MenuItem label="MenuItem with Checkbox" showCheckbox={true} checked={false} />
        </div>;
}`,...(E=(_=o.parameters)==null?void 0:_.docs)==null?void 0:E.source}}};var D,N,O;n.parameters={...n.parameters,docs:{...(D=n.parameters)==null?void 0:D.docs,source:{originalSource:`() => {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({
    item1: false,
    item2: true,
    item3: false
  });
  const handleClick = (itemId: string) => {
    setActiveItem(itemId);
  };
  const handleCheckChange = (itemId: string, isChecked: boolean) => {
    setChecked(prev => ({
      ...prev,
      [itemId]: isChecked
    }));
  };
  return <div style={{
    width: "300px",
    border: "1px solid #eee",
    borderRadius: "8px",
    overflow: "hidden"
  }}>
            <MenuItem label="Menu Item 1" active={activeItem === "item1"} onClick={() => handleClick("item1")} showCheckbox={true} checked={checked.item1} onCheckChange={isChecked => handleCheckChange("item1", isChecked)} />
            <MenuItem label="Menu Item 2" active={activeItem === "item2"} onClick={() => handleClick("item2")} showCheckbox={true} checked={checked.item2} onCheckChange={isChecked => handleCheckChange("item2", isChecked)} />
            <MenuItem label="Menu Item 3" active={activeItem === "item3"} onClick={() => handleClick("item3")} showCheckbox={true} checked={checked.item3} onCheckChange={isChecked => handleCheckChange("item3", isChecked)} />
        </div>;
}`,...(O=(N=n.parameters)==null?void 0:N.docs)==null?void 0:O.source}}};const T=["Default","WithCheckbox","WithCheckboxChecked","Active","ActiveWithCheckbox","ComparisonWithAndWithoutCheckbox","Interactive"];export{i as Active,h as ActiveWithCheckbox,o as ComparisonWithAndWithoutCheckbox,s as Default,n as Interactive,r as WithCheckbox,a as WithCheckboxChecked,T as __namedExportsOrder,Q as default};
