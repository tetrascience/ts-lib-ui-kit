import{r as i,u as V,j as o,P as E,g as _,d as w,f as S,e as W,O as $,c as j}from"./iframe-14YYbrss.js";import{R as Y,c as B,I as X}from"./index-_AbBFJ6v.js";import{u as J}from"./index-SK9A3v17.js";import{u as Q}from"./index-CoM-oBxn.js";import"./preload-helper-BbFkF2Um.js";import"./index-CzkjiSpZ.js";var k="Radio",[Z,N]=S(k),[ee,re]=Z(k),T=i.forwardRef((a,r)=>{const{__scopeRadio:e,name:d,checked:t=!1,required:n,disabled:s,value:p="on",onCheck:m,form:v,...f}=a,[u,R]=i.useState(null),c=_(r,y=>R(y)),l=i.useRef(!1),g=u?v||!!u.closest("form"):!0;return o.jsxs(ee,{scope:e,checked:t,disabled:s,children:[o.jsx(E.button,{type:"button",role:"radio","aria-checked":t,"data-state":A(t),"data-disabled":s?"":void 0,disabled:s,value:p,...f,ref:c,onClick:w(a.onClick,y=>{t||m?.(),g&&(l.current=y.isPropagationStopped(),l.current||y.stopPropagation())})}),g&&o.jsx(P,{control:u,bubbles:!l.current,name:d,value:p,checked:t,required:n,disabled:s,form:v,style:{transform:"translateX(-100%)"}})]})});T.displayName=k;var G="RadioIndicator",D=i.forwardRef((a,r)=>{const{__scopeRadio:e,forceMount:d,...t}=a,n=re(G,e);return o.jsx(W,{present:d||n.checked,children:o.jsx(E.span,{"data-state":A(n.checked),"data-disabled":n.disabled?"":void 0,...t,ref:r})})});D.displayName=G;var ae="RadioBubbleInput",P=i.forwardRef(({__scopeRadio:a,control:r,checked:e,bubbles:d=!0,...t},n)=>{const s=i.useRef(null),p=_(s,n),m=Q(e),v=$(r);return i.useEffect(()=>{const f=s.current;if(!f)return;const u=window.HTMLInputElement.prototype,c=Object.getOwnPropertyDescriptor(u,"checked").set;if(m!==e&&c){const l=new Event("click",{bubbles:d});c.call(f,e),f.dispatchEvent(l)}},[m,e,d]),o.jsx(E.input,{type:"radio","aria-hidden":!0,defaultChecked:e,...t,tabIndex:-1,ref:p,style:{...t.style,...v,position:"absolute",pointerEvents:"none",opacity:0,margin:0}})});P.displayName=ae;function A(a){return a?"checked":"unchecked"}var oe=["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"],I="RadioGroup",[te]=S(I,[B,N]),O=B(),L=N(),[ne,se]=te(I),M=i.forwardRef((a,r)=>{const{__scopeRadioGroup:e,name:d,defaultValue:t,value:n,required:s=!1,disabled:p=!1,orientation:m,dir:v,loop:f=!0,onValueChange:u,...R}=a,c=O(e),l=J(v),[g,y]=V({prop:n,defaultProp:t??null,onChange:u,caller:I});return o.jsx(ne,{scope:e,name:d,required:s,disabled:p,value:g,onValueChange:y,children:o.jsx(Y,{asChild:!0,...c,orientation:m,dir:l,loop:f,children:o.jsx(E.div,{role:"radiogroup","aria-required":s,"aria-orientation":m,"data-disabled":p?"":void 0,dir:l,...R,ref:r})})})});M.displayName=I;var z="RadioGroupItem",F=i.forwardRef((a,r)=>{const{__scopeRadioGroup:e,disabled:d,...t}=a,n=se(z,e),s=n.disabled||d,p=O(e),m=L(e),v=i.useRef(null),f=_(r,v),u=n.value===t.value,R=i.useRef(!1);return i.useEffect(()=>{const c=g=>{oe.includes(g.key)&&(R.current=!0)},l=()=>R.current=!1;return document.addEventListener("keydown",c),document.addEventListener("keyup",l),()=>{document.removeEventListener("keydown",c),document.removeEventListener("keyup",l)}},[]),o.jsx(X,{asChild:!0,...p,focusable:!s,active:u,children:o.jsx(T,{disabled:s,required:n.required,checked:u,...m,...t,name:n.name,ref:f,onCheck:()=>n.onValueChange(t.value),onKeyDown:w(c=>{c.key==="Enter"&&c.preventDefault()}),onFocus:w(t.onFocus,()=>{R.current&&v.current?.click()})})})});F.displayName=z;var ie="RadioGroupIndicator",q=i.forwardRef((a,r)=>{const{__scopeRadioGroup:e,...d}=a,t=L(e);return o.jsx(D,{...t,...d,ref:r})});q.displayName=ie;var de=M,ce=F,le=q;function C({className:a,...r}){return o.jsx(de,{"data-slot":"radio-group",className:j("grid w-full gap-2",a),...r})}function H({className:a,...r}){return o.jsx(ce,{"data-slot":"radio-group-item",className:j("group/radio-group-item peer relative flex aspect-square size-4 shrink-0 rounded-full border border-input outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary",a),...r,children:o.jsx(le,{"data-slot":"radio-group-indicator",className:"flex size-4 items-center justify-center",children:o.jsx("span",{className:"absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground"})})})}C.__docgenInfo={description:"",methods:[],displayName:"RadioGroup"};H.__docgenInfo={description:"",methods:[],displayName:"RadioGroupItem"};const{expect:h,within:K}=__STORYBOOK_MODULE_TEST__,ue=[{value:"starter",label:"Starter",description:"For smaller workspaces with basic exports and notifications."},{value:"team",label:"Team",description:"Includes shared dashboards, collaboration, and scheduled reports."},{value:"enterprise",label:"Enterprise",description:"Advanced controls for governance, compliance, and large data volumes."}],ye={title:"Components/Radio Group",component:C,parameters:{layout:"centered"},tags:["autodocs"]};function U(a){return o.jsx("div",{className:"w-[360px] rounded-xl border bg-background p-4",children:o.jsx(C,{className:"gap-3",defaultValue:"team",children:ue.map(r=>{const e=`radio-group-${r.value}`;return o.jsxs("div",{className:"flex items-start gap-3 rounded-lg border p-3",children:[o.jsx(H,{disabled:r.value===a,id:e,value:r.value}),o.jsxs("label",{className:"grid gap-1",htmlFor:e,children:[o.jsx("span",{className:"font-medium",children:r.label}),o.jsx("span",{className:"text-sm text-muted-foreground",children:r.description})]})]},r.value)})})})}const b={render:()=>U(),parameters:{zephyr:{testCaseId:"SW-T1274"}},play:async({canvasElement:a,step:r})=>{const e=K(a);await r("Radio group renders",async()=>{h(e.getAllByRole("radio")).toHaveLength(3)}),await r("Plan labels render",async()=>{h(e.getByText("Starter")).toBeInTheDocument(),h(e.getByText("Team")).toBeInTheDocument(),h(e.getByText("Enterprise")).toBeInTheDocument()})}},x={render:()=>U("enterprise"),parameters:{zephyr:{testCaseId:"SW-T1275"}},play:async({canvasElement:a,step:r})=>{const e=K(a);await r("Radio group renders",async()=>{h(e.getAllByRole("radio")).toHaveLength(3)}),await r("Enterprise option is disabled",async()=>{h(e.getByRole("radio",{name:/Enterprise/i})).toBeDisabled()})}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => renderRadioGroup(),
  parameters: {
    zephyr: {
      testCaseId: "SW-T1274"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Radio group renders", async () => {
      expect(canvas.getAllByRole("radio")).toHaveLength(3);
    });
    await step("Plan labels render", async () => {
      expect(canvas.getByText("Starter")).toBeInTheDocument();
      expect(canvas.getByText("Team")).toBeInTheDocument();
      expect(canvas.getByText("Enterprise")).toBeInTheDocument();
    });
  }
}`,...b.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => renderRadioGroup("enterprise"),
  parameters: {
    zephyr: {
      testCaseId: "SW-T1275"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Radio group renders", async () => {
      expect(canvas.getAllByRole("radio")).toHaveLength(3);
    });
    await step("Enterprise option is disabled", async () => {
      expect(canvas.getByRole("radio", {
        name: /Enterprise/i
      })).toBeDisabled();
    });
  }
}`,...x.parameters?.docs?.source}}};const he=["Default","DisabledOption"];export{b as Default,x as DisabledOption,he as __namedExportsOrder,ye as default};
