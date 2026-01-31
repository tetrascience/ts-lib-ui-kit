import{j as e}from"./jsx-runtime-CDt2p4po.js";import{r as d}from"./index-GiUgBvb1.js";import{a as s}from"./styled-components.browser.esm-Ctfm6iBV.js";import{B as x}from"./Button-tnMIwByE.js";import{C as P}from"./CodeEditor-fKz404PR.js";import{M as w}from"./Modal-sd89y6Dy.js";import"./iframe-BAqoMiQf.js";import"./Icon-CuK57VyF.js";import"./Tooltip-DeRvpXCR.js";const E=s.div`
  padding: 12px 0;
  flex: 1;
`,p=({open:t,initialValue:n="",title:o="",onSave:l,onCancel:u})=>{const[r,y]=d.useState(n),C=()=>{l(r)};return e.jsx(w,{isOpen:t,onClose:u,onCloseLabel:"Cancel",onConfirm:C,onConfirmLabel:"Save Code",title:o,width:"600px",children:e.jsx(E,{children:e.jsx(P,{value:r,onChange:S=>y(S??""),language:"python",height:300,theme:"dark",onCopy:()=>{},onLaunch:()=>{}})})})};p.__docgenInfo={description:"",methods:[],displayName:"PythonEditorModal",props:{open:{required:!0,tsType:{name:"boolean"},description:""},initialValue:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'""',computed:!1}},title:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'""',computed:!1}},onSave:{required:!0,tsType:{name:"signature",type:"function",raw:"(value: string) => void",signature:{arguments:[{type:{name:"string"},name:"value"}],return:{name:"void"}}},description:""},onCancel:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""}}};const D={title:"Molecules/PythonEditorModal",component:p,parameters:{layout:"centered"},tags:["autodocs"]},j=s.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 800px;
`,M=s.pre`
  background: var(--grey-100);
  padding: 12px;
  border-radius: 8px;
  overflow: auto;
  max-height: 200px;
  font-family: monospace;
  font-size: 14px;
  margin-top: 8px;
`,_=s.div`
  margin-top: 16px;
`,a=()=>{const[t,n]=d.useState(!1),[o,l]=d.useState("");return e.jsxs(j,{children:[e.jsx(x,{variant:"primary",onClick:()=>n(!0),children:"Open Python Editor Modal"}),e.jsx(p,{open:t,title:"Edit Python Code",initialValue:o||`def add(a, b):
  return a + b

result = add(5, 3)
print(result)`,onSave:r=>{l(r),n(!1)},onCancel:()=>{n(!1)}}),o&&e.jsxs(_,{children:[e.jsx("strong",{children:"Last Saved Code:"}),e.jsx(M,{children:o})]})]})},i={name:"Default",args:{open:!0,title:"Python Editor",initialValue:`def hello_world():
  print('Hello, World!')

hello_world()`,onSave:t=>console.log("Saving code:",t),onCancel:()=>console.log("Modal closed")}};a.__docgenInfo={description:"",methods:[],displayName:"Interactive"};var c,m,v;a.parameters={...a.parameters,docs:{...(c=a.parameters)==null?void 0:c.docs,source:{originalSource:`() => {
  const [open, setOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState("");
  const initialCode = "def add(a, b):\\n  return a + b\\n\\nresult = add(5, 3)\\nprint(result)";
  return <StoryContainer>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open Python Editor Modal
      </Button>

      <PythonEditorModal open={open} title="Edit Python Code" initialValue={lastSaved || initialCode} onSave={value => {
      setLastSaved(value);
      setOpen(false);
    }} onCancel={() => {
      setOpen(false);
    }} />

      {lastSaved && <Preview>
          <strong>Last Saved Code:</strong>
          <CodePreview>{lastSaved}</CodePreview>
        </Preview>}
    </StoryContainer>;
}`,...(v=(m=a.parameters)==null?void 0:m.docs)==null?void 0:v.source}}};var f,g,h;i.parameters={...i.parameters,docs:{...(f=i.parameters)==null?void 0:f.docs,source:{originalSource:`{
  name: "Default",
  args: {
    open: true,
    title: "Python Editor",
    initialValue: "def hello_world():\\n  print('Hello, World!')\\n\\nhello_world()",
    onSave: value => console.log("Saving code:", value),
    onCancel: () => console.log("Modal closed")
  }
}`,...(h=(g=i.parameters)==null?void 0:g.docs)==null?void 0:h.source}}};const W=["Interactive","DefaultStory"];export{i as DefaultStory,a as Interactive,W as __namedExportsOrder,D as default};
