import{C as c}from"./colors-ClKyOP62.js";import{r as x,j as d,R as U}from"./iframe-14YYbrss.js";import{P as G}from"./plotly-BfU08UT2.js";import{u as $}from"./use-plotly-theme-DDaBOKiZ.js";import"./preload-helper-BbFkF2Um.js";const X=-.5,Y=e=>e.reduce((n,s)=>n+s,0)/e.length,K=(e,t)=>{const s=e.map(o=>Math.pow(o-t,2)).reduce((o,u)=>o+u,0)/e.length;return Math.sqrt(s)},J=(e,t,n,s,o=100)=>{const u=[],p=[],T=(s-n)/(o-1);for(let l=0;l<o;l++){const i=n+l*T;u.push(i);const B=X*Math.pow((i-e)/t,2),C=1/(t*Math.sqrt(2*Math.PI))*Math.exp(B);p.push(C)}return{x:u,y:p}},Q=(e,t,n)=>{const s=Math.ceil((n.end-n.start)/n.size),o=Array(s).fill(0);t.forEach(l=>{if(l>=n.start&&l<=n.end){const i=Math.floor((l-n.start)/n.size);o[i]++}});const u=Math.max(...o),p=Math.max(...e),T=u/p;return e.map(l=>l*T)},k=({dataSeries:e,width:t=480,height:n=480,title:s="Histogram",xTitle:o="X Axis",yTitle:u="Frequency",bargap:p=.2,showDistributionLine:T=!1})=>{const l=x.useRef(null),i=$(),B=x.useMemo(()=>Array.isArray(e)?e:[e],[e]),C=x.useMemo(()=>B.length>1?"stack":void 0,[B.length]),H=x.useMemo(()=>[c.ORANGE,c.RED,c.BLUE,c.GREEN,c.PURPLE,c.YELLOW],[]),w=x.useMemo(()=>B.map((r,g)=>{const h=typeof r.showDistributionLine>"u"?T:r.showDistributionLine;return{...r,color:r.color||H[g%H.length],opacity:h?.5:r.opacity||1,showDistributionLine:h,lineWidth:r.lineWidth||3}}),[B,T,H]),R=i.gridColor,N=x.useMemo(()=>w.map(r=>({type:"histogram",x:r.x,name:r.name,marker:{color:r.color,line:{color:i.paperBg,width:1},opacity:r.opacity},autobinx:r.autobinx,xbins:r.xbins,hovertemplate:`${o}: %{x}<br>${u}: %{y}<extra>${r.name}</extra>`})),[w,o,u,i]),M=x.useMemo(()=>w.filter(r=>r.showDistributionLine).map(r=>{const g=Y(r.x),h=K(r.x,g),b=Math.min(...r.x),y=Math.max(...r.x),D=y-b,z=b-D*.1,F=y+D*.1,_=r.xbins||{start:z,end:F,size:D/10},j=J(g,h,z,F,100),V=Q(j.y,r.x,_);return{type:"scatter",x:j.x,y:V,mode:"lines",name:`${r.name} Distribution`,line:{color:r.color,width:r.lineWidth},hoverinfo:"none"}}),[w]),W=x.useMemo(()=>[...N,...M],[N,M]);x.useEffect(()=>{if(!l.current)return;const r={width:t,height:n,font:{family:"Inter, sans-serif"},showlegend:!1,margin:{l:90,r:40,b:80,t:40},xaxis:{title:{text:o,font:{size:16,color:i.textSecondary,family:"Inter, sans-serif",weight:400},standoff:20},gridcolor:R,tickcolor:i.tickColor,ticklen:8,tickwidth:1,ticks:"outside",linecolor:i.lineColor,linewidth:1,zeroline:!1},yaxis:{title:{text:u,font:{size:16,color:i.textSecondary,family:"Inter, sans-serif",weight:400},standoff:20},gridcolor:R,tickcolor:i.tickColor,ticklen:8,tickwidth:1,ticks:"outside",linecolor:i.lineColor,linewidth:1,zeroline:!1,rangemode:"tozero"},barmode:C,bargap:p,paper_bgcolor:i.paperBg,plot_bgcolor:i.plotBg},g={responsive:!0,displayModeBar:!1,displaylogo:!1};G.newPlot(l.current,W,r,g);const h=l.current;return()=>{h&&G.purge(h)}},[t,n,o,u,p,W,C,R,i]);const P=({series:r})=>{const g=r.map((y,D)=>d.jsx(U.Fragment,{children:d.jsxs("div",{className:"legend-item",children:[d.jsx("span",{className:"color-box",style:{background:y.color}}),y.name,D<r.length-1&&d.jsx("span",{className:"divider"})]})},y.name)),h=[],b=6;for(let y=0;y<g.length;y+=b)h.push(d.jsx("div",{className:"legend-row",children:g.slice(y,y+b)},y));return d.jsx("div",{className:"legend-container",children:h})};return d.jsx("div",{className:"histogram-container",style:{width:t},children:d.jsxs("div",{className:"chart-container",children:[s&&d.jsx("div",{className:"title-container",children:d.jsx("h2",{className:"title",children:s})}),d.jsx("div",{ref:l,style:{width:"100%",height:"100%",margin:"0"}}),d.jsx(P,{series:w})]})})};k.__docgenInfo={description:"",methods:[],displayName:"Histogram",props:{dataSeries:{required:!0,tsType:{name:"union",raw:"HistogramDataSeries | HistogramDataSeries[]",elements:[{name:"HistogramDataSeries"},{name:"Array",elements:[{name:"HistogramDataSeries"}],raw:"HistogramDataSeries[]"}]},description:""},width:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"480",computed:!1}},height:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"480",computed:!1}},title:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Histogram"',computed:!1}},xTitle:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"X Axis"',computed:!1}},yTitle:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Frequency"',computed:!1}},bargap:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"0.2",computed:!1}},showDistributionLine:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}}}};const{expect:a,within:S}=__STORYBOOK_MODULE_TEST__,re={title:"Charts/Histogram",component:k,parameters:{layout:"centered"},tags:["autodocs"]},m=(e,t,n)=>{const s=[];for(let o=0;o<n;o++){const u=Math.random(),p=Math.random(),T=Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*p),l=e+T*t;s.push(l)}return s},q={name:"Default",parameters:{zephyr:{testCaseId:"SW-T990"}},args:{dataSeries:{x:m(20,8,200),name:"Label"},title:"Histogram",xTitle:"Torque",yTitle:"Frequency",width:480,height:480},play:async({canvasElement:e,step:t})=>{const n=S(e);await t("Chart title is displayed",async()=>{a(n.getByText("Histogram")).toBeInTheDocument()}),await t("Chart container renders",async()=>{a(e.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await t("One histogram trace is rendered",async()=>{const s=e.querySelectorAll(".barlayer .trace");a(s.length).toBe(1)})}},f={name:"With Custom Color",parameters:{zephyr:{testCaseId:"SW-T991"}},args:{dataSeries:{x:m(20,8,200),name:"Custom Color",color:c.RED},title:"Histogram with Custom Color",xTitle:"Torque",yTitle:"Frequency",width:480,height:480},play:async({canvasElement:e,step:t})=>{const n=S(e);await t("Chart title is displayed",async()=>{a(n.getByText("Histogram with Custom Color")).toBeInTheDocument()}),await t("Chart container renders",async()=>{a(e.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await t("One histogram trace is rendered",async()=>{const s=e.querySelectorAll(".barlayer .trace");a(s.length).toBe(1)})}},v={name:"With Custom Bins",parameters:{zephyr:{testCaseId:"SW-T992"}},args:{dataSeries:{x:m(20,8,200),name:"Custom Bins",autobinx:!1,xbins:{start:0,end:40,size:4}},title:"Histogram with Custom Bins",xTitle:"Torque",yTitle:"Frequency",width:480,height:480},play:async({canvasElement:e,step:t})=>{const n=S(e);await t("Chart title is displayed",async()=>{a(n.getByText("Histogram with Custom Bins")).toBeInTheDocument()}),await t("Chart container renders",async()=>{a(e.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await t("One histogram trace is rendered",async()=>{const s=e.querySelectorAll(".barlayer .trace");a(s.length).toBe(1)}),await t("Custom bins render visible bars",async()=>{const s=e.querySelectorAll(".barlayer .bars .point");a(s.length).toBeGreaterThan(0)})}},I={name:"Stacked Histogram",parameters:{zephyr:{testCaseId:"SW-T993"}},args:{dataSeries:[{x:m(20,8,200),name:"Series A",color:c.ORANGE},{x:m(20,6,150),name:"Series B",color:c.RED}],title:"Group of Histogram",xTitle:"Torque",yTitle:"Frequency",width:480,height:480},play:async({canvasElement:e,step:t})=>{const n=S(e);await t("Chart title is displayed",async()=>{a(n.getByText("Group of Histogram")).toBeInTheDocument()}),await t("Chart container renders",async()=>{a(e.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await t("Two histogram traces are rendered",async()=>{const s=e.querySelectorAll(".barlayer .trace");a(s.length).toBe(2)}),await t("Legend shows series names",async()=>{a(n.getByText("Series A")).toBeInTheDocument(),a(n.getByText("Series B")).toBeInTheDocument()})}},A={name:"Multiple Series",parameters:{zephyr:{testCaseId:"SW-T994"}},args:{dataSeries:[{x:m(10,5,100),name:"Series A",color:c.BLUE},{x:m(20,5,100),name:"Series B",color:c.RED},{x:m(30,5,100),name:"Series C",color:c.GREEN},{x:m(40,5,100),name:"Series D",color:c.ORANGE}],title:"Multiple Series Histogram",xTitle:"Torque",yTitle:"Frequency",width:600,height:480},play:async({canvasElement:e,step:t})=>{const n=S(e);await t("Chart title is displayed",async()=>{a(n.getByText("Multiple Series Histogram")).toBeInTheDocument()}),await t("Chart container renders",async()=>{a(e.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await t("Four histogram traces are rendered",async()=>{const s=e.querySelectorAll(".barlayer .trace");a(s.length).toBe(4)}),await t("Legend shows series names",async()=>{a(n.getByText("Series A")).toBeInTheDocument(),a(n.getByText("Series B")).toBeInTheDocument(),a(n.getByText("Series C")).toBeInTheDocument(),a(n.getByText("Series D")).toBeInTheDocument()})}},L={name:"With Distribution Line",parameters:{zephyr:{testCaseId:"SW-T995"}},args:{dataSeries:{x:m(20,8,200),name:"Label",color:c.ORANGE},title:"Histogram with Fitted Distribution Line",xTitle:"Torque",yTitle:"Frequency",width:480,height:480,showDistributionLine:!0},play:async({canvasElement:e,step:t})=>{const n=S(e);await t("Chart title is displayed",async()=>{a(n.getByText("Histogram with Fitted Distribution Line")).toBeInTheDocument()}),await t("Chart container renders",async()=>{a(e.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await t("Histogram and distribution line traces render",async()=>{a(e.querySelectorAll(".barlayer .trace").length).toBe(1),a(e.querySelectorAll(".scatterlayer .trace").length).toBe(1)})}},E={name:"With Custom Bins And Distribution Line",parameters:{zephyr:{testCaseId:"SW-T996"}},args:{dataSeries:{x:m(20,8,200),name:"Label",color:c.ORANGE,autobinx:!1,xbins:{start:0,end:40,size:4}},title:"Histogram with Fitted Distribution Line",xTitle:"Torque",yTitle:"Frequency",width:480,height:480,showDistributionLine:!0},play:async({canvasElement:e,step:t})=>{const n=S(e);await t("Chart title is displayed",async()=>{a(n.getByText("Histogram with Fitted Distribution Line")).toBeInTheDocument()}),await t("Chart container renders",async()=>{a(e.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await t("Histogram and distribution line traces render",async()=>{a(e.querySelectorAll(".barlayer .trace").length).toBe(1),a(e.querySelectorAll(".scatterlayer .trace").length).toBe(1)}),await t("Custom bins render visible bars",async()=>{const s=e.querySelectorAll(".barlayer .bars .point");a(s.length).toBeGreaterThan(0)})}},O={name:"Multiple Series With Distribution Lines",parameters:{zephyr:{testCaseId:"SW-T997"}},args:{dataSeries:[{x:m(20,8,200),name:"Series A",color:c.ORANGE},{x:m(15,5,150),name:"Series B",color:c.RED}],title:"Group of Histogram with Fitted Distribution Line",xTitle:"Torque",yTitle:"Frequency",width:600,height:500,showDistributionLine:!0},play:async({canvasElement:e,step:t})=>{const n=S(e);await t("Chart title is displayed",async()=>{a(n.getByText("Group of Histogram with Fitted Distribution Line")).toBeInTheDocument()}),await t("Chart container renders",async()=>{a(e.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await t("Two histogram and two distribution line traces render",async()=>{a(e.querySelectorAll(".barlayer .trace").length).toBe(2),a(e.querySelectorAll(".scatterlayer .trace").length).toBe(2)}),await t("Legend shows series names",async()=>{a(n.getByText("Series A")).toBeInTheDocument(),a(n.getByText("Series B")).toBeInTheDocument()})}};q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  name: "Default",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T990"
    }
  },
  args: {
    dataSeries: {
      x: generateNormalData(20, 8, 200),
      name: "Label"
    },
    title: "Histogram",
    xTitle: "Torque",
    yTitle: "Frequency",
    width: 480,
    height: 480
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Histogram")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("One histogram trace is rendered", async () => {
      const traces = canvasElement.querySelectorAll(".barlayer .trace");
      expect(traces.length).toBe(1);
    });
  }
}`,...q.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: "With Custom Color",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T991"
    }
  },
  args: {
    dataSeries: {
      x: generateNormalData(20, 8, 200),
      name: "Custom Color",
      color: COLORS.RED
    },
    title: "Histogram with Custom Color",
    xTitle: "Torque",
    yTitle: "Frequency",
    width: 480,
    height: 480
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Histogram with Custom Color")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("One histogram trace is rendered", async () => {
      const traces = canvasElement.querySelectorAll(".barlayer .trace");
      expect(traces.length).toBe(1);
    });
  }
}`,...f.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: "With Custom Bins",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T992"
    }
  },
  args: {
    dataSeries: {
      x: generateNormalData(20, 8, 200),
      name: "Custom Bins",
      autobinx: false,
      xbins: {
        start: 0,
        end: 40,
        size: 4
      }
    },
    title: "Histogram with Custom Bins",
    xTitle: "Torque",
    yTitle: "Frequency",
    width: 480,
    height: 480
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Histogram with Custom Bins")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("One histogram trace is rendered", async () => {
      const traces = canvasElement.querySelectorAll(".barlayer .trace");
      expect(traces.length).toBe(1);
    });
    await step("Custom bins render visible bars", async () => {
      const barPoints = canvasElement.querySelectorAll(".barlayer .bars .point");
      expect(barPoints.length).toBeGreaterThan(0);
    });
  }
}`,...v.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  name: "Stacked Histogram",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T993"
    }
  },
  args: {
    dataSeries: [{
      x: generateNormalData(20, 8, 200),
      name: "Series A",
      color: COLORS.ORANGE
    }, {
      x: generateNormalData(20, 6, 150),
      name: "Series B",
      color: COLORS.RED
    }],
    title: "Group of Histogram",
    xTitle: "Torque",
    yTitle: "Frequency",
    width: 480,
    height: 480
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Group of Histogram")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Two histogram traces are rendered", async () => {
      const traces = canvasElement.querySelectorAll(".barlayer .trace");
      expect(traces.length).toBe(2);
    });
    await step("Legend shows series names", async () => {
      expect(canvas.getByText("Series A")).toBeInTheDocument();
      expect(canvas.getByText("Series B")).toBeInTheDocument();
    });
  }
}`,...I.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  name: "Multiple Series",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T994"
    }
  },
  args: {
    dataSeries: [{
      x: generateNormalData(10, 5, 100),
      name: "Series A",
      color: COLORS.BLUE
    }, {
      x: generateNormalData(20, 5, 100),
      name: "Series B",
      color: COLORS.RED
    }, {
      x: generateNormalData(30, 5, 100),
      name: "Series C",
      color: COLORS.GREEN
    }, {
      x: generateNormalData(40, 5, 100),
      name: "Series D",
      color: COLORS.ORANGE
    }],
    title: "Multiple Series Histogram",
    xTitle: "Torque",
    yTitle: "Frequency",
    width: 600,
    height: 480
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Multiple Series Histogram")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Four histogram traces are rendered", async () => {
      const traces = canvasElement.querySelectorAll(".barlayer .trace");
      expect(traces.length).toBe(4);
    });
    await step("Legend shows series names", async () => {
      expect(canvas.getByText("Series A")).toBeInTheDocument();
      expect(canvas.getByText("Series B")).toBeInTheDocument();
      expect(canvas.getByText("Series C")).toBeInTheDocument();
      expect(canvas.getByText("Series D")).toBeInTheDocument();
    });
  }
}`,...A.parameters?.docs?.source}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  name: "With Distribution Line",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T995"
    }
  },
  args: {
    dataSeries: {
      x: generateNormalData(20, 8, 200),
      name: "Label",
      color: COLORS.ORANGE
    },
    title: "Histogram with Fitted Distribution Line",
    xTitle: "Torque",
    yTitle: "Frequency",
    width: 480,
    height: 480,
    showDistributionLine: true
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Histogram with Fitted Distribution Line")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Histogram and distribution line traces render", async () => {
      expect(canvasElement.querySelectorAll(".barlayer .trace").length).toBe(1);
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(1);
    });
  }
}`,...L.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  name: "With Custom Bins And Distribution Line",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T996"
    }
  },
  args: {
    dataSeries: {
      x: generateNormalData(20, 8, 200),
      name: "Label",
      color: COLORS.ORANGE,
      autobinx: false,
      xbins: {
        start: 0,
        end: 40,
        size: 4
      }
    },
    title: "Histogram with Fitted Distribution Line",
    xTitle: "Torque",
    yTitle: "Frequency",
    width: 480,
    height: 480,
    showDistributionLine: true
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Histogram with Fitted Distribution Line")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Histogram and distribution line traces render", async () => {
      expect(canvasElement.querySelectorAll(".barlayer .trace").length).toBe(1);
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(1);
    });
    await step("Custom bins render visible bars", async () => {
      const barPoints = canvasElement.querySelectorAll(".barlayer .bars .point");
      expect(barPoints.length).toBeGreaterThan(0);
    });
  }
}`,...E.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  name: "Multiple Series With Distribution Lines",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T997"
    }
  },
  args: {
    dataSeries: [{
      x: generateNormalData(20, 8, 200),
      name: "Series A",
      color: COLORS.ORANGE
    }, {
      x: generateNormalData(15, 5, 150),
      name: "Series B",
      color: COLORS.RED
    }],
    title: "Group of Histogram with Fitted Distribution Line",
    xTitle: "Torque",
    yTitle: "Frequency",
    width: 600,
    height: 500,
    showDistributionLine: true
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Group of Histogram with Fitted Distribution Line")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Two histogram and two distribution line traces render", async () => {
      expect(canvasElement.querySelectorAll(".barlayer .trace").length).toBe(2);
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(2);
    });
    await step("Legend shows series names", async () => {
      expect(canvas.getByText("Series A")).toBeInTheDocument();
      expect(canvas.getByText("Series B")).toBeInTheDocument();
    });
  }
}`,...O.parameters?.docs?.source}}};const se=["Default","WithCustomColor","WithCustomBins","StackedHistogram","MultipleSeries","WithDistributionLine","WithCustomBinsAndDistributionLine","MultipleSeriesWithDistributionLines"];export{q as Default,A as MultipleSeries,O as MultipleSeriesWithDistributionLines,I as StackedHistogram,v as WithCustomBins,E as WithCustomBinsAndDistributionLine,f as WithCustomColor,L as WithDistributionLine,se as __namedExportsOrder,re as default};
