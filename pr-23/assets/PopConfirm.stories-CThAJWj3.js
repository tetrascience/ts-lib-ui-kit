import{j as e}from"./jsx-runtime-CDt2p4po.js";import{a as n}from"./index-B-lxVbXh.js";import{B as r}from"./Button-tnMIwByE.js";import{I as N,a as P}from"./Icon-CuK57VyF.js";import{r as b}from"./index-GiUgBvb1.js";import{a as s,r as t}from"./styled-components.browser.esm-Ctfm6iBV.js";import"./v4-CtRu48qb.js";const G=s.div`
  position: absolute;
  background-color: var(--white-900);
  border-radius: 8px;
  box-shadow: 0 3px 6px -4px var(--black-200), 0 6px 16px 0 var(--black-100),
    0 9px 28px 8px var(--black-50);
  z-index: 1000;
  max-width: 450px;
  min-width: 400px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  user-select: none;
  padding: 0;
  font-family: "Inter", sans-serif;

  ${o=>o.$isVisible&&t`
      opacity: 1;
      visibility: visible;
    `}

  ${o=>{switch(o.placement){case"top":return t`
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(-15px);

          &::after {
            content: "";
            position: absolute;
            top: 100%;
            left: 50%;
            margin-left: -6px;
            border-width: 6px;
            border-style: solid;
            border-color: var(--white-900) transparent transparent transparent;
          }
        `;case"topLeft":return t`
          bottom: 100%;
          left: 0;
          transform: translateY(-15px);

          &::after {
            content: "";
            position: absolute;
            top: 100%;
            left: 12px;
            border-width: 6px;
            border-style: solid;
            border-color: var(--white-900) transparent transparent transparent;
          }
        `;case"topRight":return t`
          bottom: 100%;
          right: 0;
          transform: translateY(-15px);

          &::after {
            content: "";
            position: absolute;
            top: 100%;
            right: 12px;
            border-width: 6px;
            border-style: solid;
            border-color: var(--white-900) transparent transparent transparent;
          }
        `;case"left":return t`
          top: 50%;
          right: 100%;
          transform: translateY(-50%) translateX(-15px);

          &::after {
            content: "";
            position: absolute;
            top: 50%;
            left: 100%;
            margin-top: -6px;
            border-width: 6px;
            border-style: solid;
            border-color: transparent transparent transparent var(--white-900);
          }
        `;case"leftTop":return t`
          top: 0;
          right: 100%;
          transform: translateX(-15px);

          &::after {
            content: "";
            position: absolute;
            top: 12px;
            left: 100%;
            border-width: 6px;
            border-style: solid;
            border-color: transparent transparent transparent var(--white-900);
          }
        `;case"leftBottom":return t`
          bottom: 0;
          right: 100%;
          transform: translateX(-15px);

          &::after {
            content: "";
            position: absolute;
            bottom: 12px;
            left: 100%;
            border-width: 6px;
            border-style: solid;
            border-color: transparent transparent transparent var(--white-900);
          }
        `;case"right":return t`
          top: 50%;
          left: 100%;
          transform: translateY(-50%) translateX(15px);

          &::after {
            content: "";
            position: absolute;
            top: 50%;
            right: 100%;
            margin-top: -6px;
            border-width: 6px;
            border-style: solid;
            border-color: transparent var(--white-900) transparent transparent;
          }
        `;case"rightTop":return t`
          top: 0;
          left: 100%;
          transform: translateX(15px);

          &::after {
            content: "";
            position: absolute;
            top: 12px;
            right: 100%;
            border-width: 6px;
            border-style: solid;
            border-color: transparent var(--white-900) transparent transparent;
          }
        `;case"rightBottom":return t`
          bottom: 0;
          left: 100%;
          transform: translateX(15px);

          &::after {
            content: "";
            position: absolute;
            bottom: 12px;
            right: 100%;
            border-width: 6px;
            border-style: solid;
            border-color: transparent var(--white-900) transparent transparent;
          }
        `;case"bottom":return t`
          top: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(15px);

          &::after {
            content: "";
            position: absolute;
            bottom: 100%;
            left: 50%;
            margin-left: -6px;
            border-width: 6px;
            border-style: solid;
            border-color: transparent transparent var(--white-900) transparent;
          }
        `;case"bottomLeft":return t`
          top: 100%;
          left: 0;
          transform: translateY(15px);

          &::after {
            content: "";
            position: absolute;
            bottom: 100%;
            left: 12px;
            border-width: 6px;
            border-style: solid;
            border-color: transparent transparent var(--white-900) transparent;
          }
        `;case"bottomRight":return t`
          top: 100%;
          right: 0;
          transform: translateY(15px);

          &::after {
            content: "";
            position: absolute;
            bottom: 100%;
            right: 12px;
            border-width: 6px;
            border-style: solid;
            border-color: transparent transparent var(--white-900) transparent;
          }
        `;default:return""}}}
`,J=s.div`
  padding: 12px 16px;
  color: var(--black-800);
  font-weight: 600;
  font-size: 14px;
  border-bottom: 1px solid var(--grey-100);
`,Q=s.div`
  padding: 12px 16px;
  color: var(--grey-600);
  font-size: 14px;
`,U=s.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 8px 16px 12px;
`,Z=s.div`
  position: relative;
  display: inline-block;
