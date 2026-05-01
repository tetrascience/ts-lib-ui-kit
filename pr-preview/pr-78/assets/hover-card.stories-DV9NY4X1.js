import{j as n,e as I,l as q,r as s,d as l,u as K,o as V,A as G,P as Y,g as J,D as Q,t as X,q as N,f as Z,v as ee,c as te}from"./iframe-14YYbrss.js";import{B as re}from"./button-BSJeE99h.js";import"./preload-helper-BbFkF2Um.js";import"./index-B8eA1Gpy.js";var E,P="HoverCard",[j]=Z(P,[N]),R=N(),[ne,D]=j(P),k=e=>{const{__scopeHoverCard:t,children:r,open:a,defaultOpen:c,onOpenChange:i,openDelay:m=700,closeDelay:f=300}=e,d=R(t),g=s.useRef(0),p=s.useRef(0),y=s.useRef(!1),u=s.useRef(!1),[w,o]=K({prop:a,defaultProp:c??!1,onChange:i,caller:P}),x=s.useCallback(()=>{clearTimeout(p.current),g.current=window.setTimeout(()=>o(!0),m)},[m,o]),U=s.useCallback(()=>{clearTimeout(g.current),!y.current&&!u.current&&(p.current=window.setTimeout(()=>o(!1),f))},[f,o]),$=s.useCallback(()=>o(!1),[o]);return s.useEffect(()=>()=>{clearTimeout(g.current),clearTimeout(p.current)},[]),n.jsx(ne,{scope:t,open:w,onOpenChange:o,onOpen:x,onClose:U,onDismiss:$,hasSelectionRef:y,isPointerDownOnContentRef:u,children:n.jsx(V,{...d,children:r})})};k.displayName=P;var A="HoverCardTrigger",L=s.forwardRef((e,t)=>{const{__scopeHoverCard:r,...a}=e,c=D(A,r),i=R(r);return n.jsx(G,{asChild:!0,...i,children:n.jsx(Y.a,{"data-state":c.open?"open":"closed",...a,ref:t,onPointerEnter:l(e.onPointerEnter,H(c.onOpen)),onPointerLeave:l(e.onPointerLeave,H(c.onClose)),onFocus:l(e.onFocus,c.onOpen),onBlur:l(e.onBlur,c.onClose),onTouchStart:l(e.onTouchStart,m=>m.preventDefault())})})});L.displayName=A;var _="HoverCardPortal",[oe,ae]=j(_,{forceMount:void 0}),M=e=>{const{__scopeHoverCard:t,forceMount:r,children:a,container:c}=e,i=D(_,t);return n.jsx(oe,{scope:t,forceMount:r,children:n.jsx(I,{present:r||i.open,children:n.jsx(q,{asChild:!0,container:c,children:a})})})};M.displayName=_;var S="HoverCardContent",W=s.forwardRef((e,t)=>{const r=ae(S,e.__scopeHoverCard),{forceMount:a=r.forceMount,...c}=e,i=D(S,e.__scopeHoverCard);return n.jsx(I,{present:a||i.open,children:n.jsx(se,{"data-state":i.open?"open":"closed",...c,onPointerEnter:l(e.onPointerEnter,H(i.onOpen)),onPointerLeave:l(e.onPointerLeave,H(i.onClose)),ref:t})})});W.displayName=S;var se=s.forwardRef((e,t)=>{const{__scopeHoverCard:r,onEscapeKeyDown:a,onPointerDownOutside:c,onFocusOutside:i,onInteractOutside:m,...f}=e,d=D(S,r),g=R(r),p=s.useRef(null),y=J(t,p),[u,w]=s.useState(!1);return s.useEffect(()=>{if(u){const o=document.body;return E=o.style.userSelect||o.style.webkitUserSelect,o.style.userSelect="none",o.style.webkitUserSelect="none",()=>{o.style.userSelect=E,o.style.webkitUserSelect=E}}},[u]),s.useEffect(()=>{if(p.current){const o=()=>{w(!1),d.isPointerDownOnContentRef.current=!1,setTimeout(()=>{document.getSelection()?.toString()!==""&&(d.hasSelectionRef.current=!0)})};return document.addEventListener("pointerup",o),()=>{document.removeEventListener("pointerup",o),d.hasSelectionRef.current=!1,d.isPointerDownOnContentRef.current=!1}}},[d.isPointerDownOnContentRef,d.hasSelectionRef]),s.useEffect(()=>{p.current&&de(p.current).forEach(x=>x.setAttribute("tabindex","-1"))}),n.jsx(Q,{asChild:!0,disableOutsidePointerEvents:!1,onInteractOutside:m,onEscapeKeyDown:a,onPointerDownOutside:c,onFocusOutside:l(i,o=>{o.preventDefault()}),onDismiss:d.onDismiss,children:n.jsx(X,{...g,...f,onPointerDown:l(f.onPointerDown,o=>{o.currentTarget.contains(o.target)&&w(!0),d.hasSelectionRef.current=!1,d.isPointerDownOnContentRef.current=!0}),ref:y,style:{...f.style,userSelect:u?"text":void 0,WebkitUserSelect:u?"text":void 0,"--radix-hover-card-content-transform-origin":"var(--radix-popper-transform-origin)","--radix-hover-card-content-available-width":"var(--radix-popper-available-width)","--radix-hover-card-content-available-height":"var(--radix-popper-available-height)","--radix-hover-card-trigger-width":"var(--radix-popper-anchor-width)","--radix-hover-card-trigger-height":"var(--radix-popper-anchor-height)"}})})}),ce="HoverCardArrow",ie=s.forwardRef((e,t)=>{const{__scopeHoverCard:r,...a}=e,c=R(r);return n.jsx(ee,{...c,...a,ref:t})});ie.displayName=ce;function H(e){return t=>t.pointerType==="touch"?void 0:e()}function de(e){const t=[],r=document.createTreeWalker(e,NodeFilter.SHOW_ELEMENT,{acceptNode:a=>a.tabIndex>=0?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP});for(;r.nextNode();)t.push(r.currentNode);return t}var le=k,pe=L,ue=M,ve=W;function z({...e}){return n.jsx(le,{"data-slot":"hover-card",...e})}function F({...e}){return n.jsx(pe,{"data-slot":"hover-card-trigger",...e})}function B({className:e,align:t="center",sideOffset:r=4,...a}){return n.jsx(ue,{"data-slot":"hover-card-portal",children:n.jsx(ve,{"data-slot":"hover-card-content",align:t,sideOffset:r,className:te("z-50 w-64 origin-(--radix-hover-card-content-transform-origin) rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",e),...a})})}z.__docgenInfo={description:"",methods:[],displayName:"HoverCard"};F.__docgenInfo={description:"",methods:[],displayName:"HoverCardTrigger"};B.__docgenInfo={description:"",methods:[],displayName:"HoverCardContent",props:{align:{defaultValue:{value:'"center"',computed:!1},required:!1},sideOffset:{defaultValue:{value:"4",computed:!1},required:!1}}};const{expect:v,within:h}=__STORYBOOK_MODULE_TEST__,ye={title:"Components/Hover Card",component:B,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{align:{control:{type:"select"},options:["start","center","end"]},side:{control:{type:"select"},options:["top","right","bottom","left"]},sideOffset:{control:{type:"number"}}},args:{align:"center",side:"bottom",sideOffset:8}};function O(e){return n.jsx("div",{className:"flex h-[220px] w-[320px] items-center justify-center rounded-xl border bg-background",children:n.jsxs(z,{open:!0,children:[n.jsx(F,{asChild:!0,children:n.jsx(re,{variant:"outline",children:"Preview workspace"})}),n.jsx(B,{...e,children:n.jsxs("div",{className:"grid gap-1.5",children:[n.jsx("div",{className:"font-medium",children:"Analytics workspace"}),n.jsx("p",{className:"text-sm text-muted-foreground",children:"Shared with 12 collaborators and synced across three reporting destinations."})]})})]})})}const C={render:O,parameters:{zephyr:{testCaseId:"SW-T1244"}},play:async({canvasElement:e,step:t})=>{const r=h(e),a=h(e.ownerDocument.body);await t("Hover card trigger renders",async()=>{v(r.getByRole("button",{name:"Preview workspace"})).toBeInTheDocument()}),await t("Hover card portaled content renders",async()=>{v(a.getByText("Analytics workspace")).toBeInTheDocument(),v(a.getByText("Shared with 12 collaborators and synced across three reporting destinations.")).toBeInTheDocument()})}},b={args:{align:"start"},render:O,parameters:{zephyr:{testCaseId:"SW-T1245"}},play:async({canvasElement:e,step:t})=>{const r=h(e),a=h(e.ownerDocument.body);await t("Hover card trigger renders",async()=>{v(r.getByRole("button",{name:"Preview workspace"})).toBeInTheDocument()}),await t("Hover card portaled content renders",async()=>{v(a.getByText("Analytics workspace")).toBeInTheDocument()})}},T={args:{side:"right",sideOffset:12},render:O,parameters:{zephyr:{testCaseId:"SW-T1246"}},play:async({canvasElement:e,step:t})=>{const r=h(e),a=h(e.ownerDocument.body);await t("Hover card trigger renders",async()=>{v(r.getByRole("button",{name:"Preview workspace"})).toBeInTheDocument()}),await t("Hover card portaled content renders",async()=>{v(a.getByText("Analytics workspace")).toBeInTheDocument()})}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: renderHoverCard,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1244"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await step("Hover card trigger renders", async () => {
      expect(canvas.getByRole("button", {
        name: "Preview workspace"
      })).toBeInTheDocument();
    });
    await step("Hover card portaled content renders", async () => {
      expect(body.getByText("Analytics workspace")).toBeInTheDocument();
      expect(body.getByText("Shared with 12 collaborators and synced across three reporting destinations.")).toBeInTheDocument();
    });
  }
}`,...C.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    align: "start"
  },
  render: renderHoverCard,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1245"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await step("Hover card trigger renders", async () => {
      expect(canvas.getByRole("button", {
        name: "Preview workspace"
      })).toBeInTheDocument();
    });
    await step("Hover card portaled content renders", async () => {
      expect(body.getByText("Analytics workspace")).toBeInTheDocument();
    });
  }
}`,...b.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    side: "right",
    sideOffset: 12
  },
  render: renderHoverCard,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1246"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await step("Hover card trigger renders", async () => {
      expect(canvas.getByRole("button", {
        name: "Preview workspace"
      })).toBeInTheDocument();
    });
    await step("Hover card portaled content renders", async () => {
      expect(body.getByText("Analytics workspace")).toBeInTheDocument();
    });
  }
}`,...T.parameters?.docs?.source}}};const we=["Default","StartAligned","RightSide"];export{C as Default,T as RightSide,b as StartAligned,we as __namedExportsOrder,ye as default};
