import{R as u,j as a,u as A,P as S,f as L,c as w,r as _}from"./iframe-14YYbrss.js";import{a as k,t as q}from"./toggle-Be65IcJN.js";import{I as $,c as j,R as U}from"./index-_AbBFJ6v.js";import{u as K}from"./index-SK9A3v17.js";import{T as Y,a as H,b as J}from"./text-align-start-Dyc5boXC.js";import"./preload-helper-BbFkF2Um.js";import"./index-B8eA1Gpy.js";import"./index-CzkjiSpZ.js";var i="ToggleGroup",[E]=L(i,[j]),P=j(),D=u.forwardRef((t,n)=>{const{type:e,...o}=t;if(e==="single"){const s=o;return a.jsx(Q,{...s,ref:n})}if(e==="multiple"){const s=o;return a.jsx(X,{...s,ref:n})}throw new Error(`Missing prop \`type\` expected on \`${i}\``)});D.displayName=i;var[V,W]=E(i),Q=u.forwardRef((t,n)=>{const{value:e,defaultValue:o,onValueChange:s=()=>{},...r}=t,[g,l]=A({prop:e,defaultProp:o??"",onChange:s,caller:i});return a.jsx(V,{scope:t.__scopeToggleGroup,type:"single",value:u.useMemo(()=>g?[g]:[],[g]),onItemActivate:l,onItemDeactivate:u.useCallback(()=>l(""),[l]),children:a.jsx(O,{...r,ref:n})})}),X=u.forwardRef((t,n)=>{const{value:e,defaultValue:o,onValueChange:s=()=>{},...r}=t,[g,l]=A({prop:e,defaultProp:o??[],onChange:s,caller:i}),p=u.useCallback(d=>l((m=[])=>[...m,d]),[l]),b=u.useCallback(d=>l((m=[])=>m.filter(F=>F!==d)),[l]);return a.jsx(V,{scope:t.__scopeToggleGroup,type:"multiple",value:g,onItemActivate:p,onItemDeactivate:b,children:a.jsx(O,{...r,ref:n})})});D.displayName=i;var[Z,ee]=E(i),O=u.forwardRef((t,n)=>{const{__scopeToggleGroup:e,disabled:o=!1,rovingFocus:s=!0,orientation:r,dir:g,loop:l=!0,...p}=t,b=P(e),d=K(g),m={role:"group",dir:d,...p};return a.jsx(Z,{scope:e,rovingFocus:s,disabled:o,children:s?a.jsx(U,{asChild:!0,...b,orientation:r,dir:d,loop:l,children:a.jsx(S.div,{...m,ref:n})}):a.jsx(S.div,{...m,ref:n})})}),R="ToggleGroupItem",N=u.forwardRef((t,n)=>{const e=W(R,t.__scopeToggleGroup),o=ee(R,t.__scopeToggleGroup),s=P(t.__scopeToggleGroup),r=e.value.includes(t.value),g=o.disabled||t.disabled,l={...t,pressed:r,disabled:g},p=u.useRef(null);return o.rovingFocus?a.jsx($,{asChild:!0,...s,focusable:!g,active:r,ref:p,children:a.jsx(C,{...l,ref:n})}):a.jsx(C,{...l,ref:n})});N.displayName=R;var C=u.forwardRef((t,n)=>{const{__scopeToggleGroup:e,value:o,...s}=t,r=W(R,e),g={role:"radio","aria-checked":t.pressed,"aria-pressed":void 0},l=r.type==="single"?g:void 0;return a.jsx(k,{...l,...s,ref:n,onPressedChange:p=>{p?r.onItemActivate(o):r.onItemDeactivate(o)}})}),te=D,ne=N;const M=_.createContext({size:"default",variant:"default",spacing:0,orientation:"horizontal"});function z({className:t,variant:n,size:e,spacing:o=0,orientation:s="horizontal",children:r,...g}){return a.jsx(te,{"data-slot":"toggle-group","data-variant":n,"data-size":e,"data-spacing":o,"data-orientation":s,style:{"--gap":o},className:w("group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] rounded-lg data-[size=sm]:rounded-[min(var(--radius-md),10px)] data-vertical:flex-col data-vertical:items-stretch",t),...g,children:a.jsx(M.Provider,{value:{variant:n,size:e,spacing:o,orientation:s},children:r})})}function G({className:t,children:n,variant:e="default",size:o="default",...s}){const r=_.useContext(M);return a.jsx(ne,{"data-slot":"toggle-group-item","data-variant":r.variant||e,"data-size":r.size||o,"data-spacing":r.spacing,className:w("shrink-0 group-data-[spacing=0]/toggle-group:rounded-none group-data-[spacing=0]/toggle-group:px-2 focus:z-10 focus-visible:z-10 group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-l-lg group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-t-lg group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-r-lg group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-b-lg group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t",q({variant:r.variant||e,size:r.size||o}),t),...s,children:n})}z.__docgenInfo={description:"",methods:[],displayName:"ToggleGroup",props:{spacing:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"0",computed:!1}},orientation:{required:!1,tsType:{name:"union",raw:'"horizontal" | "vertical"',elements:[{name:"literal",value:'"horizontal"'},{name:"literal",value:'"vertical"'}]},description:"",defaultValue:{value:'"horizontal"',computed:!1}}}};G.__docgenInfo={description:"",methods:[],displayName:"ToggleGroupItem",props:{variant:{defaultValue:{value:'"default"',computed:!1},required:!1},size:{defaultValue:{value:'"default"',computed:!1},required:!1}}};const{expect:c,within:v}=__STORYBOOK_MODULE_TEST__,ie={title:"Components/ToggleGroup",component:z,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{variant:{control:{type:"select"},options:["default","outline"]},size:{control:{type:"select"},options:["default","sm","lg"]},orientation:{control:{type:"select"},options:["horizontal","vertical"]},spacing:{control:{type:"number"}}},args:{variant:"default",size:"default",orientation:"horizontal",spacing:0}};function y(t){return a.jsxs(z,{...t,defaultValue:["left"],type:"multiple",children:[a.jsx(G,{value:"left","aria-label":"Align left",children:a.jsx(Y,{})}),a.jsx(G,{value:"center","aria-label":"Align center",children:a.jsx(H,{})}),a.jsx(G,{value:"right","aria-label":"Align right",children:a.jsx(J,{})})]})}const h={render:y,parameters:{zephyr:{testCaseId:"SW-T1316"}},play:async({canvasElement:t,step:n})=>{const e=v(t);await n("Toggle group container renders",async()=>{c(e.getByRole("group")).toBeInTheDocument()}),await n("Alignment toggle buttons render",async()=>{c(e.getByRole("button",{name:"Align left"})).toBeInTheDocument(),c(e.getByRole("button",{name:"Align center"})).toBeInTheDocument(),c(e.getByRole("button",{name:"Align right"})).toBeInTheDocument()})}},T={args:{variant:"outline"},render:y,parameters:{zephyr:{testCaseId:"SW-T1317"}},play:async({canvasElement:t,step:n})=>{const e=v(t);await n("Outline toggle group renders",async()=>{c(e.getByRole("group")).toBeInTheDocument(),c(e.getByRole("button",{name:"Align left"})).toBeInTheDocument()})}},f={args:{size:"sm"},render:y,parameters:{zephyr:{testCaseId:"SW-T1318"}},play:async({canvasElement:t,step:n})=>{const e=v(t);await n("Small toggle group renders",async()=>{c(e.getByRole("group")).toBeInTheDocument(),c(e.getByRole("button",{name:"Align center"})).toBeInTheDocument()})}},x={args:{size:"lg"},render:y,parameters:{zephyr:{testCaseId:"SW-T1319"}},play:async({canvasElement:t,step:n})=>{const e=v(t);await n("Large toggle group renders",async()=>{c(e.getByRole("group")).toBeInTheDocument(),c(e.getByRole("button",{name:"Align right"})).toBeInTheDocument()})}},B={args:{orientation:"vertical"},render:y,parameters:{zephyr:{testCaseId:"SW-T1320"}},play:async({canvasElement:t,step:n})=>{const e=v(t);await n("Vertical toggle group renders",async()=>{c(e.getByRole("group")).toBeInTheDocument(),c(e.getByRole("button",{name:"Align left"})).toBeInTheDocument(),c(e.getByRole("button",{name:"Align right"})).toBeInTheDocument()})}},I={args:{spacing:2},render:y,parameters:{zephyr:{testCaseId:"SW-T1321"}},play:async({canvasElement:t,step:n})=>{const e=v(t);await n("Spaced toggle group renders",async()=>{c(e.getByRole("group")).toBeInTheDocument(),c(e.getByRole("button",{name:"Align center"})).toBeInTheDocument()})}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: renderToggleGroup,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1316"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Toggle group container renders", async () => {
      expect(canvas.getByRole("group")).toBeInTheDocument();
    });
    await step("Alignment toggle buttons render", async () => {
      expect(canvas.getByRole("button", {
        name: "Align left"
      })).toBeInTheDocument();
      expect(canvas.getByRole("button", {
        name: "Align center"
      })).toBeInTheDocument();
      expect(canvas.getByRole("button", {
        name: "Align right"
      })).toBeInTheDocument();
    });
  }
}`,...h.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "outline"
  },
  render: renderToggleGroup,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1317"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Outline toggle group renders", async () => {
      expect(canvas.getByRole("group")).toBeInTheDocument();
      expect(canvas.getByRole("button", {
        name: "Align left"
      })).toBeInTheDocument();
    });
  }
}`,...T.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    size: "sm"
  },
  render: renderToggleGroup,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1318"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Small toggle group renders", async () => {
      expect(canvas.getByRole("group")).toBeInTheDocument();
      expect(canvas.getByRole("button", {
        name: "Align center"
      })).toBeInTheDocument();
    });
  }
}`,...f.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    size: "lg"
  },
  render: renderToggleGroup,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1319"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Large toggle group renders", async () => {
      expect(canvas.getByRole("group")).toBeInTheDocument();
      expect(canvas.getByRole("button", {
        name: "Align right"
      })).toBeInTheDocument();
    });
  }
}`,...x.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: "vertical"
  },
  render: renderToggleGroup,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1320"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Vertical toggle group renders", async () => {
      expect(canvas.getByRole("group")).toBeInTheDocument();
      expect(canvas.getByRole("button", {
        name: "Align left"
      })).toBeInTheDocument();
      expect(canvas.getByRole("button", {
        name: "Align right"
      })).toBeInTheDocument();
    });
  }
}`,...B.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    spacing: 2
  },
  render: renderToggleGroup,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1321"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Spaced toggle group renders", async () => {
      expect(canvas.getByRole("group")).toBeInTheDocument();
      expect(canvas.getByRole("button", {
        name: "Align center"
      })).toBeInTheDocument();
    });
  }
}`,...I.parameters?.docs?.source}}};const pe=["Default","Outline","Small","Large","Vertical","Spaced"];export{h as Default,x as Large,T as Outline,f as Small,I as Spaced,B as Vertical,pe as __namedExportsOrder,ie as default};
