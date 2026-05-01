import{r as l,g as h,j as o,d as G,N as Y,f as K,c as d}from"./iframe-14YYbrss.js";import{B as x}from"./button-BSJeE99h.js";import{W as U,C as J,R as Q,b as X,D as Z,a as v,P as ee,O as te,c as A,T as ae}from"./index-CKyK_5sn.js";import"./preload-helper-BbFkF2Um.js";import"./index-B8eA1Gpy.js";import"./index-Bjo__dt-.js";var T="AlertDialog",[oe]=K(T,[A]),i=A(),_=e=>{const{__scopeAlertDialog:t,...a}=e,n=i(t);return o.jsx(Q,{...n,...a,modal:!0})};_.displayName=T;var ne="AlertDialogTrigger",re=l.forwardRef((e,t)=>{const{__scopeAlertDialog:a,...n}=e,r=i(a);return o.jsx(ae,{...r,...n,ref:t})});re.displayName=ne;var se="AlertDialogPortal",b=e=>{const{__scopeAlertDialog:t,...a}=e,n=i(t);return o.jsx(ee,{...n,...a})};b.displayName=se;var le="AlertDialogOverlay",w=l.forwardRef((e,t)=>{const{__scopeAlertDialog:a,...n}=e,r=i(a);return o.jsx(te,{...r,...n,ref:t})});w.displayName=le;var c="AlertDialogContent",[ie,de]=oe(c),ce=Y("AlertDialogContent"),B=l.forwardRef((e,t)=>{const{__scopeAlertDialog:a,children:n,...r}=e,f=i(a),u=l.useRef(null),H=h(t,u),D=l.useRef(null);return o.jsx(U,{contentName:c,titleName:N,docsSlug:"alert-dialog",children:o.jsx(ie,{scope:a,cancelRef:D,children:o.jsxs(J,{role:"alertdialog",...f,...r,ref:H,onOpenAutoFocus:G(r.onOpenAutoFocus,p=>{p.preventDefault(),D.current?.focus({preventScroll:!0})}),onPointerDownOutside:p=>p.preventDefault(),onInteractOutside:p=>p.preventDefault(),children:[o.jsx(ce,{children:n}),o.jsx(ue,{contentRef:u})]})})})});B.displayName=c;var N="AlertDialogTitle",I=l.forwardRef((e,t)=>{const{__scopeAlertDialog:a,...n}=e,r=i(a);return o.jsx(X,{...r,...n,ref:t})});I.displayName=N;var j="AlertDialogDescription",C=l.forwardRef((e,t)=>{const{__scopeAlertDialog:a,...n}=e,r=i(a);return o.jsx(Z,{...r,...n,ref:t})});C.displayName=j;var pe="AlertDialogAction",R=l.forwardRef((e,t)=>{const{__scopeAlertDialog:a,...n}=e,r=i(a);return o.jsx(v,{...r,...n,ref:t})});R.displayName=pe;var S="AlertDialogCancel",E=l.forwardRef((e,t)=>{const{__scopeAlertDialog:a,...n}=e,{cancelRef:r}=de(S,a),f=i(a),u=h(t,r);return o.jsx(v,{...f,...n,ref:u})});E.displayName=S;var ue=({contentRef:e})=>{const t=`\`${c}\` requires a description for the component to be accessible for screen reader users.

You can add a description to the \`${c}\` by passing a \`${j}\` component as a child, which also benefits sighted users by adding visible context to the dialog.

Alternatively, you can use your own component as a description by assigning it an \`id\` and passing the same value to the \`aria-describedby\` prop in \`${c}\`. If the description is confusing or duplicative for sighted users, you can use the \`@radix-ui/react-visually-hidden\` primitive as a wrapper around your description component.

For more information, see https://radix-ui.com/primitives/docs/components/alert-dialog`;return l.useEffect(()=>{document.getElementById(e.current?.getAttribute("aria-describedby"))||console.warn(t)},[t,e]),null},ge=_,me=b,fe=w,ye=B,De=R,he=E,xe=I,ve=C;function z({...e}){return o.jsx(ge,{"data-slot":"alert-dialog",...e})}function O({...e}){return o.jsx(me,{"data-slot":"alert-dialog-portal",...e})}function P({className:e,...t}){return o.jsx(fe,{"data-slot":"alert-dialog-overlay",className:d("fixed inset-0 z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",e),...t})}function y({className:e,size:t="default",...a}){return o.jsxs(O,{children:[o.jsx(P,{}),o.jsx(ye,{"data-slot":"alert-dialog-content","data-size":t,className:d("group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-background p-4 ring-1 ring-foreground/10 duration-100 outline-none data-[size=default]:max-w-xs data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",e),...a})]})}function k({className:e,...t}){return o.jsx("div",{"data-slot":"alert-dialog-header",className:d("grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-4 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]",e),...t})}function $({className:e,...t}){return o.jsx("div",{"data-slot":"alert-dialog-footer",className:d("-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end",e),...t})}function M({className:e,...t}){return o.jsx(xe,{"data-slot":"alert-dialog-title",className:d("text-base font-medium sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2",e),...t})}function F({className:e,...t}){return o.jsx(ve,{"data-slot":"alert-dialog-description",className:d("text-sm text-balance text-muted-foreground md:text-pretty *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",e),...t})}function W({className:e,variant:t="default",size:a="default",...n}){return o.jsx(x,{variant:t,size:a,asChild:!0,children:o.jsx(De,{"data-slot":"alert-dialog-action",className:d(e),...n})})}function q({className:e,variant:t="outline",size:a="default",...n}){return o.jsx(x,{variant:t,size:a,asChild:!0,children:o.jsx(he,{"data-slot":"alert-dialog-cancel",className:d(e),...n})})}z.__docgenInfo={description:"",methods:[],displayName:"AlertDialog"};W.__docgenInfo={description:"",methods:[],displayName:"AlertDialogAction",props:{variant:{defaultValue:{value:'"default"',computed:!1},required:!1},size:{defaultValue:{value:'"default"',computed:!1},required:!1}}};q.__docgenInfo={description:"",methods:[],displayName:"AlertDialogCancel",props:{variant:{defaultValue:{value:'"outline"',computed:!1},required:!1},size:{defaultValue:{value:'"default"',computed:!1},required:!1}}};y.__docgenInfo={description:"",methods:[],displayName:"AlertDialogContent",props:{size:{required:!1,tsType:{name:"union",raw:'"default" | "sm"',elements:[{name:"literal",value:'"default"'},{name:"literal",value:'"sm"'}]},description:"",defaultValue:{value:'"default"',computed:!1}}}};F.__docgenInfo={description:"",methods:[],displayName:"AlertDialogDescription"};$.__docgenInfo={description:"",methods:[],displayName:"AlertDialogFooter"};k.__docgenInfo={description:"",methods:[],displayName:"AlertDialogHeader"};P.__docgenInfo={description:"",methods:[],displayName:"AlertDialogOverlay"};O.__docgenInfo={description:"",methods:[],displayName:"AlertDialogPortal"};M.__docgenInfo={description:"",methods:[],displayName:"AlertDialogTitle"};const{expect:s,within:V}=__STORYBOOK_MODULE_TEST__,Ne={title:"Components/AlertDialog",component:y,parameters:{layout:"centered",docs:{story:{inline:!1,iframeHeight:400}}},tags:["autodocs"],argTypes:{size:{control:{type:"select"},options:["default","sm"]}},args:{size:"default"}};function L(e){return o.jsx(z,{open:!0,children:o.jsxs(y,{...e,children:[o.jsxs(k,{children:[o.jsx(M,{children:"Delete workspace?"}),o.jsx(F,{children:"This action permanently removes the workspace and its saved settings."})]}),o.jsxs($,{children:[o.jsx(q,{children:"Cancel"}),o.jsx(W,{variant:"destructive",children:"Delete"})]})]})})}const g={render:L,parameters:{zephyr:{testCaseId:"SW-T1182"}},play:async({canvasElement:e,step:t})=>{const a=V(e.ownerDocument.body);await t("Alert dialog portal content renders",async()=>{s(a.getByRole("alertdialog")).toBeInTheDocument(),s(a.getByText("Delete workspace?")).toBeInTheDocument(),s(a.getByText("This action permanently removes the workspace and its saved settings.")).toBeInTheDocument()}),await t("Footer action buttons render",async()=>{s(a.getByRole("button",{name:"Cancel"})).toBeInTheDocument(),s(a.getByRole("button",{name:"Delete"})).toBeInTheDocument()})}},m={args:{size:"sm"},render:L,parameters:{zephyr:{testCaseId:"SW-T1183"}},play:async({canvasElement:e,step:t})=>{const a=V(e.ownerDocument.body);await t("Small alert dialog shows title and description",async()=>{s(a.getByRole("alertdialog")).toBeInTheDocument(),s(a.getByText("Delete workspace?")).toBeInTheDocument(),s(a.getByText("This action permanently removes the workspace and its saved settings.")).toBeInTheDocument()}),await t("Footer action buttons render",async()=>{s(a.getByRole("button",{name:"Cancel"})).toBeInTheDocument(),s(a.getByRole("button",{name:"Delete"})).toBeInTheDocument()})}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: renderDialog,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1182"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const body = within(canvasElement.ownerDocument.body);
    await step("Alert dialog portal content renders", async () => {
      expect(body.getByRole("alertdialog")).toBeInTheDocument();
      expect(body.getByText("Delete workspace?")).toBeInTheDocument();
      expect(body.getByText("This action permanently removes the workspace and its saved settings.")).toBeInTheDocument();
    });
    await step("Footer action buttons render", async () => {
      expect(body.getByRole("button", {
        name: "Cancel"
      })).toBeInTheDocument();
      expect(body.getByRole("button", {
        name: "Delete"
      })).toBeInTheDocument();
    });
  }
}`,...g.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    size: "sm"
  },
  render: renderDialog,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1183"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const body = within(canvasElement.ownerDocument.body);
    await step("Small alert dialog shows title and description", async () => {
      expect(body.getByRole("alertdialog")).toBeInTheDocument();
      expect(body.getByText("Delete workspace?")).toBeInTheDocument();
      expect(body.getByText("This action permanently removes the workspace and its saved settings.")).toBeInTheDocument();
    });
    await step("Footer action buttons render", async () => {
      expect(body.getByRole("button", {
        name: "Cancel"
      })).toBeInTheDocument();
      expect(body.getByRole("button", {
        name: "Delete"
      })).toBeInTheDocument();
    });
  }
}`,...m.parameters?.docs?.source}}};const Ie=["Default","Small"];export{g as Default,m as Small,Ie as __namedExportsOrder,Ne as default};