`,g=({title:o,description:v,onConfirm:f,onCancel:h,okText:Y="OK",cancelText:q="Cancel",placement:S="top",children:z,className:X,okButtonProps:V,cancelButtonProps:W,...K})=>{const[i,l]=b.useState(!1),x=b.useRef(null);b.useEffect(()=>{const a=F=>{x.current&&!x.current.contains(F.target)&&l(!1)};return i&&document.addEventListener("mousedown",a),()=>{document.removeEventListener("mousedown",a)}},[i]);const O=a=>{l(!1),f==null||f(a)},_=a=>{l(!1),h==null||h(a)},$=()=>{l(!i)};return e.jsxs(Z,{ref:x,className:X,...K,children:[e.jsx("div",{onClick:$,children:z}),e.jsxs(G,{placement:S,$isVisible:i,children:[o&&e.jsx(J,{children:o}),v&&e.jsx(Q,{children:v}),e.jsxs(U,{children:[e.jsx(r,{variant:"tertiary",size:"small",onClick:_,...W,children:q}),e.jsx(r,{variant:"primary",size:"small",onClick:O,...V,children:Y})]})]})]})};g.displayName="PopConfirm";g.__docgenInfo={description:"",methods:[],displayName:"PopConfirm",props:{title:{required:!1,tsType:{name:"ReactNode"},description:""},description:{required:!1,tsType:{name:"ReactNode"},description:""},onConfirm:{required:!1,tsType:{name:"signature",type:"function",raw:"(e?: React.MouseEvent<HTMLElement>) => void",signature:{arguments:[{type:{name:"ReactMouseEvent",raw:"React.MouseEvent<HTMLElement>",elements:[{name:"HTMLElement"}]},name:"e"}],return:{name:"void"}}},description:""},onCancel:{required:!1,tsType:{name:"signature",type:"function",raw:"(e?: React.MouseEvent<HTMLElement>) => void",signature:{arguments:[{type:{name:"ReactMouseEvent",raw:"React.MouseEvent<HTMLElement>",elements:[{name:"HTMLElement"}]},name:"e"}],return:{name:"void"}}},description:""},okText:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"OK"',computed:!1}},cancelText:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Cancel"',computed:!1}},placement:{required:!1,tsType:{name:"union",raw:`| "top"
| "left"
| "right"
| "bottom"
| "topLeft"
| "topRight"
| "bottomLeft"
| "bottomRight"
| "leftTop"
| "leftBottom"
| "rightTop"
| "rightBottom"`,elements:[{name:"literal",value:'"top"'},{name:"literal",value:'"left"'},{name:"literal",value:'"right"'},{name:"literal",value:'"bottom"'},{name:"literal",value:'"topLeft"'},{name:"literal",value:'"topRight"'},{name:"literal",value:'"bottomLeft"'},{name:"literal",value:'"bottomRight"'},{name:"literal",value:'"leftTop"'},{name:"literal",value:'"leftBottom"'},{name:"literal",value:'"rightTop"'},{name:"literal",value:'"rightBottom"'}]},description:"",defaultValue:{value:'"top"',computed:!1}},children:{required:!0,tsType:{name:"ReactNode"},description:""},className:{required:!1,tsType:{name:"string"},description:""},okButtonProps:{required:!1,tsType:{name:"ReactButtonHTMLAttributes",raw:"React.ButtonHTMLAttributes<HTMLButtonElement>",elements:[{name:"HTMLButtonElement"}]},description:""},cancelButtonProps:{required:!1,tsType:{name:"ReactButtonHTMLAttributes",raw:"React.ButtonHTMLAttributes<HTMLButtonElement>",elements:[{name:"HTMLButtonElement"}]},description:""}}};const ie={title:"Atoms/PopConfirm",component:g,parameters:{layout:"centered"},tags:["autodocs"]},c={args:{title:"Are you sure?",description:"This action cannot be undone.",okText:"Yes",cancelText:"No",onConfirm:n("confirmed"),onCancel:n("canceled"),children:e.jsx(r,{children:"Delete"}),placement:"top"}},p={args:{title:"Delete this item?",description:"This will permanently remove the item from your list.",okText:"Delete",cancelText:"Cancel",onConfirm:n("confirmed"),onCancel:n("canceled"),children:e.jsx(r,{variant:"tertiary",size:"small",leftIcon:e.jsx(N,{name:P.TRASH,width:"16px",height:"16px"}),children:"Delete"}),placement:"left"}},d={args:{title:"Are you sure to delete this input?",description:"Doing so will remove the connected edges as well.",okText:"Delete",cancelText:"Keep",onConfirm:n("confirmed"),onCancel:n("canceled"),placement:"left",children:e.jsx(r,{variant:"tertiary",size:"small",leftIcon:e.jsx(N,{name:P.TRASH}),"aria-label":"Remove item",children:""})}},m={args:{title:"Are you sure?",description:"This will permanently delete this record.",okText:"Yes, delete it",cancelText:"No, keep it",onConfirm:n("confirmed"),onCancel:n("canceled"),children:e.jsx(r,{children:"Delete Record"}),placement:"bottom",okButtonProps:{style:{backgroundColor:"#ff4d4f",borderColor:"#ff4d4f"}},cancelButtonProps:{style:{fontWeight:400}}}},u={args:{title:"Are you sure?",description:"This action cannot be undone.",okText:"Yes",cancelText:"No",onConfirm:n("confirmed"),onCancel:n("canceled"),children:e.jsx(r,{children:"Delete"}),placement:"bottomRight"}};var T,y,w;c.parameters={...c.parameters,docs:{...(T=c.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    title: "Are you sure?",
    description: "This action cannot be undone.",
    okText: "Yes",
    cancelText: "No",
    onConfirm: action("confirmed"),
    onCancel: action("canceled"),
    children: <Button>Delete</Button>,
    placement: "top"
  }
}`,...(w=(y=c.parameters)==null?void 0:y.docs)==null?void 0:w.source}}};var C,B,R;p.parameters={...p.parameters,docs:{...(C=p.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    title: "Delete this item?",
    description: "This will permanently remove the item from your list.",
    okText: "Delete",
    cancelText: "Cancel",
    onConfirm: action("confirmed"),
    onCancel: action("canceled"),
    children: <Button variant="tertiary" size="small" leftIcon={<Icon name={IconName.TRASH} width="16px" height="16px" />}>
        Delete
      </Button>,
    placement: "left"
  }
}`,...(R=(B=p.parameters)==null?void 0:B.docs)==null?void 0:R.source}}};var k,E,L;d.parameters={...d.parameters,docs:{...(k=d.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    title: "Are you sure to delete this input?",
    description: "Doing so will remove the connected edges as well.",
    okText: "Delete",
    cancelText: "Keep",
    onConfirm: action("confirmed"),
    onCancel: action("canceled"),
    placement: "left",
    children: <Button variant="tertiary" size="small" leftIcon={<Icon name={IconName.TRASH} />} aria-label="Remove item">
        {""}
      </Button>
  }
}`,...(L=(E=d.parameters)==null?void 0:E.docs)==null?void 0:L.source}}};var D,M,j;m.parameters={...m.parameters,docs:{...(D=m.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    title: "Are you sure?",
    description: "This will permanently delete this record.",
    okText: "Yes, delete it",
    cancelText: "No, keep it",
    onConfirm: action("confirmed"),
    onCancel: action("canceled"),
    children: <Button>Delete Record</Button>,
    placement: "bottom",
    okButtonProps: {
      style: {
        backgroundColor: "#ff4d4f",
        borderColor: "#ff4d4f"
      }
    },
    cancelButtonProps: {
      style: {
        fontWeight: 400
      }
    }
  }
}`,...(j=(M=m.parameters)==null?void 0:M.docs)==null?void 0:j.source}}};var H,A,I;u.parameters={...u.parameters,docs:{...(H=u.parameters)==null?void 0:H.docs,source:{originalSource:`{
  args: {
    title: "Are you sure?",
    description: "This action cannot be undone.",
    okText: "Yes",
    cancelText: "No",
    onConfirm: action("confirmed"),
    onCancel: action("canceled"),
    children: <Button>Delete</Button>,
    placement: "bottomRight"
  }
}`,...(I=(A=u.parameters)==null?void 0:A.docs)==null?void 0:I.source}}};const le=["Default","WithIcon","ConfirmDelete","CustomButtons","BottomRight"];export{u as BottomRight,d as ConfirmDelete,m as CustomButtons,c as Default,p as WithIcon,le as __namedExportsOrder,ie as default};
