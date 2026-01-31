import{C as e}from"./colors-O2mrKcAp.js";import{j as A}from"./jsx-runtime-CDt2p4po.js";import{r as M}from"./index-GiUgBvb1.js";import{P as S}from"./plotly-CNt8u1Bg.js";const z=({dataSeries:r,width:h=1e3,height:y=600,xRange:f,yRange:l,variant:g="group",xTitle:B="Columns",yTitle:x="Rows",title:w="Bar Graph",barWidth:b=24})=>{const o=M.useRef(null),K=()=>{let s=Number.MAX_VALUE,a=Number.MIN_VALUE,n=Number.MAX_VALUE,t=Number.MIN_VALUE;r.forEach(v=>{v.x.forEach(i=>{s=Math.min(s,i),a=Math.max(a,i)}),v.y.forEach(i=>{n=Math.min(n,i),t=Math.max(t,i)})});const G=(a-s)*.1,E=(t-n)*.1;return{xMin:s-G,xMax:a+G,yMin:g==="stack"?0:n-E,yMax:t+E}},{yMin:P,yMax:U}=K(),c=l||[P,U],j=()=>{const s=c[1]-c[0];let a=Math.pow(10,Math.floor(Math.log10(s)));s/a>10&&(a=a*2),s/a<4&&(a=a/2);const n=[];let t=Math.ceil(c[0]/a)*a;for(;t<=c[1];)n.push(t),t+=a;return n},W=Array.from(new Set(r.flatMap(s=>s.x))),H=j(),F=()=>{switch(g){case"stack":return"stack";case"overlay":return"overlay";case"group":default:return"group"}},k={tickcolor:e.GREY_200,ticklen:12,tickwidth:1,ticks:"outside",tickfont:{size:16,color:e.BLACK_900,family:"Inter, sans-serif",weight:400},linecolor:e.BLACK_900,linewidth:1,position:0,zeroline:!1};return M.useEffect(()=>{if(!o.current)return;const s=r.map(t=>({x:t.x,y:t.y,type:"bar",name:t.name,marker:{color:t.color},width:b,error_y:t.error_y})),a={title:{text:w,font:{size:32,family:"Inter, sans-serif",color:e.BLACK_900}},width:h,height:y,margin:{l:80,r:30,b:80,t:60,pad:0},paper_bgcolor:e.WHITE,plot_bgcolor:e.WHITE,font:{family:"Inter, sans-serif"},barmode:F(),bargap:.15,dragmode:!1,xaxis:{title:{text:B,font:{size:16,color:e.BLACK_600,family:"Inter, sans-serif",weight:400},standoff:32},gridcolor:e.GREY_200,range:f,autorange:!f,tickmode:"array",tickvals:W,showgrid:!0,...k},yaxis:{title:{text:x,font:{size:16,color:e.BLACK_600,family:"Inter, sans-serif",weight:400},standoff:30},gridcolor:e.GREY_200,range:l,autorange:!l,tickmode:"array",tickvals:H,showgrid:!0,...k},legend:{x:.5,y:-.2,xanchor:"center",yanchor:"top",orientation:"h",font:{size:16,color:e.BLUE_900,family:"Inter, sans-serif",weight:500}},showlegend:r.length>1},n={responsive:!0,displayModeBar:!1,displaylogo:!1};return S.newPlot(o.current,s,a,n),()=>{o.current&&S.purge(o.current)}},[r,h,y,f,l,g,B,x,w,b]),A.jsx("div",{className:"bar-graph-container",children:A.jsx("div",{ref:o,style:{width:"100%",height:"100%"}})})};z.__docgenInfo={description:"",methods:[],displayName:"BarGraph",props:{dataSeries:{required:!0,tsType:{name:"Array",elements:[{name:"BarDataSeries"}],raw:"BarDataSeries[]"},description:""},width:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"1000",computed:!1}},height:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"600",computed:!1}},xRange:{required:!1,tsType:{name:"tuple",raw:"[number, number]",elements:[{name:"number"},{name:"number"}]},description:""},yRange:{required:!1,tsType:{name:"tuple",raw:"[number, number]",elements:[{name:"number"},{name:"number"}]},description:""},variant:{required:!1,tsType:{name:"union",raw:'"group" | "stack" | "overlay"',elements:[{name:"literal",value:'"group"'},{name:"literal",value:'"stack"'},{name:"literal",value:'"overlay"'}]},description:"",defaultValue:{value:'"group"',computed:!1}},xTitle:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Columns"',computed:!1}},yTitle:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Rows"',computed:!1}},title:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Bar Graph"',computed:!1}},barWidth:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"24",computed:!1}}}};const re={title:"Organisms/BarGraph",component:z,parameters:{layout:"centered"},tags:["autodocs"]},J=()=>{const r=[200,300,400,500,600,700,800,900,1e3];return[{name:"Data A",color:e.ORANGE,x:r,y:[220,180,200,135,185,160,280,225,280]}]},X=()=>{const r=[100,200,300,400,500,600,700,800,900,1e3];return[{name:"Data A",color:e.ORANGE,x:r,y:[140,140,195,205,230,65,300,290,175,280]},{name:"Data B",color:e.RED,x:r,y:[150,75,300,210,130,75,140,35,290,70]},{name:"Data C",color:e.GREEN,x:r,y:[55,185,225,75,105,120,215,155,90,265]}]},Q=()=>{const r=[200,300,400,500,600,700,800,900,1e3];return[{name:"Data A",color:e.ORANGE,x:r,y:[90,105,105,45,95,70,190,135,190]},{name:"Data B",color:e.RED,x:r,y:[90,75,90,90,95,90,90,90,90]}]},u={args:{dataSeries:J(),title:"Bar Graph",width:1e3,height:600}},d={args:{dataSeries:X(),variant:"group",title:"Cluster Bar Graph",width:1e3,height:600}},m={args:{dataSeries:Q(),variant:"stack",title:"Stacked Bar Graph",width:1e3,height:600}},p={args:{dataSeries:X(),title:"Custom Bar Graph",xTitle:"X-Axis Label",yTitle:"Y-Axis Label",width:1e3,height:600,barWidth:16}};var _,T,D;u.parameters={...u.parameters,docs:{...(_=u.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    dataSeries: generateBasicData(),
    title: "Bar Graph",
    width: 1000,
    height: 600
  }
}`,...(D=(T=u.parameters)==null?void 0:T.docs)==null?void 0:D.source}}};var C,L,R;d.parameters={...d.parameters,docs:{...(C=d.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    dataSeries: generateGroupedBarData(),
    variant: "group",
    title: "Cluster Bar Graph",
    width: 1000,
    height: 600
  }
}`,...(R=(L=d.parameters)==null?void 0:L.docs)==null?void 0:R.source}}};var N,I,V;m.parameters={...m.parameters,docs:{...(N=m.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    dataSeries: generateStackedBarData(),
    variant: "stack",
    title: "Stacked Bar Graph",
    width: 1000,
    height: 600
  }
}`,...(V=(I=m.parameters)==null?void 0:I.docs)==null?void 0:V.source}}};var q,Y,O;p.parameters={...p.parameters,docs:{...(q=p.parameters)==null?void 0:q.docs,source:{originalSource:`{
  args: {
    dataSeries: generateGroupedBarData(),
    title: "Custom Bar Graph",
    xTitle: "X-Axis Label",
    yTitle: "Y-Axis Label",
    width: 1000,
    height: 600,
    barWidth: 16
  }
}`,...(O=(Y=p.parameters)==null?void 0:Y.docs)==null?void 0:O.source}}};const te=["Basic","GroupedBars","StackedBars","CustomStyling"];export{u as Basic,p as CustomStyling,d as GroupedBars,m as StackedBars,te as __namedExportsOrder,re as default};
