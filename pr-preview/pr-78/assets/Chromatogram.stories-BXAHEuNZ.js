import{r as o,j as i}from"./iframe-14YYbrss.js";import{P as _}from"./plotly-BfU08UT2.js";import{u as R}from"./use-plotly-theme-DDaBOKiZ.js";import"./preload-helper-BbFkF2Um.js";const L=75,$=1.05,H=e=>{const a={A:e.peakA,T:e.peakT,G:e.peakG,C:e.peakC},n=Object.values(a);if(n.every(k=>k===n[0]))return"";let d="",y=0;return Object.entries(a).forEach(([k,h])=>{h>y&&(d=k,y=h)}),d},W=({data:e=[],width:a=900,height:n=600,positionInterval:r=10,colorA:d="#2D9CDB",colorT:y="#A1C63C",colorG:k="#FF5C64",colorC:h="#FFA62E"})=>{const C=o.useRef(null),g=R(),t=o.useMemo(()=>e.map(s=>s.position),[e]),z=o.useMemo(()=>e.map(s=>H(s)),[e]),A=o.useMemo(()=>e.map(s=>s.peakA),[e]),f=o.useMemo(()=>e.map(s=>s.peakT),[e]),x=o.useMemo(()=>e.map(s=>s.peakG),[e]),B=o.useMemo(()=>e.map(s=>s.peakC),[e]),M=o.useMemo(()=>({x:t,y:A,type:"scatter",mode:"lines",name:"A",line:{color:d,width:2,shape:"spline"}}),[t,A,d]),E=o.useMemo(()=>({x:t,y:f,type:"scatter",mode:"lines",name:"T",line:{color:y,width:2,shape:"spline"}}),[t,f,y]),I=o.useMemo(()=>({x:t,y:x,type:"scatter",mode:"lines",name:"G",line:{color:k,width:2,shape:"spline"}}),[t,x,k]),F=o.useMemo(()=>({x:t,y:B,type:"scatter",mode:"lines",name:"C",line:{color:h,width:2,shape:"spline"}}),[t,B,h]),b=o.useMemo(()=>Math.max(...A,...f,...x,...B),[A,f,x,B]);if(o.useEffect(()=>{if(!C.current||e.length===0)return;const s=[M,E,I,F],w={width:a,height:n-L,margin:{l:0,r:0,b:20,t:10,pad:0},paper_bgcolor:g.paperBg,plot_bgcolor:g.plotBg,font:{family:"Inter, sans-serif"},showlegend:!1,xaxis:{showgrid:!1,zeroline:!1,showticklabels:!1,showline:!1,range:[Math.min(...t),Math.max(...t)],fixedrange:!0},yaxis:{showgrid:!1,zeroline:!1,showticklabels:!1,showline:!1,range:[0,b*$],fixedrange:!0}},l={responsive:!0,displayModeBar:!1,displaylogo:!1,fillFrame:!0};_.newPlot(C.current,s,w,l);const u=C.current;return()=>{u&&_.purge(u)}},[e,a,n,M,E,I,F,b,t,g]),e.length===0)return i.jsx("div",{className:"chart-container",children:"No data available"});const V=()=>{const s=()=>{const l=Math.min(...t),u=Math.max(...t),S=a;return i.jsx("div",{className:"sequence-letters-container",children:z.map((m,T)=>{const c=t[T],P=m==="A"?d:m==="T"?y:m==="G"?k:m==="C"?h:g.textColor,O=(c-l)/(u-l)*S;return i.jsx("span",{className:"sequence-letter",style:{left:`${O}px`,color:P},children:m},`base-${T}`)})})},w=()=>{const l=Math.min(...t),u=Math.max(...t),S=a,m=Math.ceil(l/r)*r,T=[];for(let c=m;c<=u;c+=r)T.push({position:c,label:c.toString()});return i.jsx("div",{className:"position-numbers-container",children:T.map(c=>{const j=(c.position-l)/(u-l)*S;return i.jsx("span",{className:"position-number",style:{left:`${j}px`},children:c.label},`pos-${c.position}`)})})};return i.jsxs("div",{className:"sequence-header",children:[s(),w()]})};return i.jsxs("div",{className:"chromatogram-container",style:{width:a,height:n},children:[V(),i.jsx("div",{className:"chromatogram-chart",children:i.jsx("div",{ref:C,style:{width:"100%",height:"100%"}})})]})};W.__docgenInfo={description:"",methods:[],displayName:"Chromatogram",props:{data:{required:!1,tsType:{name:"Array",elements:[{name:"PeakData"}],raw:"PeakData[]"},description:"",defaultValue:{value:"[]",computed:!1}},width:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"900",computed:!1}},height:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"600",computed:!1}},positionInterval:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"10",computed:!1}},colorA:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"#2D9CDB"',computed:!1}},colorT:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"#A1C63C"',computed:!1}},colorG:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"#FF5C64"',computed:!1}},colorC:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"#FFA62E"',computed:!1}}}};const{expect:p,within:D}=__STORYBOOK_MODULE_TEST__,Q={title:"Charts/Chromatogram",component:W,parameters:{layout:"centered"},tags:["autodocs"]},N=[{position:269,peakA:10,peakT:10,peakG:10,peakC:10},{position:270,peakA:10,peakT:10,peakG:10,peakC:50},{position:271,peakA:10,peakT:10,peakG:10,peakC:10},{position:272,peakA:15,peakT:70,peakG:10,peakC:10},{position:273,peakA:10,peakT:10,peakG:10,peakC:10},{position:274,peakA:10,peakT:45,peakG:15,peakC:10},{position:275,peakA:10,peakT:10,peakG:10,peakC:10},{position:276,peakA:10,peakT:10,peakG:10,peakC:40},{position:277,peakA:10,peakT:10,peakG:10,peakC:10},{position:278,peakA:10,peakT:10,peakG:10,peakC:60},{position:279,peakA:10,peakT:10,peakG:10,peakC:10},{position:280,peakA:10,peakT:10,peakG:10,peakC:35},{position:281,peakA:10,peakT:10,peakG:10,peakC:10},{position:282,peakA:10,peakT:10,peakG:10,peakC:40},{position:283,peakA:10,peakT:10,peakG:10,peakC:10},{position:284,peakA:10,peakT:10,peakG:50,peakC:10},{position:285,peakA:10,peakT:10,peakG:10,peakC:10},{position:286,peakA:10,peakT:10,peakG:45,peakC:10},{position:287,peakA:10,peakT:10,peakG:10,peakC:10},{position:288,peakA:10,peakT:10,peakG:40,peakC:10},{position:289,peakA:10,peakT:10,peakG:10,peakC:10},{position:290,peakA:10,peakT:30,peakG:10,peakC:10},{position:291,peakA:10,peakT:10,peakG:10,peakC:10},{position:292,peakA:10,peakT:40,peakG:10,peakC:10},{position:293,peakA:10,peakT:10,peakG:10,peakC:10},{position:294,peakA:10,peakT:10,peakG:60,peakC:10},{position:295,peakA:10,peakT:10,peakG:10,peakC:10},{position:296,peakA:10,peakT:10,peakG:10,peakC:50},{position:297,peakA:10,peakT:10,peakG:10,peakC:10},{position:298,peakA:60,peakT:10,peakG:10,peakC:10},{position:299,peakA:10,peakT:10,peakG:10,peakC:10},{position:300,peakA:10,peakT:10,peakG:10,peakC:75},{position:301,peakA:10,peakT:10,peakG:10,peakC:10},{position:302,peakA:10,peakT:10,peakG:10,peakC:65},{position:303,peakA:10,peakT:10,peakG:10,peakC:10},{position:304,peakA:70,peakT:10,peakG:10,peakC:10},{position:305,peakA:10,peakT:10,peakG:10,peakC:10}],Y=[{position:269,base:"C",peakA:10,peakT:10,peakG:10,peakC:10},{position:270,base:"C",peakA:60,peakT:10,peakG:10,peakC:10},{position:271,base:"T",peakA:10,peakT:10,peakG:50,peakC:10},{position:272,peakA:15,peakT:70,peakG:10,peakC:10}],G={name:"Mockup Match",parameters:{zephyr:{testCaseId:"SW-T975"}},args:{data:N},play:async({canvasElement:e,step:a})=>{const n=D(e);await a("Chart container renders",async()=>{p(e.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await a("Four traces are rendered",async()=>{const r=e.querySelectorAll(".scatterlayer .trace");p(r.length).toBe(4)}),await a("Position labels are displayed",async()=>{p(n.getByText("270")).toBeInTheDocument(),p(n.getByText("280")).toBeInTheDocument()})}},v={name:"With Explicit Bases",parameters:{zephyr:{testCaseId:"SW-T976"}},args:{data:Y},play:async({canvasElement:e,step:a})=>{const n=D(e);await a("Chart container renders",async()=>{p(e.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await a("Four traces are rendered",async()=>{const r=e.querySelectorAll(".scatterlayer .trace");p(r.length).toBe(4)}),await a("Sequence letters are displayed",async()=>{p(n.getByText("A")).toBeInTheDocument(),p(n.getByText("G")).toBeInTheDocument(),p(n.getByText("T")).toBeInTheDocument()})}},q={name:"Custom Colors",parameters:{zephyr:{testCaseId:"SW-T977"}},args:{data:N,colorA:"#8B5CF6",colorT:"#EF4444",colorG:"#F97316",colorC:"#3B82F6"},play:async({canvasElement:e,step:a})=>{const n=D(e);await a("Chart container renders",async()=>{p(e.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await a("Four traces are rendered",async()=>{const r=e.querySelectorAll(".scatterlayer .trace");p(r.length).toBe(4)}),await a("Position labels are displayed",async()=>{p(n.getByText("290")).toBeInTheDocument()})}};G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  name: "Mockup Match",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T975"
    }
  },
  args: {
    data: dnaSequenceData
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Four traces are rendered", async () => {
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBe(4);
    });
    await step("Position labels are displayed", async () => {
      expect(canvas.getByText("270")).toBeInTheDocument();
      expect(canvas.getByText("280")).toBeInTheDocument();
    });
  }
}`,...G.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: "With Explicit Bases",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T976"
    }
  },
  args: {
    data: dnaWithExplicitBases
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Four traces are rendered", async () => {
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBe(4);
    });
    await step("Sequence letters are displayed", async () => {
      expect(canvas.getByText("A")).toBeInTheDocument();
      expect(canvas.getByText("G")).toBeInTheDocument();
      expect(canvas.getByText("T")).toBeInTheDocument();
    });
  }
}`,...v.parameters?.docs?.source}}};q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  name: "Custom Colors",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T977"
    }
  },
  args: {
    data: dnaSequenceData,
    colorA: "#8B5CF6",
    colorT: "#EF4444",
    colorG: "#F97316",
    colorC: "#3B82F6"
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Four traces are rendered", async () => {
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBe(4);
    });
    await step("Position labels are displayed", async () => {
      expect(canvas.getByText("290")).toBeInTheDocument();
    });
  }
}`,...q.parameters?.docs?.source}}};const Z=["MockupMatch","WithExplicitBases","CustomColors"];export{q as CustomColors,G as MockupMatch,v as WithExplicitBases,Z as __namedExportsOrder,Q as default};
