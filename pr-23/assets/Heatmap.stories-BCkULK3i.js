import{j as T}from"./jsx-runtime-CDt2p4po.js";import{r as v}from"./index-GiUgBvb1.js";import{P as D}from"./plotly-CNt8u1Bg.js";function $(e,n,a=0,t=1){const o=[];for(let r=0;r<e;r++){const s=[];for(let i=0;i<n;i++)s.push(a+Math.random()*(t-a));o.push(s)}return o}function G(e){return Array.from({length:e},(n,a)=>String.fromCharCode(65+a))}function J(e){if(!e||e.length===0)return[];const n=Math.max(...e.map(a=>a.length));return e.map(a=>{if(a.length===n)return a;const t=[...a];for(;t.length<n;)t.push(0);return t})}const K=[[0,"#092761"],[.15,"#141950"],[.3,"#282D73"],[.45,"#463782"],[.6,"#643C8C"],[.7,"#8C4696"],[.8,"#B45096"],[.9,"#DC5A8C"],[.95,"#FA6482"],[1,"#FF5C64"]],E=({data:e,xLabels:n,yLabels:a,title:t,xTitle:o="Columns",yTitle:r="Rows",colorscale:s=K,width:i=800,height:y=600,showScale:w=!0,precision:x=0,zmin:b=0,zmax:z=5e4,valueUnit:h=""})=>{const m=v.useRef(null);let l=e||$(16,24,5e3,5e4);l=J(l);const H=l.length>0?l[0].length:24,N=n||Array.from({length:H},(C,g)=>g+1),O=a||G(l.length);return v.useEffect(()=>{if(!m.current)return;const C=[{z:l,x:N,y:O,type:"heatmap",colorscale:s,showscale:w,zsmooth:!1,hovertemplate:`Row: %{y}<br>Column: %{x}<br>Value: %{z:.${x}f}${h}<extra></extra>`,zmin:b,zmax:z,colorbar:{thickness:28,len:1,outlinewidth:0,ticksuffix:h,y:.5,yanchor:"middle"}}],g={title:{text:t||"",font:{family:"Inter, sans-serif",size:20,color:"var(--black-300)"},y:.98,yanchor:"top"},width:i,height:y,margin:{l:70,r:70,b:70,t:100,pad:5},xaxis:{title:{text:o,font:{size:16,color:"var(--black-300)",family:"Inter, sans-serif"},standoff:15},side:"top",fixedrange:!0},yaxis:{title:{text:r,font:{size:16,color:"var(--black-300)",family:"Inter, sans-serif"},standoff:15},autorange:"reversed",fixedrange:!0},paper_bgcolor:"var(--white-900)",plot_bgcolor:"var(--white-900)",font:{family:"Inter, sans-serif",color:"var(--grey-600)"}},W={responsive:!0,displayModeBar:!1,displaylogo:!1};return D.newPlot(m.current,C,g,W),()=>{m.current&&D.purge(m.current)}},[e,n,a,t,o,r,s,i,y,w,x,b,z,h]),T.jsx("div",{className:"heatmap-container",children:T.jsx("div",{ref:m,style:{width:"100%",height:"100%"}})})};E.__docgenInfo={description:"",methods:[],displayName:"Heatmap",props:{data:{required:!1,tsType:{name:"Array",elements:[{name:"Array",elements:[{name:"number"}],raw:"number[]"}],raw:"number[][]"},description:""},xLabels:{required:!1,tsType:{name:"union",raw:"string[] | number[]",elements:[{name:"Array",elements:[{name:"string"}],raw:"string[]"},{name:"Array",elements:[{name:"number"}],raw:"number[]"}]},description:""},yLabels:{required:!1,tsType:{name:"union",raw:"string[] | number[]",elements:[{name:"Array",elements:[{name:"string"}],raw:"string[]"},{name:"Array",elements:[{name:"number"}],raw:"number[]"}]},description:""},title:{required:!1,tsType:{name:"string"},description:""},xTitle:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Columns"',computed:!1}},yTitle:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Rows"',computed:!1}},colorscale:{required:!1,tsType:{name:"union",raw:"string | Array<[number, string]>",elements:[{name:"string"},{name:"Array",elements:[{name:"tuple",raw:"[number, string]",elements:[{name:"number"},{name:"string"}]}],raw:"Array<[number, string]>"}]},description:"",defaultValue:{value:`[
  [0, "#092761"],
  [0.15, "#141950"],
  [0.3, "#282D73"],
  [0.45, "#463782"],
  [0.6, "#643C8C"],
  [0.7, "#8C4696"],
  [0.8, "#B45096"],
  [0.9, "#DC5A8C"],
  [0.95, "#FA6482"],
  [1, "#FF5C64"],
]`,computed:!1}},width:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"800",computed:!1}},height:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"600",computed:!1}},showScale:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"true",computed:!1}},precision:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"0",computed:!1}},zmin:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"0",computed:!1}},zmax:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"50000",computed:!1}},valueUnit:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'""',computed:!1}}}};const ae={title:"Organisms/Heatmap",component:E,parameters:{layout:"centered"},tags:["autodocs"]},Q=[[18795,3860,8390,24575,14964,14284,9265,19850,7426,24962,17423,14363,19023,11322,4685,3769,5433,8311,8051,9420,20568,23939,22769,9396],[11666,21942,21431,5747,3189,22118,6005,24042,4899,4267,20912,14394,6556,6890,11838,17502,24777,13627,11792,13555,13253,11433,13233,14016],[5612,24870,18787,20159,15206,11226,17541,6152,4585,6943,22457,4021,14653,13805,16417,23227,10989,12692,15990,9873,8675,3161,7297,3995],[14534,10629,4016,11529,20262,12268,24271,15185,24243,9331,11571,10208,8276,21446,19448,19216,11006,5568,24847,5027,5695,18422,8258,9736],[3381,16986,15666,8892,6561,9184,22483,11392,16067,18265,22488,5454,14837,17039,22115,13965,12762,8056,17948,11110,16773,23224,20412,3502],[9910,15685,23872,3206,24518,20868,18934,20247,11731,11755,24500,15383,21141,17820,10574,9374,4678,22626,24020,4059,19198,12914,22541,13817],[13921,12789,19312,14252,5693,16931,6627,19157,13173,24834,21047,13230,18707,24976,14994,4306,9776,12474,10526,24959,8530,23797,6748,16545],[3663,4998,10994,20879,6304,23147,24616,21237,16808,9585,20675,22965,14649,4636,23080,20082,7737,17555,16877,3854,8855,10392,16949,24633],[24556,21091,8791,24919,7931,22894,3202,14447,15688,7389,5327,11004,12315,10777,3197,4930,14774,18087,12339,23666,14589,21895,21895,18708],[20043,5811,17243,9546,4986,11338,14411,5911,4734,21227,11680,22360,21343,8759,5385,14111,7736,4802,11155,11120,9616,17257,17486,24918],[23445,19646,17075,12208,19371,14835,16168,5049,8423,17589,23932,22492,10158,13248,10400,22554,12874,18151,21639,4154,7499,9295,15183,15874],[21032,8539,12637,23583,18586,5557,8352,19482,5200,17172,5961,17207,45e3,23817,14969,5869,20340,16992,8699,23877,24295,6987,16446,4218],[23880,7735,14296,7553,12146,11050,15757,22830,9893,21077,17373,17565,51e3,11754,13677,8895,22738,19609,18636,24277,10022,12151,8600],[10996,12007,15946,7642,14312,10679,11208,21589,13716,20453,6444,13757,17434,4060,21711,6420,3301,15468,19990,22554,3699,24472,3190,13492],[20364,5975,9102,20568,22711,22778,4816,3569,8442,4895,22117,6863,15913,10455,7014,14093,21070,6009,19538,13729,4409,15249,3784,11096],[10520,15533,10343,10206,24980,8801,22190,19921,9886,21225,13647,11716,22334,15323,7780,5368,15039,9655,11173,7495,13893,16403,16121,13966]],B=()=>{const e=[];for(let t=0;t<16;t++){const o=[];for(let r=0;r<24;r++){let s=5e3+Math.random()*25e3;(t+r)%7===0&&(s+=1e4),(t===11||t===12)&&r===12&&(s=45e3+Math.random()*5e3),o.push(Math.round(s))}e.push(o)}return e},u={args:{data:Q,width:1e3,height:600,zmin:3e3,zmax:51e3,precision:0,xTitle:"Columns",yTitle:"Rows"}},c={args:{data:B(),width:1e3,height:600,zmin:5e3,zmax:5e4,precision:0,xTitle:"Columns",yTitle:"Rows"}},d={args:{width:1e3,height:600,xTitle:"Columns",yTitle:"Rows",zmin:5e3,zmax:5e4,precision:0}},p={args:{data:B(),width:600,height:400,zmin:5e3,zmax:5e4,precision:0,showScale:!0}},f={args:{data:[[5e3,1e4,15e3,2e4,25e3],[1e4,15e3,2e4,25e3,3e4],[15e3,2e4,25e3,3e4,35e3],[2e4,25e3,3e4,35e3,4e4],[25e3,3e4,35e3,4e4,45e3]],xLabels:["X1","X2","X3","X4","X5"],yLabels:["Y1","Y2","Y3","Y4","Y5"],title:"Custom Labels Sample",width:600,height:500,zmin:5e3,zmax:5e4}};var A,R,q;u.parameters={...u.parameters,docs:{...(A=u.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    data: realData,
    width: 1000,
    height: 600,
    zmin: 3000,
    zmax: 51000,
    precision: 0,
    xTitle: "Columns",
    yTitle: "Rows"
  }
}`,...(q=(R=u.parameters)==null?void 0:R.docs)==null?void 0:q.source}}};var S,V,L;c.parameters={...c.parameters,docs:{...(S=c.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    data: generatePlateData(),
    width: 1000,
    height: 600,
    zmin: 5000,
    zmax: 50000,
    precision: 0,
    xTitle: "Columns",
    yTitle: "Rows"
  }
}`,...(L=(V=c.parameters)==null?void 0:V.docs)==null?void 0:L.source}}};var P,X,Y;d.parameters={...d.parameters,docs:{...(P=d.parameters)==null?void 0:P.docs,source:{originalSource:`{
  args: {
    width: 1000,
    height: 600,
    xTitle: "Columns",
    yTitle: "Rows",
    zmin: 5000,
    zmax: 50000,
    precision: 0
  }
}`,...(Y=(X=d.parameters)==null?void 0:X.docs)==null?void 0:Y.source}}};var M,_,k;p.parameters={...p.parameters,docs:{...(M=p.parameters)==null?void 0:M.docs,source:{originalSource:`{
  args: {
    data: generatePlateData(),
    width: 600,
    height: 400,
    zmin: 5000,
    zmax: 50000,
    precision: 0,
    showScale: true
  }
}`,...(k=(_=p.parameters)==null?void 0:_.docs)==null?void 0:k.source}}};var j,F,I;f.parameters={...f.parameters,docs:{...(j=f.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    data: [[5000, 10000, 15000, 20000, 25000], [10000, 15000, 20000, 25000, 30000], [15000, 20000, 25000, 30000, 35000], [20000, 25000, 30000, 35000, 40000], [25000, 30000, 35000, 40000, 45000]],
    xLabels: ["X1", "X2", "X3", "X4", "X5"],
    yLabels: ["Y1", "Y2", "Y3", "Y4", "Y5"],
    title: "Custom Labels Sample",
    width: 600,
    height: 500,
    zmin: 5000,
    zmax: 50000
  }
}`,...(I=(F=f.parameters)==null?void 0:F.docs)==null?void 0:I.source}}};const te=["RealDataVisualization","WellPlateMockup","DefaultPlate","SmallPlate","CustomLabels"];export{f as CustomLabels,d as DefaultPlate,u as RealDataVisualization,p as SmallPlate,c as WellPlateMockup,te as __namedExportsOrder,ae as default};
