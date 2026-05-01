import{C as I}from"./colors-ClKyOP62.js";import{r as u,j as N}from"./iframe-14YYbrss.js";import{P as O}from"./plotly-BfU08UT2.js";import{u as W}from"./use-plotly-theme-DDaBOKiZ.js";import"./preload-helper-BbFkF2Um.js";const V=({dataSeries:t,width:n=1e3,height:r=600,xRange:m,yRange:g,variant:T="normal",xTitle:A="Columns",yTitle:k="Rows",title:M="Area Graph"})=>{const x=u.useRef(null),c=W(),{xMin:b,xMax:E,yMin:R,yMax:q}=u.useMemo(()=>{let s=Number.MAX_VALUE,e=Number.MIN_VALUE,l=Number.MAX_VALUE,o=Number.MIN_VALUE;t.forEach(f=>{f.x.forEach(y=>{s=Math.min(s,y),e=Math.max(e,y)}),f.y.forEach(y=>{l=Math.min(l,y),o=Math.max(o,y)})});const i=(e-s)*.1,p=(o-l)*.1;return{xMin:s-i,xMax:e+i,yMin:T==="stacked"?0:l-p,yMax:o+p}},[t,T]),d=u.useMemo(()=>m||[b,E],[m,b,E]),h=u.useMemo(()=>g||[R,q],[g,R,q]),G=u.useMemo(()=>{const s=d[1]-d[0];let e=Math.pow(10,Math.floor(Math.log10(s)));s/e>10&&(e=e*2),s/e<4&&(e=e/2);const l=[];let o=Math.ceil(d[0]/e)*e;for(;o<=d[1];)l.push(o),o+=e;return l},[d]),z=u.useMemo(()=>{const s=h[1]-h[0];let e=Math.pow(10,Math.floor(Math.log10(s)));s/e>10&&(e=e*2),s/e<4&&(e=e/2);const l=[];let o=Math.ceil(h[0]/e)*e;for(;o<=h[1];)l.push(o),o+=e;return l},[h]),v=u.useMemo(()=>({tickcolor:c.tickColor,ticklen:12,tickwidth:1,ticks:"outside",tickfont:{size:16,color:c.textColor,family:"Inter, sans-serif",weight:400},linecolor:c.lineColor,linewidth:1,position:0,zeroline:!1}),[c]),_=u.useMemo(()=>({text:M,x:.5,y:.95,xanchor:"center",yanchor:"top",font:{size:32,weight:600,family:"Inter, sans-serif",color:c.textColor,lineheight:1.2,standoff:30}}),[M,c]);return u.useEffect(()=>{if(!x.current)return;let s;if(T==="stacked"){const i=new Array(t[0]?.x.length||0).fill(0);s=t.map((p,f)=>{const y=p.y.map((P,L)=>{const j=i[L]+P;return i[L]=j,j});return{x:p.x,y,type:"scatter",mode:"lines",name:p.name,fill:f===0?"tozeroy":"tonexty",fillcolor:p.color,line:{color:p.color,width:2}}})}else s=t.map(i=>({x:i.x,y:i.y,type:"scatter",mode:"lines",name:i.name,fill:i.fill||"tozeroy",fillcolor:i.color,line:{color:i.color,width:2}}));const e={width:n,height:r,title:_,margin:{l:80,r:40,b:80,t:80,pad:0},paper_bgcolor:c.paperBg,plot_bgcolor:c.plotBg,font:{family:"Inter, sans-serif"},dragmode:!1,xaxis:{title:{text:A,font:{size:16,color:c.textSecondary,family:"Inter, sans-serif",weight:400},standoff:15},gridcolor:c.gridColor,range:m,autorange:!m,tickmode:"array",tickvals:G,showgrid:!0,...v},yaxis:{title:{text:k,font:{size:16,color:c.textSecondary,family:"Inter, sans-serif",weight:400},standoff:15},gridcolor:c.gridColor,range:g,autorange:!g,tickmode:"array",tickvals:z,showgrid:!0,...v},legend:{x:.5,y:-.2,xanchor:"center",yanchor:"top",orientation:"h",font:{size:13,color:c.legendColor,family:"Inter, sans-serif",weight:500,lineheight:18}},showlegend:!0},l={responsive:!0,displayModeBar:!1,displaylogo:!1};O.newPlot(x.current,s,e,l);const o=x.current;return()=>{o&&O.purge(o)}},[t,n,r,m,g,d,h,T,A,k,_,v,G,z,c]),N.jsx("div",{className:"area-graph-container",children:N.jsx("div",{ref:x,style:{width:"100%",height:"100%"}})})};V.__docgenInfo={description:"",methods:[],displayName:"AreaGraph",props:{dataSeries:{required:!0,tsType:{name:"Array",elements:[{name:"AreaDataSeries"}],raw:"AreaDataSeries[]"},description:""},width:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"1000",computed:!1}},height:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"600",computed:!1}},xRange:{required:!1,tsType:{name:"tuple",raw:"[number, number]",elements:[{name:"number"},{name:"number"}]},description:""},yRange:{required:!1,tsType:{name:"tuple",raw:"[number, number]",elements:[{name:"number"},{name:"number"}]},description:""},variant:{required:!1,tsType:{name:"union",raw:'"normal" | "stacked"',elements:[{name:"literal",value:'"normal"'},{name:"literal",value:'"stacked"'}]},description:"",defaultValue:{value:'"normal"',computed:!1}},xTitle:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Columns"',computed:!1}},yTitle:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Rows"',computed:!1}},title:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Area Graph"',computed:!1}}}};const{expect:a,within:C}=__STORYBOOK_MODULE_TEST__,H={title:"Charts/AreaGraph",component:V,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{variant:{control:{type:"select"},options:["normal","stacked"]},width:{control:{type:"number"}},height:{control:{type:"number"}}}},D=[{x:[200,300,400,500,600,700,800,900,1e3],y:[120,130,100,110,140,160,150,140,110],name:"Series 1",color:I.ORANGE},{x:[200,300,400,500,600,700,800,900,1e3],y:[30,40,50,60,70,50,40,30,20],name:"Series 2",color:I.RED},{x:[200,300,400,500,600,700,800,900,1e3],y:[20,30,25,35,40,30,25,20,15],name:"Series 3",color:I.GREEN}],w={name:"Default",parameters:{zephyr:{testCaseId:"SW-T963"}},args:{dataSeries:D,title:"Area Graph",xTitle:"Columns",yTitle:"Rows",width:1e3,height:600,variant:"normal"},play:async({canvasElement:t,step:n})=>{const r=C(t);await n("Chart title is displayed",async()=>{a(r.getByText("Area Graph")).toBeInTheDocument()}),await n("Chart container renders",async()=>{a(t.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await n("Three traces are rendered",async()=>{const m=t.querySelectorAll(".scatterlayer .trace");a(m.length).toBe(3)}),await n("Legend shows all series names",async()=>{a(r.getByText("Series 1")).toBeInTheDocument(),a(r.getByText("Series 2")).toBeInTheDocument(),a(r.getByText("Series 3")).toBeInTheDocument()})}},B={name:"Stacked",parameters:{zephyr:{testCaseId:"SW-T964"}},args:{dataSeries:D,title:"Stacked Area Graph",xTitle:"Columns",yTitle:"Rows",width:1e3,height:600,variant:"stacked"},play:async({canvasElement:t,step:n})=>{const r=C(t);await n("Chart title is displayed",async()=>{a(r.getByText("Stacked Area Graph")).toBeInTheDocument()}),await n("Chart container renders",async()=>{a(t.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await n("Three traces are rendered",async()=>{const m=t.querySelectorAll(".scatterlayer .trace");a(m.length).toBe(3)}),await n("Legend shows all series names",async()=>{a(r.getByText("Series 1")).toBeInTheDocument(),a(r.getByText("Series 2")).toBeInTheDocument(),a(r.getByText("Series 3")).toBeInTheDocument()})}},S={name:"Custom Range",parameters:{zephyr:{testCaseId:"SW-T965"}},args:{dataSeries:D,title:"Area Graph with Custom Range",xTitle:"Columns",yTitle:"Rows",width:1e3,height:600,variant:"normal",xRange:[300,900],yRange:[0,200]},play:async({canvasElement:t,step:n})=>{const r=C(t);await n("Chart title is displayed",async()=>{a(r.getByText("Area Graph with Custom Range")).toBeInTheDocument()}),await n("Chart container renders",async()=>{a(t.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await n("Three traces are rendered",async()=>{const m=t.querySelectorAll(".scatterlayer .trace");a(m.length).toBe(3)}),await n("Legend shows all series names",async()=>{a(r.getByText("Series 1")).toBeInTheDocument(),a(r.getByText("Series 2")).toBeInTheDocument(),a(r.getByText("Series 3")).toBeInTheDocument()})}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: "Default",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T963"
    }
  },
  args: {
    dataSeries: sampleDataSeries,
    title: "Area Graph",
    xTitle: "Columns",
    yTitle: "Rows",
    width: 1000,
    height: 600,
    variant: "normal"
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Area Graph")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Three traces are rendered", async () => {
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBe(3);
    });
    await step("Legend shows all series names", async () => {
      expect(canvas.getByText("Series 1")).toBeInTheDocument();
      expect(canvas.getByText("Series 2")).toBeInTheDocument();
      expect(canvas.getByText("Series 3")).toBeInTheDocument();
    });
  }
}`,...w.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  name: "Stacked",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T964"
    }
  },
  args: {
    dataSeries: sampleDataSeries,
    title: "Stacked Area Graph",
    xTitle: "Columns",
    yTitle: "Rows",
    width: 1000,
    height: 600,
    variant: "stacked"
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Stacked Area Graph")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Three traces are rendered", async () => {
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBe(3);
    });
    await step("Legend shows all series names", async () => {
      expect(canvas.getByText("Series 1")).toBeInTheDocument();
      expect(canvas.getByText("Series 2")).toBeInTheDocument();
      expect(canvas.getByText("Series 3")).toBeInTheDocument();
    });
  }
}`,...B.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: "Custom Range",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T965"
    }
  },
  args: {
    dataSeries: sampleDataSeries,
    title: "Area Graph with Custom Range",
    xTitle: "Columns",
    yTitle: "Rows",
    width: 1000,
    height: 600,
    variant: "normal",
    xRange: [300, 900],
    yRange: [0, 200]
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Area Graph with Custom Range")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Three traces are rendered", async () => {
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBe(3);
    });
    await step("Legend shows all series names", async () => {
      expect(canvas.getByText("Series 1")).toBeInTheDocument();
      expect(canvas.getByText("Series 2")).toBeInTheDocument();
      expect(canvas.getByText("Series 3")).toBeInTheDocument();
    });
  }
}`,...S.parameters?.docs?.source}}};const J=["Default","Stacked","CustomRange"];export{S as CustomRange,w as Default,B as Stacked,J as __namedExportsOrder,H as default};
