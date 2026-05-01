import{r as u,j as t,P as v}from"./iframe-14YYbrss.js";import"./preload-helper-BbFkF2Um.js";var y="AspectRatio",c=u.forwardRef((e,a)=>{const{ratio:r=1/1,style:m,...l}=e;return t.jsx("div",{style:{position:"relative",width:"100%",paddingBottom:`${100/r}%`},"data-radix-aspect-ratio-wrapper":"",children:t.jsx(v.div,{...l,ref:a,style:{...m,position:"absolute",top:0,right:0,bottom:0,left:0}})})});c.displayName=y;var w=c;function o({...e}){return t.jsx(w,{"data-slot":"aspect-ratio",...e})}o.__docgenInfo={description:"",methods:[],displayName:"AspectRatio"};const{expect:i,within:p}=__STORYBOOK_MODULE_TEST__,f={title:"Components/Aspect Ratio",component:o,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{ratio:{control:{type:"number"}}},args:{ratio:16/9}};function d(e){return t.jsx("div",{className:"w-[360px]",children:t.jsx(o,{...e,className:"overflow-hidden rounded-xl border bg-muted",children:t.jsx("div",{className:"flex h-full items-center justify-center bg-linear-to-br from-slate-900 via-slate-700 to-slate-500 text-sm font-medium text-white",children:e?.ratio===1?"1:1 Preview":"16:9 Preview"})})})}const n={render:d,parameters:{zephyr:{testCaseId:"SW-T1186"}},play:async({canvasElement:e,step:a})=>{const r=p(e);await a("Aspect ratio container and preview content render",async()=>{i(r.getByText("16:9 Preview")).toBeInTheDocument()})}},s={args:{ratio:1},render:d,parameters:{zephyr:{testCaseId:"SW-T1187"}},play:async({canvasElement:e,step:a})=>{const r=p(e);await a("Square aspect ratio shows 1:1 preview",async()=>{i(r.getByText("1:1 Preview")).toBeInTheDocument()})}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: renderAspectRatio,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1186"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Aspect ratio container and preview content render", async () => {
      expect(canvas.getByText("16:9 Preview")).toBeInTheDocument();
    });
  }
}`,...n.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    ratio: 1
  },
  render: renderAspectRatio,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1187"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Square aspect ratio shows 1:1 preview", async () => {
      expect(canvas.getByText("1:1 Preview")).toBeInTheDocument();
    });
  }
}`,...s.parameters?.docs?.source}}};const T=["Default","Square"];export{n as Default,s as Square,T as __namedExportsOrder,f as default};
