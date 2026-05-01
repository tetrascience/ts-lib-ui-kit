import{r as i,j as r,P as T,f as N,n as O,h as z,c as g}from"./iframe-14YYbrss.js";import{s as F}from"./index-CvEJXU9u.js";import{C as R}from"./check-B_BC0xs5.js";import"./preload-helper-BbFkF2Um.js";function G(){return F.useSyncExternalStore(M,()=>!0,()=>!1)}function M(){return()=>{}}var b="Avatar",[P]=N(b),[U,k]=P(b),w=i.forwardRef((a,e)=>{const{__scopeAvatar:t,...s}=a,[o,n]=i.useState("idle");return r.jsx(U,{scope:t,imageLoadingStatus:o,onImageLoadingStatusChange:n,children:r.jsx(T.span,{...s,ref:e})})});w.displayName=b;var _="AvatarImage",H=i.forwardRef((a,e)=>{const{__scopeAvatar:t,src:s,onLoadingStatusChange:o=()=>{},...n}=a,p=k(_,t),c=K(s,n),l=O(m=>{o(m),p.onImageLoadingStatusChange(m)});return z(()=>{c!=="idle"&&l(c)},[c,l]),c==="loaded"?r.jsx(T.img,{...n,ref:e,src:s}):null});H.displayName=_;var j="AvatarFallback",E=i.forwardRef((a,e)=>{const{__scopeAvatar:t,delayMs:s,...o}=a,n=k(j,t),[p,c]=i.useState(s===void 0);return i.useEffect(()=>{if(s!==void 0){const l=window.setTimeout(()=>c(!0),s);return()=>window.clearTimeout(l)}},[s]),p&&n.imageLoadingStatus!=="loaded"?r.jsx(T.span,{...o,ref:e}):null});E.displayName=j;function B(a,e){return a?e?(a.src!==e&&(a.src=e),a.complete&&a.naturalWidth>0?"loaded":"loading"):"error":"idle"}function K(a,{referrerPolicy:e,crossOrigin:t}){const s=G(),o=i.useRef(null),n=s?(o.current||(o.current=new window.Image),o.current):null,[p,c]=i.useState(()=>B(n,a));return z(()=>{c(B(n,a))},[n,a]),z(()=>{const l=D=>()=>{c(D)};if(!n)return;const m=l("loaded"),S=l("error");return n.addEventListener("load",m),n.addEventListener("error",S),e&&(n.referrerPolicy=e),typeof t=="string"&&(n.crossOrigin=t),()=>{n.removeEventListener("load",m),n.removeEventListener("error",S)}},[n,t,e]),p}var V=w,$=E;function u({className:a,size:e="default",...t}){return r.jsx(V,{"data-slot":"avatar","data-size":e,className:g("group/avatar relative flex size-8 shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:border-border after:mix-blend-darken data-[size=lg]:size-10 data-[size=sm]:size-6 dark:after:mix-blend-lighten",a),...t})}function v({className:a,...e}){return r.jsx($,{"data-slot":"avatar-fallback",className:g("flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground group-data-[size=sm]/avatar:text-xs",a),...e})}function C({className:a,...e}){return r.jsx("span",{"data-slot":"avatar-badge",className:g("absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground bg-blend-color ring-2 ring-background select-none","group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden","group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2","group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",a),...e})}function L({className:a,...e}){return r.jsx("div",{"data-slot":"avatar-group",className:g("group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background",a),...e})}function W({className:a,...e}){return r.jsx("div",{"data-slot":"avatar-group-count",className:g("relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground ring-2 ring-background group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3",a),...e})}u.__docgenInfo={description:"",methods:[],displayName:"Avatar",props:{size:{required:!1,tsType:{name:"union",raw:'"default" | "sm" | "lg"',elements:[{name:"literal",value:'"default"'},{name:"literal",value:'"sm"'},{name:"literal",value:'"lg"'}]},description:"",defaultValue:{value:'"default"',computed:!1}}}};v.__docgenInfo={description:"",methods:[],displayName:"AvatarFallback"};L.__docgenInfo={description:"",methods:[],displayName:"AvatarGroup"};W.__docgenInfo={description:"",methods:[],displayName:"AvatarGroupCount"};C.__docgenInfo={description:"",methods:[],displayName:"AvatarBadge"};const{expect:d,within:A}=__STORYBOOK_MODULE_TEST__,X={title:"Components/Avatar",component:u,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{size:{control:{type:"select"},options:["default","sm","lg"]}},args:{size:"default"}};function I(a){return r.jsxs(u,{...a,children:[r.jsx(v,{children:"OW"}),r.jsx(C,{children:r.jsx(R,{})})]})}const f={render:I,parameters:{zephyr:{testCaseId:"SW-T1188"}},play:async({canvasElement:a,step:e})=>{const t=A(a);await e("Avatar fallback initials render",async()=>{d(t.getByText("OW")).toBeInTheDocument()})}},h={args:{size:"sm"},render:I,parameters:{zephyr:{testCaseId:"SW-T1189"}},play:async({canvasElement:a,step:e})=>{const t=A(a);await e("Small avatar shows fallback initials",async()=>{d(t.getByText("OW")).toBeInTheDocument()})}},x={args:{size:"lg"},render:I,parameters:{zephyr:{testCaseId:"SW-T1190"}},play:async({canvasElement:a,step:e})=>{const t=A(a);await e("Large avatar shows fallback initials",async()=>{d(t.getByText("OW")).toBeInTheDocument()})}},y={render:()=>r.jsxs(L,{children:[r.jsx(u,{size:"sm",children:r.jsx(v,{children:"OW"})}),r.jsx(u,{size:"sm",children:r.jsx(v,{children:"TS"})}),r.jsx(u,{size:"sm",children:r.jsx(v,{children:"UI"})}),r.jsx(W,{children:"+2"})]}),parameters:{zephyr:{testCaseId:"SW-T1191"}},play:async({canvasElement:a,step:e})=>{const t=A(a);await e("Avatar group shows fallbacks and count",async()=>{d(t.getByText("OW")).toBeInTheDocument(),d(t.getByText("TS")).toBeInTheDocument(),d(t.getByText("UI")).toBeInTheDocument(),d(t.getByText("+2")).toBeInTheDocument()})}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: renderAvatar,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1188"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Avatar fallback initials render", async () => {
      expect(canvas.getByText("OW")).toBeInTheDocument();
    });
  }
}`,...f.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    size: "sm"
  },
  render: renderAvatar,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1189"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Small avatar shows fallback initials", async () => {
      expect(canvas.getByText("OW")).toBeInTheDocument();
    });
  }
}`,...h.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    size: "lg"
  },
  render: renderAvatar,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1190"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Large avatar shows fallback initials", async () => {
      expect(canvas.getByText("OW")).toBeInTheDocument();
    });
  }
}`,...x.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <AvatarGroup>
      <Avatar size="sm">
        <AvatarFallback>OW</AvatarFallback>
      </Avatar>
      <Avatar size="sm">
        <AvatarFallback>TS</AvatarFallback>
      </Avatar>
      <Avatar size="sm">
        <AvatarFallback>UI</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+2</AvatarGroupCount>
    </AvatarGroup>,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1191"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Avatar group shows fallbacks and count", async () => {
      expect(canvas.getByText("OW")).toBeInTheDocument();
      expect(canvas.getByText("TS")).toBeInTheDocument();
      expect(canvas.getByText("UI")).toBeInTheDocument();
      expect(canvas.getByText("+2")).toBeInTheDocument();
    });
  }
}`,...y.parameters?.docs?.source}}};const Z=["Default","Small","Large","Group"];export{f as Default,y as Group,x as Large,h as Small,Z as __namedExportsOrder,X as default};
