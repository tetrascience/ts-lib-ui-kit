import{C as u}from"./colors-ClKyOP62.js";import{r as y,j as z}from"./iframe-14YYbrss.js";import{P as _}from"./plotly-BfU08UT2.js";import{u as N}from"./use-plotly-theme-DDaBOKiZ.js";import"./preload-helper-BbFkF2Um.js";const O=({dataSeries:e,width:t=1e3,height:n=600,xRange:c,yRange:d,variant:B="group",xTitle:I="Columns",yTitle:S="Rows",title:v="Bar Graph",barWidth:b=24})=>{const g=y.useRef(null),s=N(),{yMin:A,yMax:k}=y.useMemo(()=>{let o=Number.MAX_VALUE,r=Number.MIN_VALUE,i=Number.MAX_VALUE,l=Number.MIN_VALUE;e.forEach(L=>{L.x.forEach(h=>{o=Math.min(o,h),r=Math.max(r,h)}),L.y.forEach(h=>{i=Math.min(i,h),l=Math.max(l,h)})});const p=(r-o)*.1,q=(l-i)*.1;return{xMin:o-p,xMax:r+p,yMin:B==="stack"?0:i-q,yMax:l+q}},[e,B]),m=y.useMemo(()=>d||[A,k],[d,A,k]),G=y.useMemo(()=>[...new Set(e.flatMap(o=>o.x))],[e]),E=y.useMemo(()=>{const o=m[1]-m[0];let r=Math.pow(10,Math.floor(Math.log10(o)));o/r>10&&(r=r*2),o/r<4&&(r=r/2);const i=[];let l=Math.ceil(m[0]/r)*r;for(;l<=m[1];)i.push(l),l+=r;return i},[m]),M=y.useMemo(()=>{switch(B){case"stack":return"stack";case"overlay":return"overlay";default:return"group"}},[B]),C=y.useMemo(()=>({tickcolor:s.tickColor,ticklen:12,tickwidth:1,ticks:"outside",tickfont:{size:16,color:s.textColor,family:"Inter, sans-serif",weight:400},linecolor:s.lineColor,linewidth:1,position:0,zeroline:!1}),[s]);return y.useEffect(()=>{if(!g.current)return;const o=e.map(p=>({x:p.x,y:p.y,type:"bar",name:p.name,marker:{color:p.color},width:b,error_y:p.error_y})),r={title:{text:v,font:{size:32,family:"Inter, sans-serif",color:s.textColor}},width:t,height:n,margin:{l:80,r:30,b:80,t:60,pad:0},paper_bgcolor:s.paperBg,plot_bgcolor:s.plotBg,font:{family:"Inter, sans-serif"},barmode:M,bargap:.15,dragmode:!1,xaxis:{title:{text:I,font:{size:16,color:s.textSecondary,family:"Inter, sans-serif",weight:400},standoff:32},gridcolor:s.gridColor,range:c,autorange:!c,tickmode:"array",tickvals:G,showgrid:!0,...C},yaxis:{title:{text:S,font:{size:16,color:s.textSecondary,family:"Inter, sans-serif",weight:400},standoff:30},gridcolor:s.gridColor,range:d,autorange:!d,tickmode:"array",tickvals:E,showgrid:!0,...C},legend:{x:.5,y:-.2,xanchor:"center",yanchor:"top",orientation:"h",font:{size:16,color:s.legendColor,family:"Inter, sans-serif",weight:500}},showlegend:e.length>1},i={responsive:!0,displayModeBar:!1,displaylogo:!1};_.newPlot(g.current,o,r,i);const l=g.current;return()=>{l&&_.purge(l)}},[e,t,n,c,d,I,S,v,b,M,C,G,E,s]),z.jsx("div",{className:"bar-graph-container",children:z.jsx("div",{ref:g,style:{width:"100%",height:"100%"}})})};O.__docgenInfo={description:"",methods:[],displayName:"BarGraph",props:{dataSeries:{required:!0,tsType:{name:"Array",elements:[{name:"BarDataSeries"}],raw:"BarDataSeries[]"},description:""},width:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"1000",computed:!1}},height:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"600",computed:!1}},xRange:{required:!1,tsType:{name:"tuple",raw:"[number, number]",elements:[{name:"number"},{name:"number"}]},description:""},yRange:{required:!1,tsType:{name:"tuple",raw:"[number, number]",elements:[{name:"number"},{name:"number"}]},description:""},variant:{required:!1,tsType:{name:"union",raw:'"group" | "stack" | "overlay"',elements:[{name:"literal",value:'"group"'},{name:"literal",value:'"stack"'},{name:"literal",value:'"overlay"'}]},description:"",defaultValue:{value:'"group"',computed:!1}},xTitle:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Columns"',computed:!1}},yTitle:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Rows"',computed:!1}},title:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Bar Graph"',computed:!1}},barWidth:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"24",computed:!1}}}};const{expect:a,within:D}=__STORYBOOK_MODULE_TEST__,K={title:"Charts/BarGraph",component:O,parameters:{layout:"centered"},tags:["autodocs"]},V=()=>{const e=[200,300,400,500,600,700,800,900,1e3];return[{name:"Data A",color:u.ORANGE,x:e,y:[220,180,200,135,185,160,280,225,280]}]},j=()=>{const e=[100,200,300,400,500,600,700,800,900,1e3];return[{name:"Data A",color:u.ORANGE,x:e,y:[140,140,195,205,230,65,300,290,175,280]},{name:"Data B",color:u.RED,x:e,y:[150,75,300,210,130,75,140,35,290,70]},{name:"Data C",color:u.GREEN,x:e,y:[55,185,225,75,105,120,215,155,90,265]}]},R=()=>{const e=[200,300,400,500,600,700,800,900,1e3];return[{name:"Data A",color:u.ORANGE,x:e,y:[90,105,105,45,95,70,190,135,190]},{name:"Data B",color:u.RED,x:e,y:[90,75,90,90,95,90,90,90,90]}]},x={name:"Basic",parameters:{zephyr:{testCaseId:"SW-T966"}},args:{dataSeries:V(),title:"Bar Graph",width:1e3,height:600},play:async({canvasElement:e,step:t})=>{const n=D(e);await t("Chart title is displayed",async()=>{a(n.getByText("Bar Graph")).toBeInTheDocument()}),await t("Chart container renders",async()=>{a(e.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await t("One trace is rendered",async()=>{const c=e.querySelectorAll(".barlayer .trace");a(c.length).toBe(1)})}},T={name:"Grouped Bars",parameters:{zephyr:{testCaseId:"SW-T967"}},args:{dataSeries:j(),variant:"group",title:"Cluster Bar Graph",width:1e3,height:600},play:async({canvasElement:e,step:t})=>{const n=D(e);await t("Chart title is displayed",async()=>{a(n.getByText("Cluster Bar Graph")).toBeInTheDocument()}),await t("Chart container renders",async()=>{a(e.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await t("Three traces are rendered",async()=>{const c=e.querySelectorAll(".barlayer .trace");a(c.length).toBe(3)}),await t("Legend shows all series names",async()=>{a(n.getByText("Data A")).toBeInTheDocument(),a(n.getByText("Data B")).toBeInTheDocument(),a(n.getByText("Data C")).toBeInTheDocument()})}},w={name:"Stacked Bars",parameters:{zephyr:{testCaseId:"SW-T968"}},args:{dataSeries:R(),variant:"stack",title:"Stacked Bar Graph",width:1e3,height:600},play:async({canvasElement:e,step:t})=>{const n=D(e);await t("Chart title is displayed",async()=>{a(n.getByText("Stacked Bar Graph")).toBeInTheDocument()}),await t("Chart container renders",async()=>{a(e.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await t("Two traces are rendered",async()=>{const c=e.querySelectorAll(".barlayer .trace");a(c.length).toBe(2)}),await t("Legend shows all series names",async()=>{a(n.getByText("Data A")).toBeInTheDocument(),a(n.getByText("Data B")).toBeInTheDocument()})}},f={name:"Custom Styling",parameters:{zephyr:{testCaseId:"SW-T969"}},args:{dataSeries:j(),title:"Custom Bar Graph",xTitle:"X-Axis Label",yTitle:"Y-Axis Label",width:1e3,height:600,barWidth:16},play:async({canvasElement:e,step:t})=>{const n=D(e);await t("Chart title is displayed",async()=>{a(n.getByText("Custom Bar Graph")).toBeInTheDocument()}),await t("Chart container renders",async()=>{a(e.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await t("Axis titles are displayed",async()=>{a(n.getByText("X-Axis Label")).toBeInTheDocument(),a(n.getByText("Y-Axis Label")).toBeInTheDocument()}),await t("Three traces are rendered",async()=>{const c=e.querySelectorAll(".barlayer .trace");a(c.length).toBe(3)}),await t("Legend shows all series names",async()=>{a(n.getByText("Data A")).toBeInTheDocument(),a(n.getByText("Data B")).toBeInTheDocument(),a(n.getByText("Data C")).toBeInTheDocument()})}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: "Basic",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T966"
    }
  },
  args: {
    dataSeries: generateBasicData(),
    title: "Bar Graph",
    width: 1000,
    height: 600
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Bar Graph")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("One trace is rendered", async () => {
      const traces = canvasElement.querySelectorAll(".barlayer .trace");
      expect(traces.length).toBe(1);
    });
  }
}`,...x.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: "Grouped Bars",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T967"
    }
  },
  args: {
    dataSeries: generateGroupedBarData(),
    variant: "group",
    title: "Cluster Bar Graph",
    width: 1000,
    height: 600
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Cluster Bar Graph")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Three traces are rendered", async () => {
      const traces = canvasElement.querySelectorAll(".barlayer .trace");
      expect(traces.length).toBe(3);
    });
    await step("Legend shows all series names", async () => {
      expect(canvas.getByText("Data A")).toBeInTheDocument();
      expect(canvas.getByText("Data B")).toBeInTheDocument();
      expect(canvas.getByText("Data C")).toBeInTheDocument();
    });
  }
}`,...T.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: "Stacked Bars",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T968"
    }
  },
  args: {
    dataSeries: generateStackedBarData(),
    variant: "stack",
    title: "Stacked Bar Graph",
    width: 1000,
    height: 600
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Stacked Bar Graph")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Two traces are rendered", async () => {
      const traces = canvasElement.querySelectorAll(".barlayer .trace");
      expect(traces.length).toBe(2);
    });
    await step("Legend shows all series names", async () => {
      expect(canvas.getByText("Data A")).toBeInTheDocument();
      expect(canvas.getByText("Data B")).toBeInTheDocument();
    });
  }
}`,...w.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: "Custom Styling",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T969"
    }
  },
  args: {
    dataSeries: generateGroupedBarData(),
    title: "Custom Bar Graph",
    xTitle: "X-Axis Label",
    yTitle: "Y-Axis Label",
    width: 1000,
    height: 600,
    barWidth: 16
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Custom Bar Graph")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Axis titles are displayed", async () => {
      expect(canvas.getByText("X-Axis Label")).toBeInTheDocument();
      expect(canvas.getByText("Y-Axis Label")).toBeInTheDocument();
    });
    await step("Three traces are rendered", async () => {
      const traces = canvasElement.querySelectorAll(".barlayer .trace");
      expect(traces.length).toBe(3);
    });
    await step("Legend shows all series names", async () => {
      expect(canvas.getByText("Data A")).toBeInTheDocument();
      expect(canvas.getByText("Data B")).toBeInTheDocument();
      expect(canvas.getByText("Data C")).toBeInTheDocument();
    });
  }
}`,...f.parameters?.docs?.source}}};const F=["Basic","GroupedBars","StackedBars","CustomStyling"];export{x as Basic,f as CustomStyling,T as GroupedBars,w as StackedBars,F as __namedExportsOrder,K as default};
