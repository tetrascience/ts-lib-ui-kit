import{C as r}from"./colors-O2mrKcAp.js";import{L as ma}from"./LineGraph-DuYVw2tG.js";import"./jsx-runtime-CDt2p4po.js";import"./index-GiUgBvb1.js";import"./plotly-CNt8u1Bg.js";const R=()=>{const e=[200,300,400,500,600,700,800,900,1e3];return[{name:"Data A",color:r.ORANGE,x:e,y:[75,140,105,120,145,115,110,80,90]},{name:"Data B",color:r.RED,x:e,y:[125,160,115,145,190,180,120,105,110]},{name:"Data C",color:r.GREEN,x:e,y:[185,195,145,215,205,200,160,145,135]},{name:"Data D",color:r.BLUE,x:e,y:[225,215,210,245,230,230,200,185,190]},{name:"Data E",color:r.YELLOW,x:e,y:[245,260,235,265,250,250,220,220,225]},{name:"Data F",color:r.PURPLE,x:e,y:[275,295,270,285,300,300,250,255,260]}]},sa=()=>{const e=[0,125,250,375,500,625,750,875,1e3],a=(D,ia)=>Math.round(Math.random()*(ia-D)+D);return[{name:"Data A",color:r.ORANGE,symbol:"circle",x:e,y:[0,a(40,80),a(90,120),a(110,140),a(130,160),a(110,140),a(100,130),a(70,100),a(80,110)]},{name:"Data B",color:r.RED,symbol:"square",x:e,y:[a(20,60),a(80,120),a(110,140),a(130,170),a(170,200),a(160,190),a(110,140),a(90,120),a(100,130)]},{name:"Data C",color:r.GREEN,symbol:"diamond",x:e,y:[0,a(70,110),a(120,160),a(180,230),a(170,220),a(170,220),a(130,180),a(120,170),a(110,160)]},{name:"Data D",color:r.BLUE,symbol:"triangle-up",x:e,y:[a(30,80),a(100,150),a(150,200),a(220,270),a(200,250),a(200,250),a(170,220),a(150,200),a(160,210)]},{name:"Data E",color:r.YELLOW,symbol:"triangle-down",x:e,y:[0,a(120,160),a(170,210),a(240,280),a(220,260),a(220,260),a(190,230),a(190,230),a(200,240)]},{name:"Data F",color:r.PURPLE,symbol:"pentagon",x:e,y:[a(50,100),a(140,180),a(190,230),a(260,300),a(270,310),a(270,310),a(220,260),a(230,270),a(240,280)]}]},na=()=>{const e=[50,200,350,500,650,800,950,1100,1250];return[{name:"Data A",color:r.ORANGE,symbol:"circle",x:e,y:[20,35,30,45,25,40,30,20,25]},{name:"Data B",color:r.RED,symbol:"square",x:e,y:[120,140,130,145,160,150,135,125,155]},{name:"Data C",color:r.GREEN,symbol:"diamond",x:e,y:[320,360,340,380,350,370,330,345,355]}]},oa=()=>{const e=[400,425,450,475,500,525,550,575,600];return[{name:"Data A",color:r.ORANGE,symbol:"circle",x:e,y:[160,158,165,162,170,168,172,165,175]},{name:"Data B",color:r.RED,symbol:"square",x:e,y:[180,182,178,185,183,188,186,184,190]},{name:"Data C",color:r.GREEN,symbol:"diamond",x:e,y:[200,198,204,202,208,205,210,207,212]}]},y=()=>{const e=[200,300,400,500,600,700,800,900,1e3];return[{name:"Data A",color:r.ORANGE,symbol:"circle",x:e,y:[75,140,105,120,145,115,110,80,90]},{name:"Data B",color:r.RED,symbol:"square",x:e,y:[125,160,115,145,190,180,120,105,110]},{name:"Data C",color:r.GREEN,symbol:"diamond",x:e,y:[185,195,145,215,205,200,160,145,135]},{name:"Data D",color:r.BLUE,symbol:"triangle-up",x:e,y:[225,215,210,245,230,230,200,185,190]},{name:"Data E",color:r.YELLOW,symbol:"triangle-down",x:e,y:[245,260,235,265,250,250,220,220,225]},{name:"Data F",color:r.PURPLE,symbol:"pentagon",x:e,y:[275,295,270,285,300,300,250,255,260]}]},ca=()=>y().map(a=>({...a,error_y:{type:"data",array:a.y.map(()=>10),visible:!0}})),ua={title:"Organisms/LineGraph",component:ma,parameters:{layout:"centered"},tags:["autodocs"]},t={args:{dataSeries:R(),title:"Basic Line Graph"}},s={args:{dataSeries:sa(),variant:"lines+markers",title:"Line Graph with Markers"}},n={args:{dataSeries:ca(),variant:"lines+markers+error_bars",title:"Line Graph with Error Bars"}},o={args:{dataSeries:na(),variant:"lines+markers",title:"Wide Range Data Graph"}},i={args:{dataSeries:oa(),variant:"lines+markers",title:"Narrow Range Data Graph"}},m={args:{dataSeries:R(),xTitle:"Time (s)",yTitle:"Temperature (°C)",title:"Temperature Over Time"}},c={args:{dataSeries:R(),xRange:[300,800],yRange:[100,300],title:"Custom Range Graph"}},d={args:{width:1e3,height:600,dataSeries:y(),variant:"lines+markers",xTitle:"Columns",yTitle:"Rows"},parameters:{docs:{description:{story:"This story demonstrates how the LineGraph automatically calculates appropriate ranges when none are provided."}}}},l={args:{width:1e3,height:600,dataSeries:na(),variant:"lines+markers",xTitle:"Columns",yTitle:"Rows"},parameters:{docs:{description:{story:"A graph with a wider data range, demonstrating how the LineGraph adapts its scales automatically."}}}},p={args:{width:1e3,height:600,dataSeries:oa(),variant:"lines+markers",xTitle:"Columns",yTitle:"Rows"},parameters:{docs:{description:{story:"A graph with a narrower data range, showing how the LineGraph adapts to focused data."}}}},g={args:{width:1e3,height:600,dataSeries:y(),variant:"lines+markers",xRange:[150,1050],xTitle:"Columns",yTitle:"Rows"},parameters:{docs:{description:{story:"In this example, only the X-axis range is provided, while the Y-axis uses autorange."}}}},h={args:{width:1e3,height:600,dataSeries:y(),variant:"lines+markers",yRange:[50,350],xTitle:"Columns",yTitle:"Rows"},parameters:{docs:{description:{story:"In this example, only the Y-axis range is provided, while the X-axis uses autorange."}}}},u={args:{width:1e3,height:600,dataSeries:sa(),variant:"lines+markers",xTitle:"Columns",yTitle:"Rows"},parameters:{docs:{description:{story:"This graph demonstrates data that starts from 0 on both axes, with evenly distributed data points."}}}};var w,S,x;t.parameters={...t.parameters,docs:{...(w=t.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    dataSeries: generateBasicDemoData(),
    title: "Basic Line Graph"
  }
}`,...(x=(S=t.parameters)==null?void 0:S.docs)==null?void 0:x.source}}};var T,E,v;s.parameters={...s.parameters,docs:{...(T=s.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    dataSeries: generateDataStartingFromZero(),
    variant: "lines+markers",
    title: "Line Graph with Markers"
  }
}`,...(v=(E=s.parameters)==null?void 0:E.docs)==null?void 0:v.source}}};var G,L,b;n.parameters={...n.parameters,docs:{...(G=n.parameters)==null?void 0:G.docs,source:{originalSource:`{
  args: {
    dataSeries: generateDemoDataWithErrorBars(),
    variant: "lines+markers+error_bars",
    title: "Line Graph with Error Bars"
  }
}`,...(b=(L=n.parameters)==null?void 0:L.docs)==null?void 0:b.source}}};var C,k,A;o.parameters={...o.parameters,docs:{...(C=o.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    dataSeries: generateWideRangeData(),
    variant: "lines+markers",
    title: "Wide Range Data Graph"
  }
}`,...(A=(k=o.parameters)==null?void 0:k.docs)==null?void 0:A.source}}};var B,N,O;i.parameters={...i.parameters,docs:{...(B=i.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {
    dataSeries: generateNarrowRangeData(),
    variant: "lines+markers",
    title: "Narrow Range Data Graph"
  }
}`,...(O=(N=i.parameters)==null?void 0:N.docs)==null?void 0:O.source}}};var W,P,Y;m.parameters={...m.parameters,docs:{...(W=m.parameters)==null?void 0:W.docs,source:{originalSource:`{
  args: {
    dataSeries: generateBasicDemoData(),
    xTitle: "Time (s)",
    yTitle: "Temperature (°C)",
    title: "Temperature Over Time"
  }
}`,...(Y=(P=m.parameters)==null?void 0:P.docs)==null?void 0:Y.source}}};var F,f,M;c.parameters={...c.parameters,docs:{...(F=c.parameters)==null?void 0:F.docs,source:{originalSource:`{
  args: {
    dataSeries: generateBasicDemoData(),
    xRange: [300, 800],
    yRange: [100, 300],
    title: "Custom Range Graph"
  }
}`,...(M=(f=c.parameters)==null?void 0:f.docs)==null?void 0:M.source}}};var U,X,Z;d.parameters={...d.parameters,docs:{...(U=d.parameters)==null?void 0:U.docs,source:{originalSource:`{
  args: {
    width: 1000,
    height: 600,
    dataSeries: generateDemoData(),
    variant: "lines+markers",
    xTitle: "Columns",
    yTitle: "Rows"
  },
  parameters: {
    docs: {
      description: {
        story: "This story demonstrates how the LineGraph automatically calculates appropriate ranges when none are provided."
      }
    }
  }
}`,...(Z=(X=d.parameters)==null?void 0:X.docs)==null?void 0:Z.source}}};var _,q,I;l.parameters={...l.parameters,docs:{...(_=l.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    width: 1000,
    height: 600,
    dataSeries: generateWideRangeData(),
    variant: "lines+markers",
    xTitle: "Columns",
    yTitle: "Rows"
  },
  parameters: {
    docs: {
      description: {
        story: "A graph with a wider data range, demonstrating how the LineGraph adapts its scales automatically."
      }
    }
  }
}`,...(I=(q=l.parameters)==null?void 0:q.docs)==null?void 0:I.source}}};var j,z,H;p.parameters={...p.parameters,docs:{...(j=p.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    width: 1000,
    height: 600,
    dataSeries: generateNarrowRangeData(),
    variant: "lines+markers",
    xTitle: "Columns",
    yTitle: "Rows"
  },
  parameters: {
    docs: {
      description: {
        story: "A graph with a narrower data range, showing how the LineGraph adapts to focused data."
      }
    }
  }
}`,...(H=(z=p.parameters)==null?void 0:z.docs)==null?void 0:H.source}}};var J,K,Q;g.parameters={...g.parameters,docs:{...(J=g.parameters)==null?void 0:J.docs,source:{originalSource:`{
  args: {
    width: 1000,
    height: 600,
    dataSeries: generateDemoData(),
    variant: "lines+markers",
    xRange: [150, 1050],
    xTitle: "Columns",
    yTitle: "Rows"
  },
  parameters: {
    docs: {
      description: {
        story: "In this example, only the X-axis range is provided, while the Y-axis uses autorange."
      }
    }
  }
}`,...(Q=(K=g.parameters)==null?void 0:K.docs)==null?void 0:Q.source}}};var V,$,aa;h.parameters={...h.parameters,docs:{...(V=h.parameters)==null?void 0:V.docs,source:{originalSource:`{
  args: {
    width: 1000,
    height: 600,
    dataSeries: generateDemoData(),
    variant: "lines+markers",
    yRange: [50, 350],
    xTitle: "Columns",
    yTitle: "Rows"
  },
  parameters: {
    docs: {
      description: {
        story: "In this example, only the Y-axis range is provided, while the X-axis uses autorange."
      }
    }
  }
}`,...(aa=($=h.parameters)==null?void 0:$.docs)==null?void 0:aa.source}}};var ea,ra,ta;u.parameters={...u.parameters,docs:{...(ea=u.parameters)==null?void 0:ea.docs,source:{originalSource:`{
  args: {
    width: 1000,
    height: 600,
    dataSeries: generateDataStartingFromZero(),
    variant: "lines+markers",
    xTitle: "Columns",
    yTitle: "Rows"
  },
  parameters: {
    docs: {
      description: {
        story: "This graph demonstrates data that starts from 0 on both axes, with evenly distributed data points."
      }
    }
  }
}`,...(ta=(ra=u.parameters)==null?void 0:ra.docs)==null?void 0:ta.source}}};const ya=["Basic","WithMarkers","WithErrorBars","WideRange","NarrowRange","CustomAxes","CustomRange","AutoRangeLineGraph","WideRangeAutoScaled","NarrowRangeAutoScaled","OnlyXRangeProvided","OnlyYRangeProvided","LineGraphStartingFromZero"];export{d as AutoRangeLineGraph,t as Basic,m as CustomAxes,c as CustomRange,u as LineGraphStartingFromZero,i as NarrowRange,p as NarrowRangeAutoScaled,g as OnlyXRangeProvided,h as OnlyYRangeProvided,o as WideRange,l as WideRangeAutoScaled,n as WithErrorBars,s as WithMarkers,ya as __namedExportsOrder,ua as default};
