import{j as t}from"./jsx-runtime-CDt2p4po.js";import{r as m}from"./index-GiUgBvb1.js";import{r as h,a as n}from"./styled-components.browser.esm-Ctfm6iBV.js";import{B as v}from"./Button-tnMIwByE.js";const x=e=>{switch(e){case"active":return"var(--blue-100)";case"hover":return"var(--grey-100)";case"disabled":return"transparent";default:return"transparent"}},y=e=>{switch(e){case"disabled":return"var(--grey-400)";default:return"var(--black-900)"}},b=e=>{switch(e){case"disabled":return"var(--grey-400)";default:return"var(--grey-400)"}},w=e=>{switch(e){case"disabled":return"var(--grey-400)";default:return"var(--blue-600)"}},C=n.div`
  padding: 20px 16px;
  border-radius: 8px;
  background-color: ${e=>x(e.status)};
  cursor: ${e=>e.status==="disabled"?"not-allowed":"pointer"};
  transition: background-color 0.2s ease;

  ${e=>e.status==="default"&&h`
      &:hover {
        background-color: var(--grey-100);
      }
    `}
`,k=n.h3`
  margin: 0 0 4px 0;
  font-family: "Inter", sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: ${e=>y(e.status)};
`,j=n.p`
  margin: 0 0 16px 0;
  font-family: "Inter", sans-serif;
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px;
  line-height: 20px;
  color: ${e=>b(e.status)};
`,T=n.div`
  display: flex;
  align-items: center;
  gap: 16px;
`,q=n(v)`
  flex-shrink: 0;
`,$=n.a`
  font-family: "Inter", sans-serif;
  font-size: 13px;
  font-style: normal;
  font-weight: 500;
  line-height: 18px;
  color: ${e=>w(e.status)};
  text-decoration: none;
  cursor: ${e=>e.status==="disabled"?"not-allowed":"pointer"};

  &:hover {
    text-decoration: ${e=>e.status==="disabled"?"none":"underline"};
  }
`,c=m.forwardRef(({title:e,description:a,buttonText:s,linkText:o,status:r="default",onButtonClick:l,onLinkClick:d,className:u},p)=>{const f=i=>{i.stopPropagation(),r!=="disabled"&&l&&l()},g=i=>{i.stopPropagation(),r!=="disabled"&&d&&d()};return t.jsxs(C,{ref:p,status:r,className:u,children:[t.jsx(k,{status:r,children:e}),a&&t.jsx(j,{status:r,children:a}),t.jsxs(T,{children:[s&&t.jsx(q,{variant:"secondary",size:"small",disabled:r==="disabled",onClick:f,leftIcon:t.jsx("svg",{width:"16",height:"16",viewBox:"0 0 16 16",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:t.jsx("rect",{x:"3",y:"3",width:"10",height:"10",rx:"2",fill:"currentColor"})}),children:s}),o&&t.jsx($,{status:r,onClick:g,href:r==="disabled"?void 0:"#",children:o})]})]})});c.displayName="CardSidebar";c.__docgenInfo={description:"",methods:[],displayName:"CardSidebar",props:{title:{required:!0,tsType:{name:"string"},description:""},description:{required:!1,tsType:{name:"string"},description:""},buttonText:{required:!1,tsType:{name:"string"},description:""},linkText:{required:!1,tsType:{name:"string"},description:""},status:{required:!1,tsType:{name:"union",raw:'"default" | "active" | "hover" | "disabled"',elements:[{name:"literal",value:'"default"'},{name:"literal",value:'"active"'},{name:"literal",value:'"hover"'},{name:"literal",value:'"disabled"'}]},description:"",defaultValue:{value:'"default"',computed:!1}},onButtonClick:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onLinkClick:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},className:{required:!1,tsType:{name:"string"},description:""}}};export{c as C};
