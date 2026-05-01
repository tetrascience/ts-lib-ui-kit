import{r as i,j as r,e as X,P as R,u as Y,g as z,d as L,O as $,f as J,c as Q}from"./iframe-14YYbrss.js";import{C as V}from"./check-B_BC0xs5.js";import{u as Z}from"./index-CoM-oBxn.js";import{L as ee}from"./label-CEqn5uJp.js";import"./preload-helper-BbFkF2Um.js";var I="Checkbox",[te]=J(I),[ne,S]=te(I);function ae(e){const{__scopeCheckbox:t,checked:n,children:u,defaultChecked:o,disabled:a,form:h,name:m,onCheckedChange:d,required:x,value:k="on",internal_do_not_use_render:l}=e,[p,v]=Y({prop:n,defaultProp:o??!1,onChange:d,caller:I}),[f,C]=i.useState(null),[g,s]=i.useState(null),c=i.useRef(!1),T=f?!!h||!!f.closest("form"):!0,_={checked:p,disabled:a,setChecked:v,control:f,setControl:C,name:m,form:h,value:k,hasConsumerStoppedPropagationRef:c,required:x,defaultChecked:b(o)?!1:o,isFormControl:T,bubbleInput:g,setBubbleInput:s};return r.jsx(ne,{scope:t,..._,children:re(l)?l(_):u})}var O="CheckboxTrigger",M=i.forwardRef(({__scopeCheckbox:e,onKeyDown:t,onClick:n,...u},o)=>{const{control:a,value:h,disabled:m,checked:d,required:x,setControl:k,setChecked:l,hasConsumerStoppedPropagationRef:p,isFormControl:v,bubbleInput:f}=S(O,e),C=z(o,k),g=i.useRef(d);return i.useEffect(()=>{const s=a?.form;if(s){const c=()=>l(g.current);return s.addEventListener("reset",c),()=>s.removeEventListener("reset",c)}},[a,l]),r.jsx(R.button,{type:"button",role:"checkbox","aria-checked":b(d)?"mixed":d,"aria-required":x,"data-state":K(d),"data-disabled":m?"":void 0,disabled:m,value:h,...u,ref:C,onKeyDown:L(t,s=>{s.key==="Enter"&&s.preventDefault()}),onClick:L(n,s=>{l(c=>b(c)?!0:!c),f&&v&&(p.current=s.isPropagationStopped(),p.current||s.stopPropagation())})})});M.displayName=O;var W=i.forwardRef((e,t)=>{const{__scopeCheckbox:n,name:u,checked:o,defaultChecked:a,required:h,disabled:m,value:d,onCheckedChange:x,form:k,...l}=e;return r.jsx(ae,{__scopeCheckbox:n,checked:o,defaultChecked:a,disabled:m,required:h,onCheckedChange:x,name:u,form:k,value:d,internal_do_not_use_render:({isFormControl:p})=>r.jsxs(r.Fragment,{children:[r.jsx(M,{...l,ref:t,__scopeCheckbox:n}),p&&r.jsx(H,{__scopeCheckbox:n})]})})});W.displayName=I;var q="CheckboxIndicator",A=i.forwardRef((e,t)=>{const{__scopeCheckbox:n,forceMount:u,...o}=e,a=S(q,n);return r.jsx(X,{present:u||b(a.checked)||a.checked===!0,children:r.jsx(R.span,{"data-state":K(a.checked),"data-disabled":a.disabled?"":void 0,...o,ref:t,style:{pointerEvents:"none",...e.style}})})});A.displayName=q;var F="CheckboxBubbleInput",H=i.forwardRef(({__scopeCheckbox:e,...t},n)=>{const{control:u,hasConsumerStoppedPropagationRef:o,checked:a,defaultChecked:h,required:m,disabled:d,name:x,value:k,form:l,bubbleInput:p,setBubbleInput:v}=S(F,e),f=z(n,v),C=Z(a),g=$(u);i.useEffect(()=>{const c=p;if(!c)return;const T=window.HTMLInputElement.prototype,N=Object.getOwnPropertyDescriptor(T,"checked").set,U=!o.current;if(C!==a&&N){const G=new Event("click",{bubbles:U});c.indeterminate=b(a),N.call(c,b(a)?!1:a),c.dispatchEvent(G)}},[p,C,a,o]);const s=i.useRef(b(a)?!1:a);return r.jsx(R.input,{type:"checkbox","aria-hidden":!0,defaultChecked:h??s.current,required:m,disabled:d,name:x,value:k,form:l,...t,tabIndex:-1,ref:f,style:{...t.style,...g,position:"absolute",pointerEvents:"none",opacity:0,margin:0,transform:"translateX(-100%)"}})});H.displayName=F;function re(e){return typeof e=="function"}function b(e){return e==="indeterminate"}function K(e){return b(e)?"indeterminate":e?"checked":"unchecked"}function j({className:e,...t}){return r.jsx(W,{"data-slot":"checkbox",className:Q("peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input transition-colors outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary",e),...t,children:r.jsx(A,{"data-slot":"checkbox-indicator",className:"grid place-content-center text-current transition-none [&>svg]:size-3.5",children:r.jsx(V,{})})})}j.__docgenInfo={description:"",methods:[],displayName:"Checkbox"};const{expect:y,within:D}=__STORYBOOK_MODULE_TEST__,le={title:"Components/Checkbox",component:j,parameters:{layout:"centered"},tags:["autodocs"]};function P(e){return r.jsxs("div",{className:"flex items-center gap-3",children:[r.jsx(j,{id:"storybook-checkbox",...e}),r.jsx(ee,{htmlFor:"storybook-checkbox",children:"Email me when the build completes"})]})}const E={render:()=>r.jsx(P,{}),parameters:{zephyr:{testCaseId:"SW-T1216"}},play:async({canvasElement:e,step:t})=>{const n=D(e);await t("Checkbox renders with label",async()=>{y(n.getByRole("checkbox")).toBeInTheDocument(),y(n.getByText("Email me when the build completes")).toBeInTheDocument()})}},w={render:()=>r.jsx(P,{defaultChecked:!0}),parameters:{zephyr:{testCaseId:"SW-T1217"}},play:async({canvasElement:e,step:t})=>{const n=D(e);await t("Checkbox renders checked",async()=>{y(n.getByRole("checkbox")).toBeChecked()}),await t("Label remains associated",async()=>{y(n.getByText("Email me when the build completes")).toBeInTheDocument()})}},B={render:()=>r.jsx(P,{disabled:!0}),parameters:{zephyr:{testCaseId:"SW-T1218"}},play:async({canvasElement:e,step:t})=>{const n=D(e);await t("Checkbox renders disabled",async()=>{y(n.getByRole("checkbox")).toBeDisabled()}),await t("Label still visible",async()=>{y(n.getByText("Email me when the build completes")).toBeInTheDocument()})}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => <CheckboxExample />,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1216"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Checkbox renders with label", async () => {
      expect(canvas.getByRole("checkbox")).toBeInTheDocument();
      expect(canvas.getByText("Email me when the build completes")).toBeInTheDocument();
    });
  }
}`,...E.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => <CheckboxExample defaultChecked />,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1217"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Checkbox renders checked", async () => {
      expect(canvas.getByRole("checkbox")).toBeChecked();
    });
    await step("Label remains associated", async () => {
      expect(canvas.getByText("Email me when the build completes")).toBeInTheDocument();
    });
  }
}`,...w.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => <CheckboxExample disabled />,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1218"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Checkbox renders disabled", async () => {
      expect(canvas.getByRole("checkbox")).toBeDisabled();
    });
    await step("Label still visible", async () => {
      expect(canvas.getByText("Email me when the build completes")).toBeInTheDocument();
    });
  }
}`,...B.parameters?.docs?.source}}};const ue=["Default","Checked","Disabled"];export{w as Checked,E as Default,B as Disabled,ue as __namedExportsOrder,le as default};
