import{j as e}from"./jsx-runtime-CDt2p4po.js";import{r as o,R as E}from"./index-GiUgBvb1.js";import{a as t}from"./styled-components.browser.esm-Ctfm6iBV.js";import{B as L}from"./Button-tnMIwByE.js";import{C as S}from"./CodeEditor-fKz404PR.js";import{I as m,a as g}from"./Icon-CuK57VyF.js";import{I as q}from"./Input-_GCDQAcJ.js";import"./iframe-BAqoMiQf.js";import"./Tooltip-DeRvpXCR.js";const A=t.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--black-100);
  z-index: 1300;
  display: flex;
  align-items: center;
  justify-content: center;
`,M=t.div`
  background: var(--white-900);
  border-radius: 20px;
  box-shadow: 0 2px 16px var(--black-100);
  min-width: 600px;
  max-width: 90vw;
  min-height: 500px;
  padding: 0;
  display: flex;
  flex-direction: column;
`,D=t.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0 24px;
`,O=t.div`
  display: flex;
  align-items: center;
  gap: 8px;
`,z=t.span`
  font-weight: 600;
  font-size: 20px;
`,_=t.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
`,P=t.div`
  padding: 24px;

  color: var(--black-900);
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
`,R=t.div`
  margin: 0 24px;
  background: var(--blue-900);
  color: var(--white-900);
  border-radius: 12px;
  padding: 0;
  font-size: 16px;
  font-weight: 500;
  word-break: break-word;
  box-shadow: 0 1px 4px var(--black-50);
`,B=t.textarea`
  width: 100%;
  min-height: 48px;
  background: transparent;
  color: var(--white-900);
  border: none;
  outline: none;
  resize: vertical;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
  padding: 16px 20px;
  border-radius: 12px;
  box-sizing: border-box;
`,N=t.div`
  padding: 24px;
  padding-bottom: 0;
  flex: 1;
`,Q=t.div`
  border-radius: 20px;
  overflow: hidden;
  background: var(--blue-900);
  min-height: 200px;
  position: relative;
