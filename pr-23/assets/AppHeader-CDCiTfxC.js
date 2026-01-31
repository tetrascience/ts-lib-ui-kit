import{j as e}from"./jsx-runtime-CDt2p4po.js";import{a as r}from"./styled-components.browser.esm-Ctfm6iBV.js";import{B as m}from"./Button-tnMIwByE.js";import{I as n,a}from"./Icon-CuK57VyF.js";const u=r.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: auto;
  width: 100%;
  padding: 16px 28px;
  box-sizing: border-box;
  border-bottom: 1px solid var(--grey-200);
  background-color: var(--white-900);
`,h=r.div`
  color: var(--black-900);
  font-family: "Inter", sans-serif;
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: 28px;
`,x=r.div`
  display: flex;
  align-items: center;
  gap: 12px;
`,f=r.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background-color: var(--grey-100);
  }
`,v=r.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--blue-100);
  background-image: ${t=>t.src?`url(${t.src})`:"none"};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--blue-600);
  font-weight: 500;
  font-size: 14px;
  font-family: "Inter", sans-serif;
`,y=r.div`
  font-family: "Inter", sans-serif;
  color: var(--grey-400);
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
`,o=r(m)`
  width: 32px;
  height: 32px;
  padding: 0;
  min-height: 0;
  border-radius: 4px;
`,b=r.div`
  height: 20px;
  width: 1px;
  background-color: var(--grey-200);
  margin: 0;
`,j=({hostname:t,userProfile:i,onHomeClick:s,onSettingsClick:c,onUserProfileClick:d})=>{const l=p=>p.split(" ").map(g=>g.charAt(0)).join("").toUpperCase().substring(0,2);return e.jsxs(u,{children:[e.jsx(h,{children:t}),e.jsxs(x,{children:[e.jsx(o,{variant:"tertiary",size:"small",onClick:s,"aria-label":"Home",children:e.jsx(n,{name:a.HOME,width:"20",height:"20",fill:"var(--grey-600)"})}),e.jsx(o,{variant:"tertiary",size:"small",onClick:c,"aria-label":"Settings",children:e.jsx(n,{name:a.GEAR,width:"20",height:"20",fill:"var(--grey-600)"})}),e.jsx(b,{}),e.jsxs(f,{onClick:d,children:[e.jsx(v,{src:i.avatar,children:!i.avatar&&l(i.name)}),e.jsx(y,{children:i.name})]})]})]})};j.__docgenInfo={description:"",methods:[],displayName:"AppHeader",props:{hostname:{required:!0,tsType:{name:"string"},description:""},userProfile:{required:!0,tsType:{name:"UserProfileProps"},description:""},onHomeClick:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onSettingsClick:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onUserProfileClick:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""}}};export{j as A};
