import{C as e}from"./colors-O2mrKcAp.js";import{j as b}from"./jsx-runtime-CDt2p4po.js";import{r as R}from"./index-GiUgBvb1.js";import{P as M}from"./plotly-CNt8u1Bg.js";const U=({dataSeries:d,width:x=1e3,height:h=600,xRange:g,yRange:n,xTitle:y="Columns",yTitle:B="Rows",title:w="Boxplot",showPoints:C=!1})=>{const s=R.useRef(null),j=()=>{let r=Number.MAX_VALUE,t=Number.MIN_VALUE;d.forEach(o=>{o.y.forEach(T=>{r=Math.min(r,T),t=Math.max(t,T)})});const a=(t-r)*.1;return{yMin:r-a,yMax:t+a}},{yMin:z,yMax:K}=j(),i=n||[z,K],W=(()=>{const r=i[1]-i[0];let t=Math.pow(10,Math.floor(Math.log10(r)));r/t>10&&(t=t*2),r/t<4&&(t=t/2);const a=[];let o=Math.ceil(i[0]/t)*t;for(;o<=i[1];)a.push(o),o+=t;return a})(),E={tickcolor:e.GREY_200,ticklen:12,tickwidth:1,ticks:"outside",tickfont:{size:16,color:e.BLACK_900,family:"Inter, sans-serif",weight:400},linecolor:e.BLACK_900,linewidth:1,position:0,zeroline:!1},X={text:w,x:.5,y:.95,xanchor:"center",yanchor:"top",font:{size:32,weight:600,family:"Inter, sans-serif",color:e.BLACK_900,lineheight:1.2,standoff:30}};return R.useEffect(()=>{if(!s.current)return;const r=d.map(o=>({y:o.y,x:o.x,type:"box",name:o.name,marker:{color:o.color},line:{color:o.color},fillcolor:o.color+"40",boxpoints:C?o.boxpoints||"outliers":!1,jitter:o.jitter||.3,pointpos:o.pointpos||-1.8})),t={width:x,height:h,title:X,margin:{l:80,r:40,b:80,t:80,pad:0},paper_bgcolor:e.WHITE,plot_bgcolor:e.WHITE,font:{family:"Inter, sans-serif"},dragmode:!1,xaxis:{title:{text:y,font:{size:16,color:e.BLACK_600,family:"Inter, sans-serif",weight:400},standoff:15},gridcolor:e.GREY_200,range:g,autorange:!g,showgrid:!0,...E},yaxis:{title:{text:B,font:{size:16,color:e.BLACK_600,family:"Inter, sans-serif",weight:400},standoff:15},gridcolor:e.GREY_200,range:n,autorange:!n,tickmode:"array",tickvals:W,showgrid:!0,...E},legend:{x:.5,y:-.2,xanchor:"center",yanchor:"top",orientation:"h",font:{size:13,color:e.BLUE_900,family:"Inter, sans-serif",weight:500,lineheight:18}},showlegend:!0},a={responsive:!0,displayModeBar:!1,displaylogo:!1};return M.newPlot(s.current,r,t,a),()=>{s.current&&M.purge(s.current)}},[d,x,h,g,n,y,B,w,C]),b.jsx("div",{className:"boxplot-container",children:b.jsx("div",{ref:s,style:{width:"100%",height:"100%"}})})};U.__docgenInfo={description:"",methods:[],displayName:"Boxplot",props:{dataSeries:{required:!0,tsType:{name:"Array",elements:[{name:"BoxDataSeries"}],raw:"BoxDataSeries[]"},description:""},width:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"1000",computed:!1}},height:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"600",computed:!1}},xRange:{required:!1,tsType:{name:"tuple",raw:"[number, number]",elements:[{name:"number"},{name:"number"}]},description:""},yRange:{required:!1,tsType:{name:"tuple",raw:"[number, number]",elements:[{name:"number"},{name:"number"}]},description:""},xTitle:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Columns"',computed:!1}},yTitle:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Rows"',computed:!1}},title:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Boxplot"',computed:!1}},showPoints:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}}}};const te={title:"Organisms/Boxplot",component:U,parameters:{layout:"centered"},tags:["autodocs"]},H=()=>[{name:"Data A",color:e.ORANGE,y:[155,135,175,185,120,125,140,160,180,145,170,165,150]}],F=()=>[{name:"Group 1",color:e.ORANGE,y:[155,135,175,185,120,125,140,160,180,145,170,165,150],x:["Group 1"]},{name:"Group 2",color:e.RED,y:[90,85,95,105,75,80,88,92,98,82,96,87,91],x:["Group 2"]},{name:"Group 3",color:e.GREEN,y:[185,165,205,215,150,155,170,190,210,175,200,195,180],x:["Group 3"]},{name:"Group 4",color:e.BLUE,y:[220,200,240,250,185,190,205,225,245,210,235,230,215],x:["Group 4"]},{name:"Group 5",color:e.PURPLE,y:[135,115,155,165,100,105,120,140,160,125,150,145,130],x:["Group 5"]}],f=()=>[{name:"Category A",color:e.ORANGE,y:[155,135,175,185,120,125,140,160,180,145,170,165,150,155,135,175,185,120,125,140],x:["200","200","200","200","200","200","200","200","200","200","200","200","200","200","200","200","200","200","200","200"]},{name:"Category B",color:e.RED,y:[90,85,95,105,75,80,88,92,98,82,96,87,91,85,95,105,75,80,88,92],x:["350","350","350","350","350","350","350","350","350","350","350","350","350","350","350","350","350","350","350","350"]},{name:"Category C",color:e.GREEN,y:[68,45,85,95,30,35,48,68,88,53,78,73,58,65,75,85,40,45,58,72],x:["500","500","500","500","500","500","500","500","500","500","500","500","500","500","500","500","500","500","500","500"]},{name:"Category D",color:e.BLUE,y:[220,200,240,250,185,190,205,225,245,210,235,230,215,225,195,235,245,180,185,200],x:["800","800","800","800","800","800","800","800","800","800","800","800","800","800","800","800","800","800","800","800"]},{name:"Category E",color:e.PURPLE,y:[135,115,155,165,100,105,120,140,160,125,150,145,130,125,135,145,90,95,110,130],x:["1000","1000","1000","1000","1000","1000","1000","1000","1000","1000","1000","1000","1000","1000","1000","1000","1000","1000","1000","1000"]}],l={args:{dataSeries:H(),title:"Boxplot",width:1e3,height:600}},c={args:{dataSeries:F(),title:"Multiple Boxplots",width:1e3,height:600}},u={args:{dataSeries:f(),title:"Boxplot",xTitle:"Columns",yTitle:"Rows",width:1e3,height:600}},p={args:{dataSeries:f(),title:"Boxplot with Outliers",xTitle:"Columns",yTitle:"Rows",showPoints:!0,width:1e3,height:600}},m={args:{dataSeries:f(),title:"Custom Boxplot",xTitle:"X-Axis Label",yTitle:"Y-Axis Label",width:1e3,height:600,showPoints:!0}};var S,A,G;l.parameters={...l.parameters,docs:{...(S=l.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    dataSeries: generateBasicBoxData(),
    title: "Boxplot",
    width: 1000,
    height: 600
  }
}`,...(G=(A=l.parameters)==null?void 0:A.docs)==null?void 0:G.source}}};var D,L,_;c.parameters={...c.parameters,docs:{...(D=c.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    dataSeries: generateMultipleBoxData(),
    title: "Multiple Boxplots",
    width: 1000,
    height: 600
  }
}`,...(_=(L=c.parameters)==null?void 0:L.docs)==null?void 0:_.source}}};var k,O,P;u.parameters={...u.parameters,docs:{...(k=u.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    dataSeries: generateCategoricalBoxData(),
    title: "Boxplot",
    xTitle: "Columns",
    yTitle: "Rows",
    width: 1000,
    height: 600
  }
}`,...(P=(O=u.parameters)==null?void 0:O.docs)==null?void 0:P.source}}};var v,I,N;p.parameters={...p.parameters,docs:{...(v=p.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    dataSeries: generateCategoricalBoxData(),
    title: "Boxplot with Outliers",
    xTitle: "Columns",
    yTitle: "Rows",
    showPoints: true,
    width: 1000,
    height: 600
  }
}`,...(N=(I=p.parameters)==null?void 0:I.docs)==null?void 0:N.source}}};var Y,q,V;m.parameters={...m.parameters,docs:{...(Y=m.parameters)==null?void 0:Y.docs,source:{originalSource:`{
  args: {
    dataSeries: generateCategoricalBoxData(),
    title: "Custom Boxplot",
    xTitle: "X-Axis Label",
    yTitle: "Y-Axis Label",
    width: 1000,
    height: 600,
    showPoints: true
  }
}`,...(V=(q=m.parameters)==null?void 0:q.docs)==null?void 0:V.source}}};const oe=["Basic","MultipleBoxes","CategoricalData","WithOutliers","CustomStyling"];export{l as Basic,u as CategoricalData,m as CustomStyling,c as MultipleBoxes,p as WithOutliers,oe as __namedExportsOrder,te as default};
