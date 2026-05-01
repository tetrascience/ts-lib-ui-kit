import{r as W,j}from"./iframe-14YYbrss.js";import{P as H}from"./PlateMap-DtDIBq_C.js";import"./preload-helper-BbFkF2Um.js";import"./plotly-BfU08UT2.js";import"./button-BSJeE99h.js";import"./index-B8eA1Gpy.js";import"./use-plotly-theme-DDaBOKiZ.js";function Y(e){if(!e||e.length===0)return[];const t=Math.max(...e.map(a=>a.length));return e.map(a=>{if(a.length===t)return a;const n=[...a];for(;n.length<t;)n.push(0);return n})}const T=({data:e,xLabels:t,yLabels:a,title:n,xTitle:m,yTitle:l,colorscale:c,width:B=800,height:C=600,showScale:f=!0,precision:S=0,zmin:D,zmax:b,valueUnit:v=""})=>{const r=e?Y(e):void 0,z=r?.length??a?.length??16,I=r?.[0]?.length??t?.length??24,q=W.useMemo(()=>{if(!r)return;const R="ABCDEFGHIJKLMNOPQRSTUVWXYZ",w=[];for(let o=0;o<r.length;o++)for(let i=0;i<r[o].length;i++){const P=a?.[o]?.toString()??R[o]??`R${o+1}`,M=t?.[i]?.toString()??String(i+1),E=`${P}${M}`;w.push({wellId:E,values:{Value:r[o][i]}})}return w},[r,t,a]),A=c;return j.jsx(H,{data:q,plateFormat:"custom",rows:z,columns:I,title:n,xTitle:m,yTitle:l,xLabels:t,yLabels:a,colorScale:A,valueMin:D,valueMax:b,showColorBar:f,width:B,height:C,layerConfigs:[{id:"Value",valueUnit:v}],precision:S})};T.__docgenInfo={description:"",methods:[],displayName:"Heatmap",props:{data:{required:!1,tsType:{name:"Array",elements:[{name:"Array",elements:[{name:"number"}],raw:"number[]"}],raw:"number[][]"},description:"2D array of numeric values"},xLabels:{required:!1,tsType:{name:"union",raw:"string[] | number[]",elements:[{name:"Array",elements:[{name:"string"}],raw:"string[]"},{name:"Array",elements:[{name:"number"}],raw:"number[]"}]},description:"Custom x-axis labels (column labels)"},yLabels:{required:!1,tsType:{name:"union",raw:"string[] | number[]",elements:[{name:"Array",elements:[{name:"string"}],raw:"string[]"},{name:"Array",elements:[{name:"number"}],raw:"number[]"}]},description:"Custom y-axis labels (row labels)"},title:{required:!1,tsType:{name:"string"},description:"Chart title"},xTitle:{required:!1,tsType:{name:"string"},description:"X-axis title"},yTitle:{required:!1,tsType:{name:"string"},description:"Y-axis title"},colorscale:{required:!1,tsType:{name:"union",raw:"string | Array<[number, string]>",elements:[{name:"string"},{name:"Array",elements:[{name:"tuple",raw:"[number, string]",elements:[{name:"number"},{name:"string"}]}],raw:"Array<[number, string]>"}]},description:"Color scale - string name or array of [position, color] pairs"},width:{required:!1,tsType:{name:"number"},description:"Chart width in pixels",defaultValue:{value:"800",computed:!1}},height:{required:!1,tsType:{name:"number"},description:"Chart height in pixels",defaultValue:{value:"600",computed:!1}},showScale:{required:!1,tsType:{name:"boolean"},description:"Show color scale legend",defaultValue:{value:"true",computed:!1}},precision:{required:!1,tsType:{name:"number"},description:"Number of decimal places for values",defaultValue:{value:"0",computed:!1}},zmin:{required:!1,tsType:{name:"number"},description:"Minimum value for color scale"},zmax:{required:!1,tsType:{name:"number"},description:"Maximum value for color scale"},valueUnit:{required:!1,tsType:{name:"string"},description:"Value unit suffix",defaultValue:{value:'""',computed:!1}}}};const{expect:s,within:g}=__STORYBOOK_MODULE_TEST__,U={title:"Charts/Heatmap (Deprecated)",component:T,parameters:{layout:"centered",docs:{description:{component:`@deprecated The Heatmap component is now a wrapper around PlateMap.
For new projects, use PlateMap directly which provides more features including:
- Plate format presets (96, 384 wells)
- Well ID-based data input
- Click handlers with metadata
- Custom tooltip formatting`}}},tags:["autodocs"]},X=[[18795,3860,8390,24575,14964,14284,9265,19850,7426,24962,17423,14363,19023,11322,4685,3769,5433,8311,8051,9420,20568,23939,22769,9396],[11666,21942,21431,5747,3189,22118,6005,24042,4899,4267,20912,14394,6556,6890,11838,17502,24777,13627,11792,13555,13253,11433,13233,14016],[5612,24870,18787,20159,15206,11226,17541,6152,4585,6943,22457,4021,14653,13805,16417,23227,10989,12692,15990,9873,8675,3161,7297,3995],[14534,10629,4016,11529,20262,12268,24271,15185,24243,9331,11571,10208,8276,21446,19448,19216,11006,5568,24847,5027,5695,18422,8258,9736],[3381,16986,15666,8892,6561,9184,22483,11392,16067,18265,22488,5454,14837,17039,22115,13965,12762,8056,17948,11110,16773,23224,20412,3502],[9910,15685,23872,3206,24518,20868,18934,20247,11731,11755,24500,15383,21141,17820,10574,9374,4678,22626,24020,4059,19198,12914,22541,13817],[13921,12789,19312,14252,5693,16931,6627,19157,13173,24834,21047,13230,18707,24976,14994,4306,9776,12474,10526,24959,8530,23797,6748,16545],[3663,4998,10994,20879,6304,23147,24616,21237,16808,9585,20675,22965,14649,4636,23080,20082,7737,17555,16877,3854,8855,10392,16949,24633],[24556,21091,8791,24919,7931,22894,3202,14447,15688,7389,5327,11004,12315,10777,3197,4930,14774,18087,12339,23666,14589,21895,21895,18708],[20043,5811,17243,9546,4986,11338,14411,5911,4734,21227,11680,22360,21343,8759,5385,14111,7736,4802,11155,11120,9616,17257,17486,24918],[23445,19646,17075,12208,19371,14835,16168,5049,8423,17589,23932,22492,10158,13248,10400,22554,12874,18151,21639,4154,7499,9295,15183,15874],[21032,8539,12637,23583,18586,5557,8352,19482,5200,17172,5961,17207,45e3,23817,14969,5869,20340,16992,8699,23877,24295,6987,16446,4218],[23880,7735,14296,7553,12146,11050,15757,22830,9893,21077,17373,17565,51e3,11754,13677,8895,22738,19609,18636,24277,10022,12151,8600],[10996,12007,15946,7642,14312,10679,11208,21589,13716,20453,6444,13757,17434,4060,21711,6420,3301,15468,19990,22554,3699,24472,3190,13492],[20364,5975,9102,20568,22711,22778,4816,3569,8442,4895,22117,6863,15913,10455,7014,14093,21070,6009,19538,13729,4409,15249,3784,11096],[10520,15533,10343,10206,24980,8801,22190,19921,9886,21225,13647,11716,22334,15323,7780,5368,15039,9655,11173,7495,13893,16403,16121,13966]],x=()=>{const e=[];for(let n=0;n<16;n++){const m=[];for(let l=0;l<24;l++){let c=5e3+Math.random()*25e3;(n+l)%7===0&&(c+=1e4),(n===11||n===12)&&l===12&&(c=45e3+Math.random()*5e3),m.push(Math.round(c))}e.push(m)}return e},p={name:"Real Data Visualization",parameters:{zephyr:{testCaseId:"SW-T985"}},args:{data:X,width:1e3,height:600,zmin:3e3,zmax:51e3,precision:0,xTitle:"Columns",yTitle:"Rows"},play:async({canvasElement:e,step:t})=>{const a=g(e);await t("Axis titles are displayed",async()=>{s(a.getByText("Columns")).toBeInTheDocument(),s(a.getByText("Rows")).toBeInTheDocument()}),await t("Chart container renders",async()=>{s(e.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await t("Heatmap scatter trace renders",async()=>{const n=e.querySelectorAll(".scatterlayer .trace");s(n.length).toBe(1)})}},u={name:"Well Plate Mockup",parameters:{zephyr:{testCaseId:"SW-T986"}},args:{data:x(),width:1e3,height:600,zmin:5e3,zmax:5e4,precision:0,xTitle:"Columns",yTitle:"Rows"},play:async({canvasElement:e,step:t})=>{const a=g(e);await t("Axis titles are displayed",async()=>{s(a.getByText("Columns")).toBeInTheDocument(),s(a.getByText("Rows")).toBeInTheDocument()}),await t("Chart container renders",async()=>{s(e.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await t("Heatmap scatter trace renders",async()=>{const n=e.querySelectorAll(".scatterlayer .trace");s(n.length).toBe(1)})}},y={name:"Default Plate",parameters:{zephyr:{testCaseId:"SW-T987"}},args:{width:1e3,height:600,xTitle:"Columns",yTitle:"Rows",zmin:5e3,zmax:5e4,precision:0},play:async({canvasElement:e,step:t})=>{const a=g(e);await t("Axis titles are displayed",async()=>{s(a.getByText("Columns")).toBeInTheDocument(),s(a.getByText("Rows")).toBeInTheDocument()}),await t("Chart container renders",async()=>{s(e.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await t("Heatmap scatter trace renders",async()=>{const n=e.querySelectorAll(".scatterlayer .trace");s(n.length).toBe(1)})}},d={name:"Small Plate",parameters:{zephyr:{testCaseId:"SW-T988"}},args:{data:x(),width:600,height:400,zmin:5e3,zmax:5e4,precision:0,showScale:!0},play:async({canvasElement:e,step:t})=>{await t("Chart container renders",async()=>{s(e.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await t("Heatmap scatter trace renders",async()=>{const a=e.querySelectorAll(".scatterlayer .trace");s(a.length).toBe(1)})}},h={name:"Custom Labels",parameters:{zephyr:{testCaseId:"SW-T989"}},args:{data:[[5e3,1e4,15e3,2e4,25e3],[1e4,15e3,2e4,25e3,3e4],[15e3,2e4,25e3,3e4,35e3],[2e4,25e3,3e4,35e3,4e4],[25e3,3e4,35e3,4e4,45e3]],xLabels:["X1","X2","X3","X4","X5"],yLabels:["Y1","Y2","Y3","Y4","Y5"],title:"Custom Labels Sample",width:600,height:500,zmin:5e3,zmax:5e4},play:async({canvasElement:e,step:t})=>{const a=g(e);await t("Chart title is displayed",async()=>{s(a.getByText("Custom Labels Sample")).toBeInTheDocument()}),await t("Chart container renders",async()=>{s(e.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await t("Heatmap scatter trace renders",async()=>{const n=e.querySelectorAll(".scatterlayer .trace");s(n.length).toBe(1)}),await t("Custom axis labels are displayed",async()=>{s(a.getByText("X1")).toBeInTheDocument(),s(a.getByText("Y1")).toBeInTheDocument()})}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: "Real Data Visualization",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T985"
    }
  },
  args: {
    data: realData,
    width: 1000,
    height: 600,
    zmin: 3000,
    zmax: 51000,
    precision: 0,
    xTitle: "Columns",
    yTitle: "Rows"
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Axis titles are displayed", async () => {
      expect(canvas.getByText("Columns")).toBeInTheDocument();
      expect(canvas.getByText("Rows")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Heatmap scatter trace renders", async () => {
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBe(1);
    });
  }
}`,...p.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: "Well Plate Mockup",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T986"
    }
  },
  args: {
    data: generatePlateData(),
    width: 1000,
    height: 600,
    zmin: 5000,
    zmax: 50000,
    precision: 0,
    xTitle: "Columns",
    yTitle: "Rows"
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Axis titles are displayed", async () => {
      expect(canvas.getByText("Columns")).toBeInTheDocument();
      expect(canvas.getByText("Rows")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Heatmap scatter trace renders", async () => {
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBe(1);
    });
  }
}`,...u.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: "Default Plate",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T987"
    }
  },
  args: {
    width: 1000,
    height: 600,
    xTitle: "Columns",
    yTitle: "Rows",
    zmin: 5000,
    zmax: 50000,
    precision: 0
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Axis titles are displayed", async () => {
      expect(canvas.getByText("Columns")).toBeInTheDocument();
      expect(canvas.getByText("Rows")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Heatmap scatter trace renders", async () => {
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBe(1);
    });
  }
}`,...y.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: "Small Plate",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T988"
    }
  },
  args: {
    data: generatePlateData(),
    width: 600,
    height: 400,
    zmin: 5000,
    zmax: 50000,
    precision: 0,
    showScale: true
  },
  play: async ({
    canvasElement,
    step
  }) => {
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Heatmap scatter trace renders", async () => {
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBe(1);
    });
  }
}`,...d.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: "Custom Labels",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T989"
    }
  },
  args: {
    data: [[5000, 10000, 15000, 20000, 25000], [10000, 15000, 20000, 25000, 30000], [15000, 20000, 25000, 30000, 35000], [20000, 25000, 30000, 35000, 40000], [25000, 30000, 35000, 40000, 45000]],
    xLabels: ["X1", "X2", "X3", "X4", "X5"],
    yLabels: ["Y1", "Y2", "Y3", "Y4", "Y5"],
    title: "Custom Labels Sample",
    width: 600,
    height: 500,
    zmin: 5000,
    zmax: 50000
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Custom Labels Sample")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Heatmap scatter trace renders", async () => {
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBe(1);
    });
    await step("Custom axis labels are displayed", async () => {
      expect(canvas.getByText("X1")).toBeInTheDocument();
      expect(canvas.getByText("Y1")).toBeInTheDocument();
    });
  }
}`,...h.parameters?.docs?.source}}};const $=["RealDataVisualization","WellPlateMockup","DefaultPlate","SmallPlate","CustomLabels"];export{h as CustomLabels,y as DefaultPlate,p as RealDataVisualization,d as SmallPlate,u as WellPlateMockup,$ as __namedExportsOrder,U as default};
