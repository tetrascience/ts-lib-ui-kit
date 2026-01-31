import{C as t}from"./colors-O2mrKcAp.js";import{j as m}from"./jsx-runtime-CDt2p4po.js";import{r as v,R as he}from"./index-GiUgBvb1.js";import{P as B}from"./plotly-CNt8u1Bg.js";const ge=n=>n.reduce((r,o)=>r+o,0)/n.length,pe=(n,s)=>{const o=n.map(i=>Math.pow(i-s,2)).reduce((i,c)=>i+c,0)/n.length;return Math.sqrt(o)},xe=(n,s,r,o,i=100)=>{const c=[],d=[],g=(o-r)/(i-1);for(let a=0;a<i;a++){const p=r+a*g;c.push(p);const E=-.5*Math.pow((p-n)/s,2),S=1/(s*Math.sqrt(2*Math.PI))*Math.exp(E);d.push(S)}return{x:c,y:d}},fe=(n,s,r)=>{const o=Math.ceil((r.end-r.start)/r.size),i=Array(o).fill(0);s.forEach(a=>{if(a>=r.start&&a<=r.end){const p=Math.floor((a-r.start)/r.size);i[p]++}});const c=Math.max(...i),d=Math.max(...n),g=c/d;return n.map(a=>a*g)},se=({dataSeries:n,width:s=480,height:r=480,title:o="Histogram",xTitle:i="X Axis",yTitle:c="Frequency",bargap:d=.2,showDistributionLine:g=!1})=>{const a=v.useRef(null),p=Array.isArray(n)?n:[n],E=p.length>1?"stack":void 0,S=[t.ORANGE,t.RED,t.BLUE,t.GREEN,t.PURPLE,t.YELLOW],N=p.map((e,h)=>{const x=typeof e.showDistributionLine<"u"?e.showDistributionLine:g;return{...e,color:e.color||S[h%S.length],opacity:x?.5:e.opacity||1,showDistributionLine:x,lineWidth:e.lineWidth||3}}),O=t.GREY_200,le=N.map(e=>({type:"histogram",x:e.x,name:e.name,marker:{color:e.color,line:{color:t.WHITE,width:1},opacity:e.opacity},autobinx:e.autobinx,xbins:e.xbins,hovertemplate:`${i}: %{x}<br>${c}: %{y}<extra>${e.name}</extra>`})),ce=N.filter(e=>e.showDistributionLine).map(e=>{const h=ge(e.x),x=pe(e.x,h),f=Math.min(...e.x),u=Math.max(...e.x),y=u-f,A=f-y*.1,F=u+y*.1,me=e.xbins||{start:A,end:F,size:y/10},M=xe(h,x,A,F,100),de=fe(M.y,e.x,me);return{type:"scatter",x:M.x,y:de,mode:"lines",name:`${e.name} Distribution`,line:{color:e.color,width:e.lineWidth},hoverinfo:"none"}}),H=[...le,...ce];v.useEffect(()=>{if(!a.current)return;const e={width:s,height:r,font:{family:"Inter, sans-serif"},showlegend:!1,margin:{l:90,r:40,b:80,t:40},xaxis:{title:{text:i,font:{size:16,color:t.BLACK_600,family:"Inter, sans-serif",weight:400},standoff:20},gridcolor:O,tickcolor:t.GREY_200,ticklen:8,tickwidth:1,ticks:"outside",linecolor:t.BLACK_900,linewidth:1,zeroline:!1},yaxis:{title:{text:c,font:{size:16,color:t.BLACK_600,family:"Inter, sans-serif",weight:400},standoff:20},gridcolor:O,tickcolor:t.GREY_200,ticklen:8,tickwidth:1,ticks:"outside",linecolor:t.BLACK_900,linewidth:1,zeroline:!1,rangemode:"tozero"},barmode:E,bargap:d,paper_bgcolor:t.WHITE,plot_bgcolor:t.WHITE},h={responsive:!0,displayModeBar:!1,displaylogo:!1};return B.newPlot(a.current,H,e,h),()=>{a.current&&B.purge(a.current)}},[n,s,r,o,i,c,d,g,H]);const ue=({series:e})=>{const h=e.map((u,y)=>m.jsx(he.Fragment,{children:m.jsxs("div",{className:"legend-item",children:[m.jsx("span",{className:"color-box",style:{background:u.color}}),u.name,y<e.length-1&&m.jsx("span",{className:"divider"})]})},u.name)),x=[],f=6;for(let u=0;u<h.length;u+=f)x.push(m.jsx("div",{className:"legend-row",children:h.slice(u,u+f)},u));return m.jsx("div",{className:"legend-container",children:x})};return m.jsx("div",{className:"histogram-container",style:{width:s},children:m.jsxs("div",{className:"chart-container",children:[o&&m.jsx("div",{className:"title-container",children:m.jsx("h2",{className:"title",children:o})}),m.jsx("div",{ref:a,style:{width:"100%",height:"100%",margin:"0"}}),m.jsx(ue,{series:N})]})})};se.__docgenInfo={description:"",methods:[],displayName:"Histogram",props:{dataSeries:{required:!0,tsType:{name:"union",raw:"HistogramDataSeries | HistogramDataSeries[]",elements:[{name:"HistogramDataSeries"},{name:"Array",elements:[{name:"HistogramDataSeries"}],raw:"HistogramDataSeries[]"}]},description:""},width:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"480",computed:!1}},height:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"480",computed:!1}},title:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Histogram"',computed:!1}},xTitle:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"X Axis"',computed:!1}},yTitle:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Frequency"',computed:!1}},bargap:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"0.2",computed:!1}},showDistributionLine:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}}}};const we={title:"Organisms/Histogram",component:se,parameters:{layout:"centered"},tags:["autodocs"]},l=(n,s,r)=>{const o=[];for(let i=0;i<r;i++){const c=Math.random(),d=Math.random(),g=Math.sqrt(-2*Math.log(c))*Math.cos(2*Math.PI*d),a=n+g*s;o.push(a)}return o},D={args:{dataSeries:{x:l(20,8,200),name:"Label"},title:"Histogram",xTitle:"Torque",yTitle:"Frequency",width:480,height:480}},T={args:{dataSeries:{x:l(20,8,200),name:"Custom Color",color:t.RED},title:"Histogram with Custom Color",xTitle:"Torque",yTitle:"Frequency",width:480,height:480}},b={args:{dataSeries:{x:l(20,8,200),name:"Custom Bins",autobinx:!1,xbins:{start:0,end:40,size:4}},title:"Histogram with Custom Bins",xTitle:"Torque",yTitle:"Frequency",width:480,height:480}},w={args:{dataSeries:[{x:l(20,8,200),name:"Series A",color:t.ORANGE},{x:l(20,6,150),name:"Series B",color:t.RED}],title:"Group of Histogram",xTitle:"Torque",yTitle:"Frequency",width:480,height:480}},L={args:{dataSeries:[{x:l(10,5,100),name:"Series A",color:t.BLUE},{x:l(20,5,100),name:"Series B",color:t.RED},{x:l(30,5,100),name:"Series C",color:t.GREEN},{x:l(40,5,100),name:"Series D",color:t.ORANGE}],title:"Multiple Series Histogram",xTitle:"Torque",yTitle:"Frequency",width:600,height:480}},q={args:{dataSeries:{x:l(20,8,200),name:"Label",color:t.ORANGE},title:"Histogram with Fitted Distribution Line",xTitle:"Torque",yTitle:"Frequency",width:480,height:480,showDistributionLine:!0}},C={args:{dataSeries:{x:l(20,8,200),name:"Label",color:t.ORANGE,autobinx:!1,xbins:{start:0,end:40,size:4}},title:"Histogram with Fitted Distribution Line",xTitle:"Torque",yTitle:"Frequency",width:480,height:480,showDistributionLine:!0}},R={args:{dataSeries:[{x:l(20,8,200),name:"Series A",color:t.ORANGE},{x:l(15,5,150),name:"Series B",color:t.RED}],title:"Group of Histogram with Fitted Distribution Line",xTitle:"Torque",yTitle:"Frequency",width:600,height:500,showDistributionLine:!0}};var G,W,j;D.parameters={...D.parameters,docs:{...(G=D.parameters)==null?void 0:G.docs,source:{originalSource:`{
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
  }
}`,...(j=(W=D.parameters)==null?void 0:W.docs)==null?void 0:j.source}}};var z,k,_;T.parameters={...T.parameters,docs:{...(z=T.parameters)==null?void 0:z.docs,source:{originalSource:`{
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
  }
}`,...(_=(k=T.parameters)==null?void 0:k.docs)==null?void 0:_.source}}};var I,V,P;b.parameters={...b.parameters,docs:{...(I=b.parameters)==null?void 0:I.docs,source:{originalSource:`{
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
  }
}`,...(P=(V=b.parameters)==null?void 0:V.docs)==null?void 0:P.source}}};var Y,K,U;w.parameters={...w.parameters,docs:{...(Y=w.parameters)==null?void 0:Y.docs,source:{originalSource:`{
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
  }
}`,...(U=(K=w.parameters)==null?void 0:K.docs)==null?void 0:U.source}}};var $,X,J;L.parameters={...L.parameters,docs:{...($=L.parameters)==null?void 0:$.docs,source:{originalSource:`{
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
  }
}`,...(J=(X=L.parameters)==null?void 0:X.docs)==null?void 0:J.source}}};var Q,Z,ee;q.parameters={...q.parameters,docs:{...(Q=q.parameters)==null?void 0:Q.docs,source:{originalSource:`{
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
  }
}`,...(ee=(Z=q.parameters)==null?void 0:Z.docs)==null?void 0:ee.source}}};var te,re,ne;C.parameters={...C.parameters,docs:{...(te=C.parameters)==null?void 0:te.docs,source:{originalSource:`{
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
  }
}`,...(ne=(re=C.parameters)==null?void 0:re.docs)==null?void 0:ne.source}}};var ae,ie,oe;R.parameters={...R.parameters,docs:{...(ae=R.parameters)==null?void 0:ae.docs,source:{originalSource:`{
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
  }
}`,...(oe=(ie=R.parameters)==null?void 0:ie.docs)==null?void 0:oe.source}}};const Le=["Default","WithCustomColor","WithCustomBins","StackedHistogram","MultipleSeries","WithDistributionLine","WithCustomBinsAndDistributionLine","MultipleSeriesWithDistributionLines"];export{D as Default,L as MultipleSeries,R as MultipleSeriesWithDistributionLines,w as StackedHistogram,b as WithCustomBins,C as WithCustomBinsAndDistributionLine,T as WithCustomColor,q as WithDistributionLine,Le as __namedExportsOrder,we as default};
