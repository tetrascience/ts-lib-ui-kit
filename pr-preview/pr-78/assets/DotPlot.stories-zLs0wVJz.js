import{C as s}from"./colors-ClKyOP62.js";import{r as d,j as A}from"./iframe-14YYbrss.js";import{P as z}from"./plotly-BfU08UT2.js";import{u as G}from"./use-plotly-theme-DDaBOKiZ.js";import"./preload-helper-BbFkF2Um.js";const q=({dataSeries:t,width:e=1e3,height:n=600,title:r="Dot Plot",xTitle:y="Columns",yTitle:i="Rows",variant:m="default",markerSize:h=8})=>{const u=d.useRef(null),c=G(),L=d.useMemo(()=>Array.isArray(t)?t:[t],[t]),g=d.useMemo(()=>[s.ORANGE,s.RED,s.GREEN,s.BLUE,s.YELLOW,s.PURPLE],[]),v=d.useMemo(()=>["circle","square","diamond","triangle-up","triangle-down","star"],[]),b=d.useMemo(()=>L.map((l,S)=>m==="default"?{...l,color:l.color||g[0],symbol:"circle",size:l.size||h}:{...l,color:l.color||g[S%g.length],symbol:l.symbol||v[S%v.length],size:l.size||h}),[L,m,h,g,v]),E=c.gridColor,I=d.useMemo(()=>b.map(l=>({type:"scatter",x:l.x,y:l.y,mode:"markers",name:l.name,marker:{color:l.color,size:l.size,symbol:l.symbol,line:{color:c.paperBg,width:1}},hovertemplate:`${y}: %{x}<br>${i}: %{y}<extra>${l.name}</extra>`})),[b,y,i,c]),k=d.useMemo(()=>({tickcolor:c.tickColor,ticklen:12,tickwidth:1,ticks:"outside",tickfont:{size:16,color:c.textColor,family:"Inter, sans-serif",weight:400},linecolor:c.lineColor,linewidth:1,position:0,zeroline:!1}),[c]),R=d.useMemo(()=>({text:r,x:.5,y:.95,xanchor:"center",yanchor:"top",font:{size:32,weight:600,family:"Inter, sans-serif",color:c.textColor,lineheight:1.2,standoff:30}}),[r,c]);return d.useEffect(()=>{if(!u.current)return;const l={width:e,height:n,font:{family:"Inter, sans-serif"},title:R,margin:{l:80,r:40,b:80,t:80,pad:0},showlegend:!0,legend:{x:.5,y:-.2,xanchor:"center",yanchor:"top",orientation:"h",font:{size:13,color:c.legendColor,family:"Inter, sans-serif",weight:500,lineheight:18}},xaxis:{title:{text:y,font:{size:16,color:c.textSecondary,family:"Inter, sans-serif",weight:400},standoff:15},gridcolor:E,...k},yaxis:{title:{text:i,font:{size:16,color:c.textSecondary,family:"Inter, sans-serif",weight:400},standoff:15},gridcolor:E,...k},paper_bgcolor:c.paperBg,plot_bgcolor:c.plotBg},S={responsive:!0,displayModeBar:!1,displaylogo:!1};z.newPlot(u.current,I,l,S);const O=u.current;return()=>{O&&z.purge(O)}},[e,n,y,i,I,R,k,E,c]),A.jsx("div",{className:"dotplot-container",style:{width:e},children:A.jsx("div",{ref:u,style:{width:"100%",height:"100%",margin:"0"}})})};q.__docgenInfo={description:"",methods:[],displayName:"DotPlot",props:{dataSeries:{required:!0,tsType:{name:"union",raw:"DotPlotDataSeries | DotPlotDataSeries[]",elements:[{name:"DotPlotDataSeries"},{name:"Array",elements:[{name:"DotPlotDataSeries"}],raw:"DotPlotDataSeries[]"}]},description:""},width:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"1000",computed:!1}},height:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"600",computed:!1}},title:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Dot Plot"',computed:!1}},xTitle:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Columns"',computed:!1}},yTitle:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Rows"',computed:!1}},variant:{required:!1,tsType:{name:"union",raw:'"default" | "stacked"',elements:[{name:"literal",value:'"default"'},{name:"literal",value:'"stacked"'}]},description:"",defaultValue:{value:'"default"',computed:!1}},markerSize:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"8",computed:!1}}}};const{expect:a,within:p}=__STORYBOOK_MODULE_TEST__,_={title:"Charts/DotPlot",component:q,parameters:{layout:"centered"},tags:["autodocs"]},o=(t,e,n=.15)=>{const r=[],y=[];for(let i=0;i<t;i++)for(let m=0;m<e;m++)Math.random()<n&&(r.push(m),y.push(i));return{x:r,y}},M=(t,e,n)=>{const r=[],y=["Label","Label","Label","Label","Label","Label"];for(let i=0;i<n;i++){const{x:m,y:h}=o(t,e,.05);r.push({x:m,y:h.map(u=>u+i*.2),name:y[i%y.length]})}return r},x={name:"Default",parameters:{zephyr:{testCaseId:"SW-T978"}},args:{dataSeries:{x:o(25,41,.12).x,y:o(25,41,.12).y,name:"Label",color:s.ORANGE},title:"Dotplot",xTitle:"Columns",yTitle:"Rows",width:1e3,height:600,variant:"default",markerSize:8},play:async({canvasElement:t,step:e})=>{const n=p(t);await e("Chart title is displayed",async()=>{a(n.getByText("Dotplot")).toBeInTheDocument()}),await e("Chart container renders",async()=>{a(t.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await e("Single trace is rendered",async()=>{const r=t.querySelectorAll(".scatterlayer .trace");a(r.length).toBe(1)})}},D={name:"Stacked",parameters:{zephyr:{testCaseId:"SW-T979"}},args:{dataSeries:M(25,41,4).map((t,e)=>({...t,color:[s.ORANGE,s.RED,s.GREEN,s.BLUE,s.YELLOW,s.PURPLE][e],symbol:["circle","square","diamond","triangle-up"][e]})),title:"Dotplot Stacked",xTitle:"Columns",yTitle:"Rows",width:1e3,height:600,variant:"stacked",markerSize:8},play:async({canvasElement:t,step:e})=>{const n=p(t);await e("Chart title is displayed",async()=>{a(n.getByText("Dotplot Stacked")).toBeInTheDocument()}),await e("Chart container renders",async()=>{a(t.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await e("Multiple traces are rendered",async()=>{const r=t.querySelectorAll(".scatterlayer .trace");a(r.length).toBe(4)}),await e("Legend shows series labels",async()=>{a(n.getAllByText("Label").length).toBe(4)})}},T={name:"With Custom Colors",parameters:{zephyr:{testCaseId:"SW-T980"}},args:{dataSeries:[{x:o(15,25,.15).x,y:o(15,25,.15).y,name:"Series A",color:s.BLUE,symbol:"circle"},{x:o(15,25,.1).x,y:o(15,25,.1).y,name:"Series B",color:s.RED,symbol:"square"}],title:"Custom Colors Dotplot",xTitle:"X Axis",yTitle:"Y Axis",width:1e3,height:600,variant:"stacked",markerSize:10},play:async({canvasElement:t,step:e})=>{const n=p(t);await e("Chart title is displayed",async()=>{a(n.getByText("Custom Colors Dotplot")).toBeInTheDocument()}),await e("Chart container renders",async()=>{a(t.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await e("Multiple traces are rendered",async()=>{const r=t.querySelectorAll(".scatterlayer .trace");a(r.length).toBe(2)}),await e("Legend shows series names",async()=>{a(n.getByText("Series A")).toBeInTheDocument(),a(n.getByText("Series B")).toBeInTheDocument()})}},C={name:"Large Markers",parameters:{zephyr:{testCaseId:"SW-T981"}},args:{dataSeries:{x:o(12,20,.18).x,y:o(12,20,.18).y,name:"Large Dots",color:s.GREEN},title:"Large Marker Dotplot",xTitle:"Columns",yTitle:"Rows",width:1e3,height:600,variant:"default",markerSize:15},play:async({canvasElement:t,step:e})=>{const n=p(t);await e("Chart title is displayed",async()=>{a(n.getByText("Large Marker Dotplot")).toBeInTheDocument()}),await e("Chart container renders",async()=>{a(t.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await e("Single trace is rendered",async()=>{const r=t.querySelectorAll(".scatterlayer .trace");a(r.length).toBe(1)})}},B={name:"Multiple Series Colors",parameters:{zephyr:{testCaseId:"SW-T982"}},args:{dataSeries:[{x:o(10,15,.12).x,y:o(10,15,.12).y,name:"Series A",color:s.ORANGE,symbol:"circle"},{x:o(10,15,.1).x,y:o(10,15,.1).y,name:"Series B",color:s.BLUE,symbol:"square"},{x:o(10,15,.1).x,y:o(10,15,.1).y,name:"Series C",color:s.RED,symbol:"diamond"},{x:o(10,15,.09).x,y:o(10,15,.09).y,name:"Series D",color:s.GREEN,symbol:"triangle-up"}],title:"Multiple Series Colors",xTitle:"Position X",yTitle:"Position Y",width:1e3,height:600,variant:"stacked",markerSize:12},play:async({canvasElement:t,step:e})=>{const n=p(t);await e("Chart title is displayed",async()=>{a(n.getByText("Multiple Series Colors")).toBeInTheDocument()}),await e("Chart container renders",async()=>{a(t.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await e("Multiple traces are rendered",async()=>{const r=t.querySelectorAll(".scatterlayer .trace");a(r.length).toBe(4)}),await e("Legend shows series names",async()=>{a(n.getByText("Series A")).toBeInTheDocument(),a(n.getByText("Series B")).toBeInTheDocument(),a(n.getByText("Series C")).toBeInTheDocument(),a(n.getByText("Series D")).toBeInTheDocument()})}},w={name:"Small Scale",parameters:{zephyr:{testCaseId:"SW-T983"}},args:{dataSeries:{x:o(8,12,.4).x,y:o(8,12,.4).y,name:"Small Grid",color:s.PURPLE},title:"Small Scale Dotplot",xTitle:"X",yTitle:"Y",width:500,height:600,variant:"default",markerSize:6},play:async({canvasElement:t,step:e})=>{const n=p(t);await e("Chart title is displayed",async()=>{a(n.getByText("Small Scale Dotplot")).toBeInTheDocument()}),await e("Chart container renders",async()=>{a(t.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await e("Single trace is rendered",async()=>{const r=t.querySelectorAll(".scatterlayer .trace");a(r.length).toBe(1)})}},f={name:"High Density",parameters:{zephyr:{testCaseId:"SW-T984"}},args:{dataSeries:{x:o(20,30,.25).x,y:o(20,30,.25).y,name:"High Density",color:s.ORANGE},title:"High Density Dotplot",xTitle:"Columns",yTitle:"Rows",width:1e3,height:600,variant:"default",markerSize:6},play:async({canvasElement:t,step:e})=>{const n=p(t);await e("Chart title is displayed",async()=>{a(n.getByText("High Density Dotplot")).toBeInTheDocument()}),await e("Chart container renders",async()=>{a(t.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await e("Single trace is rendered",async()=>{const r=t.querySelectorAll(".scatterlayer .trace");a(r.length).toBe(1)})}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: "Default",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T978"
    }
  },
  args: {
    dataSeries: {
      x: generateGridData(25, 41, 0.12).x,
      y: generateGridData(25, 41, 0.12).y,
      name: "Label",
      color: COLORS.ORANGE
    },
    title: "Dotplot",
    xTitle: "Columns",
    yTitle: "Rows",
    width: 1000,
    height: 600,
    variant: "default",
    markerSize: 8
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Dotplot")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Single trace is rendered", async () => {
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBe(1);
    });
  }
}`,...x.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  name: "Stacked",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T979"
    }
  },
  args: {
    dataSeries: generateStackedData(25, 41, 4).map((series, index) => ({
      ...series,
      color: [COLORS.ORANGE, COLORS.RED, COLORS.GREEN, COLORS.BLUE, COLORS.YELLOW, COLORS.PURPLE][index],
      symbol: (["circle", "square", "diamond", "triangle-up"] as MarkerSymbol[])[index]
    })),
    title: "Dotplot Stacked",
    xTitle: "Columns",
    yTitle: "Rows",
    width: 1000,
    height: 600,
    variant: "stacked",
    markerSize: 8
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Dotplot Stacked")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Multiple traces are rendered", async () => {
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBe(4);
    });
    await step("Legend shows series labels", async () => {
      expect(canvas.getAllByText("Label").length).toBe(4);
    });
  }
}`,...D.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: "With Custom Colors",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T980"
    }
  },
  args: {
    dataSeries: [{
      x: generateGridData(15, 25, 0.15).x,
      y: generateGridData(15, 25, 0.15).y,
      name: "Series A",
      color: COLORS.BLUE,
      symbol: "circle" as MarkerSymbol
    }, {
      x: generateGridData(15, 25, 0.1).x,
      y: generateGridData(15, 25, 0.1).y,
      name: "Series B",
      color: COLORS.RED,
      symbol: "square" as MarkerSymbol
    }],
    title: "Custom Colors Dotplot",
    xTitle: "X Axis",
    yTitle: "Y Axis",
    width: 1000,
    height: 600,
    variant: "stacked",
    markerSize: 10
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Custom Colors Dotplot")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Multiple traces are rendered", async () => {
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBe(2);
    });
    await step("Legend shows series names", async () => {
      expect(canvas.getByText("Series A")).toBeInTheDocument();
      expect(canvas.getByText("Series B")).toBeInTheDocument();
    });
  }
}`,...T.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: "Large Markers",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T981"
    }
  },
  args: {
    dataSeries: {
      x: generateGridData(12, 20, 0.18).x,
      y: generateGridData(12, 20, 0.18).y,
      name: "Large Dots",
      color: COLORS.GREEN
    },
    title: "Large Marker Dotplot",
    xTitle: "Columns",
    yTitle: "Rows",
    width: 1000,
    height: 600,
    variant: "default",
    markerSize: 15
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Large Marker Dotplot")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Single trace is rendered", async () => {
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBe(1);
    });
  }
}`,...C.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  name: "Multiple Series Colors",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T982"
    }
  },
  args: {
    dataSeries: [{
      x: generateGridData(10, 15, 0.12).x,
      y: generateGridData(10, 15, 0.12).y,
      name: "Series A",
      color: COLORS.ORANGE,
      symbol: "circle" as MarkerSymbol
    }, {
      x: generateGridData(10, 15, 0.1).x,
      y: generateGridData(10, 15, 0.1).y,
      name: "Series B",
      color: COLORS.BLUE,
      symbol: "square" as MarkerSymbol
    }, {
      x: generateGridData(10, 15, 0.1).x,
      y: generateGridData(10, 15, 0.1).y,
      name: "Series C",
      color: COLORS.RED,
      symbol: "diamond" as MarkerSymbol
    }, {
      x: generateGridData(10, 15, 0.09).x,
      y: generateGridData(10, 15, 0.09).y,
      name: "Series D",
      color: COLORS.GREEN,
      symbol: "triangle-up" as MarkerSymbol
    }],
    title: "Multiple Series Colors",
    xTitle: "Position X",
    yTitle: "Position Y",
    width: 1000,
    height: 600,
    variant: "stacked",
    markerSize: 12
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Multiple Series Colors")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Multiple traces are rendered", async () => {
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBe(4);
    });
    await step("Legend shows series names", async () => {
      expect(canvas.getByText("Series A")).toBeInTheDocument();
      expect(canvas.getByText("Series B")).toBeInTheDocument();
      expect(canvas.getByText("Series C")).toBeInTheDocument();
      expect(canvas.getByText("Series D")).toBeInTheDocument();
    });
  }
}`,...B.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: "Small Scale",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T983"
    }
  },
  args: {
    dataSeries: {
      x: generateGridData(8, 12, 0.4).x,
      y: generateGridData(8, 12, 0.4).y,
      name: "Small Grid",
      color: COLORS.PURPLE
    },
    title: "Small Scale Dotplot",
    xTitle: "X",
    yTitle: "Y",
    width: 500,
    height: 600,
    variant: "default",
    markerSize: 6
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Small Scale Dotplot")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Single trace is rendered", async () => {
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBe(1);
    });
  }
}`,...w.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: "High Density",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T984"
    }
  },
  args: {
    dataSeries: {
      x: generateGridData(20, 30, 0.25).x,
      y: generateGridData(20, 30, 0.25).y,
      name: "High Density",
      color: COLORS.ORANGE
    },
    title: "High Density Dotplot",
    xTitle: "Columns",
    yTitle: "Rows",
    width: 1000,
    height: 600,
    variant: "default",
    markerSize: 6
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("High Density Dotplot")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Single trace is rendered", async () => {
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBe(1);
    });
  }
}`,...f.parameters?.docs?.source}}};const H=["Default","Stacked","WithCustomColors","LargeMarkers","MultipleSeriesColors","SmallScale","HighDensity"];export{x as Default,f as HighDensity,C as LargeMarkers,B as MultipleSeriesColors,w as SmallScale,D as Stacked,T as WithCustomColors,H as __namedExportsOrder,_ as default};
