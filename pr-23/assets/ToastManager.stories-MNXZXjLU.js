import{j as o}from"./jsx-runtime-CDt2p4po.js";import{a as u}from"./styled-components.browser.esm-Ctfm6iBV.js";import{r as m}from"./index-GiUgBvb1.js";import{r as k}from"./index-C8NrMXaH.js";import{T as E}from"./Toast-BkT690EI.js";import"./Icon-CuK57VyF.js";const F=u.div`
  position: fixed;
  ${t=>t.position==="top"?"top: 16px;":"bottom: 16px;"}
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
`,P=u.div`
  opacity: 0;
  transform: translateY(
    ${t=>t.theme.position==="top"?"-10px":"10px"}
  );
  animation: ${t=>t.theme.position==="top"?"slideDownFade":"slideUpFade"}
    0.3s forwards;
  pointer-events: auto;

  @keyframes slideDownFade {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideUpFade {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;m.createContext(void 0);let p=[],I=0,h=[];const v=()=>{h.forEach(t=>t(p))},i=(t,e,s="default",n=5e3)=>{const a=`toast-${I++}`,r={id:a,heading:t,description:e,type:s,duration:n};return p=[...p,r],v(),n>0&&setTimeout(()=>b(a),n),a},b=t=>{p=p.filter(e=>e.id!==t),v()},M=t=>(h.push(t),t(p),()=>{h=h.filter(e=>e!==t)}),c={show:(t,e,s="default",n=5e3)=>i(t,e,s,n),info:(t,e,s)=>i(t,e,"info",s),success:(t,e,s)=>i(t,e,"success",s),warning:(t,e,s)=>i(t,e,"warning",s),danger:(t,e,s)=>i(t,e,"danger",s),default:(t,e,s)=>i(t,e,"default",s),dismiss:t=>{b(t)}},D=({position:t="top"})=>{const[e,s]=m.useState([]),[n,a]=m.useState(!1);return m.useEffect(()=>{a(!0);const r=M(s);return()=>{r(),a(!1)}},[]),n?k.createPortal(o.jsx(F,{position:t,children:e.map(r=>o.jsx(P,{theme:{position:t},children:o.jsx(E,{type:r.type,heading:r.heading,description:r.description})},r.id))}),document.body):null},_={title:"Molecules/ToastManager",component:D,parameters:{layout:"centered"}},$=u.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
`,d=u.button`
  padding: 8px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: white;
  background-color: ${t=>{switch(t.variant){case"info":return"#4072D2";case"success":return"#08AD37";case"warning":return"#F9AD14";case"danger":return"#F93614";default:return"#48566A"}}};

  &:hover {
    opacity: 0.9;
  }
`,A=u.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid #e1e4e8;
  width: 600px;
`,S=({position:t})=>{const e=()=>c.info("Info Toast","This is an information message"),s=()=>c.success("Success Toast","Operation completed successfully"),n=()=>c.warning("Warning Toast","This action might have consequences"),a=()=>c.danger("Danger Toast","An error has occurred"),r=()=>c.default("Default Toast","This is a default message"),C=()=>c.info("This toast has no description");return o.jsxs(A,{children:[o.jsx("h2",{children:"Toast Showcase"}),o.jsxs("p",{children:["Position: ",t]}),o.jsx("h3",{children:"Toast Types"}),o.jsxs($,{children:[o.jsx(d,{variant:"default",onClick:r,children:"Default Toast"}),o.jsx(d,{variant:"info",onClick:e,children:"Info Toast"}),o.jsx(d,{variant:"success",onClick:s,children:"Success Toast"}),o.jsx(d,{variant:"warning",onClick:n,children:"Warning Toast"}),o.jsx(d,{variant:"danger",onClick:a,children:"Danger Toast"})]}),o.jsx(d,{variant:"info",onClick:C,children:"Toast without description"}),o.jsx(D,{position:t})]})},l={render:()=>o.jsx(S,{position:"top"})},f={render:()=>o.jsx(S,{position:"bottom"})};var x,T,g;l.parameters={...l.parameters,docs:{...(x=l.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => <Showcase position="top" />
}`,...(g=(T=l.parameters)==null?void 0:T.docs)==null?void 0:g.source}}};var w,j,y;f.parameters={...f.parameters,docs:{...(w=f.parameters)==null?void 0:w.docs,source:{originalSource:`{
  render: () => <Showcase position="bottom" />
}`,...(y=(j=f.parameters)==null?void 0:j.docs)==null?void 0:y.source}}};const q=["TopPosition","BottomPosition"];export{f as BottomPosition,l as TopPosition,q as __namedExportsOrder,_ as default};
