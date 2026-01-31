import{C as r}from"./colors-O2mrKcAp.js";import{j as b}from"./jsx-runtime-CDt2p4po.js";import{r as C}from"./index-GiUgBvb1.js";import{P as _}from"./plotly-CNt8u1Bg.js";const B=({dataSeries:l,width:k=1e3,height:T=600,xRange:m,yRange:u,variant:x="normal",xTitle:A="Columns",yTitle:M="Rows",title:R="Area Graph"})=>{const c=C.useRef(null),O=()=>{let t=Number.MAX_VALUE,e=Number.MIN_VALUE,n=Number.MAX_VALUE,a=Number.MIN_VALUE;l.forEach(f=>{f.x.forEach(i=>{t=Math.min(t,i),e=Math.max(e,i)}),f.y.forEach(i=>{n=Math.min(n,i),a=Math.max(a,i)})});const o=(e-t)*.1,s=(a-n)*.1;return{xMin:t-o,xMax:e+o,yMin:x==="stacked"?0:n-s,yMax:a+s}},{xMin:X,xMax:K,yMin:P,yMax:U}=O(),d=m||[X,K],p=u||[P,U],j=()=>{const t=d[1]-d[0];let e=Math.pow(10,Math.floor(Math.log10(t)));t/e>10&&(e=e*2),t/e<4&&(e=e/2);const n=[];let a=Math.ceil(d[0]/e)*e;for(;a<=d[1];)n.push(a),a+=e;return n},H=()=>{const t=p[1]-p[0];let e=Math.pow(10,Math.floor(Math.log10(t)));t/e>10&&(e=e*2),t/e<4&&(e=e/2);const n=[];let a=Math.ceil(p[0]/e)*e;for(;a<=p[1];)n.push(a),a+=e;return n},W=j(),F=H(),v={tickcolor:r.GREY_200,ticklen:12,tickwidth:1,ticks:"outside",tickfont:{size:16,color:r.BLACK_900,family:"Inter, sans-serif",weight:400},linecolor:r.BLACK_900,linewidth:1,position:0,zeroline:!1},J={text:R,x:.5,y:.95,xanchor:"center",yanchor:"top",font:{size:32,weight:600,family:"Inter, sans-serif",color:r.BLACK_900,lineheight:1.2,standoff:30}};return C.useEffect(()=>{var a;if(!c.current)return;let t;if(x==="stacked"){const o=new Array(((a=l[0])==null?void 0:a.x.length)||0).fill(0);t=l.map((s,f)=>{const i=s.y.map((Q,E)=>{const S=o[E]+Q;return o[E]=S,S});return{x:s.x,y:i,type:"scatter",mode:"lines",name:s.name,fill:f===0?"tozeroy":"tonexty",fillcolor:s.color,line:{color:s.color,width:2}}})}else t=l.map(o=>({x:o.x,y:o.y,type:"scatter",mode:"lines",name:o.name,fill:o.fill||"tozeroy",fillcolor:o.color,line:{color:o.color,width:2}}));const e={width:k,height:T,title:J,margin:{l:80,r:40,b:80,t:80,pad:0},paper_bgcolor:r.WHITE,plot_bgcolor:r.WHITE,font:{family:"Inter, sans-serif"},dragmode:!1,xaxis:{title:{text:A,font:{size:16,color:r.BLACK_600,family:"Inter, sans-serif",weight:400},standoff:15},gridcolor:r.GREY_200,range:m,autorange:!m,tickmode:"array",tickvals:W,showgrid:!0,...v},yaxis:{title:{text:M,font:{size:16,color:r.BLACK_600,family:"Inter, sans-serif",weight:400},standoff:15},gridcolor:r.GREY_200,range:u,autorange:!u,tickmode:"array",tickvals:F,showgrid:!0,...v},legend:{x:.5,y:-.2,xanchor:"center",yanchor:"top",orientation:"h",font:{size:13,color:r.BLUE_900,family:"Inter, sans-serif",weight:500,lineheight:18}},showlegend:!0},n={responsive:!0,displayModeBar:!1,displaylogo:!1};return _.newPlot(c.current,t,e,n),()=>{c.current&&_.purge(c.current)}},[l,k,T,m,u,x,A,M,R]),b.jsx("div",{className:"area-graph-container",children:b.jsx("div",{ref:c,style:{width:"100%",height:"100%"}})})};B.__docgenInfo={description:"",methods:[],displayName:"AreaGraph",props:{dataSeries:{required:!0,tsType:{name:"Array",elements:[{name:"AreaDataSeries"}],raw:"AreaDataSeries[]"},description:""},width:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"1000",computed:!1}},height:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"600",computed:!1}},xRange:{required:!1,tsType:{name:"tuple",raw:"[number, number]",elements:[{name:"number"},{name:"number"}]},description:""},yRange:{required:!1,tsType:{name:"tuple",raw:"[number, number]",elements:[{name:"number"},{name:"number"}]},description:""},variant:{required:!1,tsType:{name:"union",raw:'"normal" | "stacked"',elements:[{name:"literal",value:'"normal"'},{name:"literal",value:'"stacked"'}]},description:"",defaultValue:{value:'"normal"',computed:!1}},xTitle:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Columns"',computed:!1}},yTitle:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Rows"',computed:!1}},title:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Area Graph"',computed:!1}}}};const ae={title:"organisms/AreaGraph",component:B,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{variant:{control:{type:"select"},options:["normal","stacked"]},width:{control:{type:"number"}},height:{control:{type:"number"}}}},w=[{x:[200,300,400,500,600,700,800,900,1e3],y:[120,130,100,110,140,160,150,140,110],name:"Series 1",color:r.ORANGE},{x:[200,300,400,500,600,700,800,900,1e3],y:[30,40,50,60,70,50,40,30,20],name:"Series 2",color:r.RED},{x:[200,300,400,500,600,700,800,900,1e3],y:[20,30,25,35,40,30,25,20,15],name:"Series 3",color:r.GREEN}],h={args:{dataSeries:w,title:"Area Graph",xTitle:"Columns",yTitle:"Rows",width:1e3,height:600,variant:"normal"}},g={args:{dataSeries:w,title:"Stacked Area Graph",xTitle:"Columns",yTitle:"Rows",width:1e3,height:600,variant:"stacked"}},y={args:{dataSeries:w,title:"Area Graph with Custom Range",xTitle:"Columns",yTitle:"Rows",width:1e3,height:600,variant:"normal",xRange:[300,900],yRange:[0,200]}};var G,I,L;h.parameters={...h.parameters,docs:{...(G=h.parameters)==null?void 0:G.docs,source:{originalSource:`{
  args: {
    dataSeries: sampleDataSeries,
    title: "Area Graph",
    xTitle: "Columns",
    yTitle: "Rows",
    width: 1000,
    height: 600,
    variant: "normal"
  }
}`,...(L=(I=h.parameters)==null?void 0:I.docs)==null?void 0:L.source}}};var D,N,V;g.parameters={...g.parameters,docs:{...(D=g.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    dataSeries: sampleDataSeries,
    title: "Stacked Area Graph",
    xTitle: "Columns",
    yTitle: "Rows",
    width: 1000,
    height: 600,
    variant: "stacked"
  }
}`,...(V=(N=g.parameters)==null?void 0:N.docs)==null?void 0:V.source}}};var q,Y,z;y.parameters={...y.parameters,docs:{...(q=y.parameters)==null?void 0:q.docs,source:{originalSource:`{
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
  }
}`,...(z=(Y=y.parameters)==null?void 0:Y.docs)==null?void 0:z.source}}};const re=["Default","Stacked","CustomRange"];export{y as CustomRange,h as Default,g as Stacked,re as __namedExportsOrder,ae as default};
