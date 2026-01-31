import{C as a}from"./colors-O2mrKcAp.js";import{j as e}from"./jsx-runtime-CDt2p4po.js";import{r as O,R as k}from"./index-GiUgBvb1.js";import{P as R}from"./plotly-CNt8u1Bg.js";const A=({dataSeries:t,width:d=400,height:h=400,title:g="Pie Chart",textInfo:f="percent",hole:v=0,rotation:b=0})=>{const o=O.useRef(null),y=[a.BLUE,a.GREEN,a.ORANGE,a.RED,a.YELLOW,a.PURPLE],x=()=>{if(t.colors&&t.colors.length>=t.labels.length)return t.colors;const r=t.colors||[],l=t.labels.length-r.length;if(l<=0)return r;for(let n=0;n<l;n++)r.push(y[n%y.length]);return r};O.useEffect(()=>{if(!o.current)return;const r=[{type:"pie",labels:t.labels,values:t.values,name:t.name,marker:{colors:x()},textinfo:f,hoverinfo:"label+text+value",insidetextfont:{size:0,family:"Inter, sans-serif",color:"transparent"},hole:v,rotation:b}],l={width:d,height:h,font:{family:"Inter, sans-serif"},showlegend:!1,margin:{l:40,r:40,b:40,t:40}},n={responsive:!0,displayModeBar:!1,displaylogo:!1};return R.newPlot(o.current,r,l,n),()=>{o.current&&R.purge(o.current)}},[t,d,h,f,v,b]);const _=({labels:r,colors:l})=>{const n=r.map((s,C)=>e.jsx(k.Fragment,{children:e.jsxs("div",{className:"legend-item",children:[e.jsx("span",{className:"color-box",style:{background:l[C]}}),s,C<r.length-1&&e.jsx("span",{className:"divider"})]})},s)),D=6,P=[];for(let s=0;s<n.length;s+=D)P.push(e.jsx("div",{className:"legend-row",children:n.slice(s,s+D)},s));return e.jsx("div",{className:"legend-container",children:P})};return e.jsx("div",{className:"card-container",style:{width:d},children:e.jsxs("div",{className:"chart-container",children:[g&&e.jsx("div",{className:"title-container",children:e.jsx("h2",{className:"title",children:g})}),e.jsx("div",{ref:o,style:{width:"100%",height:"100%",margin:"0"}}),e.jsx(_,{labels:t.labels,colors:x()})]})})};A.__docgenInfo={description:"",methods:[],displayName:"PieChart",props:{dataSeries:{required:!0,tsType:{name:"PieDataSeries"},description:""},width:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"400",computed:!1}},height:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"400",computed:!1}},title:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Pie Chart"',computed:!1}},textInfo:{required:!1,tsType:{name:"union",raw:`| "none"
| "label"
| "percent"
| "value"
| "label+percent"
| "label+value"
| "value+percent"
| "label+value+percent"`,elements:[{name:"literal",value:'"none"'},{name:"literal",value:'"label"'},{name:"literal",value:'"percent"'},{name:"literal",value:'"value"'},{name:"literal",value:'"label+percent"'},{name:"literal",value:'"label+value"'},{name:"literal",value:'"value+percent"'},{name:"literal",value:'"label+value+percent"'}]},description:"",defaultValue:{value:'"percent"',computed:!1}},hole:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"0",computed:!1}},rotation:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"0",computed:!1}}}};const J={title:"Organisms/PieChart",component:A,parameters:{layout:"centered"},tags:["autodocs"]},i={args:{dataSeries:{labels:["pH","Temperature","Dissolved Oxygen","Cell Density","Viability"],values:[12,23,35,18,12],name:"Bioreactor Parameters"},title:"Bioreactor",width:480,height:480,textInfo:"percent",hole:0,rotation:0}},c={args:{dataSeries:{labels:["pH","Temperature","Dissolved Oxygen","Cell Density","Viability"],values:[12,23,35,18,12],name:"Bioreactor Parameters",colors:[a.ORANGE,a.RED,a.GREEN,a.BLUE,a.PURPLE]},title:"Bioreactor Parameter Distribution",width:480,height:480,textInfo:"percent",hole:0,rotation:0}},u={args:{dataSeries:{labels:["pH","Temperature","Dissolved Oxygen","Cell Density","Viability"],values:[12,23,35,18,12],name:"Bioreactor Parameters"},title:"Bioreactor Parameter Distribution (Donut)",width:480,height:480,textInfo:"label+percent",hole:.5,rotation:0}},m={args:{dataSeries:{labels:["pH","Temperature","Dissolved Oxygen","Cell Density","Viability"],values:[12,23,35,18,12],name:"Bioreactor Parameters"},title:"Bioreactor Parameter Distribution",width:480,height:480,textInfo:"label+value",hole:0,rotation:0}},p={args:{dataSeries:{labels:["pH","Temperature","Dissolved Oxygen","Cell Density","Viability"],values:[12,23,35,18,12],name:"Bioreactor Parameters"},title:"Bioreactor Parameter Distribution (Rotated)",width:480,height:480,textInfo:"percent",hole:0,rotation:45}};var B,E,V;i.parameters={...i.parameters,docs:{...(B=i.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {
    dataSeries: {
      labels: ["pH", "Temperature", "Dissolved Oxygen", "Cell Density", "Viability"],
      values: [12, 23, 35, 18, 12],
      name: "Bioreactor Parameters"
    },
    title: "Bioreactor",
    width: 480,
    height: 480,
    textInfo: "percent",
    hole: 0,
    rotation: 0
  }
}`,...(V=(E=i.parameters)==null?void 0:E.docs)==null?void 0:V.source}}};var L,T,w;c.parameters={...c.parameters,docs:{...(L=c.parameters)==null?void 0:L.docs,source:{originalSource:`{
  args: {
    dataSeries: {
      labels: ["pH", "Temperature", "Dissolved Oxygen", "Cell Density", "Viability"],
      values: [12, 23, 35, 18, 12],
      name: "Bioreactor Parameters",
      colors: [COLORS.ORANGE, COLORS.RED, COLORS.GREEN, COLORS.BLUE, COLORS.PURPLE]
    },
    title: "Bioreactor Parameter Distribution",
    width: 480,
    height: 480,
    textInfo: "percent",
    hole: 0,
    rotation: 0
  }
}`,...(w=(T=c.parameters)==null?void 0:T.docs)==null?void 0:w.source}}};var N,j,S;u.parameters={...u.parameters,docs:{...(N=u.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    dataSeries: {
      labels: ["pH", "Temperature", "Dissolved Oxygen", "Cell Density", "Viability"],
      values: [12, 23, 35, 18, 12],
      name: "Bioreactor Parameters"
    },
    title: "Bioreactor Parameter Distribution (Donut)",
    width: 480,
    height: 480,
    textInfo: "label+percent",
    hole: 0.5,
    rotation: 0
  }
}`,...(S=(j=u.parameters)==null?void 0:j.docs)==null?void 0:S.source}}};var I,H,q;m.parameters={...m.parameters,docs:{...(I=m.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    dataSeries: {
      labels: ["pH", "Temperature", "Dissolved Oxygen", "Cell Density", "Viability"],
      values: [12, 23, 35, 18, 12],
      name: "Bioreactor Parameters"
    },
    title: "Bioreactor Parameter Distribution",
    width: 480,
    height: 480,
    textInfo: "label+value",
    hole: 0,
    rotation: 0
  }
}`,...(q=(H=m.parameters)==null?void 0:H.docs)==null?void 0:q.source}}};var W,G,U;p.parameters={...p.parameters,docs:{...(W=p.parameters)==null?void 0:W.docs,source:{originalSource:`{
  args: {
    dataSeries: {
      labels: ["pH", "Temperature", "Dissolved Oxygen", "Cell Density", "Viability"],
      values: [12, 23, 35, 18, 12],
      name: "Bioreactor Parameters"
    },
    title: "Bioreactor Parameter Distribution (Rotated)",
    width: 480,
    height: 480,
    textInfo: "percent",
    hole: 0,
    rotation: 45
  }
}`,...(U=(G=p.parameters)==null?void 0:G.docs)==null?void 0:U.source}}};const K=["Default","WithCustomColors","DonutChart","WithLabelAndValues","WithRotation"];export{i as Default,u as DonutChart,c as WithCustomColors,m as WithLabelAndValues,p as WithRotation,K as __namedExportsOrder,J as default};
