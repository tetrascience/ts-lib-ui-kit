import{P as L}from"./PlateMap-DtDIBq_C.js";import"./iframe-14YYbrss.js";import"./preload-helper-BbFkF2Um.js";import"./plotly-BfU08UT2.js";import"./button-BSJeE99h.js";import"./index-B8eA1Gpy.js";import"./use-plotly-theme-DDaBOKiZ.js";const{expect:s,within:r,userEvent:E}=__STORYBOOK_MODULE_TEST__,k=n=>new Promise(a=>setTimeout(a,n)),Z={title:"Charts/PlateMap",component:L,tags:["autodocs"]};function M(){const n=[],a="ABCDEFGH";for(let e=0;e<8;e++)for(let t=1;t<=12;t++){const o=`${a[e]}${t}`,l=5e3+Math.random()*2e4,i=e>=2&&e<=5&&t>=4&&t<=9?1e4:0;e===0&&t===12||e===7&&t===1?n.push({wellId:o,values:{RFU:null}}):n.push({wellId:o,values:{RFU:Math.round(l+i)},tooltipData:{sampleId:`S${e*12+t}`,concentration:"100 nM"}})}return n}function V(){const n=[],a="ABCDEFGHIJKLMNOP";for(let e=0;e<16;e++)for(let t=1;t<=24;t++){const o=`${a[e]}${t}`,l=1e3+e*1e3+t*500+Math.random()*2e3;n.push({wellId:o,values:{AU:Math.round(l)}})}return n}function d(n,a="Value"){const e=[],t="ABCDEFGHIJKLMNOPQRSTUVWXYZ";for(let o=0;o<n.length;o++)for(let l=0;l<n[o].length;l++){const i=t[o],c=String(l+1),H=`${i}${c}`;e.push({wellId:H,values:{[a]:n[o][l]}})}return e}const P=[{id:"RFU",name:"Fluorescence",valueUnit:"RFU"}],p={args:{data:M(),plateFormat:"96",title:"96-Well Plate Assay Results",layerConfigs:P,precision:0,width:700,height:450,onWellClick:n=>{console.log(`Clicked ${n.wellId}:`,n.values,n.tooltipData)}},play:async({canvasElement:n,step:a})=>{const e=r(n);await a("Chart title is displayed",async()=>{const t=e.getByText("96-Well Plate Assay Results");s(t).toBeInTheDocument()}),await a("Chart container renders",async()=>{const t=n.querySelector(".js-plotly-plot");s(t).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1051"}}},u={args:{data:V(),plateFormat:"384",title:"384-Well Plate Screening",layerConfigs:[{id:"AU",valueUnit:" AU"}],precision:0,width:900,height:500},play:async({canvasElement:n,step:a})=>{const e=r(n);await a("Chart title is displayed",async()=>{const t=e.getByText("384-Well Plate Screening");s(t).toBeInTheDocument()}),await a("Chart container renders",async()=>{const t=n.querySelector(".js-plotly-plot");s(t).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1052"}}},y={args:{data:(()=>{const n=[],a="ABCDEFGHIJKLMNOPQRSTUVWXYZ",e=["AA","AB","AC","AD","AE","AF"],t=[...a,...e];for(let o=0;o<32;o++)for(let l=1;l<=48;l++){const i=`${t[o]}${l}`,c=1e3+o*500+l*100+Math.random()*500;n.push({wellId:i,values:{Signal:Math.round(c)}})}return n})(),plateFormat:"1536",title:"1536-Well High-Density Plate",layerConfigs:[{id:"Signal",valueUnit:"RFU"}],precision:0,width:1100,height:600},play:async({canvasElement:n,step:a})=>{const e=r(n);await a("Chart title is displayed",async()=>{const t=e.getByText("1536-Well High-Density Plate");s(t).toBeInTheDocument()}),await a("Chart container renders",async()=>{const t=n.querySelector(".js-plotly-plot");s(t).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1053"}}},m={args:{data:d([[100,200,300,400],[150,250,350,450],[200,300,400,500]],"Concentration"),plateFormat:"custom",rows:3,columns:4,title:"Custom 3x4 Plate",layerConfigs:[{id:"Concentration",valueUnit:" nM"}],precision:1,width:500,height:350},play:async({canvasElement:n,step:a})=>{const e=r(n);await a("Chart title is displayed",async()=>{const t=e.getByText("Custom 3x4 Plate");s(t).toBeInTheDocument()}),await a("Chart container renders with custom dimensions",async()=>{const t=n.querySelector(".js-plotly-plot");s(t).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1054"}}},h={args:{data:[{wellId:"A1",values:{RFU:5e3}},{wellId:"A2",values:{RFU:7500}},{wellId:"A3",values:{RFU:null}},{wellId:"B1",values:{RFU:6e3}},{wellId:"B2",values:{RFU:8500}},{wellId:"B3",values:{RFU:9e3}},{wellId:"C1",values:{RFU:null}},{wellId:"C2",values:{RFU:7e3}},{wellId:"D4",values:{RFU:12e3}},{wellId:"H12",values:{RFU:25e3}}],plateFormat:"96",title:"Partial Plate (Sparse Data)",layerConfigs:[{id:"RFU",valueUnit:"RFU"}],width:700,height:450,emptyWellColor:"#e0e0e0"},play:async({canvasElement:n,step:a})=>{const e=r(n);await a("Chart title is displayed",async()=>{const t=e.getByText("Partial Plate (Sparse Data)");s(t).toBeInTheDocument()}),await a("Chart container renders with sparse data",async()=>{const t=n.querySelector(".js-plotly-plot");s(t).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1055"}}},g={args:{data:d([[5e3,1e4,15e3,2e4,25e3],[1e4,15e3,2e4,25e3,3e4],[15e3,2e4,25e3,3e4,35e3],[2e4,25e3,3e4,35e3,4e4],[25e3,3e4,35e3,4e4,45e3]],"Value"),plateFormat:"custom",rows:5,columns:5,xLabels:["X1","X2","X3","X4","X5"],yLabels:["Y1","Y2","Y3","Y4","Y5"],xTitle:"X Axis",yTitle:"Y Axis",title:"Generic Heatmap with Custom Labels",layerConfigs:[{id:"Value"}],width:600,height:500,precision:0,markerShape:"square"},play:async({canvasElement:n,step:a})=>{const e=r(n);await a("Chart title is displayed",async()=>{const t=e.getByText("Generic Heatmap with Custom Labels");s(t).toBeInTheDocument()}),await a("Custom axis labels are displayed",async()=>{s(e.getByText("X1")).toBeInTheDocument(),s(e.getByText("X5")).toBeInTheDocument(),s(e.getByText("Y1")).toBeInTheDocument(),s(e.getByText("Y5")).toBeInTheDocument()}),await a("Axis titles are displayed",async()=>{s(e.getByText("X Axis")).toBeInTheDocument(),s(e.getByText("Y Axis")).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1056"}}},w={args:{plateFormat:"96",title:"Auto-generated Random Data",xTitle:"Columns",yTitle:"Rows",precision:0,width:800,height:500},play:async({canvasElement:n,step:a})=>{const e=r(n);await a("Chart title is displayed",async()=>{const t=e.getByText("Auto-generated Random Data");s(t).toBeInTheDocument()}),await a("Chart container renders with auto-generated data",async()=>{const t=n.querySelector(".js-plotly-plot");s(t).toBeInTheDocument()}),await a("Axis titles are displayed",async()=>{s(e.getByText("Columns")).toBeInTheDocument(),s(e.getByText("Rows")).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1057"}}},v={args:{data:(()=>{const n=[],a="ABCDEFGH";for(let e=0;e<8;e++)for(let t=1;t<=12;t++){const o=`${a[e]}${t}`;let l;t===1?l="control":t===12?l="blank":e===0||e===7?l="standard":l="sample",n.push({wellId:o,values:{Type:l}})}return n})(),plateFormat:"96",title:"Categorical Well Types",layerConfigs:[{id:"Type",visualizationMode:"categorical",categoryColors:{sample:"#4575b4",control:"#d73027",standard:"#fdae61",blank:"#f0f0f0"}}],width:700,height:450},play:async({canvasElement:n,step:a})=>{const e=r(n);await a("Chart renders with title",async()=>{const t=e.getByText("Categorical Well Types");s(t).toBeInTheDocument()}),await a("Legend displays categories",async()=>{s(e.getByText("sample")).toBeInTheDocument(),s(e.getByText("control")).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1058"}}},T={args:{data:(()=>{const n=[],a="ABCDEFGH";for(let e=0;e<8;e++)for(let t=1;t<=12;t++){const o=`${a[e]}${t}`,l=5e3+Math.random()*2e4,i=l/25e3,c=(l-15e3)/5e3;n.push({wellId:o,values:{Raw:Math.round(l),Normalized:Math.round(i*100)/100,ZScore:Math.round(c*100)/100},tooltipData:{sampleId:`S${e*12+t}`}})}return n})(),plateFormat:"96",title:"Multi-Layer Assay Data",layerConfigs:[{id:"Raw",name:"Raw Signal",valueUnit:"RFU",colorScale:"Blues"},{id:"Normalized",name:"Normalized",valueMin:0,valueMax:1,colorScale:"Viridis"},{id:"ZScore",name:"Z-Score",valueMin:-3,valueMax:3,colorScale:"RdBu"}],initialLayerId:"Raw",onLayerChange:n=>console.log("Layer changed to:",n),width:700,height:450},play:async({canvasElement:n,step:a})=>{const e=r(n);await a("Layer toggle buttons are displayed",async()=>{s(e.getByText("Raw Signal")).toBeInTheDocument(),s(e.getByText("Normalized")).toBeInTheDocument(),s(e.getByText("Z-Score")).toBeInTheDocument()}),await a("Chart container renders",async()=>{const t=n.querySelector(".js-plotly-plot");s(t).toBeInTheDocument()}),await a("Raw Signal is initially active",async()=>{const t=e.getByText("Raw Signal");s(t).toHaveAttribute("data-variant","default")}),await a("Click Normalized layer toggles active state",async()=>{const t=e.getByText("Normalized"),o=e.getByText("Raw Signal");s(t).not.toHaveFocus(),await k(1e3),await E.click(t),s(t).toHaveAttribute("data-variant","default"),s(o).toHaveAttribute("data-variant","outline")}),await a("Click Z-Score layer toggles active state",async()=>{const t=e.getByText("Z-Score"),o=e.getByText("Normalized");await k(1e3),await E.click(t),s(t).toHaveAttribute("data-variant","default"),s(o).toHaveAttribute("data-variant","outline")}),await a("Click Raw Signal layer to switch back",async()=>{const t=e.getByText("Raw Signal"),o=e.getByText("Z-Score");await k(1e3),await E.click(t),s(t).toHaveAttribute("data-variant","default"),s(o).toHaveAttribute("data-variant","outline")})},parameters:{zephyr:{testCaseId:"SW-T1059"}}},C={args:{data:(()=>{const n=[],a="ABCDEFGH";for(let e=0;e<8;e++)for(let t=1;t<=12;t++){const o=`${a[e]}${t}`;n.push({wellId:o,values:{Signal:Math.round(5e3+Math.random()*2e4)}})}return n})(),plateFormat:"96",title:"Plate with Region Highlights",layerConfigs:[{id:"Signal",valueUnit:"RFU"}],regions:[{id:"positive-controls",name:"Positive Controls",wells:"A1:A6",borderColor:"#d73027",borderWidth:3,fillColor:"rgba(215, 48, 39, 0.1)"},{id:"negative-controls",name:"Negative Controls",wells:"A7:A12",borderColor:"#4575b4",borderWidth:3,fillColor:"rgba(69, 117, 180, 0.1)"},{id:"samples",name:"Sample Area",wells:"B1:H12",borderColor:"#1a9850",borderWidth:2}],width:700,height:500},play:async({canvasElement:n,step:a})=>{const e=r(n);await a("Chart renders with title",async()=>{const t=e.getByText("Plate with Region Highlights");s(t).toBeInTheDocument()}),await a("Region legend items are displayed",async()=>{s(e.getByText("Positive Controls")).toBeInTheDocument(),s(e.getByText("Negative Controls")).toBeInTheDocument(),s(e.getByText("Sample Area")).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1060"}}},B={args:{data:(()=>{const n=[],a="ABCDEFGH",e=["pass","fail","pending","review"];for(let t=0;t<8;t++)for(let o=1;o<=12;o++){const l=`${a[t]}${o}`,i=e[Math.floor(Math.random()*e.length)];n.push({wellId:l,values:{QCStatus:i}})}return n})(),plateFormat:"96",title:"QC Status with Custom Colors",layerConfigs:[{id:"QCStatus",name:"QC Status",visualizationMode:"categorical",categoryColors:{pass:"#2ca02c",fail:"#d62728",pending:"#ff7f0e",review:"#9467bd"}}],width:700,height:450},play:async({canvasElement:n,step:a})=>{const e=r(n);await a("Legend shows QC statuses",async()=>{s(e.getByText("pass")).toBeInTheDocument(),s(e.getByText("fail")).toBeInTheDocument()}),await a("Chart container renders",async()=>{const t=n.querySelector(".js-plotly-plot");s(t).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1061"}}},I={args:{data:(()=>{const n=[],a="ABCDEFGH",e=["positive","negative","inconclusive"];for(let t=0;t<8;t++)for(let o=1;o<=12;o++){const l=`${a[t]}${o}`,i=Math.round(5e3+Math.random()*2e4),c=e[Math.floor(Math.random()*e.length)];n.push({wellId:l,values:{Fluorescence:i,Status:c},tooltipData:{well:l}})}return n})(),plateFormat:"96",title:"Mixed Numeric and Categorical Data",layerConfigs:[{id:"Fluorescence",name:"Fluorescence",visualizationMode:"heatmap",valueUnit:"RFU",colorScale:"Viridis"},{id:"Status",name:"Call Status",visualizationMode:"categorical",categoryColors:{positive:"#d73027",negative:"#4575b4",inconclusive:"#fdae61"}}],initialLayerId:"Fluorescence",width:700,height:450},play:async({canvasElement:n,step:a})=>{const e=r(n);await a("Both layer buttons are displayed",async()=>{s(e.getByText("Fluorescence")).toBeInTheDocument(),s(e.getByText("Call Status")).toBeInTheDocument()}),await a("Fluorescence (heatmap) is initially active",async()=>{const t=e.getByText("Fluorescence");s(t).toHaveAttribute("data-variant","default")}),await a("Switch to Call Status (categorical) layer",async()=>{const t=e.getByText("Call Status"),o=e.getByText("Fluorescence");await k(1e3),await E.click(t),s(t).toHaveAttribute("data-variant","default"),s(o).toHaveAttribute("data-variant","outline")}),await a("Categorical legend appears when Call Status is active",async()=>{s(e.getByText("positive")).toBeInTheDocument(),s(e.getByText("negative")).toBeInTheDocument(),s(e.getByText("inconclusive")).toBeInTheDocument()}),await a("Switch back to Fluorescence (heatmap) layer",async()=>{const t=e.getByText("Fluorescence");await k(1e3),await E.click(t),s(t).toHaveAttribute("data-variant","default")})},parameters:{zephyr:{testCaseId:"SW-T1062"}}},S={args:{data:(()=>{const n=[],a="ABCDEFGH",e=["sample","control","standard"];for(let t=0;t<8;t++)for(let o=1;o<=12;o++){const l=`${a[t]}${o}`,i=e[Math.floor(Math.random()*e.length)];n.push({wellId:l,values:{WellType:i}})}return n})(),plateFormat:"96",title:"Legend at Bottom with Custom Styling",layerConfigs:[{id:"WellType",visualizationMode:"categorical",categoryColors:{sample:"#4575b4",control:"#d73027",standard:"#fdae61"}}],legendConfig:{position:"bottom",fontSize:14,itemSpacing:16,swatchSize:20,title:"Well Types"},width:700,height:500},play:async({canvasElement:n,step:a})=>{const e=r(n);await a("Legend title is displayed",async()=>{s(e.getByText("Well Types")).toBeInTheDocument()}),await a("Legend items are displayed",async()=>{s(e.getByText("sample")).toBeInTheDocument(),s(e.getByText("control")).toBeInTheDocument(),s(e.getByText("standard")).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1063"}}},f={args:{data:(()=>{const n=[],a="ABCDEFGH",e=["sample","control"];for(let t=0;t<8;t++)for(let o=1;o<=12;o++){const l=`${a[t]}${o}`,i=e[(t+o)%2];n.push({wellId:l,values:{Type:i}})}return n})(),plateFormat:"96",title:"Hidden UI Elements",layerConfigs:[{id:"Type",visualizationMode:"categorical",categoryColors:{sample:"#4575b4",control:"#d73027"}}],showLegend:!1,showColorBar:!1,legendConfig:{position:"top"},width:700,height:450},play:async({canvasElement:n,step:a})=>{const e=r(n);await a("Chart title is displayed",async()=>{s(e.getByText("Hidden UI Elements")).toBeInTheDocument()}),await a("Legend items are NOT visible",async()=>{s(e.queryByText("sample")).not.toBeInTheDocument(),s(e.queryByText("control")).not.toBeInTheDocument()}),await a("Chart container renders without legend/colorbar",async()=>{const t=n.querySelector(".js-plotly-plot");s(t).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1064"}}},x={args:{data:d([[100,NaN,null,1/0],[150,250,-1/0,450],[NaN,null,400,500],[200,300,NaN,550]],"AU"),plateFormat:"custom",rows:4,columns:4,title:"Edge Cases Test",layerConfigs:[{id:"AU",valueUnit:" AU"}],width:500,height:400,showColorBar:!0},play:async({canvasElement:n,step:a})=>{const e=r(n);await a("Chart title is displayed",async()=>{s(e.getByText("Edge Cases Test")).toBeInTheDocument()}),await a("Chart renders without errors despite NaN/Infinity/null values",async()=>{const t=n.querySelector(".js-plotly-plot");s(t).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1065"}}},D={args:{data:d([[42,42,42],[42,42,42],[42,42,42]],"Value"),plateFormat:"custom",rows:3,columns:3,title:"Uniform Values Test",layerConfigs:[{id:"Value"}],showColorBar:!0,legendConfig:{position:"left",title:"Values"},width:500,height:400},play:async({canvasElement:n,step:a})=>{const e=r(n);await a("Chart title is displayed",async()=>{s(e.getByText("Uniform Values Test")).toBeInTheDocument()}),await a("Chart renders with uniform values",async()=>{const t=n.querySelector(".js-plotly-plot");s(t).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1066"}}},b={args:{data:[{wellId:"A1",values:{Type:"sample"}},{wellId:"A2",values:{Type:"control"}},{wellId:"B1",values:{Type:"sample"}},{wellId:"B2",values:{Type:"control"}}],plateFormat:"custom",rows:2,columns:2,title:"Categorical with Left Legend",layerConfigs:[{id:"Type",visualizationMode:"categorical",categoryColors:{sample:"#4575b4",control:"#d73027"}}],legendConfig:{position:"left",title:"Types"},width:500,height:400},play:async({canvasElement:n,step:a})=>{const e=r(n);await a("Chart title is displayed",async()=>{s(e.getByText("Categorical with Left Legend")).toBeInTheDocument()}),await a("Legend is rendered on left",async()=>{s(e.getByText("Types")).toBeInTheDocument(),s(e.getByText("sample")).toBeInTheDocument(),s(e.getByText("control")).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1067"}}},A={args:{data:[{wellId:"A1",values:{Value:100},tooltipData:{sample:"S001"}},{wellId:"A2",values:{Value:200},tooltipData:{sample:"S002"}},{wellId:"B1",values:{Value:300},tooltipData:{sample:"S003"}},{wellId:"B2",values:{Value:400},tooltipData:{sample:"S004"}}],plateFormat:"custom",rows:2,columns:2,title:"Clickable Wells",layerConfigs:[{id:"Value",valueUnit:"RFU"}],width:400,height:350,onWellClick:n=>{window.lastClickedWell=n}},play:async({canvasElement:n,step:a})=>{const e=r(n);await a("Chart title is displayed",async()=>{s(e.getByText("Clickable Wells")).toBeInTheDocument()}),await a("Chart container renders with click handler",async()=>{const t=n.querySelector(".js-plotly-plot");s(t).toBeInTheDocument()}),await a("Simulate Plotly click event on well A1",async()=>{const t=n.querySelector(".js-plotly-plot");s(t).toBeInTheDocument(),t&&typeof t.emit=="function"&&t.emit("plotly_click",{points:[{x:1,y:"A",pointIndex:0}]})}),await a("Wells are clickable (chart accepts pointer events)",async()=>{const t=n.querySelector(".js-plotly-plot");s(t).toBeInTheDocument();const o=n.querySelectorAll(".scatterlayer .trace");s(o.length).toBeGreaterThan(0)})},parameters:{zephyr:{testCaseId:"SW-T1068"}}},W={args:{data:V(),plateFormat:"384",title:"Using Viridis Colorscale",colorScale:"Viridis",layerConfigs:[{id:"AU"}],width:900,height:500},play:async({canvasElement:n,step:a})=>{const e=r(n);await a("Chart title is displayed",async()=>{s(e.getByText("Using Viridis Colorscale")).toBeInTheDocument()}),await a("Chart renders with string colorscale",async()=>{const t=n.querySelector(".js-plotly-plot");s(t).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1069"}}},F={args:{data:[{wellId:"A1",values:{Signal:1e3}},{wellId:"A2",values:{Signal:2e3}},{wellId:"A3",values:{Signal:3e3}},{wellId:"A4",values:{Signal:4e3}},{wellId:"B1",values:{Signal:1500}},{wellId:"B2",values:{Signal:null}},{wellId:"B3",values:{Signal:2500}},{wellId:"B4",values:{Signal:null}},{wellId:"C1",values:{Signal:null}},{wellId:"C2",values:{Signal:5e3}},{wellId:"C3",values:{Signal:null}},{wellId:"C4",values:{Signal:6e3}},{wellId:"D1",values:{Signal:7e3}},{wellId:"D2",values:{Signal:8e3}},{wellId:"D3",values:{Signal:9e3}},{wellId:"D4",values:{Signal:1e4}}],plateFormat:"custom",rows:4,columns:4,title:"Viridis with Empty Wells",colorScale:"Viridis",emptyWellColor:"#e0e0e0",layerConfigs:[{id:"Signal",valueUnit:"RFU"}],width:500,height:450},play:async({canvasElement:n,step:a})=>{const e=r(n);await a("Chart title is displayed",async()=>{s(e.getByText("Viridis with Empty Wells")).toBeInTheDocument()}),await a("Chart renders with Viridis colorscale",async()=>{const t=n.querySelector(".js-plotly-plot");s(t).toBeInTheDocument()}),await a("Colorbar is present",async()=>{const t=n.querySelector(".cbfill");s(t).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1073"}}},R={args:{data:d([[100,200,300],[150,250,350],[200,300,400]],"AU"),plateFormat:"custom",rows:3,columns:3,title:"Custom Value Range (0-500)",valueMin:0,valueMax:500,layerConfigs:[{id:"AU",valueUnit:" AU"}],width:500,height:400},play:async({canvasElement:n,step:a})=>{const e=r(n);await a("Chart title is displayed",async()=>{s(e.getByText("Custom Value Range (0-500)")).toBeInTheDocument()}),await a("Chart renders with custom range",async()=>{const t=n.querySelector(".js-plotly-plot");s(t).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1070"}}},z={args:{data:M(),plateFormat:"96",title:"Heatmap with Colorbar Title",layerConfigs:[{id:"RFU",name:"Fluorescence",valueUnit:"RFU"}],legendConfig:{position:"right",title:"Signal Intensity"},width:800,height:500},play:async({canvasElement:n,step:a})=>{const e=r(n);await a("Chart title is displayed",async()=>{s(e.getByText("Heatmap with Colorbar Title")).toBeInTheDocument()}),await a("Chart container renders",async()=>{const t=n.querySelector(".js-plotly-plot");s(t).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1071"}}},U={args:{data:d([[100,200,300],[150,250,350]],"Value"),plateFormat:"custom",rows:2,columns:3,layerConfigs:[{id:"Value"}],title:"Invalid Regions Test",regions:[{id:"invalid-format",name:"Invalid Format",wells:"INVALID:A3",borderColor:"#d73027",borderWidth:2},{id:"oob-region",name:"Out of Bounds",wells:"A1:Z99",borderColor:"#ff7f0e",borderWidth:2},{id:"valid-region",name:"Valid Region",wells:"A1:B2",borderColor:"#4575b4",borderWidth:2}],width:500,height:400},play:async({canvasElement:n,step:a})=>{const e=r(n);await a("Chart title is displayed",async()=>{s(e.getByText("Invalid Regions Test")).toBeInTheDocument()}),await a("Valid region is still rendered",async()=>{s(e.getByText("Valid Region")).toBeInTheDocument()}),await a("Chart still renders despite invalid regions",async()=>{const t=n.querySelector(".js-plotly-plot");s(t).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1072"}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    data: generate96WellData(),
    plateFormat: "96",
    title: "96-Well Plate Assay Results",
    layerConfigs: layer96WellConfigs,
    precision: 0,
    width: 700,
    height: 450,
    onWellClick: wellData => {
      console.log(\`Clicked \${wellData.wellId}:\`, wellData.values, wellData.tooltipData);
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      const title = canvas.getByText("96-Well Plate Assay Results");
      expect(title).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      // Verify the Plotly chart rendered by checking for chart title in the DOM
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });
  },
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T1051"
    }
  }
}`,...p.parameters?.docs?.source},description:{story:`96-well plate with WellData array input
Demonstrates the recommended data format with well IDs, values, and tooltipData`,...p.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    data: generate384WellData(),
    plateFormat: "384",
    title: "384-Well Plate Screening",
    layerConfigs: [{
      id: "AU",
      valueUnit: " AU"
    }],
    precision: 0,
    width: 900,
    height: 500
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      const title = canvas.getByText("384-Well Plate Screening");
      expect(title).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });
  },
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T1052"
    }
  }
}`,...u.parameters?.docs?.source},description:{story:`384-well plate with WellData array input
Demonstrates larger plate format with 16 rows × 24 columns`,...u.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    data: (() => {
      const wells: WellData[] = [];
      // Row labels for 1536-well: A-Z, then AA-AF (32 rows total)
      const singleRows = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const doubleRows = ["AA", "AB", "AC", "AD", "AE", "AF"];
      const allRows = [...[...singleRows], ...doubleRows];
      for (let r = 0; r < 32; r++) {
        for (let c = 1; c <= 48; c++) {
          const wellId = \`\${allRows[r]}\${c}\`;
          const value = 1000 + r * 500 + c * 100 + Math.random() * 500;
          wells.push({
            wellId,
            values: {
              Signal: Math.round(value)
            }
          });
        }
      }
      return wells;
    })(),
    plateFormat: "1536",
    title: "1536-Well High-Density Plate",
    layerConfigs: [{
      id: "Signal",
      valueUnit: "RFU"
    }],
    precision: 0,
    width: 1100,
    height: 600
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      const title = canvas.getByText("1536-Well High-Density Plate");
      expect(title).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });
  },
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T1053"
    }
  }
}`,...y.parameters?.docs?.source},description:{story:`1536-well plate with double-letter row notation (AA-AF)
Demonstrates high-density plate format with 32 rows × 48 columns`,...y.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    data: gridToWellData([[100, 200, 300, 400], [150, 250, 350, 450], [200, 300, 400, 500]], "Concentration"),
    plateFormat: "custom",
    rows: 3,
    columns: 4,
    title: "Custom 3x4 Plate",
    layerConfigs: [{
      id: "Concentration",
      valueUnit: " nM"
    }],
    precision: 1,
    width: 500,
    height: 350
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      const title = canvas.getByText("Custom 3x4 Plate");
      expect(title).toBeInTheDocument();
    });
    await step("Chart container renders with custom dimensions", async () => {
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });
  },
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T1054"
    }
  }
}`,...m.parameters?.docs?.source},description:{story:`Custom plate dimensions
Demonstrates using custom rows/columns for non-standard plates`,...m.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    data: [{
      wellId: "A1",
      values: {
        RFU: 5000
      }
    }, {
      wellId: "A2",
      values: {
        RFU: 7500
      }
    }, {
      wellId: "A3",
      values: {
        RFU: null
      }
    }, {
      wellId: "B1",
      values: {
        RFU: 6000
      }
    }, {
      wellId: "B2",
      values: {
        RFU: 8500
      }
    }, {
      wellId: "B3",
      values: {
        RFU: 9000
      }
    }, {
      wellId: "C1",
      values: {
        RFU: null
      }
    }, {
      wellId: "C2",
      values: {
        RFU: 7000
      }
    }, {
      wellId: "D4",
      values: {
        RFU: 12000
      }
    }, {
      wellId: "H12",
      values: {
        RFU: 25000
      }
    }],
    plateFormat: "96",
    title: "Partial Plate (Sparse Data)",
    layerConfigs: [{
      id: "RFU",
      valueUnit: "RFU"
    }],
    width: 700,
    height: 450,
    emptyWellColor: "#e0e0e0"
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      const title = canvas.getByText("Partial Plate (Sparse Data)");
      expect(title).toBeInTheDocument();
    });
    await step("Chart container renders with sparse data", async () => {
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });
  },
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T1055"
    }
  }
}`,...h.parameters?.docs?.source},description:{story:`Partial plate with empty wells
Demonstrates handling of sparse data and empty wells`,...h.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    data: gridToWellData([[5000, 10000, 15000, 20000, 25000], [10000, 15000, 20000, 25000, 30000], [15000, 20000, 25000, 30000, 35000], [20000, 25000, 30000, 35000, 40000], [25000, 30000, 35000, 40000, 45000]], "Value"),
    plateFormat: "custom",
    rows: 5,
    columns: 5,
    xLabels: ["X1", "X2", "X3", "X4", "X5"],
    yLabels: ["Y1", "Y2", "Y3", "Y4", "Y5"],
    xTitle: "X Axis",
    yTitle: "Y Axis",
    title: "Generic Heatmap with Custom Labels",
    layerConfigs: [{
      id: "Value"
    }],
    width: 600,
    height: 500,
    precision: 0,
    markerShape: "square"
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      const title = canvas.getByText("Generic Heatmap with Custom Labels");
      expect(title).toBeInTheDocument();
    });
    await step("Custom axis labels are displayed", async () => {
      // Check for custom X-axis labels
      expect(canvas.getByText("X1")).toBeInTheDocument();
      expect(canvas.getByText("X5")).toBeInTheDocument();
      // Check for custom Y-axis labels
      expect(canvas.getByText("Y1")).toBeInTheDocument();
      expect(canvas.getByText("Y5")).toBeInTheDocument();
    });
    await step("Axis titles are displayed", async () => {
      expect(canvas.getByText("X Axis")).toBeInTheDocument();
      expect(canvas.getByText("Y Axis")).toBeInTheDocument();
    });
  },
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T1056"
    }
  }
}`,...g.parameters?.docs?.source},description:{story:`Generic heatmap with axis titles
Demonstrates using PlateMap as a general-purpose heatmap with custom axis labels`,...g.parameters?.docs?.description}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    plateFormat: "96",
    title: "Auto-generated Random Data",
    xTitle: "Columns",
    yTitle: "Rows",
    precision: 0,
    width: 800,
    height: 500
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      const title = canvas.getByText("Auto-generated Random Data");
      expect(title).toBeInTheDocument();
    });
    await step("Chart container renders with auto-generated data", async () => {
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });
    await step("Axis titles are displayed", async () => {
      expect(canvas.getByText("Columns")).toBeInTheDocument();
      expect(canvas.getByText("Rows")).toBeInTheDocument();
    });
  },
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T1057"
    }
  }
}`,...w.parameters?.docs?.source},description:{story:`Auto-generated random data
Demonstrates PlateMap with no data - generates random values automatically`,...w.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    data: (() => {
      const wells: WellData[] = [];
      const rows = "ABCDEFGH";
      for (let r = 0; r < 8; r++) {
        for (let c = 1; c <= 12; c++) {
          const wellId = \`\${rows[r]}\${c}\`;
          // First column is controls, last column is blanks, rest are samples or standards
          let wellType: string;
          if (c === 1) wellType = "control";else if (c === 12) wellType = "blank";else if (r === 0 || r === 7) wellType = "standard";else wellType = "sample";
          wells.push({
            wellId,
            values: {
              Type: wellType
            }
          });
        }
      }
      return wells;
    })(),
    plateFormat: "96",
    title: "Categorical Well Types",
    layerConfigs: [{
      id: "Type",
      visualizationMode: "categorical",
      categoryColors: {
        sample: "#4575b4",
        control: "#d73027",
        standard: "#fdae61",
        blank: "#f0f0f0"
      }
    }],
    width: 700,
    height: 450
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart renders with title", async () => {
      const title = canvas.getByText("Categorical Well Types");
      expect(title).toBeInTheDocument();
    });
    await step("Legend displays categories", async () => {
      // Check that category labels appear in the legend
      expect(canvas.getByText("sample")).toBeInTheDocument();
      expect(canvas.getByText("control")).toBeInTheDocument();
    });
  },
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T1058"
    }
  }
}`,...v.parameters?.docs?.source},description:{story:`Categorical visualization mode
Demonstrates displaying well types with discrete colors`,...v.parameters?.docs?.description}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    data: (() => {
      const wells: WellData[] = [];
      const rows = "ABCDEFGH";
      for (let r = 0; r < 8; r++) {
        for (let c = 1; c <= 12; c++) {
          const wellId = \`\${rows[r]}\${c}\`;
          const rawValue = 5000 + Math.random() * 20000;
          const normalizedValue = rawValue / 25000;
          const zScore = (rawValue - 15000) / 5000;
          wells.push({
            wellId,
            values: {
              Raw: Math.round(rawValue),
              Normalized: Math.round(normalizedValue * 100) / 100,
              ZScore: Math.round(zScore * 100) / 100
            },
            tooltipData: {
              sampleId: \`S\${r * 12 + c}\`
            }
          });
        }
      }
      return wells;
    })(),
    plateFormat: "96",
    title: "Multi-Layer Assay Data",
    layerConfigs: [{
      id: "Raw",
      name: "Raw Signal",
      valueUnit: "RFU",
      colorScale: "Blues"
    }, {
      id: "Normalized",
      name: "Normalized",
      valueMin: 0,
      valueMax: 1,
      colorScale: "Viridis"
    }, {
      id: "ZScore",
      name: "Z-Score",
      valueMin: -3,
      valueMax: 3,
      colorScale: "RdBu"
    }],
    initialLayerId: "Raw",
    onLayerChange: layerId => console.log("Layer changed to:", layerId),
    width: 700,
    height: 450
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Layer toggle buttons are displayed", async () => {
      expect(canvas.getByText("Raw Signal")).toBeInTheDocument();
      expect(canvas.getByText("Normalized")).toBeInTheDocument();
      expect(canvas.getByText("Z-Score")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });
    await step("Raw Signal is initially active", async () => {
      const rawButton = canvas.getByText("Raw Signal");
      // Active button has blue background (#4575b4)
      expect(rawButton).toHaveAttribute("data-variant", "default");
    });
    await step("Click Normalized layer toggles active state", async () => {
      const normalizedButton = canvas.getByText("Normalized");
      const rawButton = canvas.getByText("Raw Signal");

      // Normalized should be inactive (white background)
      expect(normalizedButton).not.toHaveFocus();
      await sleep(1000); // Delay before click for smoother viewing
      await userEvent.click(normalizedButton);

      // Now Normalized should be active
      expect(normalizedButton).toHaveAttribute("data-variant", "default");
      // Raw Signal should be inactive
      expect(rawButton).toHaveAttribute("data-variant", "outline");
    });
    await step("Click Z-Score layer toggles active state", async () => {
      const zScoreButton = canvas.getByText("Z-Score");
      const normalizedButton = canvas.getByText("Normalized");
      await sleep(1000); // Delay before click for smoother viewing
      await userEvent.click(zScoreButton);

      // Now Z-Score should be active
      expect(zScoreButton).toHaveAttribute("data-variant", "default");
      // Normalized should be inactive
      expect(normalizedButton).toHaveAttribute("data-variant", "outline");
    });
    await step("Click Raw Signal layer to switch back", async () => {
      const rawButton = canvas.getByText("Raw Signal");
      const zScoreButton = canvas.getByText("Z-Score");
      await sleep(1000); // Delay before click for smoother viewing
      await userEvent.click(rawButton);

      // Raw Signal should be active again
      expect(rawButton).toHaveAttribute("data-variant", "default");
      // Z-Score should be inactive
      expect(zScoreButton).toHaveAttribute("data-variant", "outline");
    });
  },
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T1059"
    }
  }
}`,...T.parameters?.docs?.source},description:{story:`Multi-layer data with layer toggling
Demonstrates wells with multiple values and layer switching`,...T.parameters?.docs?.description}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    data: (() => {
      const wells: WellData[] = [];
      const rows = "ABCDEFGH";
      for (let r = 0; r < 8; r++) {
        for (let c = 1; c <= 12; c++) {
          const wellId = \`\${rows[r]}\${c}\`;
          wells.push({
            wellId,
            values: {
              Signal: Math.round(5000 + Math.random() * 20000)
            }
          });
        }
      }
      return wells;
    })(),
    plateFormat: "96",
    title: "Plate with Region Highlights",
    layerConfigs: [{
      id: "Signal",
      valueUnit: "RFU"
    }],
    regions: [{
      id: "positive-controls",
      name: "Positive Controls",
      wells: "A1:A6",
      borderColor: "#d73027",
      borderWidth: 3,
      fillColor: "rgba(215, 48, 39, 0.1)"
    }, {
      id: "negative-controls",
      name: "Negative Controls",
      wells: "A7:A12",
      borderColor: "#4575b4",
      borderWidth: 3,
      fillColor: "rgba(69, 117, 180, 0.1)"
    }, {
      id: "samples",
      name: "Sample Area",
      wells: "B1:H12",
      borderColor: "#1a9850",
      borderWidth: 2
    }] as PlateRegion[],
    width: 700,
    height: 500
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart renders with title", async () => {
      const title = canvas.getByText("Plate with Region Highlights");
      expect(title).toBeInTheDocument();
    });
    await step("Region legend items are displayed", async () => {
      expect(canvas.getByText("Positive Controls")).toBeInTheDocument();
      expect(canvas.getByText("Negative Controls")).toBeInTheDocument();
      expect(canvas.getByText("Sample Area")).toBeInTheDocument();
    });
  },
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T1060"
    }
  }
}`,...C.parameters?.docs?.source},description:{story:`Region highlighting with PlateRegions
Demonstrates rectangular region overlays with borders and fill colors`,...C.parameters?.docs?.description}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    data: (() => {
      const wells: WellData[] = [];
      const rows = "ABCDEFGH";
      const statuses = ["pass", "fail", "pending", "review"];
      for (let r = 0; r < 8; r++) {
        for (let c = 1; c <= 12; c++) {
          const wellId = \`\${rows[r]}\${c}\`;
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          wells.push({
            wellId,
            values: {
              QCStatus: status
            }
          });
        }
      }
      return wells;
    })(),
    plateFormat: "96",
    title: "QC Status with Custom Colors",
    layerConfigs: [{
      id: "QCStatus",
      name: "QC Status",
      visualizationMode: "categorical",
      categoryColors: {
        pass: "#2ca02c",
        fail: "#d62728",
        pending: "#ff7f0e",
        review: "#9467bd"
      }
    }],
    width: 700,
    height: 450
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Legend shows QC statuses", async () => {
      expect(canvas.getByText("pass")).toBeInTheDocument();
      expect(canvas.getByText("fail")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });
  },
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T1061"
    }
  }
}`,...B.parameters?.docs?.source},description:{story:`Custom category colors
Demonstrates overriding default categorical colors`,...B.parameters?.docs?.description}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    data: (() => {
      const wells: WellData[] = [];
      const rows = "ABCDEFGH";
      const statuses = ["positive", "negative", "inconclusive"];
      for (let r = 0; r < 8; r++) {
        for (let c = 1; c <= 12; c++) {
          const wellId = \`\${rows[r]}\${c}\`;
          const fluorescence = Math.round(5000 + Math.random() * 20000);
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          wells.push({
            wellId,
            values: {
              Fluorescence: fluorescence,
              Status: status
            },
            tooltipData: {
              well: wellId
            }
          });
        }
      }
      return wells;
    })(),
    plateFormat: "96",
    title: "Mixed Numeric and Categorical Data",
    layerConfigs: [{
      id: "Fluorescence",
      name: "Fluorescence",
      visualizationMode: "heatmap",
      valueUnit: "RFU",
      colorScale: "Viridis"
    }, {
      id: "Status",
      name: "Call Status",
      visualizationMode: "categorical",
      categoryColors: {
        positive: "#d73027",
        negative: "#4575b4",
        inconclusive: "#fdae61"
      }
    }],
    initialLayerId: "Fluorescence",
    width: 700,
    height: 450
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Both layer buttons are displayed", async () => {
      expect(canvas.getByText("Fluorescence")).toBeInTheDocument();
      expect(canvas.getByText("Call Status")).toBeInTheDocument();
    });
    await step("Fluorescence (heatmap) is initially active", async () => {
      const fluorescenceButton = canvas.getByText("Fluorescence");
      expect(fluorescenceButton).toHaveAttribute("data-variant", "default");
    });
    await step("Switch to Call Status (categorical) layer", async () => {
      const callStatusButton = canvas.getByText("Call Status");
      const fluorescenceButton = canvas.getByText("Fluorescence");
      await sleep(1000);
      await userEvent.click(callStatusButton);

      // Call Status should now be active
      expect(callStatusButton).toHaveAttribute("data-variant", "default");
      // Fluorescence should be inactive
      expect(fluorescenceButton).toHaveAttribute("data-variant", "outline");
    });
    await step("Categorical legend appears when Call Status is active", async () => {
      // Check that categorical legend items appear
      expect(canvas.getByText("positive")).toBeInTheDocument();
      expect(canvas.getByText("negative")).toBeInTheDocument();
      expect(canvas.getByText("inconclusive")).toBeInTheDocument();
    });
    await step("Switch back to Fluorescence (heatmap) layer", async () => {
      const fluorescenceButton = canvas.getByText("Fluorescence");
      await sleep(1000);
      await userEvent.click(fluorescenceButton);

      // Fluorescence should be active again
      expect(fluorescenceButton).toHaveAttribute("data-variant", "default");
    });
  },
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T1062"
    }
  }
}`,...I.parameters?.docs?.source},description:{story:`Mixed value types (numeric and categorical)
Demonstrates layers with both heatmap and categorical visualization`,...I.parameters?.docs?.description}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    data: (() => {
      const wells: WellData[] = [];
      const rows = "ABCDEFGH";
      const types = ["sample", "control", "standard"];
      for (let r = 0; r < 8; r++) {
        for (let c = 1; c <= 12; c++) {
          const wellId = \`\${rows[r]}\${c}\`;
          const type = types[Math.floor(Math.random() * types.length)];
          wells.push({
            wellId,
            values: {
              WellType: type
            }
          });
        }
      }
      return wells;
    })(),
    plateFormat: "96",
    title: "Legend at Bottom with Custom Styling",
    layerConfigs: [{
      id: "WellType",
      visualizationMode: "categorical",
      categoryColors: {
        sample: "#4575b4",
        control: "#d73027",
        standard: "#fdae61"
      }
    }],
    legendConfig: {
      position: "bottom",
      // Tests bottom legend position code path (lines 1485-1489)
      fontSize: 14,
      itemSpacing: 16,
      swatchSize: 20,
      title: "Well Types"
    } as LegendConfig,
    width: 700,
    height: 500
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Legend title is displayed", async () => {
      expect(canvas.getByText("Well Types")).toBeInTheDocument();
    });
    await step("Legend items are displayed", async () => {
      expect(canvas.getByText("sample")).toBeInTheDocument();
      expect(canvas.getByText("control")).toBeInTheDocument();
      expect(canvas.getByText("standard")).toBeInTheDocument();
    });
  },
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T1063"
    }
  }
}`,...S.parameters?.docs?.source},description:{story:`Legend configuration options
Demonstrates legend positioning and styling`,...S.parameters?.docs?.description}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    data: (() => {
      const wells: WellData[] = [];
      const rows = "ABCDEFGH";
      const types = ["sample", "control"];
      for (let r = 0; r < 8; r++) {
        for (let c = 1; c <= 12; c++) {
          const wellId = \`\${rows[r]}\${c}\`;
          const type = types[(r + c) % 2];
          wells.push({
            wellId,
            values: {
              Type: type
            }
          });
        }
      }
      return wells;
    })(),
    plateFormat: "96",
    title: "Hidden UI Elements",
    layerConfigs: [{
      id: "Type",
      visualizationMode: "categorical",
      categoryColors: {
        sample: "#4575b4",
        control: "#d73027"
      }
    }],
    showLegend: false,
    showColorBar: false,
    legendConfig: {
      position: "top" // Tests horizontal legend position code path
    } as LegendConfig,
    width: 700,
    height: 450
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Hidden UI Elements")).toBeInTheDocument();
    });
    await step("Legend items are NOT visible", async () => {
      expect(canvas.queryByText("sample")).not.toBeInTheDocument();
      expect(canvas.queryByText("control")).not.toBeInTheDocument();
    });
    await step("Chart container renders without legend/colorbar", async () => {
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1064"
    }
  }
}`,...f.parameters?.docs?.source},description:{story:`Hidden UI elements (showColorBar=false, showLegend=false)
Tests rendering without colorbar and legend, including horizontal legend position`,...f.parameters?.docs?.description}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    data: gridToWellData([[100, NaN, null, Infinity], [150, 250, -Infinity, 450], [NaN, null, 400, 500], [200, 300, NaN, 550]], "AU"),
    plateFormat: "custom",
    rows: 4,
    columns: 4,
    title: "Edge Cases Test",
    layerConfigs: [{
      id: "AU",
      valueUnit: " AU"
    }],
    width: 500,
    height: 400,
    showColorBar: true
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Edge Cases Test")).toBeInTheDocument();
    });
    await step("Chart renders without errors despite NaN/Infinity/null values", async () => {
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1065"
    }
  }
}`,...x.parameters?.docs?.source},description:{story:`Edge cases: NaN/Infinity values, null values
Tests graceful handling of invalid numeric values (converted to null)`,...x.parameters?.docs?.description}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    data: gridToWellData([[42.0, 42.0, 42.0], [42.0, 42.0, 42.0], [42.0, 42.0, 42.0]], "Value"),
    plateFormat: "custom",
    rows: 3,
    columns: 3,
    title: "Uniform Values Test",
    layerConfigs: [{
      id: "Value"
    }],
    showColorBar: true,
    legendConfig: {
      position: "left",
      title: "Values"
    } as LegendConfig,
    width: 500,
    height: 400
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Uniform Values Test")).toBeInTheDocument();
    });
    await step("Chart renders with uniform values", async () => {
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1066"
    }
  }
}`,...D.parameters?.docs?.source},description:{story:`Uniform values: all wells have the same value (min === max edge case)
Also tests left legend position for heatmap data`,...D.parameters?.docs?.description}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    data: [{
      wellId: "A1",
      values: {
        Type: "sample"
      }
    }, {
      wellId: "A2",
      values: {
        Type: "control"
      }
    }, {
      wellId: "B1",
      values: {
        Type: "sample"
      }
    }, {
      wellId: "B2",
      values: {
        Type: "control"
      }
    }],
    plateFormat: "custom",
    rows: 2,
    columns: 2,
    title: "Categorical with Left Legend",
    layerConfigs: [{
      id: "Type",
      visualizationMode: "categorical",
      categoryColors: {
        sample: "#4575b4",
        control: "#d73027"
      }
    }],
    legendConfig: {
      position: "left",
      title: "Types"
    } as LegendConfig,
    width: 500,
    height: 400
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Categorical with Left Legend")).toBeInTheDocument();
    });
    await step("Legend is rendered on left", async () => {
      expect(canvas.getByText("Types")).toBeInTheDocument();
      expect(canvas.getByText("sample")).toBeInTheDocument();
      expect(canvas.getByText("control")).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1067"
    }
  }
}`,...b.parameters?.docs?.source},description:{story:`Categorical data with left legend position
Tests left legend rendering code path (lines 1121, 1471-1475)`,...b.parameters?.docs?.description}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    data: [{
      wellId: "A1",
      values: {
        Value: 100
      },
      tooltipData: {
        sample: "S001"
      }
    }, {
      wellId: "A2",
      values: {
        Value: 200
      },
      tooltipData: {
        sample: "S002"
      }
    }, {
      wellId: "B1",
      values: {
        Value: 300
      },
      tooltipData: {
        sample: "S003"
      }
    }, {
      wellId: "B2",
      values: {
        Value: 400
      },
      tooltipData: {
        sample: "S004"
      }
    }],
    plateFormat: "custom",
    rows: 2,
    columns: 2,
    title: "Clickable Wells",
    layerConfigs: [{
      id: "Value",
      valueUnit: "RFU"
    }],
    width: 400,
    height: 350,
    onWellClick: wellData => {
      // Store clicked well data on window for test verification
      (window as unknown as Record<string, unknown>).lastClickedWell = wellData;
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Clickable Wells")).toBeInTheDocument();
    });
    await step("Chart container renders with click handler", async () => {
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });
    await step("Simulate Plotly click event on well A1", async () => {
      const plotContainer = canvasElement.querySelector(".js-plotly-plot") as HTMLElement & {
        emit?: (eventName: string, data: unknown) => void;
      };
      expect(plotContainer).toBeInTheDocument();

      // Trigger a plotly_click event with mock data for well A1
      // Plotly attaches event handlers that we can trigger directly
      if (plotContainer && typeof plotContainer.emit === "function") {
        plotContainer.emit("plotly_click", {
          points: [{
            x: 1,
            y: "A",
            pointIndex: 0
          }]
        });
      }
    });
    await step("Wells are clickable (chart accepts pointer events)", async () => {
      // Verify the plot has interactive elements by checking for marker points
      const plotContainer = canvasElement.querySelector(".js-plotly-plot");
      expect(plotContainer).toBeInTheDocument();
      // Plotly renders SVG elements for scatter markers
      const markers = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(markers.length).toBeGreaterThan(0);
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1068"
    }
  }
}`,...A.parameters?.docs?.source},description:{story:`Well click interaction
Tests the onWellClick callback by simulating Plotly click events`,...A.parameters?.docs?.description}}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    data: generate384WellData(),
    plateFormat: "384",
    title: "Using Viridis Colorscale",
    colorScale: "Viridis",
    layerConfigs: [{
      id: "AU"
    }],
    width: 900,
    height: 500
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Using Viridis Colorscale")).toBeInTheDocument();
    });
    await step("Chart renders with string colorscale", async () => {
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1069"
    }
  }
}`,...W.parameters?.docs?.source},description:{story:`Named Plotly colorscale (string format)
Tests using a string colorscale like "Viridis" instead of array`,...W.parameters?.docs?.description}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    data: [
    // Row A: all values present
    {
      wellId: "A1",
      values: {
        Signal: 1000
      }
    }, {
      wellId: "A2",
      values: {
        Signal: 2000
      }
    }, {
      wellId: "A3",
      values: {
        Signal: 3000
      }
    }, {
      wellId: "A4",
      values: {
        Signal: 4000
      }
    },
    // Row B: some empty wells (null values)
    {
      wellId: "B1",
      values: {
        Signal: 1500
      }
    }, {
      wellId: "B2",
      values: {
        Signal: null
      }
    },
    // Empty well
    {
      wellId: "B3",
      values: {
        Signal: 2500
      }
    }, {
      wellId: "B4",
      values: {
        Signal: null
      }
    },
    // Empty well
    // Row C: more empty wells
    {
      wellId: "C1",
      values: {
        Signal: null
      }
    },
    // Empty well
    {
      wellId: "C2",
      values: {
        Signal: 5000
      }
    }, {
      wellId: "C3",
      values: {
        Signal: null
      }
    },
    // Empty well
    {
      wellId: "C4",
      values: {
        Signal: 6000
      }
    },
    // Row D: all values present
    {
      wellId: "D1",
      values: {
        Signal: 7000
      }
    }, {
      wellId: "D2",
      values: {
        Signal: 8000
      }
    }, {
      wellId: "D3",
      values: {
        Signal: 9000
      }
    }, {
      wellId: "D4",
      values: {
        Signal: 10000
      }
    }],
    plateFormat: "custom",
    rows: 4,
    columns: 4,
    title: "Viridis with Empty Wells",
    colorScale: "Viridis",
    emptyWellColor: "#e0e0e0",
    // Light gray for empty wells
    layerConfigs: [{
      id: "Signal",
      valueUnit: "RFU"
    }],
    width: 500,
    height: 450
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Viridis with Empty Wells")).toBeInTheDocument();
    });
    await step("Chart renders with Viridis colorscale", async () => {
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });
    await step("Colorbar is present", async () => {
      // Verify colorbar is rendered
      const colorbar = canvasElement.querySelector(".cbfill");
      expect(colorbar).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1073"
    }
  }
}`,...F.parameters?.docs?.source},description:{story:`Named colorscale with empty wells
Tests that empty wells display with emptyWellColor when using named colorscales (string format)
This regression test covers the bug where empty wells showed as the minimum color of the scale`,...F.parameters?.docs?.description}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    data: gridToWellData([[100, 200, 300], [150, 250, 350], [200, 300, 400]], "AU"),
    plateFormat: "custom",
    rows: 3,
    columns: 3,
    title: "Custom Value Range (0-500)",
    valueMin: 0,
    valueMax: 500,
    layerConfigs: [{
      id: "AU",
      valueUnit: " AU"
    }],
    width: 500,
    height: 400
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Custom Value Range (0-500)")).toBeInTheDocument();
    });
    await step("Chart renders with custom range", async () => {
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1070"
    }
  }
}`,...R.parameters?.docs?.source},description:{story:`Custom value range overrides
Tests valueMin and valueMax props to override auto-calculated range`,...R.parameters?.docs?.description}}};z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  args: {
    data: generate96WellData(),
    plateFormat: "96",
    title: "Heatmap with Colorbar Title",
    layerConfigs: [{
      id: "RFU",
      name: "Fluorescence",
      valueUnit: "RFU"
    }],
    legendConfig: {
      position: "right",
      title: "Signal Intensity"
    } as LegendConfig,
    width: 800,
    height: 500
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Heatmap with Colorbar Title")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1071"
    }
  }
}`,...z.parameters?.docs?.source},description:{story:`Colorbar with title (heatmap legend title)
Tests legendConfig.title with heatmap mode`,...z.parameters?.docs?.description}}};U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    data: gridToWellData([[100, 200, 300], [150, 250, 350]], "Value"),
    plateFormat: "custom",
    rows: 2,
    columns: 3,
    layerConfigs: [{
      id: "Value"
    }],
    title: "Invalid Regions Test",
    regions: [{
      id: "invalid-format",
      name: "Invalid Format",
      wells: "INVALID:A3",
      // Invalid format - should be gracefully ignored
      borderColor: "#d73027",
      borderWidth: 2
    }, {
      id: "oob-region",
      name: "Out of Bounds",
      wells: "A1:Z99",
      // Extends beyond 2x3 plate
      borderColor: "#ff7f0e",
      borderWidth: 2
    }, {
      id: "valid-region",
      name: "Valid Region",
      wells: "A1:B2",
      borderColor: "#4575b4",
      borderWidth: 2
    }] as PlateRegion[],
    width: 500,
    height: 400
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Invalid Regions Test")).toBeInTheDocument();
    });
    await step("Valid region is still rendered", async () => {
      expect(canvas.getByText("Valid Region")).toBeInTheDocument();
    });
    await step("Chart still renders despite invalid regions", async () => {
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1072"
    }
  }
}`,...U.parameters?.docs?.source},description:{story:`Invalid regions: tests graceful handling of invalid/out-of-bounds region definitions
Covers invalid well format and regions extending beyond plate dimensions`,...U.parameters?.docs?.description}}};const O=["Plate96Well","Plate384Well","Plate1536Well","CustomDimensions","PartialPlate","GenericHeatmap","RandomData","CategoricalVisualization","LayerToggling","RegionHighlighting","CustomCategoryColors","MixedValueTypes","LegendConfiguration","HiddenUIElements","EdgeCases","UniformValuesAndLeftLegend","CategoricalLeftLegend","WellClickInteraction","StringColorscale","StringColorscaleWithEmptyWells","ValueRangeOverride","ColorbarWithTitle","InvalidRegions"];export{b as CategoricalLeftLegend,v as CategoricalVisualization,z as ColorbarWithTitle,B as CustomCategoryColors,m as CustomDimensions,x as EdgeCases,g as GenericHeatmap,f as HiddenUIElements,U as InvalidRegions,T as LayerToggling,S as LegendConfiguration,I as MixedValueTypes,h as PartialPlate,y as Plate1536Well,u as Plate384Well,p as Plate96Well,w as RandomData,C as RegionHighlighting,W as StringColorscale,F as StringColorscaleWithEmptyWells,D as UniformValuesAndLeftLegend,R as ValueRangeOverride,A as WellClickInteraction,O as __namedExportsOrder,Z as default};
