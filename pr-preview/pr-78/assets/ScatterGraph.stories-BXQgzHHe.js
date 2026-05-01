import{C}from"./colors-ClKyOP62.js";import{r as m,j as R}from"./iframe-14YYbrss.js";import{P as _}from"./plotly-BfU08UT2.js";import{u as L}from"./use-plotly-theme-DDaBOKiZ.js";import"./preload-helper-BbFkF2Um.js";const P=({dataSeries:r,width:s=1e3,height:o=600,xRange:i,yRange:d,xTitle:T="Columns",yTitle:B="Rows",title:I="Scatter Plot"})=>{const f=m.useRef(null),t=L(),{xMin:M,xMax:v,yMin:k,yMax:b}=m.useMemo(()=>{let n=Number.MAX_VALUE,e=Number.MIN_VALUE,c=Number.MAX_VALUE,a=Number.MIN_VALUE;r.forEach(q=>{q.x.forEach(h=>{n=Math.min(n,h),e=Math.max(e,h)}),q.y.forEach(h=>{c=Math.min(c,h),a=Math.max(a,h)})});const u=(e-n)*.1,A=(a-c)*.1;return{xMin:n-u,xMax:e+u,yMin:c-A,yMax:a+A}},[r]),p=m.useMemo(()=>i||[M,v],[i,M,v]),y=m.useMemo(()=>d||[k,b],[d,k,b]),D=m.useMemo(()=>{const n=p[1]-p[0];let e=Math.pow(10,Math.floor(Math.log10(n)));n/e>10&&(e=e*2),n/e<4&&(e=e/2);const c=[];let a=Math.ceil(p[0]/e)*e;for(;a<=p[1];)c.push(a),a+=e;return c},[p]),E=m.useMemo(()=>{const n=y[1]-y[0];let e=Math.pow(10,Math.floor(Math.log10(n)));n/e>10&&(e=e*2),n/e<4&&(e=e/2);const c=[];let a=Math.ceil(y[0]/e)*e;for(;a<=y[1];)c.push(a),a+=e;return c},[y]),w=m.useMemo(()=>({tickcolor:t.tickColor,ticklen:12,tickwidth:1,ticks:"outside",tickfont:{size:16,color:t.textColor,family:"Inter, sans-serif",weight:400},linecolor:t.lineColor,linewidth:1,position:0,zeroline:!1}),[t]),S=m.useMemo(()=>({showspikes:!0,spikemode:"across",spikedash:"solid",spikecolor:t.spikeColor,spikethickness:2}),[t]);return m.useEffect(()=>{if(!f.current)return;const n=r.map(u=>({x:u.x,y:u.y,type:"scatter",mode:"markers",name:u.name,marker:{color:u.color,size:10,symbol:"circle"},hovertemplate:`${T}: %{x}<br>${B}: %{y}<extra>${u.name}</extra>`})),e={title:{text:I,font:{size:32,family:"Inter, sans-serif",color:t.textColor}},width:s,height:o,margin:{l:80,r:30,b:80,t:60,pad:10},paper_bgcolor:t.paperBg,plot_bgcolor:t.plotBg,font:{family:"Inter, sans-serif"},dragmode:!1,xaxis:{title:{text:T,font:{size:16,color:t.textSecondary,family:"Inter, sans-serif",weight:400},standoff:32},gridcolor:t.gridColor,range:i,autorange:!i,tickmode:"array",tickvals:D,ticktext:D.map(String),showgrid:!0,...S,...w},yaxis:{title:{text:B,font:{size:16,color:t.textSecondary,family:"Inter, sans-serif",weight:400},standoff:30},gridcolor:t.gridColor,range:d,autorange:!d,tickmode:"array",tickvals:E,showgrid:!0,...S,...w},legend:{x:.5,y:-.2,xanchor:"center",yanchor:"top",orientation:"h",font:{size:16,color:t.legendColor,family:"Inter, sans-serif",weight:500}},showlegend:!0,hovermode:"closest"},c={responsive:!0,displayModeBar:!1,displaylogo:!1};_.newPlot(f.current,n,e,c);const a=f.current;return()=>{a&&_.purge(a)}},[r,s,o,i,d,T,B,I,p,y,D,E,w,S,t]),R.jsx("div",{className:"chart-container",children:R.jsx("div",{ref:f,style:{width:"100%",height:"100%"}})})};P.__docgenInfo={description:"",methods:[],displayName:"ScatterGraph",props:{dataSeries:{required:!0,tsType:{name:"Array",elements:[{name:"ScatterDataSeries"}],raw:"ScatterDataSeries[]"},description:""},width:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"1000",computed:!1}},height:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"600",computed:!1}},xRange:{required:!1,tsType:{name:"tuple",raw:"[number, number]",elements:[{name:"number"},{name:"number"}]},description:""},yRange:{required:!1,tsType:{name:"tuple",raw:"[number, number]",elements:[{name:"number"},{name:"number"}]},description:""},xTitle:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Columns"',computed:!1}},yTitle:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Rows"',computed:!1}},title:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Scatter Plot"',computed:!1}}}};const{expect:l,within:z}=__STORYBOOK_MODULE_TEST__,N=()=>[{name:"Data A",color:C.ORANGE,x:[400,430,450,470,490,510,530,550,570,590,610,630,650],y:[85,72,75,92,87,125,143,145,150,165,170,160,145]},{name:"Data B",color:C.RED,x:[390,410,430,450,470,490,510,530,550,570,590,610],y:[50,75,80,85,100,105,115,135,140,150,155,145]},{name:"Data C",color:C.GREEN,x:[410,440,460,480,500,520,540,560,580,600,620,640],y:[60,85,90,100,110,120,125,150,160,165,175,170]}],X={title:"Charts/ScatterGraph",component:P,parameters:{layout:"centered"},tags:["autodocs"]},g={name:"Default",parameters:{zephyr:{testCaseId:"SW-T1017"}},args:{dataSeries:N(),width:900,height:600,title:"Scatter Plot",xTitle:"Columns",yTitle:"Rows"},play:async({canvasElement:r,step:s})=>{const o=z(r);await s("Chart title is displayed",async()=>{l(o.getByText("Scatter Plot")).toBeInTheDocument()}),await s("Chart container renders",async()=>{l(r.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await s("Three traces are rendered",async()=>{const i=r.querySelectorAll(".scatterlayer .trace");l(i.length).toBe(3)}),await s("Legend shows all series names",async()=>{l(o.getByText("Data A")).toBeInTheDocument(),l(o.getByText("Data B")).toBeInTheDocument(),l(o.getByText("Data C")).toBeInTheDocument()})}},x={name:"Custom Ranges",parameters:{zephyr:{testCaseId:"SW-T1018"}},args:{...g.args,xRange:[300,700],yRange:[0,200]},play:async({canvasElement:r,step:s})=>{const o=z(r);await s("Chart title is displayed",async()=>{l(o.getByText("Scatter Plot")).toBeInTheDocument()}),await s("Chart container renders",async()=>{l(r.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await s("Three traces are rendered",async()=>{const i=r.querySelectorAll(".scatterlayer .trace");l(i.length).toBe(3)}),await s("Legend shows all series names",async()=>{l(o.getByText("Data A")).toBeInTheDocument(),l(o.getByText("Data B")).toBeInTheDocument(),l(o.getByText("Data C")).toBeInTheDocument()})}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: "Default",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T1017"
    }
  },
  args: {
    dataSeries: generateScatterDemoData(),
    width: 900,
    height: 600,
    title: "Scatter Plot",
    xTitle: "Columns",
    yTitle: "Rows"
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Scatter Plot")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Three traces are rendered", async () => {
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBe(3);
    });
    await step("Legend shows all series names", async () => {
      expect(canvas.getByText("Data A")).toBeInTheDocument();
      expect(canvas.getByText("Data B")).toBeInTheDocument();
      expect(canvas.getByText("Data C")).toBeInTheDocument();
    });
  }
}`,...g.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: "Custom Ranges",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T1018"
    }
  },
  args: {
    ...Default.args,
    xRange: [300, 700],
    yRange: [0, 200]
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Scatter Plot")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Three traces are rendered", async () => {
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBe(3);
    });
    await step("Legend shows all series names", async () => {
      expect(canvas.getByText("Data A")).toBeInTheDocument();
      expect(canvas.getByText("Data B")).toBeInTheDocument();
      expect(canvas.getByText("Data C")).toBeInTheDocument();
    });
  }
}`,...x.parameters?.docs?.source}}};const W=["Default","CustomRanges"];export{x as CustomRanges,g as Default,W as __namedExportsOrder,X as default};
