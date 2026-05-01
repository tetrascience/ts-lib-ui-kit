import{r as c,j as e,u as te,P as ae,b as $,g as Ae,d as w,f as Ee,c as T,R as z}from"./iframe-14YYbrss.js";import{C as ne}from"./check-B_BC0xs5.js";import{C as Ne}from"./chevron-right-CDyisS10.js";import{c as Pe}from"./index-CzkjiSpZ.js";import{u as Oe}from"./index-SK9A3v17.js";import{I as Ge,R as Fe,A as Le,C as ze,S as He,L as We,a as Ve,e as $e,G as Ke,b as Ue,d as qe,i as Ze,g as Xe,h as Ye,c as Je,P as Qe,f as et}from"./index-B_XuWxj8.js";import{R as tt,I as at,c as re}from"./index-_AbBFJ6v.js";import{P as nt,T as oe}from"./trash-2-wrIozPJb.js";import{C as rt}from"./copy-CeUeG-Dw.js";import"./preload-helper-BbFkF2Um.js";import"./index-Bjo__dt-.js";var A="Menubar",[K,ot,st]=Pe(A),[se]=Ee(A,[st,re]),b=Je(),ce=re(),[ct,X]=se(A),ie=c.forwardRef((t,a)=>{const{__scopeMenubar:r,value:n,onValueChange:o,defaultValue:d,loop:p=!0,dir:l,...i}=t,x=Oe(l),u=ce(r),[f,y]=te({prop:n,onChange:o,defaultProp:d??"",caller:A}),[M,g]=c.useState(null);return e.jsx(ct,{scope:r,value:f,onMenuOpen:c.useCallback(I=>{y(I),g(I)},[y]),onMenuClose:c.useCallback(()=>y(""),[y]),onMenuToggle:c.useCallback(I=>{y(J=>J?"":I),g(I)},[y]),dir:x,loop:p,children:e.jsx(K.Provider,{scope:r,children:e.jsx(K.Slot,{scope:r,children:e.jsx(tt,{asChild:!0,...u,orientation:"horizontal",loop:p,dir:x,currentTabStopId:M,onCurrentTabStopIdChange:g,children:e.jsx(ae.div,{role:"menubar",...i,ref:a})})})})})});ie.displayName=A;var Y="MenubarMenu",[it,ue]=se(Y),de=t=>{const{__scopeMenubar:a,value:r,...n}=t,o=$(),d=r||o||"LEGACY_REACT_AUTO_VALUE",p=X(Y,a),l=b(a),i=c.useRef(null),x=c.useRef(!1),u=p.value===d;return c.useEffect(()=>{u||(x.current=!1)},[u]),e.jsx(it,{scope:a,value:d,triggerId:$(),triggerRef:i,contentId:$(),wasKeyboardTriggerOpenRef:x,children:e.jsx(Fe,{...l,open:u,onOpenChange:f=>{f||p.onMenuClose()},modal:!1,dir:p.dir,...n})})};de.displayName=Y;var U="MenubarTrigger",le=c.forwardRef((t,a)=>{const{__scopeMenubar:r,disabled:n=!1,...o}=t,d=ce(r),p=b(r),l=X(U,r),i=ue(U,r),x=c.useRef(null),u=Ae(a,x,i.triggerRef),[f,y]=c.useState(!1),M=l.value===i.value;return e.jsx(K.ItemSlot,{scope:r,value:i.value,disabled:n,children:e.jsx(at,{asChild:!0,...d,focusable:!n,tabStopId:i.value,children:e.jsx(Le,{asChild:!0,...p,children:e.jsx(ae.button,{type:"button",role:"menuitem",id:i.triggerId,"aria-haspopup":"menu","aria-expanded":M,"aria-controls":M?i.contentId:void 0,"data-highlighted":f?"":void 0,"data-state":M?"open":"closed","data-disabled":n?"":void 0,disabled:n,...o,ref:u,onPointerDown:w(t.onPointerDown,g=>{!n&&g.button===0&&g.ctrlKey===!1&&(l.onMenuOpen(i.value),M||g.preventDefault())}),onPointerEnter:w(t.onPointerEnter,()=>{l.value&&!M&&(l.onMenuOpen(i.value),x.current?.focus())}),onKeyDown:w(t.onKeyDown,g=>{n||(["Enter"," "].includes(g.key)&&l.onMenuToggle(i.value),g.key==="ArrowDown"&&l.onMenuOpen(i.value),["Enter"," ","ArrowDown"].includes(g.key)&&(i.wasKeyboardTriggerOpenRef.current=!0,g.preventDefault()))}),onFocus:w(t.onFocus,()=>y(!0)),onBlur:w(t.onBlur,()=>y(!1))})})})})});le.displayName=U;var ut="MenubarPortal",me=t=>{const{__scopeMenubar:a,...r}=t,n=b(a);return e.jsx(Qe,{...n,...r})};me.displayName=ut;var q="MenubarContent",be=c.forwardRef((t,a)=>{const{__scopeMenubar:r,align:n="start",...o}=t,d=b(r),p=X(q,r),l=ue(q,r),i=ot(r),x=c.useRef(!1);return e.jsx(ze,{id:l.contentId,"aria-labelledby":l.triggerId,"data-radix-menubar-content":"",...d,...o,ref:a,align:n,onCloseAutoFocus:w(t.onCloseAutoFocus,u=>{!p.value&&!x.current&&l.triggerRef.current?.focus(),x.current=!1,u.preventDefault()}),onFocusOutside:w(t.onFocusOutside,u=>{const f=u.target;i().some(M=>M.ref.current?.contains(f))&&u.preventDefault()}),onInteractOutside:w(t.onInteractOutside,()=>{x.current=!0}),onEntryFocus:u=>{l.wasKeyboardTriggerOpenRef.current||u.preventDefault()},onKeyDown:w(t.onKeyDown,u=>{if(["ArrowRight","ArrowLeft"].includes(u.key)){const f=u.target,y=f.hasAttribute("data-radix-menubar-subtrigger"),M=f.closest("[data-radix-menubar-content]")!==u.currentTarget,I=(p.dir==="rtl"?"ArrowRight":"ArrowLeft")===u.key;if(!I&&y||M&&I)return;let k=i().filter(V=>!V.disabled).map(V=>V.value);I&&k.reverse();const Q=k.indexOf(l.value);k=p.loop?Tt(k,Q+1):k.slice(Q+1);const[ee]=k;ee&&p.onMenuOpen(ee)}},{checkForDefaultPrevented:!1}),style:{...t.style,"--radix-menubar-content-transform-origin":"var(--radix-popper-transform-origin)","--radix-menubar-content-available-width":"var(--radix-popper-available-width)","--radix-menubar-content-available-height":"var(--radix-popper-available-height)","--radix-menubar-trigger-width":"var(--radix-popper-anchor-width)","--radix-menubar-trigger-height":"var(--radix-popper-anchor-height)"}})});be.displayName=q;var dt="MenubarGroup",pe=c.forwardRef((t,a)=>{const{__scopeMenubar:r,...n}=t,o=b(r);return e.jsx(Ke,{...o,...n,ref:a})});pe.displayName=dt;var lt="MenubarLabel",he=c.forwardRef((t,a)=>{const{__scopeMenubar:r,...n}=t,o=b(r);return e.jsx(We,{...o,...n,ref:a})});he.displayName=lt;var mt="MenubarItem",ge=c.forwardRef((t,a)=>{const{__scopeMenubar:r,...n}=t,o=b(r);return e.jsx(Ge,{...o,...n,ref:a})});ge.displayName=mt;var bt="MenubarCheckboxItem",xe=c.forwardRef((t,a)=>{const{__scopeMenubar:r,...n}=t,o=b(r);return e.jsx(Ve,{...o,...n,ref:a})});xe.displayName=bt;var pt="MenubarRadioGroup",ye=c.forwardRef((t,a)=>{const{__scopeMenubar:r,...n}=t,o=b(r);return e.jsx(Ue,{...o,...n,ref:a})});ye.displayName=pt;var ht="MenubarRadioItem",ve=c.forwardRef((t,a)=>{const{__scopeMenubar:r,...n}=t,o=b(r);return e.jsx(qe,{...o,...n,ref:a})});ve.displayName=ht;var gt="MenubarItemIndicator",fe=c.forwardRef((t,a)=>{const{__scopeMenubar:r,...n}=t,o=b(r);return e.jsx($e,{...o,...n,ref:a})});fe.displayName=gt;var xt="MenubarSeparator",Me=c.forwardRef((t,a)=>{const{__scopeMenubar:r,...n}=t,o=b(r);return e.jsx(He,{...o,...n,ref:a})});Me.displayName=xt;var yt="MenubarArrow",vt=c.forwardRef((t,a)=>{const{__scopeMenubar:r,...n}=t,o=b(r);return e.jsx(et,{...o,...n,ref:a})});vt.displayName=yt;var Te="MenubarSub",Ie=t=>{const{__scopeMenubar:a,children:r,open:n,onOpenChange:o,defaultOpen:d}=t,p=b(a),[l,i]=te({prop:n,defaultProp:d??!1,onChange:o,caller:Te});return e.jsx(Ze,{...p,open:l,onOpenChange:i,children:r})};Ie.displayName=Te;var ft="MenubarSubTrigger",we=c.forwardRef((t,a)=>{const{__scopeMenubar:r,...n}=t,o=b(r);return e.jsx(Xe,{"data-radix-menubar-subtrigger":"",...o,...n,ref:a})});we.displayName=ft;var Mt="MenubarSubContent",Se=c.forwardRef((t,a)=>{const{__scopeMenubar:r,...n}=t,o=b(r);return e.jsx(Ye,{...o,"data-radix-menubar-content":"",...n,ref:a,style:{...t.style,"--radix-menubar-content-transform-origin":"var(--radix-popper-transform-origin)","--radix-menubar-content-available-width":"var(--radix-popper-available-width)","--radix-menubar-content-available-height":"var(--radix-popper-available-height)","--radix-menubar-trigger-width":"var(--radix-popper-anchor-width)","--radix-menubar-trigger-height":"var(--radix-popper-anchor-height)"}})});Se.displayName=Mt;function Tt(t,a){return t.map((r,n)=>t[(a+n)%t.length])}var It=ie,wt=de,St=le,Bt=me,Ct=be,jt=pe,kt=he,Dt=ge,_t=xe,Rt=ye,At=ve,Be=fe,Et=Me,Nt=Ie,Pt=we,Ot=Se;function j({className:t,...a}){return e.jsx(It,{"data-slot":"menubar",className:T("flex h-8 items-center gap-0.5 rounded-lg border bg-background p-[3px]",t),...a})}function S({...t}){return e.jsx(wt,{"data-slot":"menubar-menu",...t})}function Z({...t}){return e.jsx(jt,{"data-slot":"menubar-group",...t})}function Ce({...t}){return e.jsx(Bt,{"data-slot":"menubar-portal",...t})}function je({...t}){return e.jsx(Rt,{"data-slot":"menubar-radio-group",...t})}function B({className:t,...a}){return e.jsx(St,{"data-slot":"menubar-trigger",className:T("flex items-center rounded-sm px-1.5 py-[2px] text-sm font-medium outline-hidden select-none hover:bg-muted aria-expanded:bg-muted",t),...a})}function C({className:t,align:a="start",alignOffset:r=-4,sideOffset:n=8,...o}){return e.jsx(Ce,{children:e.jsx(Ct,{"data-slot":"menubar-content",align:a,alignOffset:r,sideOffset:n,className:T("z-50 min-w-36 origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",t),...o})})}function m({className:t,inset:a,variant:r="default",...n}){return e.jsx(Dt,{"data-slot":"menubar-item","data-inset":a,"data-variant":r,className:T("group/menubar-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:text-destructive!",t),...n})}function H({className:t,children:a,checked:r,inset:n,...o}){return e.jsxs(_t,{"data-slot":"menubar-checkbox-item","data-inset":n,className:T("relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-1.5 pl-7 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",t),checked:r,...o,children:[e.jsx("span",{className:"pointer-events-none absolute left-1.5 flex size-4 items-center justify-center [&_svg:not([class*='size-'])]:size-4",children:e.jsx(Be,{children:e.jsx(ne,{})})}),a]})}function W({className:t,children:a,inset:r,...n}){return e.jsxs(At,{"data-slot":"menubar-radio-item","data-inset":r,className:T("relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-1.5 pl-7 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",t),...n,children:[e.jsx("span",{className:"pointer-events-none absolute left-1.5 flex size-4 items-center justify-center [&_svg:not([class*='size-'])]:size-4",children:e.jsx(Be,{children:e.jsx(ne,{})})}),a]})}function R({className:t,inset:a,...r}){return e.jsx(kt,{"data-slot":"menubar-label","data-inset":a,className:T("px-1.5 py-1 text-sm font-medium data-inset:pl-7",t),...r})}function _({className:t,...a}){return e.jsx(Et,{"data-slot":"menubar-separator",className:T("-mx-1 my-1 h-px bg-border",t),...a})}function D({className:t,...a}){return e.jsx("span",{"data-slot":"menubar-shortcut",className:T("ml-auto text-xs tracking-widest text-muted-foreground group-focus/menubar-item:text-accent-foreground",t),...a})}function ke({...t}){return e.jsx(Nt,{"data-slot":"menubar-sub",...t})}function De({className:t,inset:a,children:r,...n}){return e.jsxs(Pt,{"data-slot":"menubar-sub-trigger","data-inset":a,className:T("flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-none select-none focus:bg-accent focus:text-accent-foreground data-inset:pl-7 data-open:bg-accent data-open:text-accent-foreground [&_svg:not([class*='size-'])]:size-4",t),...n,children:[r,e.jsx(Ne,{className:"ml-auto size-4"})]})}function _e({className:t,...a}){return e.jsx(Ot,{"data-slot":"menubar-sub-content",className:T("z-50 min-w-32 origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",t),...a})}j.__docgenInfo={description:"",methods:[],displayName:"Menubar"};Ce.__docgenInfo={description:"",methods:[],displayName:"MenubarPortal"};S.__docgenInfo={description:"",methods:[],displayName:"MenubarMenu"};B.__docgenInfo={description:"",methods:[],displayName:"MenubarTrigger"};C.__docgenInfo={description:"",methods:[],displayName:"MenubarContent",props:{align:{defaultValue:{value:'"start"',computed:!1},required:!1},alignOffset:{defaultValue:{value:"-4",computed:!1},required:!1},sideOffset:{defaultValue:{value:"8",computed:!1},required:!1}}};Z.__docgenInfo={description:"",methods:[],displayName:"MenubarGroup"};_.__docgenInfo={description:"",methods:[],displayName:"MenubarSeparator"};R.__docgenInfo={description:"",methods:[],displayName:"MenubarLabel",props:{inset:{required:!1,tsType:{name:"boolean"},description:""}}};m.__docgenInfo={description:"",methods:[],displayName:"MenubarItem",props:{inset:{required:!1,tsType:{name:"boolean"},description:""},variant:{required:!1,tsType:{name:"union",raw:'"default" | "destructive"',elements:[{name:"literal",value:'"default"'},{name:"literal",value:'"destructive"'}]},description:"",defaultValue:{value:'"default"',computed:!1}}}};D.__docgenInfo={description:"",methods:[],displayName:"MenubarShortcut"};H.__docgenInfo={description:"",methods:[],displayName:"MenubarCheckboxItem",props:{inset:{required:!1,tsType:{name:"boolean"},description:""}}};je.__docgenInfo={description:"",methods:[],displayName:"MenubarRadioGroup"};W.__docgenInfo={description:"",methods:[],displayName:"MenubarRadioItem",props:{inset:{required:!1,tsType:{name:"boolean"},description:""}}};ke.__docgenInfo={description:"",methods:[],displayName:"MenubarSub"};De.__docgenInfo={description:"",methods:[],displayName:"MenubarSubTrigger",props:{inset:{required:!1,tsType:{name:"boolean"},description:""}}};_e.__docgenInfo={description:"",methods:[],displayName:"MenubarSubContent"};const{expect:s,userEvent:v,waitFor:Gt,within:h}=__STORYBOOK_MODULE_TEST__,Yt={title:"Components/Menubar",component:m,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{variant:{control:{type:"select"},options:["default","destructive"]}},args:{variant:"default"}};function Re(t){const a=t?.variant==="destructive";return e.jsxs(j,{children:[e.jsxs(S,{children:[e.jsx(B,{children:"File"}),e.jsxs(C,{children:[e.jsxs(m,{children:[e.jsx(nt,{}),"Rename",e.jsx(D,{children:"⌘R"})]}),e.jsxs(m,{children:[e.jsx(rt,{}),"Duplicate",e.jsx(D,{children:"⌘D"})]}),e.jsx(_,{}),e.jsxs(m,{...t,children:[a&&e.jsx(oe,{}),a?"Delete project":"Archive project"]})]})]}),e.jsxs(S,{children:[e.jsx(B,{children:"Edit"}),e.jsxs(C,{children:[e.jsx(m,{children:"Copy"}),e.jsx(m,{children:"Paste"})]})]})]})}const E={render:Re,parameters:{zephyr:{testCaseId:"SW-T1270"}},play:async({canvasElement:t,step:a})=>{const r=h(t);await a("Menubar triggers render",async()=>{s(r.getByText("File")).toBeInTheDocument(),s(r.getByText("Edit")).toBeInTheDocument()}),await a("Menubar root has correct data-slot",async()=>{const n=r.getByRole("menubar");s(n).toHaveAttribute("data-slot","menubar")}),await a("Clicking File trigger opens menu content",async()=>{await v.click(r.getByText("File"));const n=h(t.ownerDocument.body);s(n.getByText("Rename")).toBeInTheDocument(),s(n.getByText("Duplicate")).toBeInTheDocument(),s(n.getByText("Archive project")).toBeInTheDocument()}),await a("Shortcuts render inside menu items",async()=>{const n=h(t.ownerDocument.body);s(n.getByText("⌘R")).toBeInTheDocument(),s(n.getByText("⌘D")).toBeInTheDocument()})}},N={args:{variant:"destructive"},render:Re,parameters:{zephyr:{testCaseId:"SW-T1271"}},play:async({canvasElement:t,step:a})=>{const r=h(t);await a("Menubar triggers render",async()=>{s(r.getByText("File")).toBeInTheDocument(),s(r.getByText("Edit")).toBeInTheDocument()}),await a("Opening File shows destructive item",async()=>{await v.click(r.getByText("File"));const o=h(t.ownerDocument.body).getByText("Delete project");s(o).toBeInTheDocument(),s(o.closest("[data-slot='menubar-item']")).toHaveAttribute("data-variant","destructive")})}},P={render:()=>{const[t,a]=z.useState(!0),[r,n]=z.useState(!1),[o,d]=z.useState(!0);return e.jsx(j,{children:e.jsxs(S,{children:[e.jsx(B,{children:"View"}),e.jsxs(C,{children:[e.jsx(R,{children:"Panels"}),e.jsx(_,{}),e.jsx(H,{checked:t,onCheckedChange:a,children:"Toolbar"}),e.jsx(H,{checked:r,onCheckedChange:n,children:"Sidebar"}),e.jsx(H,{checked:o,onCheckedChange:d,children:"Status Bar"})]})]})})},play:async({canvasElement:t,step:a})=>{const r=h(t);await a("Open View menu",async()=>{await v.click(r.getByText("View"))});const n=h(t.ownerDocument.body);await a("Label and checkbox items render",async()=>{s(n.getByText("Panels")).toBeInTheDocument(),s(n.getByText("Toolbar")).toBeInTheDocument(),s(n.getByText("Sidebar")).toBeInTheDocument(),s(n.getByText("Status Bar")).toBeInTheDocument()}),await a("Checked items show indicator, unchecked do not",async()=>{const o=n.getByText("Toolbar").closest("[data-slot='menubar-checkbox-item']"),d=n.getByText("Sidebar").closest("[data-slot='menubar-checkbox-item']");s(o).toHaveAttribute("data-state","checked"),s(d).toHaveAttribute("data-state","unchecked")}),await a("Clicking unchecked item toggles it to checked",async()=>{await v.click(n.getByText("Sidebar")),await v.click(r.getByText("View"));const o=n.getByText("Sidebar").closest("[data-slot='menubar-checkbox-item']");s(o).toHaveAttribute("data-state","checked")})},parameters:{zephyr:{testCaseId:"SW-T1480"}}},O={render:()=>{const[t,a]=z.useState("system");return e.jsx(j,{children:e.jsxs(S,{children:[e.jsx(B,{children:"Preferences"}),e.jsxs(C,{children:[e.jsx(R,{children:"Theme"}),e.jsx(_,{}),e.jsxs(je,{value:t,onValueChange:a,children:[e.jsx(W,{value:"light",children:"Light"}),e.jsx(W,{value:"dark",children:"Dark"}),e.jsx(W,{value:"system",children:"System"})]})]})]})})},play:async({canvasElement:t,step:a})=>{const r=h(t);await a("Open Preferences menu",async()=>{await v.click(r.getByText("Preferences"))});const n=h(t.ownerDocument.body);await a("Radio items render with correct initial selection",async()=>{s(n.getByText("Theme")).toBeInTheDocument();const o=n.getByText("System").closest("[data-slot='menubar-radio-item']"),d=n.getByText("Light").closest("[data-slot='menubar-radio-item']");s(o).toHaveAttribute("data-state","checked"),s(d).toHaveAttribute("data-state","unchecked")}),await a("Clicking a different radio item selects it",async()=>{await v.click(n.getByText("Dark")),await v.click(r.getByText("Preferences"));const o=n.getByText("Dark").closest("[data-slot='menubar-radio-item']"),d=n.getByText("System").closest("[data-slot='menubar-radio-item']");s(o).toHaveAttribute("data-state","checked"),s(d).toHaveAttribute("data-state","unchecked")})},parameters:{zephyr:{testCaseId:"SW-T1481"}}},G={render:()=>e.jsx(j,{children:e.jsxs(S,{children:[e.jsx(B,{children:"File"}),e.jsxs(C,{children:[e.jsx(m,{children:"New File"}),e.jsxs(ke,{children:[e.jsx(De,{children:"Share"}),e.jsxs(_e,{children:[e.jsx(m,{children:"Email"}),e.jsx(m,{children:"Slack"}),e.jsx(m,{children:"Copy Link"})]})]}),e.jsx(_,{}),e.jsx(m,{children:"Exit"})]})]})}),play:async({canvasElement:t,step:a})=>{const r=h(t),n=h(t.ownerDocument.body);await a("Open File menu",async()=>{await v.click(r.getByText("File")),s(n.getByText("New File")).toBeInTheDocument()}),await a("Sub-trigger renders with correct data-slot",async()=>{const o=n.getByText("Share");s(o.closest("[data-slot='menubar-sub-trigger']")).toBeInTheDocument()}),await a("Clicking sub-trigger opens sub-content",async()=>{await v.click(n.getByText("Share")),await Gt(()=>{s(n.getByText("Email")).toBeInTheDocument()}),s(n.getByText("Slack")).toBeInTheDocument(),s(n.getByText("Copy Link")).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1482"}}},F={render:()=>e.jsx(j,{children:e.jsxs(S,{children:[e.jsx(B,{children:"Edit"}),e.jsxs(C,{children:[e.jsxs(m,{children:["Cut",e.jsx(D,{children:"⌘X"})]}),e.jsxs(m,{disabled:!0,children:["Paste",e.jsx(D,{children:"⌘V"})]}),e.jsxs(m,{children:["Select All",e.jsx(D,{children:"⌘A"})]})]})]})}),play:async({canvasElement:t,step:a})=>{const r=h(t),n=h(t.ownerDocument.body);await a("Open Edit menu",async()=>{await v.click(r.getByText("Edit"))}),await a("Disabled item has data-disabled attribute",async()=>{const o=n.getByText("Paste").closest("[data-slot='menubar-item']");s(o).toHaveAttribute("data-disabled")}),await a("Enabled items do not have data-disabled",async()=>{const o=n.getByText("Cut").closest("[data-slot='menubar-item']");s(o).not.toHaveAttribute("data-disabled")})},parameters:{zephyr:{testCaseId:"SW-T1483"}}},L={render:()=>e.jsx(j,{children:e.jsxs(S,{children:[e.jsx(B,{children:"Actions"}),e.jsxs(C,{children:[e.jsxs(Z,{children:[e.jsx(R,{children:"Navigation"}),e.jsx(m,{children:"Go to Home"}),e.jsx(m,{children:"Go to Settings"})]}),e.jsx(_,{}),e.jsxs(Z,{children:[e.jsx(R,{children:"Danger Zone"}),e.jsxs(m,{variant:"destructive",children:[e.jsx(oe,{}),"Delete Account"]})]})]})]})}),play:async({canvasElement:t,step:a})=>{const r=h(t),n=h(t.ownerDocument.body);await a("Open Actions menu",async()=>{await v.click(r.getByText("Actions"))}),await a("Labels render for each group",async()=>{s(n.getByText("Navigation")).toBeInTheDocument(),s(n.getByText("Danger Zone")).toBeInTheDocument()}),await a("Items render in their groups",async()=>{s(n.getByText("Go to Home")).toBeInTheDocument(),s(n.getByText("Go to Settings")).toBeInTheDocument(),s(n.getByText("Delete Account")).toBeInTheDocument()}),await a("Destructive item in group has correct variant",async()=>{const o=n.getByText("Delete Account").closest("[data-slot='menubar-item']");s(o).toHaveAttribute("data-variant","destructive")})},parameters:{zephyr:{testCaseId:"SW-T1484"}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: renderMenubar,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1270"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Menubar triggers render", async () => {
      expect(canvas.getByText("File")).toBeInTheDocument();
      expect(canvas.getByText("Edit")).toBeInTheDocument();
    });
    await step("Menubar root has correct data-slot", async () => {
      const menubar = canvas.getByRole("menubar");
      expect(menubar).toHaveAttribute("data-slot", "menubar");
    });
    await step("Clicking File trigger opens menu content", async () => {
      await userEvent.click(canvas.getByText("File"));
      const body = within(canvasElement.ownerDocument.body);
      expect(body.getByText("Rename")).toBeInTheDocument();
      expect(body.getByText("Duplicate")).toBeInTheDocument();
      expect(body.getByText("Archive project")).toBeInTheDocument();
    });
    await step("Shortcuts render inside menu items", async () => {
      const body = within(canvasElement.ownerDocument.body);
      expect(body.getByText("⌘R")).toBeInTheDocument();
      expect(body.getByText("⌘D")).toBeInTheDocument();
    });
  }
}`,...E.parameters?.docs?.source}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "destructive"
  },
  render: renderMenubar,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1271"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Menubar triggers render", async () => {
      expect(canvas.getByText("File")).toBeInTheDocument();
      expect(canvas.getByText("Edit")).toBeInTheDocument();
    });
    await step("Opening File shows destructive item", async () => {
      await userEvent.click(canvas.getByText("File"));
      const body = within(canvasElement.ownerDocument.body);
      const deleteItem = body.getByText("Delete project");
      expect(deleteItem).toBeInTheDocument();
      expect(deleteItem.closest("[data-slot='menubar-item']")).toHaveAttribute("data-variant", "destructive");
    });
  }
}`,...N.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [showToolbar, setShowToolbar] = React.useState(true);
    const [showSidebar, setShowSidebar] = React.useState(false);
    const [showStatusBar, setShowStatusBar] = React.useState(true);
    return <Menubar>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarLabel>Panels</MenubarLabel>
            <MenubarSeparator />
            <MenubarCheckboxItem checked={showToolbar} onCheckedChange={setShowToolbar}>
              Toolbar
            </MenubarCheckboxItem>
            <MenubarCheckboxItem checked={showSidebar} onCheckedChange={setShowSidebar}>
              Sidebar
            </MenubarCheckboxItem>
            <MenubarCheckboxItem checked={showStatusBar} onCheckedChange={setShowStatusBar}>
              Status Bar
            </MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>;
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Open View menu", async () => {
      await userEvent.click(canvas.getByText("View"));
    });
    const body = within(canvasElement.ownerDocument.body);
    await step("Label and checkbox items render", async () => {
      expect(body.getByText("Panels")).toBeInTheDocument();
      expect(body.getByText("Toolbar")).toBeInTheDocument();
      expect(body.getByText("Sidebar")).toBeInTheDocument();
      expect(body.getByText("Status Bar")).toBeInTheDocument();
    });
    await step("Checked items show indicator, unchecked do not", async () => {
      const toolbarItem = body.getByText("Toolbar").closest("[data-slot='menubar-checkbox-item']")!;
      const sidebarItem = body.getByText("Sidebar").closest("[data-slot='menubar-checkbox-item']")!;
      expect(toolbarItem).toHaveAttribute("data-state", "checked");
      expect(sidebarItem).toHaveAttribute("data-state", "unchecked");
    });
    await step("Clicking unchecked item toggles it to checked", async () => {
      await userEvent.click(body.getByText("Sidebar"));
      // Re-open the menu to verify
      await userEvent.click(canvas.getByText("View"));
      const sidebarItem = body.getByText("Sidebar").closest("[data-slot='menubar-checkbox-item']")!;
      expect(sidebarItem).toHaveAttribute("data-state", "checked");
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1480"
    }
  }
}`,...P.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [theme, setTheme] = React.useState("system");
    return <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Preferences</MenubarTrigger>
          <MenubarContent>
            <MenubarLabel>Theme</MenubarLabel>
            <MenubarSeparator />
            <MenubarRadioGroup value={theme} onValueChange={setTheme}>
              <MenubarRadioItem value="light">Light</MenubarRadioItem>
              <MenubarRadioItem value="dark">Dark</MenubarRadioItem>
              <MenubarRadioItem value="system">System</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>;
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Open Preferences menu", async () => {
      await userEvent.click(canvas.getByText("Preferences"));
    });
    const body = within(canvasElement.ownerDocument.body);
    await step("Radio items render with correct initial selection", async () => {
      expect(body.getByText("Theme")).toBeInTheDocument();
      const systemItem = body.getByText("System").closest("[data-slot='menubar-radio-item']")!;
      const lightItem = body.getByText("Light").closest("[data-slot='menubar-radio-item']")!;
      expect(systemItem).toHaveAttribute("data-state", "checked");
      expect(lightItem).toHaveAttribute("data-state", "unchecked");
    });
    await step("Clicking a different radio item selects it", async () => {
      await userEvent.click(body.getByText("Dark"));
      // Re-open menu to verify
      await userEvent.click(canvas.getByText("Preferences"));
      const darkItem = body.getByText("Dark").closest("[data-slot='menubar-radio-item']")!;
      const systemItem = body.getByText("System").closest("[data-slot='menubar-radio-item']")!;
      expect(darkItem).toHaveAttribute("data-state", "checked");
      expect(systemItem).toHaveAttribute("data-state", "unchecked");
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1481"
    }
  }
}`,...O.parameters?.docs?.source}}};G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  render: () => <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New File</MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger>Share</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Email</MenubarItem>
              <MenubarItem>Slack</MenubarItem>
              <MenubarItem>Copy Link</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>Exit</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await step("Open File menu", async () => {
      await userEvent.click(canvas.getByText("File"));
      expect(body.getByText("New File")).toBeInTheDocument();
    });
    await step("Sub-trigger renders with correct data-slot", async () => {
      const shareTrigger = body.getByText("Share");
      expect(shareTrigger.closest("[data-slot='menubar-sub-trigger']")).toBeInTheDocument();
    });
    await step("Clicking sub-trigger opens sub-content", async () => {
      await userEvent.click(body.getByText("Share"));
      await waitFor(() => {
        expect(body.getByText("Email")).toBeInTheDocument();
      });
      expect(body.getByText("Slack")).toBeInTheDocument();
      expect(body.getByText("Copy Link")).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1482"
    }
  }
}`,...G.parameters?.docs?.source}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: () => <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Cut
            <MenubarShortcut>⌘X</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>
            Paste
            <MenubarShortcut>⌘V</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Select All
            <MenubarShortcut>⌘A</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await step("Open Edit menu", async () => {
      await userEvent.click(canvas.getByText("Edit"));
    });
    await step("Disabled item has data-disabled attribute", async () => {
      const pasteItem = body.getByText("Paste").closest("[data-slot='menubar-item']")!;
      expect(pasteItem).toHaveAttribute("data-disabled");
    });
    await step("Enabled items do not have data-disabled", async () => {
      const cutItem = body.getByText("Cut").closest("[data-slot='menubar-item']")!;
      expect(cutItem).not.toHaveAttribute("data-disabled");
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1483"
    }
  }
}`,...F.parameters?.docs?.source}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: () => <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Actions</MenubarTrigger>
        <MenubarContent>
          <MenubarGroup>
            <MenubarLabel>Navigation</MenubarLabel>
            <MenubarItem>Go to Home</MenubarItem>
            <MenubarItem>Go to Settings</MenubarItem>
          </MenubarGroup>
          <MenubarSeparator />
          <MenubarGroup>
            <MenubarLabel>Danger Zone</MenubarLabel>
            <MenubarItem variant="destructive">
              <Trash2Icon />
              Delete Account
            </MenubarItem>
          </MenubarGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await step("Open Actions menu", async () => {
      await userEvent.click(canvas.getByText("Actions"));
    });
    await step("Labels render for each group", async () => {
      expect(body.getByText("Navigation")).toBeInTheDocument();
      expect(body.getByText("Danger Zone")).toBeInTheDocument();
    });
    await step("Items render in their groups", async () => {
      expect(body.getByText("Go to Home")).toBeInTheDocument();
      expect(body.getByText("Go to Settings")).toBeInTheDocument();
      expect(body.getByText("Delete Account")).toBeInTheDocument();
    });
    await step("Destructive item in group has correct variant", async () => {
      const deleteItem = body.getByText("Delete Account").closest("[data-slot='menubar-item']")!;
      expect(deleteItem).toHaveAttribute("data-variant", "destructive");
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1484"
    }
  }
}`,...L.parameters?.docs?.source}}};const Jt=["Default","Destructive","WithCheckboxItems","WithRadioGroup","WithSubMenu","WithDisabledItems","WithGroupsAndLabels"];export{E as Default,N as Destructive,P as WithCheckboxItems,F as WithDisabledItems,L as WithGroupsAndLabels,O as WithRadioGroup,G as WithSubMenu,Jt as __namedExportsOrder,Yt as default};
