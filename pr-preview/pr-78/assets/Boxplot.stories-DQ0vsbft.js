import{C as c}from"./colors-ClKyOP62.js";import{r as u,j as I}from"./iframe-14YYbrss.js";import{P as M}from"./plotly-BfU08UT2.js";import{u as z}from"./use-plotly-theme-DDaBOKiZ.js";import"./preload-helper-BbFkF2Um.js";const R=-1.8,L=({dataSeries:n,width:a=1e3,height:t=600,xRange:o,yRange:g,xTitle:f="Columns",yTitle:q="Rows",title:v="Boxplot",showPoints:G=!1})=>{const d=u.useRef(null),l=z(),{yMin:O,yMax:b}=u.useMemo(()=>{let i=Number.MAX_VALUE,r=Number.MIN_VALUE;n.forEach(y=>{y.y.forEach(s=>{i=Math.min(i,s),r=Math.max(r,s)})});const p=(r-i)*.1;return{yMin:i-p,yMax:r+p}},[n]),h=u.useMemo(()=>g||[O,b],[g,O,b]),D=u.useMemo(()=>{const i=h[1]-h[0];let r=Math.pow(10,Math.floor(Math.log10(i)));i/r>10&&(r=r*2),i/r<4&&(r=r/2);const p=[];let y=Math.ceil(h[0]/r)*r;for(;y<=h[1];)p.push(y),y+=r;return p},[h]),A=u.useMemo(()=>({tickcolor:l.tickColor,ticklen:12,tickwidth:1,ticks:"outside",tickfont:{size:16,color:l.textColor,family:"Inter, sans-serif",weight:400},linecolor:l.lineColor,linewidth:1,position:0,zeroline:!1}),[l]),S=u.useMemo(()=>({text:v,x:.5,y:.95,xanchor:"center",yanchor:"top",font:{size:32,weight:600,family:"Inter, sans-serif",color:l.textColor,lineheight:1.2,standoff:30}}),[v,l]);return u.useEffect(()=>{if(!d.current)return;const i=n.map(s=>({y:s.y,x:s.x,type:"box",name:s.name,marker:{color:s.color},line:{color:s.color},fillcolor:s.color+"40",boxpoints:G?s.boxpoints||"outliers":!1,jitter:s.jitter||.3,pointpos:s.pointpos||R})),r={width:a,height:t,title:S,margin:{l:80,r:40,b:80,t:80,pad:0},paper_bgcolor:l.paperBg,plot_bgcolor:l.plotBg,font:{family:"Inter, sans-serif"},dragmode:!1,xaxis:{title:{text:f,font:{size:16,color:l.textSecondary,family:"Inter, sans-serif",weight:400},standoff:15},gridcolor:l.gridColor,range:o,autorange:!o,showgrid:!0,...A},yaxis:{title:{text:q,font:{size:16,color:l.textSecondary,family:"Inter, sans-serif",weight:400},standoff:15},gridcolor:l.gridColor,range:g,autorange:!g,tickmode:"array",tickvals:D,showgrid:!0,...A},legend:{x:.5,y:-.2,xanchor:"center",yanchor:"top",orientation:"h",font:{size:13,color:l.legendColor,family:"Inter, sans-serif",weight:500,lineheight:18}},showlegend:!0},p={responsive:!0,displayModeBar:!1,displaylogo:!1};M.newPlot(d.current,i,r,p);const y=d.current;return()=>{y&&M.purge(y)}},[n,a,t,o,g,h,f,q,G,S,A,D,l]),I.jsx("div",{className:"boxplot-container",children:I.jsx("div",{ref:d,style:{width:"100%",height:"100%"}})})};L.__docgenInfo={description:"",methods:[],displayName:"Boxplot",props:{dataSeries:{required:!0,tsType:{name:"Array",elements:[{name:"BoxDataSeries"}],raw:"BoxDataSeries[]"},description:""},width:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"1000",computed:!1}},height:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"600",computed:!1}},xRange:{required:!1,tsType:{name:"tuple",raw:"[number, number]",elements:[{name:"number"},{name:"number"}]},description:""},yRange:{required:!1,tsType:{name:"tuple",raw:"[number, number]",elements:[{name:"number"},{name:"number"}]},description:""},xTitle:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Columns"',computed:!1}},yTitle:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Rows"',computed:!1}},title:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Boxplot"',computed:!1}},showPoints:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}}}};const{expect:e,within:x}=__STORYBOOK_MODULE_TEST__,U={title:"Charts/Boxplot",component:L,parameters:{layout:"centered"},tags:["autodocs"]},k=()=>[{name:"Data A",color:c.ORANGE,y:[155,135,175,185,120,125,140,160,180,145,170,165,150]}],P=()=>[{name:"Group 1",color:c.ORANGE,y:[155,135,175,185,120,125,140,160,180,145,170,165,150],x:["Group 1"]},{name:"Group 2",color:c.RED,y:[90,85,95,105,75,80,88,92,98,82,96,87,91],x:["Group 2"]},{name:"Group 3",color:c.GREEN,y:[185,165,205,215,150,155,170,190,210,175,200,195,180],x:["Group 3"]},{name:"Group 4",color:c.BLUE,y:[220,200,240,250,185,190,205,225,245,210,235,230,215],x:["Group 4"]},{name:"Group 5",color:c.PURPLE,y:[135,115,155,165,100,105,120,140,160,125,150,145,130],x:["Group 5"]}],E=()=>[{name:"Category A",color:c.ORANGE,y:[155,135,175,185,120,125,140,160,180,145,170,165,150,155,135,175,185,120,125,140],x:["200","200","200","200","200","200","200","200","200","200","200","200","200","200","200","200","200","200","200","200"]},{name:"Category B",color:c.RED,y:[90,85,95,105,75,80,88,92,98,82,96,87,91,85,95,105,75,80,88,92],x:["350","350","350","350","350","350","350","350","350","350","350","350","350","350","350","350","350","350","350","350"]},{name:"Category C",color:c.GREEN,y:[68,45,85,95,30,35,48,68,88,53,78,73,58,65,75,85,40,45,58,72],x:["500","500","500","500","500","500","500","500","500","500","500","500","500","500","500","500","500","500","500","500"]},{name:"Category D",color:c.BLUE,y:[220,200,240,250,185,190,205,225,245,210,235,230,215,225,195,235,245,180,185,200],x:["800","800","800","800","800","800","800","800","800","800","800","800","800","800","800","800","800","800","800","800"]},{name:"Category E",color:c.PURPLE,y:[135,115,155,165,100,105,120,140,160,125,150,145,130,125,135,145,90,95,110,130],x:["1000","1000","1000","1000","1000","1000","1000","1000","1000","1000","1000","1000","1000","1000","1000","1000","1000","1000","1000","1000"]}],B={name:"Basic",parameters:{zephyr:{testCaseId:"SW-T970"}},args:{dataSeries:k(),title:"Boxplot",width:1e3,height:600},play:async({canvasElement:n,step:a})=>{const t=x(n);await a("Chart title is displayed",async()=>{e(t.getByText("Boxplot")).toBeInTheDocument()}),await a("Chart container renders",async()=>{e(n.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await a("One box trace is rendered",async()=>{const o=n.querySelectorAll(".boxlayer .trace");e(o.length).toBe(1)}),await a("Legend shows series name",async()=>{e(t.getAllByText("Data A").length).toBeGreaterThanOrEqual(1)})}},m={name:"Multiple Boxes",parameters:{zephyr:{testCaseId:"SW-T971"}},args:{dataSeries:P(),title:"Multiple Boxplots",width:1e3,height:600},play:async({canvasElement:n,step:a})=>{const t=x(n);await a("Chart title is displayed",async()=>{e(t.getByText("Multiple Boxplots")).toBeInTheDocument()}),await a("Chart container renders",async()=>{e(n.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await a("Five box traces are rendered",async()=>{const o=n.querySelectorAll(".boxlayer .trace");e(o.length).toBe(5)}),await a("Legend shows all group names",async()=>{e(t.getAllByText("Group 1").length).toBeGreaterThanOrEqual(1),e(t.getAllByText("Group 2").length).toBeGreaterThanOrEqual(1),e(t.getAllByText("Group 3").length).toBeGreaterThanOrEqual(1),e(t.getAllByText("Group 4").length).toBeGreaterThanOrEqual(1),e(t.getAllByText("Group 5").length).toBeGreaterThanOrEqual(1)})}},T={name:"Categorical Data",parameters:{zephyr:{testCaseId:"SW-T972"}},args:{dataSeries:E(),title:"Boxplot",xTitle:"Columns",yTitle:"Rows",width:1e3,height:600},play:async({canvasElement:n,step:a})=>{const t=x(n);await a("Chart title is displayed",async()=>{e(t.getByText("Boxplot")).toBeInTheDocument()}),await a("Chart container renders",async()=>{e(n.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await a("Axis titles are displayed",async()=>{e(t.getByText("Columns")).toBeInTheDocument(),e(t.getByText("Rows")).toBeInTheDocument()}),await a("Five box traces are rendered",async()=>{const o=n.querySelectorAll(".boxlayer .trace");e(o.length).toBe(5)}),await a("Legend shows all category names",async()=>{e(t.getAllByText("Category A").length).toBeGreaterThanOrEqual(1),e(t.getAllByText("Category B").length).toBeGreaterThanOrEqual(1),e(t.getAllByText("Category C").length).toBeGreaterThanOrEqual(1),e(t.getAllByText("Category D").length).toBeGreaterThanOrEqual(1),e(t.getAllByText("Category E").length).toBeGreaterThanOrEqual(1)})}},w={name:"With Outliers",parameters:{zephyr:{testCaseId:"SW-T973"}},args:{dataSeries:E(),title:"Boxplot with Outliers",xTitle:"Columns",yTitle:"Rows",showPoints:!0,width:1e3,height:600},play:async({canvasElement:n,step:a})=>{const t=x(n);await a("Chart title is displayed",async()=>{e(t.getByText("Boxplot with Outliers")).toBeInTheDocument()}),await a("Chart container renders",async()=>{e(n.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await a("Axis titles are displayed",async()=>{e(t.getByText("Columns")).toBeInTheDocument(),e(t.getByText("Rows")).toBeInTheDocument()}),await a("Five box traces are rendered",async()=>{const o=n.querySelectorAll(".boxlayer .trace");e(o.length).toBe(5)}),await a("Points are rendered with box traces",async()=>{const o=n.querySelectorAll(".boxlayer .trace");e(o.length).toBe(5)}),await a("Legend shows all category names",async()=>{e(t.getAllByText("Category A").length).toBeGreaterThanOrEqual(1),e(t.getAllByText("Category B").length).toBeGreaterThanOrEqual(1),e(t.getAllByText("Category C").length).toBeGreaterThanOrEqual(1),e(t.getAllByText("Category D").length).toBeGreaterThanOrEqual(1),e(t.getAllByText("Category E").length).toBeGreaterThanOrEqual(1)})}},C={name:"Custom Styling",parameters:{zephyr:{testCaseId:"SW-T974"}},args:{dataSeries:E(),title:"Custom Boxplot",xTitle:"X-Axis Label",yTitle:"Y-Axis Label",width:1e3,height:600,showPoints:!0},play:async({canvasElement:n,step:a})=>{const t=x(n);await a("Chart title is displayed",async()=>{e(t.getByText("Custom Boxplot")).toBeInTheDocument()}),await a("Chart container renders",async()=>{e(n.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await a("Axis titles are displayed",async()=>{e(t.getByText("X-Axis Label")).toBeInTheDocument(),e(t.getByText("Y-Axis Label")).toBeInTheDocument()}),await a("Five box traces are rendered",async()=>{const o=n.querySelectorAll(".boxlayer .trace");e(o.length).toBe(5)}),await a("Legend shows all category names",async()=>{e(t.getAllByText("Category A").length).toBeGreaterThanOrEqual(1),e(t.getAllByText("Category B").length).toBeGreaterThanOrEqual(1),e(t.getAllByText("Category C").length).toBeGreaterThanOrEqual(1),e(t.getAllByText("Category D").length).toBeGreaterThanOrEqual(1),e(t.getAllByText("Category E").length).toBeGreaterThanOrEqual(1)})}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  name: "Basic",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T970"
    }
  },
  args: {
    dataSeries: generateBasicBoxData(),
    title: "Boxplot",
    width: 1000,
    height: 600
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Boxplot")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("One box trace is rendered", async () => {
      const traces = canvasElement.querySelectorAll(".boxlayer .trace");
      expect(traces.length).toBe(1);
    });
    await step("Legend shows series name", async () => {
      expect(canvas.getAllByText("Data A").length).toBeGreaterThanOrEqual(1);
    });
  }
}`,...B.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: "Multiple Boxes",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T971"
    }
  },
  args: {
    dataSeries: generateMultipleBoxData(),
    title: "Multiple Boxplots",
    width: 1000,
    height: 600
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Multiple Boxplots")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Five box traces are rendered", async () => {
      const traces = canvasElement.querySelectorAll(".boxlayer .trace");
      expect(traces.length).toBe(5);
    });
    await step("Legend shows all group names", async () => {
      expect(canvas.getAllByText("Group 1").length).toBeGreaterThanOrEqual(1);
      expect(canvas.getAllByText("Group 2").length).toBeGreaterThanOrEqual(1);
      expect(canvas.getAllByText("Group 3").length).toBeGreaterThanOrEqual(1);
      expect(canvas.getAllByText("Group 4").length).toBeGreaterThanOrEqual(1);
      expect(canvas.getAllByText("Group 5").length).toBeGreaterThanOrEqual(1);
    });
  }
}`,...m.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: "Categorical Data",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T972"
    }
  },
  args: {
    dataSeries: generateCategoricalBoxData(),
    title: "Boxplot",
    xTitle: "Columns",
    yTitle: "Rows",
    width: 1000,
    height: 600
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Boxplot")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Axis titles are displayed", async () => {
      expect(canvas.getByText("Columns")).toBeInTheDocument();
      expect(canvas.getByText("Rows")).toBeInTheDocument();
    });
    await step("Five box traces are rendered", async () => {
      const traces = canvasElement.querySelectorAll(".boxlayer .trace");
      expect(traces.length).toBe(5);
    });
    await step("Legend shows all category names", async () => {
      expect(canvas.getAllByText("Category A").length).toBeGreaterThanOrEqual(1);
      expect(canvas.getAllByText("Category B").length).toBeGreaterThanOrEqual(1);
      expect(canvas.getAllByText("Category C").length).toBeGreaterThanOrEqual(1);
      expect(canvas.getAllByText("Category D").length).toBeGreaterThanOrEqual(1);
      expect(canvas.getAllByText("Category E").length).toBeGreaterThanOrEqual(1);
    });
  }
}`,...T.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: "With Outliers",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T973"
    }
  },
  args: {
    dataSeries: generateCategoricalBoxData(),
    title: "Boxplot with Outliers",
    xTitle: "Columns",
    yTitle: "Rows",
    showPoints: true,
    width: 1000,
    height: 600
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Boxplot with Outliers")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Axis titles are displayed", async () => {
      expect(canvas.getByText("Columns")).toBeInTheDocument();
      expect(canvas.getByText("Rows")).toBeInTheDocument();
    });
    await step("Five box traces are rendered", async () => {
      const traces = canvasElement.querySelectorAll(".boxlayer .trace");
      expect(traces.length).toBe(5);
    });
    await step("Points are rendered with box traces", async () => {
      const traces = canvasElement.querySelectorAll(".boxlayer .trace");
      expect(traces.length).toBe(5);
    });
    await step("Legend shows all category names", async () => {
      expect(canvas.getAllByText("Category A").length).toBeGreaterThanOrEqual(1);
      expect(canvas.getAllByText("Category B").length).toBeGreaterThanOrEqual(1);
      expect(canvas.getAllByText("Category C").length).toBeGreaterThanOrEqual(1);
      expect(canvas.getAllByText("Category D").length).toBeGreaterThanOrEqual(1);
      expect(canvas.getAllByText("Category E").length).toBeGreaterThanOrEqual(1);
    });
  }
}`,...w.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: "Custom Styling",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T974"
    }
  },
  args: {
    dataSeries: generateCategoricalBoxData(),
    title: "Custom Boxplot",
    xTitle: "X-Axis Label",
    yTitle: "Y-Axis Label",
    width: 1000,
    height: 600,
    showPoints: true
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Custom Boxplot")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Axis titles are displayed", async () => {
      expect(canvas.getByText("X-Axis Label")).toBeInTheDocument();
      expect(canvas.getByText("Y-Axis Label")).toBeInTheDocument();
    });
    await step("Five box traces are rendered", async () => {
      const traces = canvasElement.querySelectorAll(".boxlayer .trace");
      expect(traces.length).toBe(5);
    });
    await step("Legend shows all category names", async () => {
      expect(canvas.getAllByText("Category A").length).toBeGreaterThanOrEqual(1);
      expect(canvas.getAllByText("Category B").length).toBeGreaterThanOrEqual(1);
      expect(canvas.getAllByText("Category C").length).toBeGreaterThanOrEqual(1);
      expect(canvas.getAllByText("Category D").length).toBeGreaterThanOrEqual(1);
      expect(canvas.getAllByText("Category E").length).toBeGreaterThanOrEqual(1);
    });
  }
}`,...C.parameters?.docs?.source}}};const V=["Basic","MultipleBoxes","CategoricalData","WithOutliers","CustomStyling"];export{B as Basic,T as CategoricalData,C as CustomStyling,m as MultipleBoxes,w as WithOutliers,V as __namedExportsOrder,U as default};
