import{j as e}from"./jsx-runtime-CDt2p4po.js";import{r as n}from"./index-GiUgBvb1.js";import{u as j,a as o,l as a}from"./styled-components.browser.esm-Ctfm6iBV.js";import{B as u}from"./Button-tnMIwByE.js";import{I as k,a as C}from"./Icon-CuK57VyF.js";const T=j`
	body.stop-scrolling {
		overflow: hidden;
	}
`,F=a`
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
`,O=a`
	from {
		opacity: 1;
	}
	to {
		opacity: 0;
	}
`,$=a`
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
`,q=a`
	from {
		opacity: 1;
	}
	to {
		opacity: 0;
	}
`,I=o.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10000;
  animation: ${t=>t.$isFadeOut?O:F} 0.3s
    ease forwards;
  display: flex;
  align-items: center;
  justify-content: center;
`,L=o.button`
  background-color: var(--black-500);
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  backdrop-filter: blur(2px);
  box-shadow: none;
  border: none;
  height: 100%;
  animation: ${t=>t.$isFadeOut?q:$}
    0.3s ease forwards;
`,M=o.div`
  position: relative;
  background: var(--theme-background, var(--white-900));
  border-radius: var(--theme-radius-large, 16px);
  width: ${t=>t.width||"480px"};
  max-width: 90vw;
  padding: 0;
  box-shadow: 0px 4px 12px 0px var(--black-100),
    0px 2px 4px -2px var(--black-100);
  z-index: 1;
  transform: ${t=>t.$isFadeOut?"scale(0.95)":"scale(1)"};
  opacity: ${t=>t.$isFadeOut?0:1};
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
  max-height: 90vh;
  display: flex;
  flex-direction: column;

  @media (max-width: 767px) {
    width: calc(100% - 40px) !important;
  }
`,z=o.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  border-bottom: 1px solid var(--grey-100);
`,N=o.h3`
  margin: 0;
  font-family: "Inter", sans-serif;
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: 28px;
  color: var(--black-900);
`,f=o.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--black-900);
  width: 24px;
  height: 24px;

  &:hover {
    color: var(--black-900);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`,B=o.div`
  padding: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  @media (max-width: 767px) {
    justify-content: center !important;

    .button {
      display: flex !important;
      width: 100%;
    }
  }
`,E=o.div`
  color: var(--grey-500);
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
  margin: 0 24px;
  overflow-y: auto;
  flex: 1;
  max-height: calc(90vh - 140px); /* Account for header and footer */
`,V=({isOpen:t,onClose:m,onCloseLabel:x,onConfirm:h,onConfirmLabel:y,children:g,width:b="400px",className:v="",hideActions:w=!1,title:d})=>{const[i,p]=n.useState(!1),[l,c]=n.useState(!1),s=n.useRef(null);n.useEffect(()=>{if(t)p(!0),c(!1);else{if(!i)return;c(!0),s.current=setTimeout(()=>{p(!1)},300)}return()=>{s.current&&clearTimeout(s.current)}},[t,i]),n.useEffect(()=>(i?typeof document<"u"&&document.body.classList.add("stop-scrolling"):typeof document<"u"&&document.body.classList.remove("stop-scrolling"),()=>{typeof document<"u"&&document.body.classList.remove("stop-scrolling")}),[i]);const r=()=>{c(!0),s.current=setTimeout(()=>{m()},300)};return i&&e.jsxs(e.Fragment,{children:[e.jsx(T,{}),e.jsxs(I,{$isFadeOut:l,className:v,children:[e.jsx(L,{$isFadeOut:l,onClick:r}),e.jsxs(M,{$isFadeOut:l,width:b,children:[d&&e.jsxs(z,{children:[e.jsx(N,{children:d}),e.jsx(f,{onClick:r,children:e.jsx(k,{name:C.CLOSE})})]}),!d&&e.jsx(f,{onClick:r,style:{position:"absolute",top:"16px",right:"16px"},children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"18",y1:"6",x2:"6",y2:"18"}),e.jsx("line",{x1:"6",y1:"6",x2:"18",y2:"18"})]})}),e.jsx(E,{children:g}),!w&&e.jsxs(B,{children:[e.jsx(u,{variant:"tertiary",onClick:r,className:"button",size:"medium",fullWidth:!0,children:x||"Cancel"}),e.jsx(u,{variant:"primary",onClick:h,className:"button",size:"medium",fullWidth:!0,children:y||"Confirm"})]})]})]})]})};V.__docgenInfo={description:"",methods:[],displayName:"Modal",props:{isOpen:{required:!0,tsType:{name:"boolean"},description:""},onClose:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onCloseLabel:{required:!1,tsType:{name:"string"},description:""},onConfirm:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onConfirmLabel:{required:!1,tsType:{name:"string"},description:""},children:{required:!0,tsType:{name:"ReactNode"},description:""},width:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"400px"',computed:!1}},className:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'""',computed:!1}},hideActions:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},title:{required:!1,tsType:{name:"string"},description:""}}};export{V as M};