`,V=t.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px;
  padding-top: 16px;
  background: var(--white-900);
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
`,H=t(L)`
  min-width: 100px;
  display: flex;
  align-items: center;
  gap: 6px;
`,x=({open:l,title:d,prompt:a,initialCode:u="",userQuery:s="",onUserQueryChange:p,onCopy:n,onLaunch:C,onSend:f,onCancel:w})=>{const[j,k]=o.useState(u),[c,T]=o.useState(""),[I,h]=o.useState(s);return E.useEffect(()=>{h(s)},[s]),l?e.jsx(A,{children:e.jsxs(M,{children:[e.jsxs(D,{children:[e.jsxs(O,{children:[e.jsx(m,{name:g.TETRASCIENCE_ICON,fill:"var(--blue-600)"}),e.jsx(z,{children:d})]}),e.jsx(_,{onClick:w,children:e.jsx(m,{name:g.CLOSE,width:"20",height:"20",fill:"var(--black-900)"})})]}),e.jsx(P,{children:a}),e.jsx(R,{children:e.jsx(B,{value:I,onChange:r=>{h(r.target.value),p&&p(r.target.value)},rows:2,placeholder:"Type your question here..."})}),e.jsx(N,{children:e.jsx(Q,{children:e.jsx(S,{value:j,onChange:r=>k(r??""),language:"python",theme:"dark",height:200,onCopy:n,onLaunch:C})})}),e.jsxs(V,{children:[e.jsx(q,{value:c,onChange:r=>T(r.target.value),placeholder:"Ask us anything related to your work...",size:"small",onKeyDown:r=>{r.key==="Enter"&&f(c)}}),e.jsxs(H,{variant:"primary",onClick:()=>f(c),children:[e.jsx(m,{name:g.PAPER_PLANE}),"Send"]})]})]})}):null};x.__docgenInfo={description:"",methods:[],displayName:"AssistantModal",props:{open:{required:!0,tsType:{name:"boolean"},description:""},title:{required:!0,tsType:{name:"string"},description:""},prompt:{required:!0,tsType:{name:"string"},description:""},initialCode:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'""',computed:!1}},userQuery:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'""',computed:!1}},onUserQueryChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(value: string) => void",signature:{arguments:[{type:{name:"string"},name:"value"}],return:{name:"void"}}},description:""},onCopy:{required:!0,tsType:{name:"signature",type:"function",raw:"(code: string) => void",signature:{arguments:[{type:{name:"string"},name:"code"}],return:{name:"void"}}},description:""},onLaunch:{required:!0,tsType:{name:"signature",type:"function",raw:"(code: string) => void",signature:{arguments:[{type:{name:"string"},name:"code"}],return:{name:"void"}}},description:""},onSend:{required:!0,tsType:{name:"signature",type:"function",raw:"(input: string) => void",signature:{arguments:[{type:{name:"string"},name:"input"}],return:{name:"void"}}},description:""},onCancel:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""}}};const $={title:"Molecules/AssistantModal",component:x},i=()=>{const[l,d]=o.useState(!1),[a,u]=o.useState(""),[s,p]=o.useState("");return e.jsxs("div",{children:[e.jsx("button",{onClick:()=>d(!0),style:{marginBottom:16},children:"Open Assistant Modal"}),e.jsx(x,{open:l,title:"Tetrascience Assistant",prompt:"Here you may ask questions about task scripts, protocols, and pipelines.",initialCode:a||`Description
`,userQuery:"Please generate an example protocol v3 yaml for Tecan D300e and PerkinElmer EnVision to Dotmatics",onCopy:n=>{u(n),alert("Copied code: "+n)},onLaunch:n=>{alert("Launch with code: "+n)},onSend:n=>{p(n),alert("Sent input: "+n)},onCancel:()=>{d(!1)}}),a&&e.jsxs("div",{style:{marginTop:16},children:[e.jsx("strong",{children:"Last Code:"}),e.jsx("pre",{style:{background:"#f5f5f5",padding:8,borderRadius:4},children:a})]}),s&&e.jsxs("div",{style:{marginTop:8},children:[e.jsx("strong",{children:"Last Input:"})," ",s]})]})};i.__docgenInfo={description:"",methods:[],displayName:"Default"};var y,v,b;i.parameters={...i.parameters,docs:{...(y=i.parameters)==null?void 0:y.docs,source:{originalSource:`() => {
  const [open, setOpen] = useState(false);
  const [lastCode, setLastCode] = useState("");
  const [lastInput, setLastInput] = useState("");
  return <div>
      <button onClick={() => setOpen(true)} style={{
      marginBottom: 16
    }}>
        Open Assistant Modal
      </button>
      <AssistantModal open={open} title="Tetrascience Assistant" prompt="Here you may ask questions about task scripts, protocols, and pipelines." initialCode={lastCode || "Description\\n"} userQuery={\`Please generate an example protocol v3 yaml for Tecan D300e and PerkinElmer EnVision to Dotmatics\`} onCopy={code => {
      setLastCode(code);
      alert("Copied code: " + code);
    }} onLaunch={code => {
      alert("Launch with code: " + code);
    }} onSend={input => {
      setLastInput(input);
      alert("Sent input: " + input);
    }} onCancel={() => {
      setOpen(false);
    }} />
      {lastCode && <div style={{
      marginTop: 16
    }}>
          <strong>Last Code:</strong>
          <pre style={{
        background: "#f5f5f5",
        padding: 8,
        borderRadius: 4
      }}>
            {lastCode}
          </pre>
        </div>}
      {lastInput && <div style={{
      marginTop: 8
    }}>
          <strong>Last Input:</strong> {lastInput}
        </div>}
    </div>;
}`,...(b=(v=i.parameters)==null?void 0:v.docs)==null?void 0:b.source}}};const ee=["Default"];export{i as Default,ee as __namedExportsOrder,$ as default};
