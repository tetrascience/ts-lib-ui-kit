import{C as l}from"./colors-ClKyOP62.js";import{r as v,j as s,R as E}from"./iframe-14YYbrss.js";import{P as f}from"./plotly-BfU08UT2.js";import{u as L}from"./use-plotly-theme-DDaBOKiZ.js";import"./preload-helper-BbFkF2Um.js";const P=[l.BLUE,l.GREEN,l.ORANGE,l.RED,l.YELLOW,l.PURPLE],R=({dataSeries:e,width:n=400,height:o=400,title:a="Pie Chart",textInfo:r="percent",hole:w=0,rotation:C=0})=>{const m=v.useRef(null),h=L(),b=v.useMemo(()=>{if(e.colors&&e.colors.length>=e.labels.length)return e.colors;const c=[...e.colors||[]],p=e.labels.length-c.length;if(p<=0)return c;for(let y=0;y<p;y++)c.push(P[y%P.length]);return c},[e.colors,e.labels.length]);v.useEffect(()=>{if(!m.current)return;const c=[{type:"pie",labels:e.labels,values:e.values,name:e.name,marker:{colors:b},textinfo:r,hoverinfo:"label+text+value",insidetextfont:{size:0,family:"Inter, sans-serif",color:"transparent"},hole:w,rotation:C}],p={width:n,height:o,font:{family:"Inter, sans-serif",color:h.textColor},showlegend:!1,margin:{l:40,r:40,b:40,t:40},paper_bgcolor:h.paperBg,plot_bgcolor:h.plotBg},y={responsive:!0,displayModeBar:!1,displaylogo:!1};f.newPlot(m.current,c,p,y);const d=m.current;return()=>{d&&f.purge(d)}},[b,e.labels,e.name,e.values,n,o,r,w,C,h]);const q=({labels:c,colors:p})=>{const y=c.map((u,S)=>s.jsx(E.Fragment,{children:s.jsxs("div",{className:"legend-item",children:[s.jsx("span",{className:"color-box",style:{background:p[S]}}),u,S<c.length-1&&s.jsx("span",{className:"divider"})]})},u)),d=6,I=[];for(let u=0;u<y.length;u+=d)I.push(s.jsx("div",{className:"legend-row",children:y.slice(u,u+d)},u));return s.jsx("div",{className:"legend-container",children:I})};return s.jsx("div",{className:"card-container",style:{width:n},children:s.jsxs("div",{className:"chart-container",children:[a&&s.jsx("div",{className:"title-container",children:s.jsx("h2",{className:"title",children:a})}),s.jsx("div",{ref:m,style:{width:"100%",height:"100%",margin:"0"}}),s.jsx(q,{labels:e.labels,colors:b})]})})};R.__docgenInfo={description:"",methods:[],displayName:"PieChart",props:{dataSeries:{required:!0,tsType:{name:"PieDataSeries"},description:""},width:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"400",computed:!1}},height:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"400",computed:!1}},title:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Pie Chart"',computed:!1}},textInfo:{required:!1,tsType:{name:"union",raw:`| "none"
| "label"
| "percent"
| "value"
| "label+percent"
| "label+value"
| "value+percent"
| "label+value+percent"`,elements:[{name:"literal",value:'"none"'},{name:"literal",value:'"label"'},{name:"literal",value:'"percent"'},{name:"literal",value:'"value"'},{name:"literal",value:'"label+percent"'},{name:"literal",value:'"label+value"'},{name:"literal",value:'"value+percent"'},{name:"literal",value:'"label+value+percent"'}]},description:"",defaultValue:{value:'"percent"',computed:!1}},hole:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"0",computed:!1}},rotation:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"0",computed:!1}}}};const{expect:t,within:i}=__STORYBOOK_MODULE_TEST__,H={title:"Charts/PieChart",component:R,parameters:{layout:"centered"},tags:["autodocs"]},g={name:"Default",parameters:{zephyr:{testCaseId:"SW-T1012"}},args:{dataSeries:{labels:["pH","Temperature","Dissolved Oxygen","Cell Density","Viability"],values:[12,23,35,18,12],name:"Bioreactor Parameters"},title:"Bioreactor",width:480,height:480,textInfo:"percent",hole:0,rotation:0},play:async({canvasElement:e,step:n})=>{const o=i(e);await n("Chart title is displayed",async()=>{t(o.getByText("Bioreactor")).toBeInTheDocument()}),await n("Chart container renders",async()=>{t(e.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await n("Pie layer and slices render",async()=>{t(e.querySelector(".pielayer")).toBeInTheDocument();const a=e.querySelectorAll(".pielayer .slice");t(a.length).toBe(5)}),await n("Legend shows parameter labels",async()=>{const a=e.querySelector(".legend-container");t(a).toBeTruthy();const r=i(a);t(r.getByText("pH")).toBeInTheDocument(),t(r.getByText("Temperature")).toBeInTheDocument()})}},B={name:"With Custom Colors",parameters:{zephyr:{testCaseId:"SW-T1013"}},args:{dataSeries:{labels:["pH","Temperature","Dissolved Oxygen","Cell Density","Viability"],values:[12,23,35,18,12],name:"Bioreactor Parameters",colors:[l.ORANGE,l.RED,l.GREEN,l.BLUE,l.PURPLE]},title:"Bioreactor Parameter Distribution",width:480,height:480,textInfo:"percent",hole:0,rotation:0},play:async({canvasElement:e,step:n})=>{const o=i(e);await n("Chart title is displayed",async()=>{t(o.getByText("Bioreactor Parameter Distribution")).toBeInTheDocument()}),await n("Chart container renders",async()=>{t(e.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await n("Pie layer and slices render",async()=>{t(e.querySelector(".pielayer")).toBeInTheDocument();const a=e.querySelectorAll(".pielayer .slice");t(a.length).toBe(5)}),await n("Legend shows parameter labels",async()=>{const a=e.querySelector(".legend-container");t(a).toBeTruthy();const r=i(a);t(r.getByText("pH")).toBeInTheDocument(),t(r.getByText("Dissolved Oxygen")).toBeInTheDocument()})}},T={name:"Donut Chart",parameters:{zephyr:{testCaseId:"SW-T1014"}},args:{dataSeries:{labels:["pH","Temperature","Dissolved Oxygen","Cell Density","Viability"],values:[12,23,35,18,12],name:"Bioreactor Parameters"},title:"Bioreactor Parameter Distribution (Donut)",width:480,height:480,textInfo:"label+percent",hole:.5,rotation:0},play:async({canvasElement:e,step:n})=>{const o=i(e);await n("Chart title is displayed",async()=>{t(o.getByText("Bioreactor Parameter Distribution (Donut)")).toBeInTheDocument()}),await n("Chart container renders",async()=>{t(e.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await n("Pie layer and slices render",async()=>{t(e.querySelector(".pielayer")).toBeInTheDocument();const a=e.querySelectorAll(".pielayer .slice");t(a.length).toBe(5)}),await n("Legend shows parameter labels",async()=>{const a=e.querySelector(".legend-container");t(a).toBeTruthy();const r=i(a);t(r.getByText("Viability")).toBeInTheDocument(),t(r.getByText("Cell Density")).toBeInTheDocument()})}},D={name:"With Label And Values",parameters:{zephyr:{testCaseId:"SW-T1015"}},args:{dataSeries:{labels:["pH","Temperature","Dissolved Oxygen","Cell Density","Viability"],values:[12,23,35,18,12],name:"Bioreactor Parameters"},title:"Bioreactor Parameter Distribution",width:480,height:480,textInfo:"label+value",hole:0,rotation:0},play:async({canvasElement:e,step:n})=>{const o=i(e);await n("Chart title is displayed",async()=>{t(o.getByText("Bioreactor Parameter Distribution")).toBeInTheDocument()}),await n("Chart container renders",async()=>{t(e.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await n("Pie layer and slices render",async()=>{t(e.querySelector(".pielayer")).toBeInTheDocument();const a=e.querySelectorAll(".pielayer .slice");t(a.length).toBe(5)}),await n("Legend shows parameter labels",async()=>{const a=e.querySelector(".legend-container");t(a).toBeTruthy();const r=i(a);t(r.getByText("pH")).toBeInTheDocument(),t(r.getByText("Temperature")).toBeInTheDocument()})}},x={name:"With Rotation",parameters:{zephyr:{testCaseId:"SW-T1016"}},args:{dataSeries:{labels:["pH","Temperature","Dissolved Oxygen","Cell Density","Viability"],values:[12,23,35,18,12],name:"Bioreactor Parameters"},title:"Bioreactor Parameter Distribution (Rotated)",width:480,height:480,textInfo:"percent",hole:0,rotation:45},play:async({canvasElement:e,step:n})=>{const o=i(e);await n("Chart title is displayed",async()=>{t(o.getByText("Bioreactor Parameter Distribution (Rotated)")).toBeInTheDocument()}),await n("Chart container renders",async()=>{t(e.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await n("Pie layer and slices render",async()=>{t(e.querySelector(".pielayer")).toBeInTheDocument();const a=e.querySelectorAll(".pielayer .slice");t(a.length).toBe(5)}),await n("Legend shows parameter labels",async()=>{const a=e.querySelector(".legend-container");t(a).toBeTruthy();const r=i(a);t(r.getByText("Dissolved Oxygen")).toBeInTheDocument(),t(r.getByText("Cell Density")).toBeInTheDocument()})}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: "Default",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T1012"
    }
  },
  args: {
    dataSeries: {
      labels: ["pH", "Temperature", "Dissolved Oxygen", "Cell Density", "Viability"],
      values: [12, 23, 35, 18, 12],
      name: "Bioreactor Parameters"
    },
    title: "Bioreactor",
    width: 480,
    height: 480,
    textInfo: "percent",
    hole: 0,
    rotation: 0
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Bioreactor")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Pie layer and slices render", async () => {
      expect(canvasElement.querySelector(".pielayer")).toBeInTheDocument();
      const slices = canvasElement.querySelectorAll(".pielayer .slice");
      expect(slices.length).toBe(5);
    });
    await step("Legend shows parameter labels", async () => {
      const legendRoot = canvasElement.querySelector(".legend-container");
      expect(legendRoot).toBeTruthy();
      const legend = within(legendRoot as HTMLElement);
      expect(legend.getByText("pH")).toBeInTheDocument();
      expect(legend.getByText("Temperature")).toBeInTheDocument();
    });
  }
}`,...g.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  name: "With Custom Colors",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T1013"
    }
  },
  args: {
    dataSeries: {
      labels: ["pH", "Temperature", "Dissolved Oxygen", "Cell Density", "Viability"],
      values: [12, 23, 35, 18, 12],
      name: "Bioreactor Parameters",
      colors: [COLORS.ORANGE, COLORS.RED, COLORS.GREEN, COLORS.BLUE, COLORS.PURPLE]
    },
    title: "Bioreactor Parameter Distribution",
    width: 480,
    height: 480,
    textInfo: "percent",
    hole: 0,
    rotation: 0
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Bioreactor Parameter Distribution")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Pie layer and slices render", async () => {
      expect(canvasElement.querySelector(".pielayer")).toBeInTheDocument();
      const slices = canvasElement.querySelectorAll(".pielayer .slice");
      expect(slices.length).toBe(5);
    });
    await step("Legend shows parameter labels", async () => {
      const legendRoot = canvasElement.querySelector(".legend-container");
      expect(legendRoot).toBeTruthy();
      const legend = within(legendRoot as HTMLElement);
      expect(legend.getByText("pH")).toBeInTheDocument();
      expect(legend.getByText("Dissolved Oxygen")).toBeInTheDocument();
    });
  }
}`,...B.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: "Donut Chart",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T1014"
    }
  },
  args: {
    dataSeries: {
      labels: ["pH", "Temperature", "Dissolved Oxygen", "Cell Density", "Viability"],
      values: [12, 23, 35, 18, 12],
      name: "Bioreactor Parameters"
    },
    title: "Bioreactor Parameter Distribution (Donut)",
    width: 480,
    height: 480,
    textInfo: "label+percent",
    hole: 0.5,
    rotation: 0
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Bioreactor Parameter Distribution (Donut)")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Pie layer and slices render", async () => {
      expect(canvasElement.querySelector(".pielayer")).toBeInTheDocument();
      const slices = canvasElement.querySelectorAll(".pielayer .slice");
      expect(slices.length).toBe(5);
    });
    await step("Legend shows parameter labels", async () => {
      const legendRoot = canvasElement.querySelector(".legend-container");
      expect(legendRoot).toBeTruthy();
      const legend = within(legendRoot as HTMLElement);
      expect(legend.getByText("Viability")).toBeInTheDocument();
      expect(legend.getByText("Cell Density")).toBeInTheDocument();
    });
  }
}`,...T.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  name: "With Label And Values",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T1015"
    }
  },
  args: {
    dataSeries: {
      labels: ["pH", "Temperature", "Dissolved Oxygen", "Cell Density", "Viability"],
      values: [12, 23, 35, 18, 12],
      name: "Bioreactor Parameters"
    },
    title: "Bioreactor Parameter Distribution",
    width: 480,
    height: 480,
    textInfo: "label+value",
    hole: 0,
    rotation: 0
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Bioreactor Parameter Distribution")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Pie layer and slices render", async () => {
      expect(canvasElement.querySelector(".pielayer")).toBeInTheDocument();
      const slices = canvasElement.querySelectorAll(".pielayer .slice");
      expect(slices.length).toBe(5);
    });
    await step("Legend shows parameter labels", async () => {
      const legendRoot = canvasElement.querySelector(".legend-container");
      expect(legendRoot).toBeTruthy();
      const legend = within(legendRoot as HTMLElement);
      expect(legend.getByText("pH")).toBeInTheDocument();
      expect(legend.getByText("Temperature")).toBeInTheDocument();
    });
  }
}`,...D.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: "With Rotation",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T1016"
    }
  },
  args: {
    dataSeries: {
      labels: ["pH", "Temperature", "Dissolved Oxygen", "Cell Density", "Viability"],
      values: [12, 23, 35, 18, 12],
      name: "Bioreactor Parameters"
    },
    title: "Bioreactor Parameter Distribution (Rotated)",
    width: 480,
    height: 480,
    textInfo: "percent",
    hole: 0,
    rotation: 45
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Bioreactor Parameter Distribution (Rotated)")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Pie layer and slices render", async () => {
      expect(canvasElement.querySelector(".pielayer")).toBeInTheDocument();
      const slices = canvasElement.querySelectorAll(".pielayer .slice");
      expect(slices.length).toBe(5);
    });
    await step("Legend shows parameter labels", async () => {
      const legendRoot = canvasElement.querySelector(".legend-container");
      expect(legendRoot).toBeTruthy();
      const legend = within(legendRoot as HTMLElement);
      expect(legend.getByText("Dissolved Oxygen")).toBeInTheDocument();
      expect(legend.getByText("Cell Density")).toBeInTheDocument();
    });
  }
}`,...x.parameters?.docs?.source}}};const z=["Default","WithCustomColors","DonutChart","WithLabelAndValues","WithRotation"];export{g as Default,T as DonutChart,B as WithCustomColors,D as WithLabelAndValues,x as WithRotation,z as __namedExportsOrder,H as default};
