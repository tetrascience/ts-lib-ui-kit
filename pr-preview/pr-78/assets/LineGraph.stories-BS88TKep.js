import{C as r}from"./colors-ClKyOP62.js";import{r as d,j as X}from"./iframe-14YYbrss.js";import{P as U}from"./plotly-BfU08UT2.js";import{u as J}from"./use-plotly-theme-DDaBOKiZ.js";import"./preload-helper-BbFkF2Um.js";const V=({dataSeries:t,width:e=1e3,height:n=600,xRange:h,yRange:u,variant:g="lines",xTitle:z="Columns",yTitle:M="Rows",title:N="Line Graph"})=>{const B=d.useRef(null),o=J(),{yMin:j,yMax:F}=d.useMemo(()=>{let i=Number.MAX_VALUE,s=Number.MIN_VALUE,m=Number.MAX_VALUE,y=Number.MIN_VALUE;t.forEach(Y=>{Y.x.forEach(T=>{i=Math.min(i,T),s=Math.max(s,T)}),Y.y.forEach(T=>{m=Math.min(m,T),y=Math.max(y,T)})});const l=(s-i)*.1,P=(y-m)*.1;return{xMin:i-l,xMax:s+l,yMin:m-P,yMax:y+P}},[t]),p=d.useMemo(()=>u||[j,F],[u,j,F]),O=d.useMemo(()=>{const i=p[1]-p[0];let s=Math.pow(10,Math.floor(Math.log10(i)));i/s>10&&(s=s*2),i/s<4&&(s=s/2);const m=[];let y=Math.ceil(p[0]/s)*s;for(;y<=p[1];)m.push(y),y+=s;return m},[p]),q=d.useMemo(()=>[...new Set(t.flatMap(i=>i.x))],[t]),_=d.useMemo(()=>{switch(g){case"lines+markers":case"lines+markers+error_bars":return"lines+markers";default:return"lines"}},[g]),G=d.useMemo(()=>({tickcolor:o.tickColor,ticklen:12,tickwidth:1,ticks:"outside",tickfont:{size:16,color:o.textColor,family:"Inter, sans-serif",weight:400},linecolor:o.lineColor,linewidth:1,position:0,zeroline:!1}),[o]);return d.useEffect(()=>{if(!B.current)return;const i=t.map(l=>({x:l.x,y:l.y,type:"scatter",mode:_,name:l.name,line:{color:l.color,width:1.5},marker:g==="lines"?{opacity:0}:{color:l.color,size:8,symbol:l.symbol||"triangle-up"},error_y:g==="lines+markers+error_bars"?l.error_y||{type:"data",array:l.y.map(()=>10),visible:!0,color:l.color,thickness:1,width:5}:void 0})),s={title:{text:N,font:{size:32,family:"Inter, sans-serif",color:o.textColor}},width:e,height:n,margin:{l:80,r:30,b:80,t:60,pad:10},paper_bgcolor:o.paperBg,plot_bgcolor:o.plotBg,font:{family:"Inter, sans-serif"},dragmode:!1,xaxis:{title:{text:z,font:{size:16,color:o.textSecondary,family:"Inter, sans-serif",weight:400},standoff:32},gridcolor:o.gridColor,range:h,autorange:!h,tickmode:"array",tickvals:q,ticktext:q.map(String),showgrid:!0,...G},yaxis:{title:{text:M,font:{size:16,color:o.textSecondary,family:"Inter, sans-serif",weight:400},standoff:30},gridcolor:o.gridColor,range:u,autorange:!u,tickmode:"array",tickvals:O,showgrid:!0,...G},legend:{x:.5,y:-.2,xanchor:"center",yanchor:"top",orientation:"h",font:{size:16,color:o.legendColor,family:"Inter, sans-serif",weight:500}},showlegend:!0},m={responsive:!0,displayModeBar:!1,displaylogo:!1};U.newPlot(B.current,i,s,m);const y=B.current;return()=>{y&&U.purge(y)}},[t,e,n,h,u,z,M,N,_,G,q,O,p,g,o]),X.jsx("div",{className:"chart-container",children:X.jsx("div",{ref:B,style:{width:"100%",height:"100%"}})})};V.__docgenInfo={description:"",methods:[],displayName:"LineGraph",props:{dataSeries:{required:!0,tsType:{name:"Array",elements:[{name:"LineDataSeries"}],raw:"LineDataSeries[]"},description:""},width:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"1000",computed:!1}},height:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"600",computed:!1}},xRange:{required:!1,tsType:{name:"tuple",raw:"[number, number]",elements:[{name:"number"},{name:"number"}]},description:""},yRange:{required:!1,tsType:{name:"tuple",raw:"[number, number]",elements:[{name:"number"},{name:"number"}]},description:""},variant:{required:!1,tsType:{name:"union",raw:'"lines" | "lines+markers" | "lines+markers+error_bars"',elements:[{name:"literal",value:'"lines"'},{name:"literal",value:'"lines+markers"'},{name:"literal",value:'"lines+markers+error_bars"'}]},description:"",defaultValue:{value:'"lines"',computed:!1}},xTitle:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Columns"',computed:!1}},yTitle:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Rows"',computed:!1}},title:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Line Graph"',computed:!1}}}};const{expect:a,within:c}=__STORYBOOK_MODULE_TEST__,W=()=>{const t=[200,300,400,500,600,700,800,900,1e3];return[{name:"Data A",color:r.ORANGE,x:t,y:[75,140,105,120,145,115,110,80,90]},{name:"Data B",color:r.RED,x:t,y:[125,160,115,145,190,180,120,105,110]},{name:"Data C",color:r.GREEN,x:t,y:[185,195,145,215,205,200,160,145,135]},{name:"Data D",color:r.BLUE,x:t,y:[225,215,210,245,230,230,200,185,190]},{name:"Data E",color:r.YELLOW,x:t,y:[245,260,235,265,250,250,220,220,225]},{name:"Data F",color:r.PURPLE,x:t,y:[275,295,270,285,300,300,250,255,260]}]},Z=()=>{const t=[0,125,250,375,500,625,750,875,1e3],e=(n,h)=>Math.round(Math.random()*(h-n)+n);return[{name:"Data A",color:r.ORANGE,symbol:"circle",x:t,y:[0,e(40,80),e(90,120),e(110,140),e(130,160),e(110,140),e(100,130),e(70,100),e(80,110)]},{name:"Data B",color:r.RED,symbol:"square",x:t,y:[e(20,60),e(80,120),e(110,140),e(130,170),e(170,200),e(160,190),e(110,140),e(90,120),e(100,130)]},{name:"Data C",color:r.GREEN,symbol:"diamond",x:t,y:[0,e(70,110),e(120,160),e(180,230),e(170,220),e(170,220),e(130,180),e(120,170),e(110,160)]},{name:"Data D",color:r.BLUE,symbol:"triangle-up",x:t,y:[e(30,80),e(100,150),e(150,200),e(220,270),e(200,250),e(200,250),e(170,220),e(150,200),e(160,210)]},{name:"Data E",color:r.YELLOW,symbol:"triangle-down",x:t,y:[0,e(120,160),e(170,210),e(240,280),e(220,260),e(220,260),e(190,230),e(190,230),e(200,240)]},{name:"Data F",color:r.PURPLE,symbol:"pentagon",x:t,y:[e(50,100),e(140,180),e(190,230),e(260,300),e(270,310),e(270,310),e(220,260),e(230,270),e(240,280)]}]},K=()=>{const t=[50,200,350,500,650,800,950,1100,1250];return[{name:"Data A",color:r.ORANGE,symbol:"circle",x:t,y:[20,35,30,45,25,40,30,20,25]},{name:"Data B",color:r.RED,symbol:"square",x:t,y:[120,140,130,145,160,150,135,125,155]},{name:"Data C",color:r.GREEN,symbol:"diamond",x:t,y:[320,360,340,380,350,370,330,345,355]}]},H=()=>{const t=[400,425,450,475,500,525,550,575,600];return[{name:"Data A",color:r.ORANGE,symbol:"circle",x:t,y:[160,158,165,162,170,168,172,165,175]},{name:"Data B",color:r.RED,symbol:"square",x:t,y:[180,182,178,185,183,188,186,184,190]},{name:"Data C",color:r.GREEN,symbol:"diamond",x:t,y:[200,198,204,202,208,205,210,207,212]}]},k=()=>{const t=[200,300,400,500,600,700,800,900,1e3];return[{name:"Data A",color:r.ORANGE,symbol:"circle",x:t,y:[75,140,105,120,145,115,110,80,90]},{name:"Data B",color:r.RED,symbol:"square",x:t,y:[125,160,115,145,190,180,120,105,110]},{name:"Data C",color:r.GREEN,symbol:"diamond",x:t,y:[185,195,145,215,205,200,160,145,135]},{name:"Data D",color:r.BLUE,symbol:"triangle-up",x:t,y:[225,215,210,245,230,230,200,185,190]},{name:"Data E",color:r.YELLOW,symbol:"triangle-down",x:t,y:[245,260,235,265,250,250,220,220,225]},{name:"Data F",color:r.PURPLE,symbol:"pentagon",x:t,y:[275,295,270,285,300,300,250,255,260]}]},Q=()=>k().map(e=>({...e,error_y:{type:"data",array:e.y.map(()=>10),visible:!0}})),re={title:"Charts/LineGraph",component:V,parameters:{layout:"centered"},tags:["autodocs"]},x={name:"Basic",parameters:{zephyr:{testCaseId:"SW-T998"}},args:{dataSeries:W(),title:"Basic Line Graph"},play:async({canvasElement:t,step:e})=>{const n=c(t);await e("Chart title is displayed",async()=>{a(n.getByText("Basic Line Graph")).toBeInTheDocument()}),await e("Chart container renders",async()=>{a(t.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await e("6 traces are rendered",async()=>{a(t.querySelectorAll(".scatterlayer .trace").length).toBe(6)}),await e("Legend shows series names",async()=>{a(n.getByText("Data A")).toBeInTheDocument(),a(n.getByText("Data F")).toBeInTheDocument()})}},w={name:"With Markers",parameters:{zephyr:{testCaseId:"SW-T999"}},args:{dataSeries:Z(),variant:"lines+markers",title:"Line Graph with Markers"},play:async({canvasElement:t,step:e})=>{const n=c(t);await e("Chart title is displayed",async()=>{a(n.getByText("Line Graph with Markers")).toBeInTheDocument()}),await e("Chart container renders",async()=>{a(t.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await e("6 traces are rendered",async()=>{a(t.querySelectorAll(".scatterlayer .trace").length).toBe(6)}),await e("Legend shows series names",async()=>{a(n.getByText("Data A")).toBeInTheDocument(),a(n.getByText("Data F")).toBeInTheDocument()})}},D={name:"With Error Bars",parameters:{zephyr:{testCaseId:"SW-T1000"}},args:{dataSeries:Q(),variant:"lines+markers+error_bars",title:"Line Graph with Error Bars"},play:async({canvasElement:t,step:e})=>{const n=c(t);await e("Chart title is displayed",async()=>{a(n.getByText("Line Graph with Error Bars")).toBeInTheDocument()}),await e("Chart container renders",async()=>{a(t.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await e("6 traces are rendered",async()=>{a(t.querySelectorAll(".scatterlayer .trace").length).toBe(6)}),await e("Legend shows series names",async()=>{a(n.getByText("Data A")).toBeInTheDocument(),a(n.getByText("Data F")).toBeInTheDocument()})}},I={name:"Wide Range",parameters:{zephyr:{testCaseId:"SW-T1001"}},args:{dataSeries:K(),variant:"lines+markers",title:"Wide Range Data Graph"},play:async({canvasElement:t,step:e})=>{const n=c(t);await e("Chart title is displayed",async()=>{a(n.getByText("Wide Range Data Graph")).toBeInTheDocument()}),await e("Chart container renders",async()=>{a(t.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await e("3 traces are rendered",async()=>{a(t.querySelectorAll(".scatterlayer .trace").length).toBe(3)}),await e("Legend shows series names",async()=>{a(n.getByText("Data A")).toBeInTheDocument(),a(n.getByText("Data B")).toBeInTheDocument(),a(n.getByText("Data C")).toBeInTheDocument()})}},v={name:"Narrow Range",parameters:{zephyr:{testCaseId:"SW-T1002"}},args:{dataSeries:H(),variant:"lines+markers",title:"Narrow Range Data Graph"},play:async({canvasElement:t,step:e})=>{const n=c(t);await e("Chart title is displayed",async()=>{a(n.getByText("Narrow Range Data Graph")).toBeInTheDocument()}),await e("Chart container renders",async()=>{a(t.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await e("3 traces are rendered",async()=>{a(t.querySelectorAll(".scatterlayer .trace").length).toBe(3)}),await e("Legend shows series names",async()=>{a(n.getByText("Data A")).toBeInTheDocument(),a(n.getByText("Data B")).toBeInTheDocument(),a(n.getByText("Data C")).toBeInTheDocument()})}},C={name:"Custom Axes",parameters:{zephyr:{testCaseId:"SW-T1003"}},args:{dataSeries:W(),xTitle:"Time (s)",yTitle:"Temperature (°C)",title:"Temperature Over Time"},play:async({canvasElement:t,step:e})=>{const n=c(t);await e("Chart title is displayed",async()=>{a(n.getByText("Temperature Over Time")).toBeInTheDocument()}),await e("Chart container renders",async()=>{a(t.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await e("6 traces are rendered",async()=>{a(t.querySelectorAll(".scatterlayer .trace").length).toBe(6)}),await e("Axis titles are displayed",async()=>{a(n.getByText("Time (s)")).toBeInTheDocument(),a(n.getByText("Temperature (°C)")).toBeInTheDocument()}),await e("Legend shows series names",async()=>{a(n.getByText("Data A")).toBeInTheDocument(),a(n.getByText("Data F")).toBeInTheDocument()})}},S={name:"Custom Range",parameters:{zephyr:{testCaseId:"SW-T1004"}},args:{dataSeries:W(),xRange:[300,800],yRange:[100,300],title:"Custom Range Graph"},play:async({canvasElement:t,step:e})=>{const n=c(t);await e("Chart title is displayed",async()=>{a(n.getByText("Custom Range Graph")).toBeInTheDocument()}),await e("Chart container renders",async()=>{a(t.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await e("6 traces are rendered",async()=>{a(t.querySelectorAll(".scatterlayer .trace").length).toBe(6)}),await e("Legend shows series names",async()=>{a(n.getByText("Data A")).toBeInTheDocument(),a(n.getByText("Data F")).toBeInTheDocument()})}},A={name:"Auto Range Line Graph",args:{width:1e3,height:600,dataSeries:k(),variant:"lines+markers",xTitle:"Columns",yTitle:"Rows"},play:async({canvasElement:t,step:e})=>{const n=c(t);await e("Chart title is displayed",async()=>{a(n.getByText("Line Graph")).toBeInTheDocument()}),await e("Chart container renders",async()=>{a(t.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await e("6 traces are rendered",async()=>{a(t.querySelectorAll(".scatterlayer .trace").length).toBe(6)}),await e("Axis titles are displayed",async()=>{a(n.getByText("Columns")).toBeInTheDocument(),a(n.getByText("Rows")).toBeInTheDocument()}),await e("Legend shows series names",async()=>{a(n.getByText("Data A")).toBeInTheDocument(),a(n.getByText("Data F")).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1005"},docs:{description:{story:"This story demonstrates how the LineGraph automatically calculates appropriate ranges when none are provided."}}}},R={name:"Wide Range Auto Scaled",args:{width:1e3,height:600,dataSeries:K(),variant:"lines+markers",xTitle:"Columns",yTitle:"Rows"},play:async({canvasElement:t,step:e})=>{const n=c(t);await e("Chart title is displayed",async()=>{a(n.getByText("Line Graph")).toBeInTheDocument()}),await e("Chart container renders",async()=>{a(t.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await e("3 traces are rendered",async()=>{a(t.querySelectorAll(".scatterlayer .trace").length).toBe(3)}),await e("Axis titles are displayed",async()=>{a(n.getByText("Columns")).toBeInTheDocument(),a(n.getByText("Rows")).toBeInTheDocument()}),await e("Legend shows series names",async()=>{a(n.getByText("Data A")).toBeInTheDocument(),a(n.getByText("Data C")).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1006"},docs:{description:{story:"A graph with a wider data range, demonstrating how the LineGraph adapts its scales automatically."}}}},L={name:"Narrow Range Auto Scaled",args:{width:1e3,height:600,dataSeries:H(),variant:"lines+markers",xTitle:"Columns",yTitle:"Rows"},play:async({canvasElement:t,step:e})=>{const n=c(t);await e("Chart title is displayed",async()=>{a(n.getByText("Line Graph")).toBeInTheDocument()}),await e("Chart container renders",async()=>{a(t.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await e("3 traces are rendered",async()=>{a(t.querySelectorAll(".scatterlayer .trace").length).toBe(3)}),await e("Axis titles are displayed",async()=>{a(n.getByText("Columns")).toBeInTheDocument(),a(n.getByText("Rows")).toBeInTheDocument()}),await e("Legend shows series names",async()=>{a(n.getByText("Data A")).toBeInTheDocument(),a(n.getByText("Data C")).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1007"},docs:{description:{story:"A graph with a narrower data range, showing how the LineGraph adapts to focused data."}}}},E={name:"Only X Range Provided",parameters:{zephyr:{testCaseId:"SW-T1008"},docs:{description:{story:"In this example, only the X-axis range is provided, while the Y-axis uses autorange."}}},args:{width:1e3,height:600,dataSeries:k(),variant:"lines+markers",xRange:[150,1050],xTitle:"Columns",yTitle:"Rows"},play:async({canvasElement:t,step:e})=>{const n=c(t);await e("Chart title is displayed",async()=>{a(n.getByText("Line Graph")).toBeInTheDocument()}),await e("Chart container renders",async()=>{a(t.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await e("6 traces are rendered",async()=>{a(t.querySelectorAll(".scatterlayer .trace").length).toBe(6)}),await e("Axis titles are displayed",async()=>{a(n.getByText("Columns")).toBeInTheDocument(),a(n.getByText("Rows")).toBeInTheDocument()}),await e("Legend shows series names",async()=>{a(n.getByText("Data A")).toBeInTheDocument(),a(n.getByText("Data F")).toBeInTheDocument()})}},b={name:"Only Y Range Provided",parameters:{zephyr:{testCaseId:"SW-T1009"},docs:{description:{story:"In this example, only the Y-axis range is provided, while the X-axis uses autorange."}}},args:{width:1e3,height:600,dataSeries:k(),variant:"lines+markers",yRange:[50,350],xTitle:"Columns",yTitle:"Rows"},play:async({canvasElement:t,step:e})=>{const n=c(t);await e("Chart title is displayed",async()=>{a(n.getByText("Line Graph")).toBeInTheDocument()}),await e("Chart container renders",async()=>{a(t.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await e("6 traces are rendered",async()=>{a(t.querySelectorAll(".scatterlayer .trace").length).toBe(6)}),await e("Axis titles are displayed",async()=>{a(n.getByText("Columns")).toBeInTheDocument(),a(n.getByText("Rows")).toBeInTheDocument()}),await e("Legend shows series names",async()=>{a(n.getByText("Data A")).toBeInTheDocument(),a(n.getByText("Data F")).toBeInTheDocument()})}},f={name:"Line Graph Starting From Zero",args:{width:1e3,height:600,dataSeries:Z(),variant:"lines+markers",xTitle:"Columns",yTitle:"Rows"},play:async({canvasElement:t,step:e})=>{const n=c(t);await e("Chart title is displayed",async()=>{a(n.getByText("Line Graph")).toBeInTheDocument()}),await e("Chart container renders",async()=>{a(t.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await e("6 traces are rendered",async()=>{a(t.querySelectorAll(".scatterlayer .trace").length).toBe(6)}),await e("Axis titles are displayed",async()=>{a(n.getByText("Columns")).toBeInTheDocument(),a(n.getByText("Rows")).toBeInTheDocument()}),await e("Legend shows series names",async()=>{a(n.getByText("Data A")).toBeInTheDocument(),a(n.getByText("Data F")).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1010"},docs:{description:{story:"This graph demonstrates data that starts from 0 on both axes, with evenly distributed data points."}}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: "Basic",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T998"
    }
  },
  args: {
    dataSeries: generateBasicDemoData(),
    title: "Basic Line Graph"
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Basic Line Graph")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("6 traces are rendered", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(6);
    });
    await step("Legend shows series names", async () => {
      expect(canvas.getByText("Data A")).toBeInTheDocument();
      expect(canvas.getByText("Data F")).toBeInTheDocument();
    });
  }
}`,...x.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: "With Markers",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T999"
    }
  },
  args: {
    dataSeries: generateDataStartingFromZero(),
    variant: "lines+markers",
    title: "Line Graph with Markers"
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Line Graph with Markers")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("6 traces are rendered", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(6);
    });
    await step("Legend shows series names", async () => {
      expect(canvas.getByText("Data A")).toBeInTheDocument();
      expect(canvas.getByText("Data F")).toBeInTheDocument();
    });
  }
}`,...w.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  name: "With Error Bars",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T1000"
    }
  },
  args: {
    dataSeries: generateDemoDataWithErrorBars(),
    variant: "lines+markers+error_bars",
    title: "Line Graph with Error Bars"
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Line Graph with Error Bars")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("6 traces are rendered", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(6);
    });
    await step("Legend shows series names", async () => {
      expect(canvas.getByText("Data A")).toBeInTheDocument();
      expect(canvas.getByText("Data F")).toBeInTheDocument();
    });
  }
}`,...D.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  name: "Wide Range",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T1001"
    }
  },
  args: {
    dataSeries: generateWideRangeData(),
    variant: "lines+markers",
    title: "Wide Range Data Graph"
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Wide Range Data Graph")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("3 traces are rendered", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(3);
    });
    await step("Legend shows series names", async () => {
      expect(canvas.getByText("Data A")).toBeInTheDocument();
      expect(canvas.getByText("Data B")).toBeInTheDocument();
      expect(canvas.getByText("Data C")).toBeInTheDocument();
    });
  }
}`,...I.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: "Narrow Range",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T1002"
    }
  },
  args: {
    dataSeries: generateNarrowRangeData(),
    variant: "lines+markers",
    title: "Narrow Range Data Graph"
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Narrow Range Data Graph")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("3 traces are rendered", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(3);
    });
    await step("Legend shows series names", async () => {
      expect(canvas.getByText("Data A")).toBeInTheDocument();
      expect(canvas.getByText("Data B")).toBeInTheDocument();
      expect(canvas.getByText("Data C")).toBeInTheDocument();
    });
  }
}`,...v.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: "Custom Axes",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T1003"
    }
  },
  args: {
    dataSeries: generateBasicDemoData(),
    xTitle: "Time (s)",
    yTitle: "Temperature (°C)",
    title: "Temperature Over Time"
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Temperature Over Time")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("6 traces are rendered", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(6);
    });
    await step("Axis titles are displayed", async () => {
      expect(canvas.getByText("Time (s)")).toBeInTheDocument();
      expect(canvas.getByText("Temperature (°C)")).toBeInTheDocument();
    });
    await step("Legend shows series names", async () => {
      expect(canvas.getByText("Data A")).toBeInTheDocument();
      expect(canvas.getByText("Data F")).toBeInTheDocument();
    });
  }
}`,...C.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: "Custom Range",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T1004"
    }
  },
  args: {
    dataSeries: generateBasicDemoData(),
    xRange: [300, 800],
    yRange: [100, 300],
    title: "Custom Range Graph"
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Custom Range Graph")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("6 traces are rendered", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(6);
    });
    await step("Legend shows series names", async () => {
      expect(canvas.getByText("Data A")).toBeInTheDocument();
      expect(canvas.getByText("Data F")).toBeInTheDocument();
    });
  }
}`,...S.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  name: "Auto Range Line Graph",
  args: {
    width: 1000,
    height: 600,
    dataSeries: generateDemoData(),
    variant: "lines+markers",
    xTitle: "Columns",
    yTitle: "Rows"
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Line Graph")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("6 traces are rendered", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(6);
    });
    await step("Axis titles are displayed", async () => {
      expect(canvas.getByText("Columns")).toBeInTheDocument();
      expect(canvas.getByText("Rows")).toBeInTheDocument();
    });
    await step("Legend shows series names", async () => {
      expect(canvas.getByText("Data A")).toBeInTheDocument();
      expect(canvas.getByText("Data F")).toBeInTheDocument();
    });
  },
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T1005"
    },
    docs: {
      description: {
        story: "This story demonstrates how the LineGraph automatically calculates appropriate ranges when none are provided."
      }
    }
  }
}`,...A.parameters?.docs?.source}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  name: "Wide Range Auto Scaled",
  args: {
    width: 1000,
    height: 600,
    dataSeries: generateWideRangeData(),
    variant: "lines+markers",
    xTitle: "Columns",
    yTitle: "Rows"
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Line Graph")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("3 traces are rendered", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(3);
    });
    await step("Axis titles are displayed", async () => {
      expect(canvas.getByText("Columns")).toBeInTheDocument();
      expect(canvas.getByText("Rows")).toBeInTheDocument();
    });
    await step("Legend shows series names", async () => {
      expect(canvas.getByText("Data A")).toBeInTheDocument();
      expect(canvas.getByText("Data C")).toBeInTheDocument();
    });
  },
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T1006"
    },
    docs: {
      description: {
        story: "A graph with a wider data range, demonstrating how the LineGraph adapts its scales automatically."
      }
    }
  }
}`,...R.parameters?.docs?.source}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  name: "Narrow Range Auto Scaled",
  args: {
    width: 1000,
    height: 600,
    dataSeries: generateNarrowRangeData(),
    variant: "lines+markers",
    xTitle: "Columns",
    yTitle: "Rows"
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Line Graph")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("3 traces are rendered", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(3);
    });
    await step("Axis titles are displayed", async () => {
      expect(canvas.getByText("Columns")).toBeInTheDocument();
      expect(canvas.getByText("Rows")).toBeInTheDocument();
    });
    await step("Legend shows series names", async () => {
      expect(canvas.getByText("Data A")).toBeInTheDocument();
      expect(canvas.getByText("Data C")).toBeInTheDocument();
    });
  },
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T1007"
    },
    docs: {
      description: {
        story: "A graph with a narrower data range, showing how the LineGraph adapts to focused data."
      }
    }
  }
}`,...L.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  name: "Only X Range Provided",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T1008"
    },
    docs: {
      description: {
        story: "In this example, only the X-axis range is provided, while the Y-axis uses autorange."
      }
    }
  },
  args: {
    width: 1000,
    height: 600,
    dataSeries: generateDemoData(),
    variant: "lines+markers",
    xRange: [150, 1050],
    xTitle: "Columns",
    yTitle: "Rows"
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Line Graph")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("6 traces are rendered", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(6);
    });
    await step("Axis titles are displayed", async () => {
      expect(canvas.getByText("Columns")).toBeInTheDocument();
      expect(canvas.getByText("Rows")).toBeInTheDocument();
    });
    await step("Legend shows series names", async () => {
      expect(canvas.getByText("Data A")).toBeInTheDocument();
      expect(canvas.getByText("Data F")).toBeInTheDocument();
    });
  }
}`,...E.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: "Only Y Range Provided",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T1009"
    },
    docs: {
      description: {
        story: "In this example, only the Y-axis range is provided, while the X-axis uses autorange."
      }
    }
  },
  args: {
    width: 1000,
    height: 600,
    dataSeries: generateDemoData(),
    variant: "lines+markers",
    yRange: [50, 350],
    xTitle: "Columns",
    yTitle: "Rows"
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Line Graph")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("6 traces are rendered", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(6);
    });
    await step("Axis titles are displayed", async () => {
      expect(canvas.getByText("Columns")).toBeInTheDocument();
      expect(canvas.getByText("Rows")).toBeInTheDocument();
    });
    await step("Legend shows series names", async () => {
      expect(canvas.getByText("Data A")).toBeInTheDocument();
      expect(canvas.getByText("Data F")).toBeInTheDocument();
    });
  }
}`,...b.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: "Line Graph Starting From Zero",
  args: {
    width: 1000,
    height: 600,
    dataSeries: generateDataStartingFromZero(),
    variant: "lines+markers",
    xTitle: "Columns",
    yTitle: "Rows"
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Line Graph")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("6 traces are rendered", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(6);
    });
    await step("Axis titles are displayed", async () => {
      expect(canvas.getByText("Columns")).toBeInTheDocument();
      expect(canvas.getByText("Rows")).toBeInTheDocument();
    });
    await step("Legend shows series names", async () => {
      expect(canvas.getByText("Data A")).toBeInTheDocument();
      expect(canvas.getByText("Data F")).toBeInTheDocument();
    });
  },
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T1010"
    },
    docs: {
      description: {
        story: "This graph demonstrates data that starts from 0 on both axes, with evenly distributed data points."
      }
    }
  }
}`,...f.parameters?.docs?.source}}};const se=["Basic","WithMarkers","WithErrorBars","WideRange","NarrowRange","CustomAxes","CustomRange","AutoRangeLineGraph","WideRangeAutoScaled","NarrowRangeAutoScaled","OnlyXRangeProvided","OnlyYRangeProvided","LineGraphStartingFromZero"];export{A as AutoRangeLineGraph,x as Basic,C as CustomAxes,S as CustomRange,f as LineGraphStartingFromZero,v as NarrowRange,L as NarrowRangeAutoScaled,E as OnlyXRangeProvided,b as OnlyYRangeProvided,I as WideRange,R as WideRangeAutoScaled,D as WithErrorBars,w as WithMarkers,se as __namedExportsOrder,re as default};
