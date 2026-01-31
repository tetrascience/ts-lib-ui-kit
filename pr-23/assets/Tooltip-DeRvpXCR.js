import{j as n}from"./jsx-runtime-CDt2p4po.js";import{r as a}from"./index-GiUgBvb1.js";import{a as i,r}from"./styled-components.browser.esm-Ctfm6iBV.js";const f=i.div`
  position: relative;
  display: inline-flex;
  width: fit-content;
`,b=i.div`
  position: absolute;
  background-color: var(--black);
  color: var(--white);
  padding: 8px 12px;
  border-radius: 6px;
  font-family: "Inter", sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 18px;
  max-width: 250px;
  min-width: min-content;
  width: max-content;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  white-space: normal;
  word-wrap: break-word;
  box-sizing: border-box;
  text-align: left;

  ${e=>e.$isVisible&&r`
      opacity: 1;
      visibility: visible;
    `}

  ${e=>{switch(e.placement){case"top":return r`
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(-8px);

          &::after {
            content: "";
            position: absolute;
            top: 100%;
            left: 50%;
            margin-left: -6px;
            border-width: 6px;
            border-style: solid;
            border-color: var(--black) transparent transparent transparent;
          }
        `;case"right":return r`
          top: 50%;
          left: 100%;
          transform: translateY(-50%) translateX(8px);

          &::after {
            content: "";
            position: absolute;
            top: 50%;
            right: 100%;
            margin-top: -6px;
            border-width: 6px;
            border-style: solid;
            border-color: transparent var(--black) transparent transparent;
          }
        `;case"bottom":return r`
          top: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(8px);

          &::after {
            content: "";
            position: absolute;
            bottom: 100%;
            left: 50%;
            margin-left: -6px;
            border-width: 6px;
            border-style: solid;
            border-color: transparent transparent var(--black) transparent;
          }
        `;case"left":return r`
          top: 50%;
          right: 100%;
          transform: translateY(-50%) translateX(-8px);

          &::after {
            content: "";
            position: absolute;
            top: 50%;
            left: 100%;
            margin-top: -6px;
            border-width: 6px;
            border-style: solid;
            border-color: transparent transparent transparent var(--black);
          }
        `;default:return""}}}
`,x=({content:e,children:s,placement:l="top",className:p,delay:c=100})=>{const[d,o]=a.useState(!1),t=a.useRef(null),u=()=>{t.current&&clearTimeout(t.current),t.current=setTimeout(()=>{o(!0)},c)},m=()=>{t.current&&clearTimeout(t.current),o(!1)};return a.useEffect(()=>()=>{t.current&&clearTimeout(t.current)},[]),n.jsxs(f,{className:p,onMouseEnter:u,onMouseLeave:m,children:[s,n.jsx(b,{placement:l,$isVisible:d,children:e})]})};x.__docgenInfo={description:"",methods:[],displayName:"Tooltip",props:{content:{required:!0,tsType:{name:"ReactNode"},description:""},children:{required:!0,tsType:{name:"ReactNode"},description:""},placement:{required:!1,tsType:{name:"union",raw:'"top" | "right" | "bottom" | "left"',elements:[{name:"literal",value:'"top"'},{name:"literal",value:'"right"'},{name:"literal",value:'"bottom"'},{name:"literal",value:'"left"'}]},description:"",defaultValue:{value:'"top"',computed:!1}},className:{required:!1,tsType:{name:"string"},description:""},delay:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"100",computed:!1}}}};export{x as T};
