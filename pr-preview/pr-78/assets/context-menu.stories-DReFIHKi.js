import{r as s,j as a,n as U,P as X,d as g,f as $,c as h}from"./iframe-14YYbrss.js";import{I as W,R as Y,A as F,P as q,C as H,S as K,c as R,G as V,L as J,a as Q,b as Z,d as ee,e as te,f as ne,g as oe,h as ae}from"./index-B_XuWxj8.js";import{P as re,T as se}from"./trash-2-wrIozPJb.js";import{C as ie}from"./copy-CeUeG-Dw.js";import{F as ce}from"./folder-CpEITL-a.js";import"./preload-helper-BbFkF2Um.js";import"./index-CzkjiSpZ.js";import"./index-SK9A3v17.js";import"./index-Bjo__dt-.js";import"./index-_AbBFJ6v.js";var w="ContextMenu",[ue]=$(w,[R]),i=R(),[de,I]=ue(w),N=e=>{const{__scopeContextMenu:t,children:o,onOpenChange:n,dir:r,modal:l=!0}=e,[d,u]=s.useState(!1),_=i(t),x=U(n),c=s.useCallback(f=>{u(f),x(f)},[x]);return a.jsx(de,{scope:t,open:d,onOpenChange:c,modal:l,children:a.jsx(Y,{..._,dir:r,open:d,onOpenChange:c,modal:l,children:o})})};N.displayName=w;var E="ContextMenuTrigger",P=s.forwardRef((e,t)=>{const{__scopeContextMenu:o,disabled:n=!1,...r}=e,l=I(E,o),d=i(o),u=s.useRef({x:0,y:0}),_=s.useRef({getBoundingClientRect:()=>DOMRect.fromRect({width:0,height:0,...u.current})}),x=s.useRef(0),c=s.useCallback(()=>window.clearTimeout(x.current),[]),f=m=>{u.current={x:m.clientX,y:m.clientY},l.onOpenChange(!0)};return s.useEffect(()=>c,[c]),s.useEffect(()=>{n&&c()},[n,c]),a.jsxs(a.Fragment,{children:[a.jsx(F,{...d,virtualRef:_}),a.jsx(X.span,{"data-state":l.open?"open":"closed","data-disabled":n?"":void 0,...r,ref:t,style:{WebkitTouchCallout:"none",...e.style},onContextMenu:n?e.onContextMenu:g(e.onContextMenu,m=>{c(),f(m),m.preventDefault()}),onPointerDown:n?e.onPointerDown:g(e.onPointerDown,C(m=>{c(),x.current=window.setTimeout(()=>f(m),700)})),onPointerMove:n?e.onPointerMove:g(e.onPointerMove,C(c)),onPointerCancel:n?e.onPointerCancel:g(e.onPointerCancel,C(c)),onPointerUp:n?e.onPointerUp:g(e.onPointerUp,C(c))})]})});P.displayName=E;var le="ContextMenuPortal",S=e=>{const{__scopeContextMenu:t,...o}=e,n=i(t);return a.jsx(q,{...n,...o})};S.displayName=le;var j="ContextMenuContent",D=s.forwardRef((e,t)=>{const{__scopeContextMenu:o,...n}=e,r=I(j,o),l=i(o),d=s.useRef(!1);return a.jsx(H,{...l,...n,ref:t,side:"right",sideOffset:2,align:"start",onCloseAutoFocus:u=>{e.onCloseAutoFocus?.(u),!u.defaultPrevented&&d.current&&u.preventDefault(),d.current=!1},onInteractOutside:u=>{e.onInteractOutside?.(u),!u.defaultPrevented&&!r.modal&&(d.current=!0)},style:{...e.style,"--radix-context-menu-content-transform-origin":"var(--radix-popper-transform-origin)","--radix-context-menu-content-available-width":"var(--radix-popper-available-width)","--radix-context-menu-content-available-height":"var(--radix-popper-available-height)","--radix-context-menu-trigger-width":"var(--radix-popper-anchor-width)","--radix-context-menu-trigger-height":"var(--radix-popper-anchor-height)"}})});D.displayName=j;var me="ContextMenuGroup",pe=s.forwardRef((e,t)=>{const{__scopeContextMenu:o,...n}=e,r=i(o);return a.jsx(V,{...r,...n,ref:t})});pe.displayName=me;var xe="ContextMenuLabel",fe=s.forwardRef((e,t)=>{const{__scopeContextMenu:o,...n}=e,r=i(o);return a.jsx(J,{...r,...n,ref:t})});fe.displayName=xe;var ge="ContextMenuItem",O=s.forwardRef((e,t)=>{const{__scopeContextMenu:o,...n}=e,r=i(o);return a.jsx(W,{...r,...n,ref:t})});O.displayName=ge;var ve="ContextMenuCheckboxItem",he=s.forwardRef((e,t)=>{const{__scopeContextMenu:o,...n}=e,r=i(o);return a.jsx(Q,{...r,...n,ref:t})});he.displayName=ve;var Ce="ContextMenuRadioGroup",Me=s.forwardRef((e,t)=>{const{__scopeContextMenu:o,...n}=e,r=i(o);return a.jsx(Z,{...r,...n,ref:t})});Me.displayName=Ce;var ye="ContextMenuRadioItem",be=s.forwardRef((e,t)=>{const{__scopeContextMenu:o,...n}=e,r=i(o);return a.jsx(ee,{...r,...n,ref:t})});be.displayName=ye;var _e="ContextMenuItemIndicator",Te=s.forwardRef((e,t)=>{const{__scopeContextMenu:o,...n}=e,r=i(o);return a.jsx(te,{...r,...n,ref:t})});Te.displayName=_e;var we="ContextMenuSeparator",B=s.forwardRef((e,t)=>{const{__scopeContextMenu:o,...n}=e,r=i(o);return a.jsx(K,{...r,...n,ref:t})});B.displayName=we;var Re="ContextMenuArrow",Ie=s.forwardRef((e,t)=>{const{__scopeContextMenu:o,...n}=e,r=i(o);return a.jsx(ne,{...r,...n,ref:t})});Ie.displayName=Re;var Ne="ContextMenuSubTrigger",Ee=s.forwardRef((e,t)=>{const{__scopeContextMenu:o,...n}=e,r=i(o);return a.jsx(oe,{...r,...n,ref:t})});Ee.displayName=Ne;var Pe="ContextMenuSubContent",Se=s.forwardRef((e,t)=>{const{__scopeContextMenu:o,...n}=e,r=i(o);return a.jsx(ae,{...r,...n,ref:t,style:{...e.style,"--radix-context-menu-content-transform-origin":"var(--radix-popper-transform-origin)","--radix-context-menu-content-available-width":"var(--radix-popper-available-width)","--radix-context-menu-content-available-height":"var(--radix-popper-available-height)","--radix-context-menu-trigger-width":"var(--radix-popper-anchor-width)","--radix-context-menu-trigger-height":"var(--radix-popper-anchor-height)"}})});Se.displayName=Pe;function C(e){return t=>t.pointerType!=="mouse"?e(t):void 0}var je=N,De=P,Oe=S,Be=D,Ae=O,ke=B;function A({...e}){return a.jsx(je,{"data-slot":"context-menu",...e})}function k({className:e,...t}){return a.jsx(De,{"data-slot":"context-menu-trigger",className:h("select-none",e),...t})}function G({className:e,...t}){return a.jsx(Oe,{children:a.jsx(Be,{"data-slot":"context-menu-content",className:h("z-50 max-h-(--radix-context-menu-content-available-height) min-w-36 origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",e),...t})})}function v({className:e,inset:t,variant:o="default",...n}){return a.jsx(Ae,{"data-slot":"context-menu-item","data-inset":t,"data-variant":o,className:h("group/context-menu-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 focus:*:[svg]:text-accent-foreground data-[variant=destructive]:*:[svg]:text-destructive",e),...n})}function z({className:e,...t}){return a.jsx(ke,{"data-slot":"context-menu-separator",className:h("-mx-1 my-1 h-px bg-border",e),...t})}function T({className:e,...t}){return a.jsx("span",{"data-slot":"context-menu-shortcut",className:h("ml-auto text-xs tracking-widest text-muted-foreground group-focus/context-menu-item:text-accent-foreground",e),...t})}A.__docgenInfo={description:"",methods:[],displayName:"ContextMenu"};k.__docgenInfo={description:"",methods:[],displayName:"ContextMenuTrigger"};G.__docgenInfo={description:"",methods:[],displayName:"ContextMenuContent",props:{side:{required:!1,tsType:{name:"union",raw:'"top" | "right" | "bottom" | "left"',elements:[{name:"literal",value:'"top"'},{name:"literal",value:'"right"'},{name:"literal",value:'"bottom"'},{name:"literal",value:'"left"'}]},description:""}}};v.__docgenInfo={description:"",methods:[],displayName:"ContextMenuItem",props:{inset:{required:!1,tsType:{name:"boolean"},description:""},variant:{required:!1,tsType:{name:"union",raw:'"default" | "destructive"',elements:[{name:"literal",value:'"default"'},{name:"literal",value:'"destructive"'}]},description:"",defaultValue:{value:'"default"',computed:!1}}}};z.__docgenInfo={description:"",methods:[],displayName:"ContextMenuSeparator"};T.__docgenInfo={description:"",methods:[],displayName:"ContextMenuShortcut"};const{expect:p,within:b}=__STORYBOOK_MODULE_TEST__,He={title:"Components/ContextMenu",component:v,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{variant:{control:{type:"select"},options:["default","destructive"]}},args:{variant:"default"}};function L(e){const t=e?.variant==="destructive";return a.jsxs(A,{children:[a.jsx(k,{className:"flex h-40 w-[320px] items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground",children:"Right click this area"}),a.jsxs(G,{className:"w-52",children:[a.jsxs(v,{children:[a.jsx(re,{}),"Rename",a.jsx(T,{children:"⌘R"})]}),a.jsxs(v,{children:[a.jsx(ie,{}),"Duplicate",a.jsx(T,{children:"⌘D"})]}),a.jsx(z,{}),a.jsxs(v,{...e,children:[t?a.jsx(se,{}):a.jsx(ce,{}),t?"Delete":"Move to folder"]})]})]})}const M={render:L,parameters:{zephyr:{testCaseId:"SW-T1228"}},play:async({canvasElement:e,step:t})=>{const o=b(e);await t("Context menu trigger renders",async()=>{p(o.getByText("Right click this area")).toBeInTheDocument()}),await t("Open menu and verify items in portal",async()=>{o.getByText("Right click this area").dispatchEvent(new MouseEvent("contextmenu",{bubbles:!0,cancelable:!0,clientX:8,clientY:8}));const r=b(e.ownerDocument.body);p(await r.findByText("Rename")).toBeInTheDocument(),p(r.getByText("Duplicate")).toBeInTheDocument(),p(r.getByText("Move to folder")).toBeInTheDocument()})}},y={args:{variant:"destructive"},render:L,parameters:{zephyr:{testCaseId:"SW-T1229"}},play:async({canvasElement:e,step:t})=>{const o=b(e);await t("Context menu trigger renders",async()=>{p(o.getByText("Right click this area")).toBeInTheDocument()}),await t("Open menu and verify destructive item in portal",async()=>{o.getByText("Right click this area").dispatchEvent(new MouseEvent("contextmenu",{bubbles:!0,cancelable:!0,clientX:8,clientY:8}));const r=b(e.ownerDocument.body);p(await r.findByText("Delete")).toBeInTheDocument()})}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: renderMenu,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1228"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Context menu trigger renders", async () => {
      expect(canvas.getByText("Right click this area")).toBeInTheDocument();
    });
    await step("Open menu and verify items in portal", async () => {
      const trigger = canvas.getByText("Right click this area");
      trigger.dispatchEvent(new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        clientX: 8,
        clientY: 8
      }));
      const body = within(canvasElement.ownerDocument.body);
      expect(await body.findByText("Rename")).toBeInTheDocument();
      expect(body.getByText("Duplicate")).toBeInTheDocument();
      expect(body.getByText("Move to folder")).toBeInTheDocument();
    });
  }
}`,...M.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "destructive"
  },
  render: renderMenu,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1229"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Context menu trigger renders", async () => {
      expect(canvas.getByText("Right click this area")).toBeInTheDocument();
    });
    await step("Open menu and verify destructive item in portal", async () => {
      const trigger = canvas.getByText("Right click this area");
      trigger.dispatchEvent(new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        clientX: 8,
        clientY: 8
      }));
      const body = within(canvasElement.ownerDocument.body);
      expect(await body.findByText("Delete")).toBeInTheDocument();
    });
  }
}`,...y.parameters?.docs?.source}}};const Ke=["Default","Destructive"];export{M as Default,y as Destructive,Ke as __namedExportsOrder,He as default};
