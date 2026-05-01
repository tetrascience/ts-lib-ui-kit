import{r as c,j as e,c as i,S as z,B as je,E as Be,y as Te}from"./iframe-14YYbrss.js";import{c as we}from"./index-B8eA1Gpy.js";import{B as Ie}from"./button-BSJeE99h.js";import{I as _e}from"./input-CUCTLqrj.js";import{S as Ne}from"./separator-BG8Oc9DV.js";import{a as Ce,S as Ae,b as ke,c as ze,d as Me}from"./sheet-Cu6TYjPq.js";import{S as pe}from"./skeleton-A5DdSu8W.js";import{P as De,a as be,H as re,U as qe,I as he}from"./users-B1UQT0uH.js";import{F as ne}from"./folder-CpEITL-a.js";import{S as oe}from"./settings-B7uj2V5S.js";import{B as Ee}from"./bell-BujJDfEv.js";import{S as Re}from"./star-zsBEvrKc.js";import"./preload-helper-BbFkF2Um.js";import"./x-B6L8IQUu.js";import"./index-CKyK_5sn.js";import"./index-Bjo__dt-.js";const te=768;function We(){const[a,t]=c.useState();return c.useEffect(()=>{const s=window.matchMedia(`(max-width: ${te-1}px)`),r=()=>{t(window.innerWidth<te)};return s.addEventListener("change",r),t(window.innerWidth<te),()=>s.removeEventListener("change",r)},[]),!!a}const me=60,Oe=24,Pe=7,Ve="sidebar_state",Ge=me*me*Oe*Pe,Le="16rem",He="18rem",Fe="3rem",Ke="b",ge=c.createContext(null);function ee(){const a=c.useContext(ge);if(!a)throw new Error("useSidebar must be used within a SidebarProvider.");return a}function w({defaultOpen:a=!0,open:t,onOpenChange:s,className:r,style:o,children:j,...B}){const b=We(),[T,h]=c.useState(!1),[C,Se]=c.useState(a),A=t??C,M=c.useCallback(u=>{const g=typeof u=="function"?u(A):u;s?s(g):Se(g),document.cookie=`${Ve}=${g}; path=/; max-age=${Ge}`},[s,A]),D=c.useCallback(()=>b?h(u=>!u):M(u=>!u),[b,M,h]);c.useEffect(()=>{const u=g=>{g.key===Ke&&(g.metaKey||g.ctrlKey)&&(g.preventDefault(),D())};return window.addEventListener("keydown",u),()=>window.removeEventListener("keydown",u)},[D]);const ue=A?"expanded":"collapsed",ve=c.useMemo(()=>({state:ue,open:A,setOpen:M,isMobile:b,openMobile:T,setOpenMobile:h,toggleSidebar:D}),[ue,A,M,b,T,h,D]);return e.jsx(ge.Provider,{value:ve,children:e.jsx("div",{"data-slot":"sidebar-wrapper",style:{"--sidebar-width":Le,"--sidebar-width-icon":Fe,...o},className:i("group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar",r),...B,children:j})})}function S({side:a="left",variant:t="sidebar",collapsible:s="offcanvas",className:r,children:o,dir:j,...B}){const{isMobile:b,state:T,openMobile:h,setOpenMobile:C}=ee();return s==="none"?e.jsx("div",{"data-slot":"sidebar",className:i("flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground",r),...B,children:o}):b?e.jsx(Ce,{open:h,onOpenChange:C,...B,children:e.jsxs(Ae,{dir:j,"data-sidebar":"sidebar","data-slot":"sidebar","data-mobile":"true",className:"w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden",style:{"--sidebar-width":He},side:a,children:[e.jsxs(ke,{className:"sr-only",children:[e.jsx(ze,{children:"Sidebar"}),e.jsx(Me,{children:"Displays the mobile sidebar."})]}),e.jsx("div",{className:"flex h-full w-full flex-col",children:o})]})}):e.jsxs("div",{className:"group peer hidden text-sidebar-foreground md:block","data-state":T,"data-collapsible":T==="collapsed"?s:"","data-variant":t,"data-side":a,"data-slot":"sidebar",children:[e.jsx("div",{"data-slot":"sidebar-gap",className:i("relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear","group-data-[collapsible=offcanvas]:w-0","group-data-[side=right]:rotate-180",t==="floating"||t==="inset"?"group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]":"group-data-[collapsible=icon]:w-(--sidebar-width-icon)")}),e.jsx("div",{"data-slot":"sidebar-container","data-side":a,className:i("fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear data-[side=left]:left-0 data-[side=left]:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] data-[side=right]:right-0 data-[side=right]:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)] md:flex",t==="floating"||t==="inset"?"p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]":"group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",r),...B,children:e.jsx("div",{"data-sidebar":"sidebar","data-slot":"sidebar-inner",className:"flex size-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:shadow-sm group-data-[variant=floating]:ring-1 group-data-[variant=floating]:ring-sidebar-border",children:o})})]})}function ae({className:a,onClick:t,...s}){const{toggleSidebar:r}=ee();return e.jsxs(Ie,{"data-sidebar":"trigger","data-slot":"sidebar-trigger",variant:"ghost",size:"icon-sm",className:i(a),onClick:o=>{t?.(o),r()},...s,children:[e.jsx(De,{}),e.jsx("span",{className:"sr-only",children:"Toggle Sidebar"})]})}function xe({className:a,...t}){const{toggleSidebar:s}=ee();return e.jsx("button",{"data-sidebar":"rail","data-slot":"sidebar-rail","aria-label":"Toggle Sidebar",tabIndex:-1,onClick:s,title:"Toggle Sidebar",className:i("absolute inset-y-0 z-20 hidden w-4 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:start-1/2 after:w-[2px] hover:after:bg-sidebar-border sm:flex ltr:-translate-x-1/2 rtl:-translate-x-1/2","in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize","[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize","group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full hover:group-data-[collapsible=offcanvas]:bg-sidebar","[[data-side=left][data-collapsible=offcanvas]_&]:-right-2","[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",a),...t})}function I({className:a,...t}){return e.jsx("main",{"data-slot":"sidebar-inset",className:i("relative flex w-full flex-1 flex-col bg-background md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",a),...t})}function ie({className:a,...t}){return e.jsx(_e,{"data-slot":"sidebar-input","data-sidebar":"input",className:i("h-8 w-full bg-background shadow-none",a),...t})}function de({className:a,...t}){return e.jsx("div",{"data-slot":"sidebar-header","data-sidebar":"header",className:i("flex flex-col gap-2 p-2",a),...t})}function le({className:a,...t}){return e.jsx("div",{"data-slot":"sidebar-footer","data-sidebar":"footer",className:i("flex flex-col gap-2 p-2",a),...t})}function k({className:a,...t}){return e.jsx(Ne,{"data-slot":"sidebar-separator","data-sidebar":"separator",className:i("mx-2 w-auto bg-sidebar-border",a),...t})}function _({className:a,...t}){return e.jsx("div",{"data-slot":"sidebar-content","data-sidebar":"content",className:i("no-scrollbar flex min-h-0 flex-1 flex-col gap-0 overflow-auto group-data-[collapsible=icon]:overflow-hidden",a),...t})}function x({className:a,...t}){return e.jsx("div",{"data-slot":"sidebar-group","data-sidebar":"group",className:i("relative flex w-full min-w-0 flex-col p-2",a),...t})}function f({className:a,asChild:t=!1,...s}){const r=t?z:"div";return e.jsx(r,{"data-slot":"sidebar-group-label","data-sidebar":"group-label",className:i("flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 ring-sidebar-ring outline-hidden transition-[margin,opacity] duration-200 ease-linear group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",a),...s})}function ce({className:a,asChild:t=!1,...s}){const r=t?z:"button";return e.jsx(r,{"data-slot":"sidebar-group-action","data-sidebar":"group-action",className:i("absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground ring-sidebar-ring outline-hidden transition-transform group-data-[collapsible=icon]:hidden after:absolute after:-inset-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0",a),...s})}function y({className:a,...t}){return e.jsx("div",{"data-slot":"sidebar-group-content","data-sidebar":"group-content",className:i("w-full text-sm",a),...t})}function p({className:a,...t}){return e.jsx("ul",{"data-slot":"sidebar-menu","data-sidebar":"menu",className:i("flex w-full min-w-0 flex-col gap-0",a),...t})}function d({className:a,...t}){return e.jsx("li",{"data-slot":"sidebar-menu-item","data-sidebar":"menu-item",className:i("group/menu-item relative",a),...t})}const Ue=we("peer/menu-button group/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm ring-sidebar-ring outline-hidden transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-open:hover:bg-sidebar-accent data-open:hover:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate",{variants:{variant:{default:"hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",outline:"bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]"},size:{default:"h-8 text-sm",sm:"h-7 text-xs",lg:"h-12 text-sm group-data-[collapsible=icon]:p-0!"}},defaultVariants:{variant:"default",size:"default"}});function l({asChild:a=!1,isActive:t=!1,variant:s="default",size:r="default",tooltip:o,className:j,...B}){const b=a?z:"button",{isMobile:T,state:h}=ee(),C=e.jsx(b,{"data-slot":"sidebar-menu-button","data-sidebar":"menu-button","data-size":r,"data-active":t,className:i(Ue({variant:s,size:r}),j),...B});return o?(typeof o=="string"&&(o={children:o}),e.jsxs(je,{children:[e.jsx(Be,{asChild:!0,children:C}),e.jsx(Te,{side:"right",align:"center",hidden:h!=="collapsed"||T,...o})]})):C}function fe({className:a,asChild:t=!1,showOnHover:s=!1,...r}){const o=t?z:"button";return e.jsx(o,{"data-slot":"sidebar-menu-action","data-sidebar":"menu-action",className:i("absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground ring-sidebar-ring outline-hidden transition-transform group-data-[collapsible=icon]:hidden peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 after:absolute after:-inset-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0",s&&"group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 peer-data-active/menu-button:text-sidebar-accent-foreground aria-expanded:opacity-100 md:opacity-0",a),...r})}function se({className:a,...t}){return e.jsx("div",{"data-slot":"sidebar-menu-badge","data-sidebar":"menu-badge",className:i("pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium text-sidebar-foreground tabular-nums select-none group-data-[collapsible=icon]:hidden peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 peer-data-active/menu-button:text-sidebar-accent-foreground",a),...t})}function Q({className:a,showIcon:t=!1,...s}){const[r]=c.useState(()=>`${Math.floor(Math.random()*40)+50}%`);return e.jsxs("div",{"data-slot":"sidebar-menu-skeleton","data-sidebar":"menu-skeleton",className:i("flex h-8 items-center gap-2 rounded-md px-2",a),...s,children:[t&&e.jsx(pe,{className:"size-4 rounded-md","data-sidebar":"menu-skeleton-icon"}),e.jsx(pe,{className:"h-4 max-w-(--skeleton-width) flex-1","data-sidebar":"menu-skeleton-text",style:{"--skeleton-width":r}})]})}function ye({className:a,...t}){return e.jsx("ul",{"data-slot":"sidebar-menu-sub","data-sidebar":"menu-sub",className:i("mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5 group-data-[collapsible=icon]:hidden",a),...t})}function X({className:a,...t}){return e.jsx("li",{"data-slot":"sidebar-menu-sub-item","data-sidebar":"menu-sub-item",className:i("group/menu-sub-item relative",a),...t})}function J({asChild:a=!1,size:t="md",isActive:s=!1,className:r,...o}){const j=a?z:"a";return e.jsx(j,{"data-slot":"sidebar-menu-sub-button","data-sidebar":"menu-sub-button","data-size":t,"data-active":s,className:i("flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground ring-sidebar-ring outline-hidden group-data-[collapsible=icon]:hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[size=md]:text-sm data-[size=sm]:text-xs data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",r),...o})}S.__docgenInfo={description:"",methods:[],displayName:"Sidebar",props:{side:{required:!1,tsType:{name:"union",raw:'"left" | "right"',elements:[{name:"literal",value:'"left"'},{name:"literal",value:'"right"'}]},description:"",defaultValue:{value:'"left"',computed:!1}},variant:{required:!1,tsType:{name:"union",raw:'"sidebar" | "floating" | "inset"',elements:[{name:"literal",value:'"sidebar"'},{name:"literal",value:'"floating"'},{name:"literal",value:'"inset"'}]},description:"",defaultValue:{value:'"sidebar"',computed:!1}},collapsible:{required:!1,tsType:{name:"union",raw:'"offcanvas" | "icon" | "none"',elements:[{name:"literal",value:'"offcanvas"'},{name:"literal",value:'"icon"'},{name:"literal",value:'"none"'}]},description:"",defaultValue:{value:'"offcanvas"',computed:!1}}}};_.__docgenInfo={description:"",methods:[],displayName:"SidebarContent"};le.__docgenInfo={description:"",methods:[],displayName:"SidebarFooter"};x.__docgenInfo={description:"",methods:[],displayName:"SidebarGroup"};ce.__docgenInfo={description:"",methods:[],displayName:"SidebarGroupAction",props:{asChild:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}}}};y.__docgenInfo={description:"",methods:[],displayName:"SidebarGroupContent"};f.__docgenInfo={description:"",methods:[],displayName:"SidebarGroupLabel",props:{asChild:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}}}};de.__docgenInfo={description:"",methods:[],displayName:"SidebarHeader"};ie.__docgenInfo={description:"",methods:[],displayName:"SidebarInput"};I.__docgenInfo={description:"",methods:[],displayName:"SidebarInset"};p.__docgenInfo={description:"",methods:[],displayName:"SidebarMenu"};fe.__docgenInfo={description:"",methods:[],displayName:"SidebarMenuAction",props:{asChild:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},showOnHover:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}}}};se.__docgenInfo={description:"",methods:[],displayName:"SidebarMenuBadge"};l.__docgenInfo={description:"",methods:[],displayName:"SidebarMenuButton",props:{asChild:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},isActive:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},tooltip:{required:!1,tsType:{name:"union",raw:"string | React.ComponentProps<typeof TooltipContent>",elements:[{name:"string"},{name:"ReactComponentProps",raw:"React.ComponentProps<typeof TooltipContent>",elements:[{name:"TooltipContent"}]}]},description:""},variant:{defaultValue:{value:'"default"',computed:!1},required:!1},size:{defaultValue:{value:'"default"',computed:!1},required:!1}}};d.__docgenInfo={description:"",methods:[],displayName:"SidebarMenuItem"};Q.__docgenInfo={description:"",methods:[],displayName:"SidebarMenuSkeleton",props:{showIcon:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}}}};ye.__docgenInfo={description:"",methods:[],displayName:"SidebarMenuSub"};J.__docgenInfo={description:"",methods:[],displayName:"SidebarMenuSubButton",props:{asChild:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},size:{required:!1,tsType:{name:"union",raw:'"sm" | "md"',elements:[{name:"literal",value:'"sm"'},{name:"literal",value:'"md"'}]},description:"",defaultValue:{value:'"md"',computed:!1}},isActive:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}}}};X.__docgenInfo={description:"",methods:[],displayName:"SidebarMenuSubItem"};w.__docgenInfo={description:"",methods:[],displayName:"SidebarProvider",props:{defaultOpen:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"true",computed:!1}},open:{required:!1,tsType:{name:"boolean"},description:""},onOpenChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(open: boolean) => void",signature:{arguments:[{type:{name:"boolean"},name:"open"}],return:{name:"void"}}},description:""}}};xe.__docgenInfo={description:"",methods:[],displayName:"SidebarRail"};k.__docgenInfo={description:"",methods:[],displayName:"SidebarSeparator"};ae.__docgenInfo={description:"",methods:[],displayName:"SidebarTrigger"};const{expect:n,userEvent:Z,within:v}=__STORYBOOK_MODULE_TEST__,ha={title:"Components/Sidebar",component:S,parameters:{layout:"fullscreen"},tags:["autodocs"],argTypes:{side:{control:{type:"select"},options:["left","right"]},variant:{control:{type:"select"},options:["sidebar","floating","inset"]},collapsible:{control:{type:"select"},options:["offcanvas","icon","none"]}},args:{side:"left",variant:"sidebar",collapsible:"offcanvas"}};function m(a,t){const s=typeof t?.open=="boolean"?{open:t.open}:{defaultOpen:!0};return e.jsx("div",{className:"min-h-[520px] bg-muted/30",children:e.jsxs(w,{...s,children:[e.jsxs(S,{...a,children:[e.jsx(de,{children:e.jsx(ie,{placeholder:"Search navigation"})}),e.jsx(k,{}),e.jsx(_,{children:e.jsxs(x,{children:[e.jsx(f,{children:"Workspace"}),e.jsx(ce,{"aria-label":"Add workspace section",children:e.jsx(be,{})}),e.jsx(y,{children:e.jsxs(p,{children:[e.jsx(d,{children:e.jsxs(l,{isActive:!0,size:t?.menuButtonSize??"default",tooltip:"Overview",variant:t?.menuButtonVariant??"default",children:[e.jsx(re,{}),e.jsx("span",{children:"Overview"})]})}),e.jsx(d,{children:e.jsxs(l,{size:t?.menuButtonSize??"default",tooltip:"Projects",variant:t?.menuButtonVariant??"default",children:[e.jsx(ne,{}),e.jsx("span",{children:"Projects"})]})}),e.jsx(d,{children:e.jsxs(l,{size:t?.menuButtonSize??"default",tooltip:"Team",variant:t?.menuButtonVariant??"default",children:[e.jsx(qe,{}),e.jsx("span",{children:"Team"})]})})]})})]})}),e.jsx(le,{children:e.jsx(p,{children:e.jsx(d,{children:e.jsxs(l,{size:t?.menuButtonSize??"default",variant:t?.menuButtonVariant??"default",children:[e.jsx(oe,{}),e.jsx("span",{children:"Settings"})]})})})})]}),e.jsxs(I,{children:[e.jsxs("div",{className:"flex items-center gap-2 border-b p-4",children:[e.jsx(ae,{}),e.jsxs("div",{children:[e.jsx("div",{className:"font-medium",children:"Dashboard"}),e.jsx("div",{className:"text-sm text-muted-foreground",children:"Example layout using the sidebar primitives."})]})]}),e.jsx("div",{className:"grid gap-4 p-4 md:grid-cols-3",children:Array.from({length:6},(r,o)=>e.jsxs("div",{className:"rounded-xl border bg-background p-4 text-sm",children:["Content panel ",o+1]},o))})]})]})})}const N=async({canvasElement:a,step:t})=>{const s=v(a);await t("Layout renders",async()=>{n(s.getByText("Dashboard")).toBeInTheDocument(),n(s.getByRole("button",{name:/toggle sidebar/i})).toBeInTheDocument()}),await t("Sidebar navigation",async()=>{n(s.getByPlaceholderText("Search navigation")).toBeInTheDocument(),n(s.getByText("Workspace")).toBeInTheDocument(),n(s.getByText("Overview")).toBeInTheDocument(),n(s.getByText("Projects")).toBeInTheDocument(),n(s.getByText("Settings")).toBeInTheDocument()})},q={render:m,parameters:{zephyr:{testCaseId:"SW-T1288"}},play:N},E={args:{variant:"floating"},render:m,parameters:{zephyr:{testCaseId:"SW-T1289"}},play:N},R={args:{variant:"inset"},render:m,parameters:{zephyr:{testCaseId:"SW-T1290"}},play:N},W={args:{side:"right"},render:m,parameters:{zephyr:{testCaseId:"SW-T1291"}},play:N},O={args:{collapsible:"icon"},render:a=>m(a,{open:!1}),parameters:{zephyr:{testCaseId:"SW-T1292"}},play:async({canvasElement:a,step:t})=>{const s=v(a);await t("Layout renders",async()=>{n(s.getByText("Dashboard")).toBeInTheDocument(),n(s.getByRole("button",{name:/toggle sidebar/i})).toBeInTheDocument()}),await t("Collapsed sidebar shell",async()=>{n(a.querySelector('[data-sidebar="sidebar"]')).toBeTruthy(),n(s.getByPlaceholderText("Search navigation")).toBeInTheDocument()})}},P={args:{collapsible:"none"},render:m,parameters:{zephyr:{testCaseId:"SW-T1293"}},play:N},V={render:a=>m(a,{menuButtonVariant:"outline"}),parameters:{zephyr:{testCaseId:"SW-T1294"}},play:N},G={render:a=>m(a,{menuButtonSize:"lg"}),parameters:{zephyr:{testCaseId:"SW-T1295"}},play:N},L={args:{collapsible:"icon"},render:a=>m(a),parameters:{zephyr:{testCaseId:"SW-T1296"}},play:async({canvasElement:a,step:t})=>{const s=v(a);await t("Sidebar starts expanded",async()=>{const r=a.querySelector('[data-slot="sidebar"]');n(r).toBeTruthy(),n(r?.getAttribute("data-state")).toBe("expanded")}),await t("Click trigger collapses sidebar",async()=>{const r=s.getByRole("button",{name:/toggle sidebar/i});await Z.click(r);const o=a.querySelector('[data-slot="sidebar"]');n(o?.getAttribute("data-state")).toBe("collapsed")}),await t("Click trigger again expands sidebar",async()=>{const r=s.getByRole("button",{name:/toggle sidebar/i});await Z.click(r);const o=a.querySelector('[data-slot="sidebar"]');n(o?.getAttribute("data-state")).toBe("expanded")})}};function $e(a){return e.jsx("div",{className:"min-h-[520px] bg-muted/30",children:e.jsxs(w,{defaultOpen:!0,children:[e.jsxs(S,{...a,collapsible:"icon",children:[e.jsx(_,{children:e.jsxs(x,{children:[e.jsx(f,{children:"Navigation"}),e.jsx(y,{children:e.jsxs(p,{children:[e.jsx(d,{children:e.jsxs(l,{isActive:!0,tooltip:"Home",children:[e.jsx(re,{}),e.jsx("span",{children:"Home"})]})}),e.jsx(d,{children:e.jsxs(l,{tooltip:"Inbox",children:[e.jsx(he,{}),e.jsx("span",{children:"Inbox"})]})})]})})]})}),e.jsx(xe,{})]}),e.jsx(I,{children:e.jsxs("div",{className:"flex items-center gap-2 border-b p-4",children:[e.jsx(ae,{}),e.jsx("span",{className:"font-medium",children:"Rail Example"})]})})]})})}const H={render:$e,parameters:{zephyr:{testCaseId:"SW-T1297"}},play:async({canvasElement:a,step:t})=>{const s=v(a);await t("Rail element renders",async()=>{const r=a.querySelector('[data-sidebar="rail"]');n(r).toBeTruthy(),n(r?.getAttribute("aria-label")).toBe("Toggle Sidebar")}),await t("Sidebar content renders with rail",async()=>{n(s.getByText("Home")).toBeInTheDocument(),n(s.getByText("Inbox")).toBeInTheDocument()}),await t("Rail click collapses sidebar",async()=>{const r=a.querySelector('[data-sidebar="rail"]');await Z.click(r);const o=a.querySelector('[data-slot="sidebar"]');n(o?.getAttribute("data-state")).toBe("collapsed")}),await t("Rail click expands sidebar again",async()=>{const r=a.querySelector('[data-sidebar="rail"]');await Z.click(r);const o=a.querySelector('[data-slot="sidebar"]');n(o?.getAttribute("data-state")).toBe("expanded")})}};function Ye(a){return e.jsx("div",{className:"min-h-[520px] bg-muted/30",children:e.jsxs(w,{defaultOpen:!0,children:[e.jsx(S,{...a,children:e.jsx(_,{children:e.jsxs(x,{children:[e.jsx(f,{children:"Platform"}),e.jsx(y,{children:e.jsxs(p,{children:[e.jsxs(d,{children:[e.jsxs(l,{isActive:!0,children:[e.jsx(ne,{}),e.jsx("span",{children:"Projects"})]}),e.jsxs(ye,{children:[e.jsx(X,{children:e.jsx(J,{isActive:!0,children:e.jsx("span",{children:"Alpha"})})}),e.jsx(X,{children:e.jsx(J,{children:e.jsx("span",{children:"Beta"})})}),e.jsx(X,{children:e.jsx(J,{size:"sm",children:e.jsx("span",{children:"Gamma (small)"})})})]})]}),e.jsx(d,{children:e.jsxs(l,{children:[e.jsx(oe,{}),e.jsx("span",{children:"Settings"})]})})]})})]})})}),e.jsx(I,{children:e.jsx("div",{className:"p-4 font-medium",children:"Sub Menu Example"})})]})})}const F={render:Ye,parameters:{zephyr:{testCaseId:"SW-T1298"}},play:async({canvasElement:a,step:t})=>{const s=v(a);await t("Parent menu items render",async()=>{n(s.getByText("Projects")).toBeInTheDocument(),n(s.getByText("Settings")).toBeInTheDocument()}),await t("Sub-menu items render",async()=>{n(s.getByText("Alpha")).toBeInTheDocument(),n(s.getByText("Beta")).toBeInTheDocument(),n(s.getByText("Gamma (small)")).toBeInTheDocument()}),await t("Sub-menu structure uses correct slots",async()=>{const r=a.querySelector('[data-slot="sidebar-menu-sub"]');n(r).toBeTruthy();const o=a.querySelectorAll('[data-slot="sidebar-menu-sub-item"]');n(o.length).toBe(3)}),await t("Active sub-item has data-active attribute",async()=>{const r=a.querySelector('[data-slot="sidebar-menu-sub-button"][data-active="true"]');n(r).toBeTruthy()})}};function Qe(a){return e.jsx("div",{className:"min-h-[520px] bg-muted/30",children:e.jsxs(w,{defaultOpen:!0,children:[e.jsx(S,{...a,children:e.jsx(_,{children:e.jsxs(x,{children:[e.jsx(f,{children:"Inbox"}),e.jsx(y,{children:e.jsxs(p,{children:[e.jsxs(d,{children:[e.jsxs(l,{children:[e.jsx(he,{}),e.jsx("span",{children:"Messages"})]}),e.jsx(se,{children:"12"})]}),e.jsxs(d,{children:[e.jsxs(l,{children:[e.jsx(Ee,{}),e.jsx("span",{children:"Notifications"})]}),e.jsx(se,{children:"3"}),e.jsx(fe,{"aria-label":"Mark all read",children:e.jsx(Re,{})})]})]})})]})})}),e.jsx(I,{children:e.jsx("div",{className:"p-4 font-medium",children:"Badges & Actions Example"})})]})})}const K={render:Qe,parameters:{zephyr:{testCaseId:"SW-T1299"}},play:async({canvasElement:a,step:t})=>{const s=v(a);await t("Badge counts render",async()=>{n(s.getByText("12")).toBeInTheDocument(),n(s.getByText("3")).toBeInTheDocument()}),await t("Badge uses correct data slot",async()=>{const r=a.querySelectorAll('[data-slot="sidebar-menu-badge"]');n(r.length).toBe(2)}),await t("Menu action renders",async()=>{const r=s.getByRole("button",{name:"Mark all read"});n(r).toBeInTheDocument()}),await t("Menu action has correct data slot",async()=>{const r=a.querySelectorAll('[data-slot="sidebar-menu-action"]');n(r.length).toBe(1)})}};function Xe(a){return e.jsx("div",{className:"min-h-[520px] bg-muted/30",children:e.jsxs(w,{defaultOpen:!0,children:[e.jsx(S,{...a,children:e.jsx(_,{children:e.jsxs(x,{children:[e.jsx(f,{children:"Loading…"}),e.jsx(y,{children:e.jsxs(p,{children:[e.jsx(d,{children:e.jsx(Q,{showIcon:!0})}),e.jsx(d,{children:e.jsx(Q,{showIcon:!0})}),e.jsx(d,{children:e.jsx(Q,{})})]})})]})})}),e.jsx(I,{children:e.jsx("div",{className:"p-4 font-medium",children:"Skeleton Example"})})]})})}const U={render:Xe,parameters:{zephyr:{testCaseId:"SW-T1300"}},play:async({canvasElement:a,step:t})=>{await t("Skeleton items render",async()=>{const s=a.querySelectorAll('[data-slot="sidebar-menu-skeleton"]');n(s.length).toBe(3)}),await t("Icon skeletons render for showIcon items",async()=>{const s=a.querySelectorAll('[data-sidebar="menu-skeleton-icon"]');n(s.length).toBe(2)}),await t("Text skeletons render for all items",async()=>{const s=a.querySelectorAll('[data-sidebar="menu-skeleton-text"]');n(s.length).toBe(3)})}};function Je(a){return e.jsx("div",{className:"min-h-[520px] bg-muted/30",children:e.jsxs(w,{defaultOpen:!0,children:[e.jsxs(S,{...a,children:[e.jsx(de,{children:e.jsx(ie,{placeholder:"Quick search…"})}),e.jsx(k,{}),e.jsxs(_,{children:[e.jsxs(x,{children:[e.jsx(f,{children:"Main"}),e.jsx(y,{children:e.jsx(p,{children:e.jsx(d,{children:e.jsxs(l,{isActive:!0,children:[e.jsx(re,{}),e.jsx("span",{children:"Dashboard"})]})})})})]}),e.jsx(k,{}),e.jsxs(x,{children:[e.jsx(f,{children:"Resources"}),e.jsx(ce,{"aria-label":"Add resource",children:e.jsx(be,{})}),e.jsx(y,{children:e.jsx(p,{children:e.jsx(d,{children:e.jsxs(l,{children:[e.jsx(ne,{}),e.jsx("span",{children:"Files"})]})})})})]})]}),e.jsx(k,{}),e.jsx(le,{children:e.jsx(p,{children:e.jsx(d,{children:e.jsxs(l,{children:[e.jsx(oe,{}),e.jsx("span",{children:"Preferences"})]})})})})]}),e.jsx(I,{children:e.jsxs("div",{className:"flex items-center gap-2 border-b p-4",children:[e.jsx(ae,{}),e.jsx("span",{className:"font-medium",children:"Multi-Group Layout"})]})})]})})}const $={render:Je,parameters:{zephyr:{testCaseId:"SW-T1301"}},play:async({canvasElement:a,step:t})=>{const s=v(a);await t("Header with search input renders",async()=>{n(s.getByPlaceholderText("Quick search…")).toBeInTheDocument();const r=a.querySelector('[data-sidebar="header"]');n(r).toBeTruthy()}),await t("Multiple groups render",async()=>{const r=a.querySelectorAll('[data-sidebar="group"]');n(r.length).toBe(2),n(s.getByText("Main")).toBeInTheDocument(),n(s.getByText("Resources")).toBeInTheDocument()}),await t("Group action button renders",async()=>{const r=s.getByRole("button",{name:"Add resource"});n(r).toBeInTheDocument()}),await t("Separators render between sections",async()=>{const r=a.querySelectorAll('[data-slot="sidebar-separator"]');n(r.length).toBeGreaterThanOrEqual(2)}),await t("Footer renders",async()=>{const r=a.querySelector('[data-sidebar="footer"]');n(r).toBeTruthy(),n(s.getByText("Preferences")).toBeInTheDocument()}),await t("Active item has data-active attribute",async()=>{const r=a.querySelector('[data-slot="sidebar-menu-button"][data-active="true"]');n(r).toBeTruthy()})}},Y={render:a=>m(a,{menuButtonSize:"sm"}),parameters:{zephyr:{testCaseId:"SW-T1302"}},play:async({canvasElement:a,step:t})=>{const s=v(a);await t("Menu buttons render at small size",async()=>{const r=a.querySelectorAll('[data-slot="sidebar-menu-button"]');n(r.length).toBeGreaterThan(0);for(const o of r)n(o.getAttribute("data-size")).toBe("sm")}),await t("Sidebar content is intact",async()=>{n(s.getByText("Overview")).toBeInTheDocument(),n(s.getByText("Projects")).toBeInTheDocument(),n(s.getByText("Team")).toBeInTheDocument()})}};q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  render: renderSidebar,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1288"
    }
  },
  play: playSidebar
}`,...q.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "floating"
  },
  render: renderSidebar,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1289"
    }
  },
  play: playSidebar
}`,...E.parameters?.docs?.source}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "inset"
  },
  render: renderSidebar,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1290"
    }
  },
  play: playSidebar
}`,...R.parameters?.docs?.source}}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    side: "right"
  },
  render: renderSidebar,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1291"
    }
  },
  play: playSidebar
}`,...W.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    collapsible: "icon"
  },
  render: args => renderSidebar(args, {
    open: false
  }),
  parameters: {
    zephyr: {
      testCaseId: "SW-T1292"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Layout renders", async () => {
      expect(canvas.getByText("Dashboard")).toBeInTheDocument();
      expect(canvas.getByRole("button", {
        name: /toggle sidebar/i
      })).toBeInTheDocument();
    });
    await step("Collapsed sidebar shell", async () => {
      expect(canvasElement.querySelector('[data-sidebar="sidebar"]')).toBeTruthy();
      expect(canvas.getByPlaceholderText("Search navigation")).toBeInTheDocument();
    });
  }
}`,...O.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    collapsible: "none"
  },
  render: renderSidebar,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1293"
    }
  },
  play: playSidebar
}`,...P.parameters?.docs?.source}}};V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: args => renderSidebar(args, {
    menuButtonVariant: "outline"
  }),
  parameters: {
    zephyr: {
      testCaseId: "SW-T1294"
    }
  },
  play: playSidebar
}`,...V.parameters?.docs?.source}}};G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  render: args => renderSidebar(args, {
    menuButtonSize: "lg"
  }),
  parameters: {
    zephyr: {
      testCaseId: "SW-T1295"
    }
  },
  play: playSidebar
}`,...G.parameters?.docs?.source}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    collapsible: "icon"
  },
  render: args => renderSidebar(args),
  parameters: {
    zephyr: {
      testCaseId: "SW-T1296"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Sidebar starts expanded", async () => {
      const sidebarSlot = canvasElement.querySelector('[data-slot="sidebar"]');
      expect(sidebarSlot).toBeTruthy();
      expect(sidebarSlot?.getAttribute("data-state")).toBe("expanded");
    });
    await step("Click trigger collapses sidebar", async () => {
      const trigger = canvas.getByRole("button", {
        name: /toggle sidebar/i
      });
      await userEvent.click(trigger);
      const sidebarSlot = canvasElement.querySelector('[data-slot="sidebar"]');
      expect(sidebarSlot?.getAttribute("data-state")).toBe("collapsed");
    });
    await step("Click trigger again expands sidebar", async () => {
      const trigger = canvas.getByRole("button", {
        name: /toggle sidebar/i
      });
      await userEvent.click(trigger);
      const sidebarSlot = canvasElement.querySelector('[data-slot="sidebar"]');
      expect(sidebarSlot?.getAttribute("data-state")).toBe("expanded");
    });
  }
}`,...L.parameters?.docs?.source}}};H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: renderRailSidebar,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1297"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Rail element renders", async () => {
      const rail = canvasElement.querySelector('[data-sidebar="rail"]');
      expect(rail).toBeTruthy();
      expect(rail?.getAttribute("aria-label")).toBe("Toggle Sidebar");
    });
    await step("Sidebar content renders with rail", async () => {
      expect(canvas.getByText("Home")).toBeInTheDocument();
      expect(canvas.getByText("Inbox")).toBeInTheDocument();
    });
    await step("Rail click collapses sidebar", async () => {
      const rail = canvasElement.querySelector('[data-sidebar="rail"]') as HTMLElement;
      await userEvent.click(rail);
      const sidebarSlot = canvasElement.querySelector('[data-slot="sidebar"]');
      expect(sidebarSlot?.getAttribute("data-state")).toBe("collapsed");
    });
    await step("Rail click expands sidebar again", async () => {
      const rail = canvasElement.querySelector('[data-sidebar="rail"]') as HTMLElement;
      await userEvent.click(rail);
      const sidebarSlot = canvasElement.querySelector('[data-slot="sidebar"]');
      expect(sidebarSlot?.getAttribute("data-state")).toBe("expanded");
    });
  }
}`,...H.parameters?.docs?.source}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: renderSubMenuSidebar,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1298"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Parent menu items render", async () => {
      expect(canvas.getByText("Projects")).toBeInTheDocument();
      expect(canvas.getByText("Settings")).toBeInTheDocument();
    });
    await step("Sub-menu items render", async () => {
      expect(canvas.getByText("Alpha")).toBeInTheDocument();
      expect(canvas.getByText("Beta")).toBeInTheDocument();
      expect(canvas.getByText("Gamma (small)")).toBeInTheDocument();
    });
    await step("Sub-menu structure uses correct slots", async () => {
      const subMenu = canvasElement.querySelector('[data-slot="sidebar-menu-sub"]');
      expect(subMenu).toBeTruthy();
      const subItems = canvasElement.querySelectorAll('[data-slot="sidebar-menu-sub-item"]');
      expect(subItems.length).toBe(3);
    });
    await step("Active sub-item has data-active attribute", async () => {
      const activeSubButton = canvasElement.querySelector('[data-slot="sidebar-menu-sub-button"][data-active="true"]');
      expect(activeSubButton).toBeTruthy();
    });
  }
}`,...F.parameters?.docs?.source}}};K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  render: renderBadgesAndActionsSidebar,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1299"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Badge counts render", async () => {
      expect(canvas.getByText("12")).toBeInTheDocument();
      expect(canvas.getByText("3")).toBeInTheDocument();
    });
    await step("Badge uses correct data slot", async () => {
      const badges = canvasElement.querySelectorAll('[data-slot="sidebar-menu-badge"]');
      expect(badges.length).toBe(2);
    });
    await step("Menu action renders", async () => {
      const action = canvas.getByRole("button", {
        name: "Mark all read"
      });
      expect(action).toBeInTheDocument();
    });
    await step("Menu action has correct data slot", async () => {
      const actions = canvasElement.querySelectorAll('[data-slot="sidebar-menu-action"]');
      expect(actions.length).toBe(1);
    });
  }
}`,...K.parameters?.docs?.source}}};U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  render: renderSkeletonSidebar,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1300"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    await step("Skeleton items render", async () => {
      const skeletons = canvasElement.querySelectorAll('[data-slot="sidebar-menu-skeleton"]');
      expect(skeletons.length).toBe(3);
    });
    await step("Icon skeletons render for showIcon items", async () => {
      const iconSkeletons = canvasElement.querySelectorAll('[data-sidebar="menu-skeleton-icon"]');
      expect(iconSkeletons.length).toBe(2);
    });
    await step("Text skeletons render for all items", async () => {
      const textSkeletons = canvasElement.querySelectorAll('[data-sidebar="menu-skeleton-text"]');
      expect(textSkeletons.length).toBe(3);
    });
  }
}`,...U.parameters?.docs?.source}}};$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  render: renderMultiGroupSidebar,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1301"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Header with search input renders", async () => {
      expect(canvas.getByPlaceholderText("Quick search…")).toBeInTheDocument();
      const header = canvasElement.querySelector('[data-sidebar="header"]');
      expect(header).toBeTruthy();
    });
    await step("Multiple groups render", async () => {
      const groups = canvasElement.querySelectorAll('[data-sidebar="group"]');
      expect(groups.length).toBe(2);
      expect(canvas.getByText("Main")).toBeInTheDocument();
      expect(canvas.getByText("Resources")).toBeInTheDocument();
    });
    await step("Group action button renders", async () => {
      const addButton = canvas.getByRole("button", {
        name: "Add resource"
      });
      expect(addButton).toBeInTheDocument();
    });
    await step("Separators render between sections", async () => {
      const separators = canvasElement.querySelectorAll('[data-slot="sidebar-separator"]');
      expect(separators.length).toBeGreaterThanOrEqual(2);
    });
    await step("Footer renders", async () => {
      const footer = canvasElement.querySelector('[data-sidebar="footer"]');
      expect(footer).toBeTruthy();
      expect(canvas.getByText("Preferences")).toBeInTheDocument();
    });
    await step("Active item has data-active attribute", async () => {
      const activeButton = canvasElement.querySelector('[data-slot="sidebar-menu-button"][data-active="true"]');
      expect(activeButton).toBeTruthy();
    });
  }
}`,...$.parameters?.docs?.source}}};Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  render: args => renderSidebar(args, {
    menuButtonSize: "sm"
  }),
  parameters: {
    zephyr: {
      testCaseId: "SW-T1302"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Menu buttons render at small size", async () => {
      const buttons = canvasElement.querySelectorAll('[data-slot="sidebar-menu-button"]');
      expect(buttons.length).toBeGreaterThan(0);
      for (const btn of buttons) {
        expect(btn.getAttribute("data-size")).toBe("sm");
      }
    });
    await step("Sidebar content is intact", async () => {
      expect(canvas.getByText("Overview")).toBeInTheDocument();
      expect(canvas.getByText("Projects")).toBeInTheDocument();
      expect(canvas.getByText("Team")).toBeInTheDocument();
    });
  }
}`,...Y.parameters?.docs?.source}}};const ga=["Default","Floating","Inset","RightSide","CollapsedIcon","NonCollapsible","OutlineMenuButtons","LargeMenuButtons","ToggleSidebar","WithRail","WithSubMenu","WithBadgesAndActions","SkeletonLoading","MultipleGroups","SmallMenuButtons"];export{O as CollapsedIcon,q as Default,E as Floating,R as Inset,G as LargeMenuButtons,$ as MultipleGroups,P as NonCollapsible,V as OutlineMenuButtons,W as RightSide,U as SkeletonLoading,Y as SmallMenuButtons,L as ToggleSidebar,K as WithBadgesAndActions,H as WithRail,F as WithSubMenu,ga as __namedExportsOrder,ha as default};
