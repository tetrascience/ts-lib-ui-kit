import{C as e}from"./colors-O2mrKcAp.js";import{j as O}from"./jsx-runtime-CDt2p4po.js";import{r as k}from"./index-GiUgBvb1.js";import{P as b}from"./plotly-CNt8u1Bg.js";const $=({dataSeries:o,width:n=1e3,height:m=600,title:l="Dot Plot",xTitle:s="Columns",yTitle:r="Rows",variant:i="default",markerSize:d=8})=>{const c=k.useRef(null),F=Array.isArray(o)?o:[o],D=[e.ORANGE,e.RED,e.GREEN,e.BLUE,e.YELLOW,e.PURPLE],R=["circle","square","diamond","triangle-up","triangle-down","star"],J=F.map((a,u)=>i==="default"?{...a,color:a.color||D[0],symbol:"circle",size:a.size||d}:{...a,color:a.color||D[u%D.length],symbol:a.symbol||R[u%R.length],size:a.size||d}),E=e.GREY_200,L=J.map(a=>({type:"scatter",x:a.x,y:a.y,mode:"markers",name:a.name,marker:{color:a.color,size:a.size,symbol:a.symbol,line:{color:e.WHITE,width:1}},hovertemplate:`${s}: %{x}<br>${r}: %{y}<extra>${a.name}</extra>`})),C={tickcolor:e.GREY_200,ticklen:12,tickwidth:1,ticks:"outside",tickfont:{size:16,color:e.BLACK_900,family:"Inter, sans-serif",weight:400},linecolor:e.BLACK_900,linewidth:1,position:0,zeroline:!1},Q={text:l,x:.5,y:.95,xanchor:"center",yanchor:"top",font:{size:32,weight:600,family:"Inter, sans-serif",color:e.BLACK_900,lineheight:1.2,standoff:30}};return k.useEffect(()=>{if(!c.current)return;const a={width:n,height:m,font:{family:"Inter, sans-serif"},title:Q,margin:{l:80,r:40,b:80,t:80,pad:0},showlegend:!0,legend:{x:.5,y:-.2,xanchor:"center",yanchor:"top",orientation:"h",font:{size:13,color:e.BLUE_900,family:"Inter, sans-serif",weight:500,lineheight:18}},xaxis:{title:{text:s,font:{size:16,color:e.BLACK_600,family:"Inter, sans-serif",weight:400},standoff:15},gridcolor:E,...C},yaxis:{title:{text:r,font:{size:16,color:e.BLACK_600,family:"Inter, sans-serif",weight:400},standoff:15},gridcolor:E,...C},paper_bgcolor:e.WHITE,plot_bgcolor:e.WHITE},u={responsive:!0,displayModeBar:!1,displaylogo:!1};return b.newPlot(c.current,L,a,u),()=>{c.current&&b.purge(c.current)}},[o,n,m,s,r,i,d,L]),O.jsx("div",{className:"dotplot-container",style:{width:n},children:O.jsx("div",{ref:c,style:{width:"100%",height:"100%",margin:"0"}})})};$.__docgenInfo={description:"",methods:[],displayName:"DotPlot",props:{dataSeries:{required:!0,tsType:{name:"union",raw:"DotPlotDataSeries | DotPlotDataSeries[]",elements:[{name:"DotPlotDataSeries"},{name:"Array",elements:[{name:"DotPlotDataSeries"}],raw:"DotPlotDataSeries[]"}]},description:""},width:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"1000",computed:!1}},height:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"600",computed:!1}},title:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Dot Plot"',computed:!1}},xTitle:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Columns"',computed:!1}},yTitle:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Rows"',computed:!1}},variant:{required:!1,tsType:{name:"union",raw:'"default" | "stacked"',elements:[{name:"literal",value:'"default"'},{name:"literal",value:'"stacked"'}]},description:"",defaultValue:{value:'"default"',computed:!1}},markerSize:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"8",computed:!1}}}};const ne={title:"Organisms/DotPlot",component:$,parameters:{layout:"centered"},tags:["autodocs"]},t=(o,n,m=.15)=>{const l=[],s=[];for(let r=0;r<o;r++)for(let i=0;i<n;i++)Math.random()<m&&(l.push(i),s.push(r));return{x:l,y:s}},Z=(o,n,m)=>{const l=[],s=["Label","Label","Label","Label","Label","Label"];for(let r=0;r<m;r++){const{x:i,y:d}=t(o,n,.05);l.push({x:i,y:d.map(c=>c+r*.2),name:s[r%s.length]})}return l},y={args:{dataSeries:{x:t(25,41,.12).x,y:t(25,41,.12).y,name:"Label",color:e.ORANGE},title:"Dotplot",xTitle:"Columns",yTitle:"Rows",width:1e3,height:600,variant:"default",markerSize:8}},p={args:{dataSeries:Z(25,41,4).map((o,n)=>({...o,color:[e.ORANGE,e.RED,e.GREEN,e.BLUE,e.YELLOW,e.PURPLE][n],symbol:["circle","square","diamond","triangle-up"][n]})),title:"Dotplot Stacked",xTitle:"Columns",yTitle:"Rows",width:1e3,height:600,variant:"stacked",markerSize:8}},g={args:{dataSeries:[{x:t(15,25,.15).x,y:t(15,25,.15).y,name:"Series A",color:e.BLUE,symbol:"circle"},{x:t(15,25,.1).x,y:t(15,25,.1).y,name:"Series B",color:e.RED,symbol:"square"}],title:"Custom Colors Dotplot",xTitle:"X Axis",yTitle:"Y Axis",width:1e3,height:600,variant:"stacked",markerSize:10}},S={args:{dataSeries:{x:t(12,20,.18).x,y:t(12,20,.18).y,name:"Large Dots",color:e.GREEN},title:"Large Marker Dotplot",xTitle:"Columns",yTitle:"Rows",width:1e3,height:600,variant:"default",markerSize:15}},f={args:{dataSeries:[{x:t(10,15,.12).x,y:t(10,15,.12).y,name:"Series A",color:e.ORANGE,symbol:"circle"},{x:t(10,15,.1).x,y:t(10,15,.1).y,name:"Series B",color:e.BLUE,symbol:"square"},{x:t(10,15,.1).x,y:t(10,15,.1).y,name:"Series C",color:e.RED,symbol:"diamond"},{x:t(10,15,.09).x,y:t(10,15,.09).y,name:"Series D",color:e.GREEN,symbol:"triangle-up"}],title:"Multiple Series Colors",xTitle:"Position X",yTitle:"Position Y",width:1e3,height:600,variant:"stacked",markerSize:12}},h={args:{dataSeries:{x:t(8,12,.4).x,y:t(8,12,.4).y,name:"Small Grid",color:e.PURPLE},title:"Small Scale Dotplot",xTitle:"X",yTitle:"Y",width:500,height:600,variant:"default",markerSize:6}},x={args:{dataSeries:{x:t(20,30,.25).x,y:t(20,30,.25).y,name:"High Density",color:e.ORANGE},title:"High Density Dotplot",xTitle:"Columns",yTitle:"Rows",width:1e3,height:600,variant:"default",markerSize:6}};var G,w,T;y.parameters={...y.parameters,docs:{...(G=y.parameters)==null?void 0:G.docs,source:{originalSource:`{
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
  }
}`,...(T=(w=y.parameters)==null?void 0:w.docs)==null?void 0:T.source}}};var v,P,A;p.parameters={...p.parameters,docs:{...(v=p.parameters)==null?void 0:v.docs,source:{originalSource:`{
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
  }
}`,...(A=(P=p.parameters)==null?void 0:P.docs)==null?void 0:A.source}}};var z,N,B;g.parameters={...g.parameters,docs:{...(z=g.parameters)==null?void 0:z.docs,source:{originalSource:`{
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
  }
}`,...(B=(N=g.parameters)==null?void 0:N.docs)==null?void 0:B.source}}};var M,q,_;S.parameters={...S.parameters,docs:{...(M=S.parameters)==null?void 0:M.docs,source:{originalSource:`{
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
  }
}`,...(_=(q=S.parameters)==null?void 0:q.docs)==null?void 0:_.source}}};var U,W,Y;f.parameters={...f.parameters,docs:{...(U=f.parameters)==null?void 0:U.docs,source:{originalSource:`{
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
  }
}`,...(Y=(W=f.parameters)==null?void 0:W.docs)==null?void 0:Y.source}}};var I,H,V;h.parameters={...h.parameters,docs:{...(I=h.parameters)==null?void 0:I.docs,source:{originalSource:`{
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
  }
}`,...(V=(H=h.parameters)==null?void 0:H.docs)==null?void 0:V.source}}};var X,K,j;x.parameters={...x.parameters,docs:{...(X=x.parameters)==null?void 0:X.docs,source:{originalSource:`{
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
  }
}`,...(j=(K=x.parameters)==null?void 0:K.docs)==null?void 0:j.source}}};const se=["Default","Stacked","WithCustomColors","LargeMarkers","MultipleSeriesColors","SmallScale","HighDensity"];export{y as Default,x as HighDensity,S as LargeMarkers,f as MultipleSeriesColors,h as SmallScale,p as Stacked,g as WithCustomColors,se as __namedExportsOrder,ne as default};
