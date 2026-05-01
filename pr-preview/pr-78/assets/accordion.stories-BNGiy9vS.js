import{R as d,j as n,u as H,b as ce,P as K,g as ae,d as se,f as ie,c as T}from"./iframe-14YYbrss.js";import{C as de}from"./chevron-down-DJZ_3i8R.js";import{C as le}from"./chevron-up-CzLCBlyb.js";import{c as pe}from"./index-CzkjiSpZ.js";import{R as ue,T as me,b as ge,c as L}from"./index-DkZdde6L.js";import{u as he}from"./index-SK9A3v17.js";import"./preload-helper-BbFkF2Um.js";var l="Accordion",xe=["Home","End","ArrowDown","ArrowUp","ArrowLeft","ArrowRight"],[O,fe,ve]=pe(l),[j]=ie(l,[ve,L]),M=L(),U=d.forwardRef((o,t)=>{const{type:e,...c}=o,a=c,r=c;return n.jsx(O.Provider,{scope:o.__scopeAccordion,children:e==="multiple"?n.jsx(Ae,{...r,ref:t}):n.jsx(Ce,{...a,ref:t})})});U.displayName=l;var[W,be]=j(l),[$,ye]=j(l,{collapsible:!1}),Ce=d.forwardRef((o,t)=>{const{value:e,defaultValue:c,onValueChange:a=()=>{},collapsible:r=!1,...i}=o,[s,p]=H({prop:e,defaultProp:c??"",onChange:a,caller:l});return n.jsx(W,{scope:o.__scopeAccordion,value:d.useMemo(()=>s?[s]:[],[s]),onItemOpen:p,onItemClose:d.useCallback(()=>r&&p(""),[r,p]),children:n.jsx($,{scope:o.__scopeAccordion,collapsible:r,children:n.jsx(G,{...i,ref:t})})})}),Ae=d.forwardRef((o,t)=>{const{value:e,defaultValue:c,onValueChange:a=()=>{},...r}=o,[i,s]=H({prop:e,defaultProp:c??[],onChange:a,caller:l}),p=d.useCallback(x=>s((m=[])=>[...m,x]),[s]),h=d.useCallback(x=>s((m=[])=>m.filter(R=>R!==x)),[s]);return n.jsx(W,{scope:o.__scopeAccordion,value:i,onItemOpen:p,onItemClose:h,children:n.jsx($,{scope:o.__scopeAccordion,collapsible:!0,children:n.jsx(G,{...r,ref:t})})})}),[Ie,w]=j(l),G=d.forwardRef((o,t)=>{const{__scopeAccordion:e,disabled:c,dir:a,orientation:r="vertical",...i}=o,s=d.useRef(null),p=ae(s,t),h=fe(e),m=he(a)==="ltr",R=se(o.onKeyDown,f=>{if(!xe.includes(f.key))return;const te=f.target,D=h().filter(k=>!k.ref.current?.disabled),v=D.findIndex(k=>k.ref.current===te),z=D.length;if(v===-1)return;f.preventDefault();let u=v;const B=0,E=z-1,S=()=>{u=v+1,u>E&&(u=B)},N=()=>{u=v-1,u<B&&(u=E)};switch(f.key){case"Home":u=B;break;case"End":u=E;break;case"ArrowRight":r==="horizontal"&&(m?S():N());break;case"ArrowDown":r==="vertical"&&S();break;case"ArrowLeft":r==="horizontal"&&(m?N():S());break;case"ArrowUp":r==="vertical"&&N();break}const re=u%z;D[re].ref.current?.focus()});return n.jsx(Ie,{scope:e,disabled:c,direction:a,orientation:r,children:n.jsx(O.Slot,{scope:e,children:n.jsx(K.div,{...i,"data-orientation":r,ref:p,onKeyDown:c?void 0:R})})})}),_="AccordionItem",[_e,V]=j(_),q=d.forwardRef((o,t)=>{const{__scopeAccordion:e,value:c,...a}=o,r=w(_,e),i=be(_,e),s=M(e),p=ce(),h=c&&i.value.includes(c)||!1,x=r.disabled||o.disabled;return n.jsx(_e,{scope:e,open:h,disabled:x,triggerId:p,children:n.jsx(ue,{"data-orientation":r.orientation,"data-state":ee(h),...s,...a,ref:t,disabled:x,open:h,onOpenChange:m=>{m?i.onItemOpen(c):i.onItemClose(c)}})})});q.displayName=_;var F="AccordionHeader",J=d.forwardRef((o,t)=>{const{__scopeAccordion:e,...c}=o,a=w(l,e),r=V(F,e);return n.jsx(K.h3,{"data-orientation":a.orientation,"data-state":ee(r.open),"data-disabled":r.disabled?"":void 0,...c,ref:t})});J.displayName=F;var P="AccordionTrigger",Q=d.forwardRef((o,t)=>{const{__scopeAccordion:e,...c}=o,a=w(l,e),r=V(P,e),i=ye(P,e),s=M(e);return n.jsx(O.ItemSlot,{scope:e,children:n.jsx(me,{"aria-disabled":r.open&&!i.collapsible||void 0,"data-orientation":a.orientation,id:r.triggerId,...s,...c,ref:t})})});Q.displayName=P;var X="AccordionContent",Z=d.forwardRef((o,t)=>{const{__scopeAccordion:e,...c}=o,a=w(l,e),r=V(X,e),i=M(e);return n.jsx(ge,{role:"region","aria-labelledby":r.triggerId,"data-orientation":a.orientation,...i,...c,ref:t,style:{"--radix-accordion-content-height":"var(--radix-collapsible-content-height)","--radix-accordion-content-width":"var(--radix-collapsible-content-width)",...o.style}})});Z.displayName=X;function ee(o){return o?"open":"closed"}var Te=U,je=q,we=J,Re=Q,De=Z;function Y({className:o,...t}){return n.jsx(Te,{"data-slot":"accordion",className:T("flex w-full flex-col",o),...t})}function C({className:o,...t}){return n.jsx(je,{"data-slot":"accordion-item",className:T("not-last:border-b",o),...t})}function A({className:o,children:t,...e}){return n.jsx(we,{className:"flex",children:n.jsxs(Re,{"data-slot":"accordion-trigger",className:T("group/accordion-trigger relative flex flex-1 items-start justify-between rounded-lg border border-transparent py-2.5 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:after:border-ring disabled:pointer-events-none disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-muted-foreground",o),...e,children:[t,n.jsx(de,{"data-slot":"accordion-trigger-icon",className:"pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"}),n.jsx(le,{"data-slot":"accordion-trigger-icon",className:"pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"})]})})}function I({className:o,children:t,...e}){return n.jsx(De,{"data-slot":"accordion-content",className:"overflow-hidden text-sm data-open:animate-accordion-down data-closed:animate-accordion-up",...e,children:n.jsx("div",{className:T("h-(--radix-accordion-content-height) pt-0 pb-2.5 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",o),children:t})})}Y.__docgenInfo={description:"",methods:[],displayName:"Accordion"};C.__docgenInfo={description:"",methods:[],displayName:"AccordionItem"};A.__docgenInfo={description:"",methods:[],displayName:"AccordionTrigger"};I.__docgenInfo={description:"",methods:[],displayName:"AccordionContent"};const{expect:g,within:oe}=__STORYBOOK_MODULE_TEST__,Me={title:"Components/Accordion",component:Y,parameters:{layout:"centered"},tags:["autodocs"]};function ne(o){return n.jsxs(Y,{className:"w-[420px]",...o,children:[n.jsxs(C,{value:"item-1",children:[n.jsx(A,{children:"Can I use these components in Storybook?"}),n.jsx(I,{children:"Yes. Each component can be composed into focused stories for docs and testing."})]}),n.jsxs(C,{value:"item-2",children:[n.jsx(A,{children:"Do they support multiple open sections?"}),n.jsx(I,{children:"The accordion root supports both single and multiple expansion modes."})]}),n.jsxs(C,{value:"item-3",children:[n.jsx(A,{children:"Can content include links?"}),n.jsxs(I,{children:["Absolutely. You can include formatted content, actions, and ",n.jsx("a",{href:"./",children:"inline links"}),"."]})]})]})}const b={render:()=>n.jsx(ne,{type:"single",collapsible:!0,defaultValue:"item-1"}),parameters:{zephyr:{testCaseId:"SW-T1180"}},play:async({canvasElement:o,step:t})=>{const e=oe(o);await t("Accordion triggers and section headings render",async()=>{g(e.getByRole("button",{name:"Can I use these components in Storybook?"})).toBeInTheDocument(),g(e.getByRole("button",{name:"Do they support multiple open sections?"})).toBeInTheDocument(),g(e.getByRole("button",{name:"Can content include links?"})).toBeInTheDocument()}),await t("Expanded section content is visible",async()=>{g(e.getByText("Yes. Each component can be composed into focused stories for docs and testing.")).toBeInTheDocument()})}},y={render:()=>n.jsx(ne,{type:"multiple",defaultValue:["item-1","item-2"]}),parameters:{zephyr:{testCaseId:"SW-T1181"}},play:async({canvasElement:o,step:t})=>{const e=oe(o);await t("Accordion triggers render",async()=>{g(e.getByRole("button",{name:"Can I use these components in Storybook?"})).toBeInTheDocument(),g(e.getByRole("button",{name:"Do they support multiple open sections?"})).toBeInTheDocument()}),await t("Multiple expanded sections show content",async()=>{g(e.getByText("Yes. Each component can be composed into focused stories for docs and testing.")).toBeInTheDocument(),g(e.getByText("The accordion root supports both single and multiple expansion modes.")).toBeInTheDocument()})}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <AccordionExample type="single" collapsible defaultValue="item-1" />,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1180"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Accordion triggers and section headings render", async () => {
      expect(canvas.getByRole("button", {
        name: "Can I use these components in Storybook?"
      })).toBeInTheDocument();
      expect(canvas.getByRole("button", {
        name: "Do they support multiple open sections?"
      })).toBeInTheDocument();
      expect(canvas.getByRole("button", {
        name: "Can content include links?"
      })).toBeInTheDocument();
    });
    await step("Expanded section content is visible", async () => {
      expect(canvas.getByText("Yes. Each component can be composed into focused stories for docs and testing.")).toBeInTheDocument();
    });
  }
}`,...b.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <AccordionExample type="multiple" defaultValue={["item-1", "item-2"]} />,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1181"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Accordion triggers render", async () => {
      expect(canvas.getByRole("button", {
        name: "Can I use these components in Storybook?"
      })).toBeInTheDocument();
      expect(canvas.getByRole("button", {
        name: "Do they support multiple open sections?"
      })).toBeInTheDocument();
    });
    await step("Multiple expanded sections show content", async () => {
      expect(canvas.getByText("Yes. Each component can be composed into focused stories for docs and testing.")).toBeInTheDocument();
      expect(canvas.getByText("The accordion root supports both single and multiple expansion modes.")).toBeInTheDocument();
    });
  }
}`,...y.parameters?.docs?.source}}};const Ve=["Single","Multiple"];export{y as Multiple,b as Single,Ve as __namedExportsOrder,Me as default};
