import{r as u,j as c}from"./iframe-14YYbrss.js";import{P as ae}from"./plotly-BfU08UT2.js";import{B as Ce}from"./button-BSJeE99h.js";import"./preload-helper-BbFkF2Um.js";import"./index-B8eA1Gpy.js";const Fe=[[0,"#313695"],[.25,"#4575b4"],[.5,"#ffffbf"],[.75,"#fdae61"],[1,"#a50026"]],de=["#4575b4","#d73027","#1a9850","#fdae61","#9467bd","#e377c2","#8c564b","#bcbd22","#17becf","#ff7f0e"],G=8,ke=[4,20],Be=5e3,x={MARGIN_LEFT:80,MARGIN_RIGHT:30,MARGIN_TOP:80,MARGIN_BOTTOM:80,TITLE_FONT_SIZE:20,AXIS_TITLE_FONT_SIZE:16,AXIS_TICK_FONT_SIZE:12,FONT_FAMILY:"Inter, sans-serif",AXIS_LINE_WIDTH:1,AUTO_RANGE_PADDING:.1};function we(t,e){let n=Number.POSITIVE_INFINITY,s=Number.NEGATIVE_INFINITY;for(const a of t){const r=a.metadata?.[e];typeof r=="number"&&Number.isFinite(r)&&(n=Math.min(n,r),s=Math.max(s,r))}return!Number.isFinite(n)||!Number.isFinite(s)?{min:0,max:1}:n===s?{min:n-1,max:s+1}:{min:n,max:s}}function pe(t,e){const n=t.map(s=>s.metadata?.[e]).filter(s=>typeof s=="string");return[...new Set(n)].sort()}function Re(t,e){if(!e||e.type==="static"){const n=e?.value||"#4575b4";return new Array(t.length).fill(n)}if(e.type==="categorical"&&e.field){const n=pe(t,e.field),s=e.categoryColors||{},a={};return n.forEach((r,o)=>{a[r]=s[r]||de[o%de.length]}),t.map(r=>{const o=r.metadata?.[e.field];return a[String(o)]||de[0]})}return new Array(t.length).fill("#4575b4")}function je(t,e){if(!e||e.type==="static"){const n=e?.value||"circle";return new Array(t.length).fill(n)}if(e.type==="categorical"&&e.field){const n=pe(t,e.field),s=e.categoryShapes||{},a=["circle","square","diamond","cross","x","triangle-up","triangle-down","star"],r={};return n.forEach((o,l)=>{r[o]=s[o]||a[l%a.length]}),t.map(o=>{const l=o.metadata?.[e.field];return r[String(l)]||"circle"})}return new Array(t.length).fill("circle")}function Me(t,e){if(!e||e.type==="static"){const n=e?.value||G;return new Array(t.length).fill(n)}if(e.type==="categorical"&&e.field){const n=pe(t,e.field),s=e.categorySizes||{},a={};return n.forEach((r,o)=>{a[r]=s[r]||G+o*2}),t.map(r=>{const o=r.metadata?.[e.field];return a[String(o)]||G})}if(e.type==="continuous"&&e.field){const n=e.min!==void 0&&e.max!==void 0?{min:e.min,max:e.max}:we(t,e.field),s=e.sizeRange||ke,[a,r]=s;return t.map(o=>{const l=o.metadata?.[e.field];if(typeof l=="number"&&Number.isFinite(l)){const p=(l-n.min)/(n.max-n.min);return a+p*(r-a)}return G})}return new Array(t.length).fill(G)}function Oe(t,e){if(!e.enabled||t.length<=(e.maxPoints||Be))return t;const n=e.maxPoints||Be;return(e.strategy||"lttb")==="lttb"?qe(t,n):t}function ze(t,e,n,s){const a=n-e;if(a>0){let o=0,l=0;for(let p=e;p<n;p++)o+=t[p].x,l+=t[p].y;return{x:o/a,y:l/a}}const r=Math.max(0,Math.min(e,s-1));return{x:t[r].x,y:t[r].y}}function qe(t,e){const n=t.length;if(e<=0||n===0)return[];if(e>=n)return t;if(e===1)return[t[0]];if(e===2)return[t[0],t[n-1]];const s=(n-2)/(e-2),{floor:a,abs:r,min:o}=Math,l=[t[0]];let p=0;for(let m=0;m<e-2;m++){const g=o(a((m+1)*s)+1,n-1),S=o(a((m+2)*s)+1,n),{x:T,y:B}=ze(t,g,S,n),h=o(a(m*s)+1,n-1),A=o(a((m+1)*s)+1,n-1),L=t[p].x,M=t[p].y;let O=-1,N=t[h],E=h;for(let w=h;w<A;w++){const z=r((L-T)*(t[w].y-M)-(L-t[w].x)*(B-M))*.5;z>O&&(O=z,N=t[w],E=w)}l.push(N),p=E}return l.push(t[n-1]),l}function Ye(t,e){const n=[];if(n.push(`X: ${t.x.toFixed(2)}`),n.push(`Y: ${t.y.toFixed(2)}`),t.label&&n.push(`Label: ${t.label}`),e&&t.metadata){for(const s of e)if(s in t.metadata){const a=t.metadata[s];n.push(`${s}: ${a}`)}}else if(t.metadata&&!e)for(const[s,a]of Object.entries(t.metadata))n.push(`${s}: ${a}`);return n.join("<br>")}function Pe(t){const e=t.ctrlKey||t.metaKey;return t.shiftKey&&e?"toggle":t.shiftKey?"add":e?"remove":"replace"}function be(t,e,n=.1,s="linear"){const a=s==="log";let r=1/0,o=-1/0;for(const p of t){const m=p[e];if(!Number.isFinite(m)||a&&m<=0)continue;const g=a?Math.log10(m):m;g<r&&(r=g),g>o&&(o=g)}if(!Number.isFinite(r))return[0,1];if(r===o)return[r-1,o+1];const l=o-r;return[r-l*n,o+l*n]}function Ge(t,e,n){const s=new Set(t);switch(n){case"replace":return new Set(e);case"add":for(const a of e)s.add(a);return s;case"remove":for(const a of e)s.delete(a);return s;case"toggle":for(const a of e)s.has(a)?s.delete(a):s.add(a);return s;default:return s}}const Xe=({title:t,xAxis:e,yAxis:n,width:s,height:a,xRange:r,yRange:o,enableLassoSelection:l,enableBoxSelection:p})=>({autosize:!1,width:s,height:a,title:t?{text:t,font:{family:x.FONT_FAMILY,size:x.TITLE_FONT_SIZE,color:"#333333"},x:.5,xanchor:"center"}:void 0,margin:{l:x.MARGIN_LEFT,r:x.MARGIN_RIGHT,t:t?x.MARGIN_TOP:x.MARGIN_TOP-x.TITLE_FONT_SIZE,b:x.MARGIN_BOTTOM},xaxis:{title:{text:e.title||"",font:{family:x.FONT_FAMILY,size:x.AXIS_TITLE_FONT_SIZE,color:"#333333"}},type:e.scale==="log"?"log":"linear",range:r,autorange:!r,gridcolor:"#e0e0e0",linecolor:"#333333",linewidth:x.AXIS_LINE_WIDTH,tickfont:{family:x.FONT_FAMILY,size:x.AXIS_TICK_FONT_SIZE},zeroline:!1},yaxis:{title:{text:n.title||"",font:{family:x.FONT_FAMILY,size:x.AXIS_TITLE_FONT_SIZE,color:"#333333"}},type:n.scale==="log"?"log":"linear",range:o,autorange:!o,gridcolor:"#e0e0e0",linecolor:"#333333",linewidth:x.AXIS_LINE_WIDTH,tickfont:{family:x.FONT_FAMILY,size:x.AXIS_TICK_FONT_SIZE},zeroline:!1},paper_bgcolor:"#ffffff",plot_bgcolor:"#ffffff",font:{family:x.FONT_FAMILY,color:"#333333"},hovermode:"closest",dragmode:l?"lasso":p?"select":!1}),j=({data:t,title:e,xAxis:n={},yAxis:s={},colorMapping:a,shapeMapping:r,sizeMapping:o,tooltip:l={enabled:!0},enableClickSelection:p=!0,enableBoxSelection:m=!0,enableLassoSelection:g=!0,selectedIds:S,onSelectionChange:T,onPointClick:B,downsampling:h,width:A=800,height:L=600,showColorBar:M=!0,className:O})=>{const N=u.useRef(null),E=u.useRef(T),w=u.useRef(B),z=u.useRef(new Set),ee=u.useRef(!1);E.current=T,w.current=B;const[_e,se]=u.useState(new Set),ye=S!==void 0,re=ye?S:_e;z.current=re,ee.current=ye;const me=u.useMemo(()=>new Set([...re].map(String)),[re]),ge=u.useMemo(()=>new Map(t.map(d=>[String(d.id),d.id])),[t]),y=u.useMemo(()=>h?Oe(t,h):t,[t,h]),te=u.useMemo(()=>Re(y,a),[y,a]),xe=u.useMemo(()=>je(y,r),[y,r]),fe=u.useMemo(()=>Me(y,o),[y,o]),Se=u.useMemo(()=>{if(n.range)return n.range;if(n.autoRange!==!1)return be(y,"x",n.autoRangePadding??x.AUTO_RANGE_PADDING,n.scale)},[y,n]),he=u.useMemo(()=>{if(s.range)return s.range;if(s.autoRange!==!1)return be(y,"y",s.autoRangePadding??x.AUTO_RANGE_PADDING,s.scale)},[y,s]),q=l.enabled!==!1,Te=u.useMemo(()=>q?y.map(d=>l.content?l.content(d):Ye(d,l.fields)):[],[y,l,q]),Ae=u.useMemo(()=>a?.type==="continuous"&&a.field&&y.length>0?y.map(d=>{const I=d.metadata?.[a.field];return typeof I=="number"&&Number.isFinite(I)?I:0}):te,[y,a,te]),oe=u.useMemo(()=>{if(a?.type==="continuous"){const d=a.colorScale||Fe;return d}},[a]),Ie=u.useMemo(()=>{const d={size:fe,symbol:xe,line:{color:"#ffffff",width:1}};if(a?.type==="continuous"&&oe){if(d.color=Ae,d.colorscale=oe,d.showscale=M,a.field){const I=a.min!==void 0&&a.max!==void 0?{min:a.min,max:a.max}:we(y,a.field);d.cmin=I.min,d.cmax=I.max,d.colorbar={title:{text:a.field,side:"right"},thickness:20,len:.7}}}else d.color=te;return d},[fe,xe,a,oe,Ae,M,y,te]);u.useEffect(()=>{const d=N.current;if(!d||y.length===0)return;const I=y.map(f=>f.x),ne=y.map(f=>f.y),Y=y.map(f=>String(f.id)),Le=[{x:I,y:ne,ids:Y,mode:"markers",type:"scatter",marker:Ie,hoverinfo:q?"text":"skip",text:Te,hovertemplate:q?"%{text}<extra></extra>":void 0,showlegend:!1,unselected:{marker:{opacity:.3}},selected:{marker:{opacity:1,line:{color:"#d73027",width:2}}}}],Ne=Xe({title:e,xAxis:n,yAxis:s,width:A,height:L,xRange:Se,yRange:he,enableLassoSelection:g,enableBoxSelection:m}),ie={responsive:!0,displayModeBar:!0,displaylogo:!1,modeBarButtonsToAdd:[],modeBarButtonsToRemove:["toImage"]};m&&ie.modeBarButtonsToAdd?.push("select2d"),g&&ie.modeBarButtonsToAdd?.push("lasso2d"),ae.newPlot(d,Le,Ne,ie);const le=d;return p&&le.on("plotly_click",f=>{const F=f.points[0];if(F&&F.data.ids){const ce=F.data.ids[F.pointIndex],k=y.find(v=>String(v.id)===ce);if(k){w.current?.(k,f.event);const v=Pe(f.event),P=Ge(z.current,new Set([k.id]),v);ee.current||se(P),E.current?.(P,v)}}}),(m||g)&&(le.on("plotly_selected",f=>{if(f&&f.points){const F=f.points.map(v=>{if(v.data.ids&&v.pointIndex!==void 0){const P=v.data.ids[v.pointIndex];return ge.get(P)??P}return null}).filter(v=>v!==null),ce="replace",k=new Set(F);ee.current||se(k),E.current?.(k,ce)}}),le.on("plotly_deselect",()=>{const f=new Set;ee.current||se(f),E.current?.(f,"replace")})),()=>{d&&ae.purge(d)}},[y,Ie,n,s,Se,he,e,A,L,l,Te,p,m,g,ge,q]),u.useEffect(()=>{const d=N.current;if(!d||y.length===0)return;const I=d,ne=y.map((Y,ve)=>me.has(String(Y.id))?ve:null).filter(Y=>Y!==null);ne.length>0?ae.restyle(I,{selectedpoints:[ne]},[0]):ae.restyle(I,{selectedpoints:[null]},[0])},[me,y]);const Ee=O?`interactive-scatter ${O}`:"interactive-scatter";return c.jsx("div",{className:Ee,children:c.jsx("div",{ref:N,className:"interactive-scatter__plot",style:{width:A,height:L}})})};j.__docgenInfo={description:`InteractiveScatter component for visualizing scatter plot data with advanced interactions.

**Features:**
- Data-driven and static styling (color, shape, size)
- Interactive selection (click, box, lasso)
- Keyboard modifiers for click-selection modes (Shift/Ctrl)
- Customizable tooltips with rich content support
- Axis customization (ranges, log/linear scales)
- Performance optimizations for large datasets
- Selection propagation via callbacks

**Selection Modes (click selection only):**
- Default click: Replace selection
- Shift + click: Add to selection
- Ctrl/Cmd + click: Remove from selection
- Shift + Ctrl + click: Toggle selection

Box/lasso selection always replaces the current selection because
Plotly does not expose the original keyboard event for drag operations.`,methods:[],displayName:"InteractiveScatter",props:{data:{required:!0,tsType:{name:"Array",elements:[{name:"ScatterPoint"}],raw:"ScatterPoint[]"},description:"Array of data points to plot"},title:{required:!1,tsType:{name:"string"},description:"Chart title"},xAxis:{required:!1,tsType:{name:"AxisConfig"},description:"X-axis configuration",defaultValue:{value:"{}",computed:!1}},yAxis:{required:!1,tsType:{name:"AxisConfig"},description:"Y-axis configuration",defaultValue:{value:"{}",computed:!1}},colorMapping:{required:!1,tsType:{name:"ColorMapping"},description:"Color mapping configuration"},shapeMapping:{required:!1,tsType:{name:"ShapeMapping"},description:"Shape mapping configuration"},sizeMapping:{required:!1,tsType:{name:"SizeMapping"},description:"Size mapping configuration"},tooltip:{required:!1,tsType:{name:"TooltipConfig"},description:"Tooltip configuration",defaultValue:{value:"{ enabled: true }",computed:!1}},enableClickSelection:{required:!1,tsType:{name:"boolean"},description:`Enable click selection
@default true`,defaultValue:{value:"true",computed:!1}},enableBoxSelection:{required:!1,tsType:{name:"boolean"},description:`Enable box selection (drag to select rectangular region)
@default true`,defaultValue:{value:"true",computed:!1}},enableLassoSelection:{required:!1,tsType:{name:"boolean"},description:`Enable lasso selection (freeform selection)
@default true`,defaultValue:{value:"true",computed:!1}},selectedIds:{required:!1,tsType:{name:"Set",elements:[{name:"union",raw:"string | number",elements:[{name:"string"},{name:"number"}]}],raw:"Set<string | number>"},description:`Controlled selection state.
If provided, component operates in controlled mode.`},onSelectionChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(selectedIds: Set<string | number>, mode: SelectionMode) => void",signature:{arguments:[{type:{name:"Set",elements:[{name:"union",raw:"string | number",elements:[{name:"string"},{name:"number"}]}],raw:"Set<string | number>"},name:"selectedIds"},{type:{name:"union",raw:`| "replace" // Default: Replace existing selection
| "add" // Shift: Add to selection
| "remove" // Ctrl: Remove from selection
| "toggle"`,elements:[{name:"literal",value:'"replace"'},{name:"literal",value:'"add"'},{name:"literal",value:'"remove"'},{name:"literal",value:'"toggle"'}]},name:"mode"}],return:{name:"void"}}},description:"Callback when selection changes"},onPointClick:{required:!1,tsType:{name:"signature",type:"function",raw:"(point: ScatterPoint, event: MouseEvent) => void",signature:{arguments:[{type:{name:"ScatterPoint"},name:"point"},{type:{name:"MouseEvent"},name:"event"}],return:{name:"void"}}},description:"Callback when a point is clicked"},downsampling:{required:!1,tsType:{name:"DownsamplingConfig"},description:"Downsampling configuration for large datasets"},width:{required:!1,tsType:{name:"number"},description:`Chart width in pixels
@default 800`,defaultValue:{value:"800",computed:!1}},height:{required:!1,tsType:{name:"number"},description:`Chart height in pixels
@default 600`,defaultValue:{value:"600",computed:!1}},showColorBar:{required:!1,tsType:{name:"boolean"},description:"Show the continuous color-scale bar when using a continuous `colorMapping`.\nHas no effect for categorical or static mappings.\n@default true",defaultValue:{value:"true",computed:!1}},className:{required:!1,tsType:{name:"string"},description:"Custom CSS class name"}}};const{expect:i,within:b}=__STORYBOOK_MODULE_TEST__,ct={title:"Charts/InteractiveScatter",component:j,tags:["autodocs"],parameters:{layout:"centered"}},$e=["Group A","Group B","Group C"],Ue=["Active","Inactive","Pending"],C=()=>Math.random();function _(t){return Array.from({length:t},(e,n)=>({id:`point-${n}`,x:C()*100,y:C()*100,label:`Point ${n}`,metadata:{category:$e[n%3],status:Ue[n%3],value:C()*1e3,intensity:C()*10,concentration:Number((C()*100).toFixed(2))}}))}function We(){const t=[{cx:25,cy:25,label:"Cluster A",n:50},{cx:75,cy:75,label:"Cluster B",n:50},{cx:50,cy:90,label:"Cluster C",n:30}];let e=0;return t.flatMap(n=>Array.from({length:n.n},()=>({id:`point-${e++}`,x:n.cx+(C()-.5)*20,y:n.cy+(C()-.5)*20,label:`${n.label} ${e}`,metadata:{cluster:n.label,value:C()*1e3,intensity:C()*10}})))}function Ve(){return Array.from({length:80},(t,e)=>({id:`point-${e}`,x:10**(C()*4),y:10**(C()*5),label:`Sample ${e}`,metadata:{category:e%2===0?"Type X":"Type Y"}}))}const Ke=_(100),He=_(150),Ze=_(80),Je=_(80),De=We(),Qe=_(100),et=_(200),tt=Ve(),ue=1e4;function nt(t){const e=t.trim().split(/\r?\n/);if(e.length<2)return[];const n=e[0].split(",").map(p=>p.trim().toLowerCase()),s=n.indexOf("x"),a=n.indexOf("y");if(s===-1||a===-1)return[];const r=n.indexOf("id"),o=n.indexOf("label"),l=n.filter((p,m)=>![s,a,r,o].includes(m));return e.slice(1).flatMap((p,m)=>{const g=p.split(",").map(h=>h.trim()),S=Number(g[s]),T=Number(g[a]);if(Number.isNaN(S)||Number.isNaN(T))return[];const B={};for(const h of l){const A=g[n.indexOf(h)];B[h]=Number.isNaN(Number(A))?A:Number(A)}return{id:r===-1?`row-${m}`:g[r],x:S,y:T,label:o===-1?void 0:g[o],metadata:Object.keys(B).length>0?B:void 0}})}function at(t){const e=JSON.parse(t);return(Array.isArray(e)?e:[]).flatMap((s,a)=>{if(typeof s!="object"||s===null)return[];const r=s,o=Number(r.x),l=Number(r.y);if(Number.isNaN(o)||Number.isNaN(l))return[];const{id:p,x:m,y:g,label:S,...T}=r;return{id:p==null?`row-${a}`:String(p),x:o,y:l,label:S==null?void 0:String(S),metadata:Object.keys(T).length>0?T:void 0}})}const D={width:800,height:600},R={padding:8,border:"1px solid #ddd"},X={args:{data:Ke,title:"Basic Scatter Plot",xAxis:{title:"X Axis"},yAxis:{title:"Y Axis"},...D},play:async({canvasElement:t,step:e})=>{const n=b(t);await e("Chart title is displayed",async()=>{i(n.getByText("Basic Scatter Plot")).toBeInTheDocument()}),await e("Chart container renders",async()=>{i(t.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await e("Single scatter trace renders",async()=>{i(t.querySelectorAll(".scatterlayer .trace").length).toBe(1)}),await e("Axis titles are displayed",async()=>{i(n.getByText("X Axis")).toBeInTheDocument(),i(n.getByText("Y Axis")).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1149"}}},$={args:{data:He,title:"Data-Driven Color / Shape / Size",xAxis:{title:"X Axis"},yAxis:{title:"Y Axis"},colorMapping:{type:"categorical",field:"category",categoryColors:{"Group A":"#4575b4","Group B":"#d73027","Group C":"#1a9850"}},shapeMapping:{type:"categorical",field:"status",categoryShapes:{Active:"circle",Inactive:"square",Pending:"diamond"}},sizeMapping:{type:"continuous",field:"intensity",sizeRange:[4,20]},...D},play:async({canvasElement:t,step:e})=>{const n=b(t);await e("Chart title is displayed",async()=>{i(n.getByText("Data-Driven Color / Shape / Size")).toBeInTheDocument()}),await e("Chart container renders",async()=>{i(t.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await e("Single scatter trace renders",async()=>{i(t.querySelectorAll(".scatterlayer .trace").length).toBe(1)}),await e("Axis titles are displayed",async()=>{i(n.getByText("X Axis")).toBeInTheDocument(),i(n.getByText("Y Axis")).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1150"}}},U={args:{data:Ze,title:"Static Styling",xAxis:{title:"X Axis"},yAxis:{title:"Y Axis"},colorMapping:{type:"static",value:"#e377c2"},shapeMapping:{type:"static",value:"diamond"},sizeMapping:{type:"static",value:12},...D},play:async({canvasElement:t,step:e})=>{const n=b(t);await e("Chart title is displayed",async()=>{i(n.getByText("Static Styling")).toBeInTheDocument()}),await e("Chart container renders",async()=>{i(t.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await e("Single scatter trace renders",async()=>{i(t.querySelectorAll(".scatterlayer .trace").length).toBe(1)}),await e("Axis titles are displayed",async()=>{i(n.getByText("X Axis")).toBeInTheDocument(),i(n.getByText("Y Axis")).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1151"}}},W={render:t=>{const[e,n]=u.useState(new Set);return c.jsxs("div",{children:[c.jsx(j,{...t,selectedIds:e,onSelectionChange:n}),c.jsxs("p",{style:{fontFamily:"monospace",marginTop:12},children:["Selected: ",e.size," point(s)"]})]})},args:{data:De,title:"Click / Box / Lasso Selection",xAxis:{title:"X Axis"},yAxis:{title:"Y Axis"},colorMapping:{type:"categorical",field:"cluster"},enableClickSelection:!0,enableBoxSelection:!0,enableLassoSelection:!0,...D},play:async({canvasElement:t,step:e})=>{const n=b(t);await e("Chart title is displayed",async()=>{i(n.getByText("Click / Box / Lasso Selection")).toBeInTheDocument()}),await e("Chart container renders",async()=>{i(t.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await e("Single scatter trace renders",async()=>{i(t.querySelectorAll(".scatterlayer .trace").length).toBe(1)}),await e("Selection count is displayed",async()=>{i(n.getByText(/Selected:\s*0\s+point\(s\)/)).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1152"}}},V={render:t=>{const[e,n]=u.useState(new Set),[s,a]=u.useState("replace");return c.jsxs("div",{children:[c.jsx(j,{...t,selectedIds:e,onSelectionChange:(r,o)=>{n(r),a(o)}}),c.jsxs("div",{style:{fontFamily:"monospace",marginTop:12,lineHeight:1.8},children:[c.jsxs("p",{style:{margin:0},children:["Selected: ",e.size,"  |  Mode: ",c.jsx("strong",{children:s})]}),c.jsx("p",{style:{margin:0,color:"#666",fontSize:13},children:"Click: replace · Shift+Click: add · Ctrl+Click (Win) / Cmd+Click (Mac): remove · Shift+Ctrl+Click (Win) / Shift+Cmd+Click (Mac): toggle · Box/Lasso: always replace"})]})]})},args:{data:Je,title:"Keyboard Modifier Selection",xAxis:{title:"X Axis"},yAxis:{title:"Y Axis"},colorMapping:{type:"categorical",field:"category"},enableClickSelection:!0,enableBoxSelection:!0,enableLassoSelection:!0,...D},play:async({canvasElement:t,step:e})=>{const n=b(t);await e("Chart title is displayed",async()=>{i(n.getByText("Keyboard Modifier Selection")).toBeInTheDocument()}),await e("Chart container renders",async()=>{i(t.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await e("Single scatter trace renders",async()=>{i(t.querySelectorAll(".scatterlayer .trace").length).toBe(1)}),await e("Selection status and mode are displayed",async()=>{i(n.getByText(/Selected:\s*0/)).toBeInTheDocument(),i(n.getByText("replace",{selector:"strong"})).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1154"}}},K={render:t=>{const[e,n]=u.useState(new Set),s=t.data.filter(a=>e.has(a.id));return c.jsxs("div",{style:{display:"flex",gap:24,alignItems:"flex-start"},children:[c.jsx(j,{...t,selectedIds:e,onSelectionChange:n}),c.jsxs("div",{style:{minWidth:340,maxHeight:600,overflowY:"auto"},children:[c.jsxs("h3",{style:{margin:"0 0 8px"},children:["Selected Points (",s.length,")"]}),s.length>0?c.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",border:"1px solid #ddd",fontSize:13},children:[c.jsx("thead",{children:c.jsx("tr",{style:{backgroundColor:"#f0f0f0"},children:["ID","X","Y","Cluster","Value"].map(a=>c.jsx("th",{style:R,children:a},a))})}),c.jsx("tbody",{children:s.map(a=>c.jsxs("tr",{children:[c.jsx("td",{style:R,children:a.id}),c.jsx("td",{style:R,children:a.x.toFixed(2)}),c.jsx("td",{style:R,children:a.y.toFixed(2)}),c.jsx("td",{style:R,children:String(a.metadata?.cluster??"")}),c.jsx("td",{style:R,children:typeof a.metadata?.value=="number"?a.metadata.value.toFixed(2):"–"})]},a.id))})]}):c.jsx("p",{style:{color:"#888"},children:"Select points to populate the grid."})]})]})},args:{data:De,title:"Selection → Data Grid",xAxis:{title:"X Axis"},yAxis:{title:"Y Axis"},colorMapping:{type:"categorical",field:"cluster"},enableClickSelection:!0,enableBoxSelection:!0,enableLassoSelection:!0,width:700,height:600},play:async({canvasElement:t,step:e})=>{const n=b(t);await e("Chart title is displayed",async()=>{i(n.getByText("Selection → Data Grid")).toBeInTheDocument()}),await e("Chart container renders",async()=>{i(t.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await e("Single scatter trace renders",async()=>{i(t.querySelectorAll(".scatterlayer .trace").length).toBe(1)}),await e("Data grid heading is displayed",async()=>{i(n.getByText("Selected Points (0)")).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1156"}}},H={args:{data:Qe,title:"Custom Rich Tooltips",xAxis:{title:"X Axis"},yAxis:{title:"Y Axis"},colorMapping:{type:"categorical",field:"category",categoryColors:{"Group A":"#4575b4","Group B":"#d73027","Group C":"#1a9850"}},sizeMapping:{type:"continuous",field:"intensity",sizeRange:[5,18]},tooltip:{enabled:!0,content:t=>{const e=t.metadata?.status??"Unknown",n=typeof t.metadata?.value=="number"?t.metadata.value.toFixed(1):"–",s=e==="Active"?"#1a9850":e==="Inactive"?"#d73027":"#fdae61";return[`<b>${t.label??t.id}</b>`,`<span style="background:${s};color:#fff;padding:1px 6px;border-radius:3px;font-size:11px">${String(e)}</span>`,`X: ${t.x.toFixed(2)} · Y: ${t.y.toFixed(2)}`,`Value: <b>${n}</b> · Conc: ${String(t.metadata?.concentration??"–")}`].join("<br>")}},...D},play:async({canvasElement:t,step:e})=>{const n=b(t);await e("Chart title is displayed",async()=>{i(n.getByText("Custom Rich Tooltips")).toBeInTheDocument()}),await e("Chart container renders",async()=>{i(t.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await e("Single scatter trace renders",async()=>{i(t.querySelectorAll(".scatterlayer .trace").length).toBe(1)}),await e("Axis titles are displayed",async()=>{i(n.getByText("X Axis")).toBeInTheDocument(),i(n.getByText("Y Axis")).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1157"}}},Z={args:{data:et,title:"Fixed Axis Ranges (zoomed to 20-80)",xAxis:{title:"X Axis",range:[20,80]},yAxis:{title:"Y Axis",range:[20,80]},colorMapping:{type:"categorical",field:"category"},...D},play:async({canvasElement:t,step:e})=>{const n=b(t);await e("Chart title is displayed",async()=>{i(n.getByText("Fixed Axis Ranges (zoomed to 20-80)")).toBeInTheDocument()}),await e("Chart container renders",async()=>{i(t.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await e("Single scatter trace renders",async()=>{i(t.querySelectorAll(".scatterlayer .trace").length).toBe(1)}),await e("Axis titles are displayed",async()=>{i(n.getByText("X Axis")).toBeInTheDocument(),i(n.getByText("Y Axis")).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1158"}}},J={args:{data:tt,title:"Log-Scale Axes",xAxis:{title:"X (log)",scale:"log"},yAxis:{title:"Y (log)",scale:"log"},colorMapping:{type:"categorical",field:"category"},...D},play:async({canvasElement:t,step:e})=>{const n=b(t);await e("Chart title is displayed",async()=>{i(n.getByText("Log-Scale Axes")).toBeInTheDocument()}),await e("Chart container renders",async()=>{i(t.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await e("Single scatter trace renders",async()=>{i(t.querySelectorAll(".scatterlayer .trace").length).toBe(1)}),await e("Log axis titles are displayed",async()=>{i(n.getByText("X (log)")).toBeInTheDocument(),i(n.getByText("Y (log)")).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1159"}}},Q={render:t=>{const[e,n]=u.useState([]),[s,a]=u.useState("generated"),[r,o]=u.useState(null),l=u.useRef(null);u.useEffect(()=>{const g=requestAnimationFrame(()=>{n(_(ue))});return()=>cancelAnimationFrame(g)},[]);const p=g=>{const S=g.target.files?.[0];if(!S)return;o(null);const T=new FileReader;T.onload=B=>{try{const h=B.target?.result,A=S.name.endsWith(".json")?at(h):nt(h);if(A.length===0){o("No valid points found. CSV needs x,y columns; JSON needs [{x, y}, …].");return}n(A),a(S.name)}catch{o("Failed to parse file. Check that it is valid CSV or JSON.")}},T.readAsText(S)},m=()=>{n(_(ue)),a("generated"),o(null),l.current&&(l.current.value="")};return e.length===0?c.jsxs("div",{style:{width:t.width,height:t.height,display:"grid",placeItems:"center",color:"#888"},children:["Generating ",ue.toLocaleString()," points…"]}):c.jsxs("div",{children:[c.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12,marginBottom:12,fontSize:13},children:[c.jsx(Ce,{variant:"secondary",size:"small",onClick:()=>l.current?.click(),children:"Upload CSV / JSON"}),c.jsx("input",{ref:l,type:"file",accept:".csv,.json",onChange:p,style:{display:"none"}}),s!=="generated"&&c.jsx(Ce,{variant:"tertiary",size:"small",onClick:m,children:"Reset to random data"}),c.jsx("span",{style:{color:"#666"},children:s==="generated"?`${e.length.toLocaleString()} random points`:`${e.length.toLocaleString()} points from ${s}`}),r&&c.jsx("span",{style:{color:"#d73027"},children:r})]}),c.jsx(j,{...t,data:e})]})},args:{data:[],title:"Downsampling (10k → 1k via LTTB)",xAxis:{title:"X Axis"},yAxis:{title:"Y Axis"},downsampling:{enabled:!0,maxPoints:1e3,strategy:"lttb"},...D},play:async({canvasElement:t,step:e})=>{const n=b(t);await e("Chart title is displayed",async()=>{i(await n.findByText("Downsampling (10k → 1k via LTTB)",{},{timeout:15e3})).toBeInTheDocument()}),await e("Chart container renders",async()=>{i(t.querySelector(".js-plotly-plot")).toBeInTheDocument()}),await e("Single scatter trace renders",async()=>{i(t.querySelectorAll(".scatterlayer .trace").length).toBe(1)}),await e("Upload control is displayed",async()=>{i(n.getByRole("button",{name:/upload csv \/ json/i})).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1161"},docs:{source:{code:`
function scatterData(count: number): ScatterPoint[] {
  return Array.from({ length: count }, (_, i) => ({
    id: \`point-\${i}\`,
    x: rand() * 100,
    y: rand() * 100,
    label: \`Point \${i}\`,
    metadata: {
      category: CATEGORIES[\${i} % 3],
      status: STATUSES[\${i} % 3],
      value: rand() * 1000,
      intensity: rand() * 10,
      concentration: Number((\${rand()} * 100).toFixed(2)),
    },
  }));
}

const [data, setData] = useState<ScatterPoint[]>([]);

useEffect(() => {
  const handle = requestAnimationFrame(() => {
    setData(scatterData(10_000));
  });
  return () => cancelAnimationFrame(handle);
}, []);

return (
  <InteractiveScatter
    data={data}
    title="Downsampling (10k → 1k via LTTB)"
    xAxis={{ title: "X Axis" }}
    yAxis={{ title: "Y Axis" }}
    downsampling={{ enabled: true, maxPoints: 1000, strategy: "lttb" }}
    width={800}
    height={600}
  />
);`.trim(),language:"tsx"}}}};X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  args: {
    data: BASIC_DATA,
    title: "Basic Scatter Plot",
    xAxis: {
      title: "X Axis"
    },
    yAxis: {
      title: "Y Axis"
    },
    ...DEFAULT_DIMS
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Basic Scatter Plot")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Single scatter trace renders", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(1);
    });
    await step("Axis titles are displayed", async () => {
      expect(canvas.getByText("X Axis")).toBeInTheDocument();
      expect(canvas.getByText("Y Axis")).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1149"
    }
  }
}`,...X.parameters?.docs?.source},description:{story:"Minimal scatter plot — just data and axis titles, everything else defaults.",...X.parameters?.docs?.description}}};$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  args: {
    data: STYLED_DATA,
    title: "Data-Driven Color / Shape / Size",
    xAxis: {
      title: "X Axis"
    },
    yAxis: {
      title: "Y Axis"
    },
    colorMapping: {
      type: "categorical",
      field: "category",
      categoryColors: {
        "Group A": "#4575b4",
        "Group B": "#d73027",
        "Group C": "#1a9850"
      }
    },
    shapeMapping: {
      type: "categorical",
      field: "status",
      categoryShapes: {
        Active: "circle",
        Inactive: "square",
        Pending: "diamond"
      }
    },
    sizeMapping: {
      type: "continuous",
      field: "intensity",
      sizeRange: [4, 20]
    },
    ...DEFAULT_DIMS
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Data-Driven Color / Shape / Size")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Single scatter trace renders", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(1);
    });
    await step("Axis titles are displayed", async () => {
      expect(canvas.getByText("X Axis")).toBeInTheDocument();
      expect(canvas.getByText("Y Axis")).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1150"
    }
  }
}`,...$.parameters?.docs?.source},description:{story:"Color mapped to `category` (categorical), shape to `status` (categorical),\nsize to `intensity` (continuous) — all driven by point metadata.",...$.parameters?.docs?.description}}};U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    data: STATIC_DATA,
    title: "Static Styling",
    xAxis: {
      title: "X Axis"
    },
    yAxis: {
      title: "Y Axis"
    },
    colorMapping: {
      type: "static",
      value: "#e377c2"
    },
    shapeMapping: {
      type: "static",
      value: "diamond"
    },
    sizeMapping: {
      type: "static",
      value: 12
    },
    ...DEFAULT_DIMS
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Static Styling")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Single scatter trace renders", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(1);
    });
    await step("Axis titles are displayed", async () => {
      expect(canvas.getByText("X Axis")).toBeInTheDocument();
      expect(canvas.getByText("Y Axis")).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1151"
    }
  }
}`,...U.parameters?.docs?.source},description:{story:"Fixed color, shape, and size — ignores data values entirely.",...U.parameters?.docs?.description}}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    return <div>
        <InteractiveScatter {...args} selectedIds={selectedIds} onSelectionChange={setSelectedIds} />
        <p style={{
        fontFamily: "monospace",
        marginTop: 12
      }}>Selected: {selectedIds.size} point(s)</p>
      </div>;
  },
  args: {
    data: CLUSTERED_DATA,
    title: "Click / Box / Lasso Selection",
    xAxis: {
      title: "X Axis"
    },
    yAxis: {
      title: "Y Axis"
    },
    colorMapping: {
      type: "categorical",
      field: "cluster"
    },
    enableClickSelection: true,
    enableBoxSelection: true,
    enableLassoSelection: true,
    ...DEFAULT_DIMS
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Click / Box / Lasso Selection")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Single scatter trace renders", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(1);
    });
    await step("Selection count is displayed", async () => {
      expect(canvas.getByText(/Selected:\\s*0\\s+point\\(s\\)/)).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1152"
    }
  }
}`,...W.parameters?.docs?.source},description:{story:`All three selection modes enabled: click a point, drag a box, or draw a
lasso. The selected count is shown below the chart.`,...W.parameters?.docs?.description}}};V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [lastMode, setLastMode] = useState<SelectionMode>("replace");
    return <div>
        <InteractiveScatter {...args} selectedIds={selectedIds} onSelectionChange={(ids, mode) => {
        setSelectedIds(ids);
        setLastMode(mode);
      }} />
        <div style={{
        fontFamily: "monospace",
        marginTop: 12,
        lineHeight: 1.8
      }}>
          <p style={{
          margin: 0
        }}>
            Selected: {selectedIds.size} &nbsp;|&nbsp; Mode: <strong>{lastMode}</strong>
          </p>
          <p style={{
          margin: 0,
          color: "#666",
          fontSize: 13
        }}>
            Click: replace · Shift+Click: add · Ctrl+Click (Win) / Cmd+Click (Mac): remove · Shift+Ctrl+Click (Win) /
            Shift+Cmd+Click (Mac): toggle · Box/Lasso: always replace
          </p>
        </div>
      </div>;
  },
  args: {
    data: SELECTION_DATA,
    title: "Keyboard Modifier Selection",
    xAxis: {
      title: "X Axis"
    },
    yAxis: {
      title: "Y Axis"
    },
    colorMapping: {
      type: "categorical",
      field: "category"
    },
    enableClickSelection: true,
    enableBoxSelection: true,
    enableLassoSelection: true,
    ...DEFAULT_DIMS
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Keyboard Modifier Selection")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Single scatter trace renders", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(1);
    });
    await step("Selection status and mode are displayed", async () => {
      expect(canvas.getByText(/Selected:\\s*0/)).toBeInTheDocument();
      expect(canvas.getByText("replace", {
        selector: "strong"
      })).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1154"
    }
  }
}`,...V.parameters?.docs?.source},description:{story:`Keyboard modifiers apply to click selection only.
Click = replace, Shift+Click = add, Ctrl/Cmd+Click = remove,
Shift+Ctrl/Cmd+Click = toggle. Box/lasso selection always replaces.
The active mode is shown below.`,...V.parameters?.docs?.description}}};K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const selected = args.data.filter(p => selectedIds.has(p.id));
    return <div style={{
      display: "flex",
      gap: 24,
      alignItems: "flex-start"
    }}>
        <InteractiveScatter {...args} selectedIds={selectedIds} onSelectionChange={setSelectedIds} />

        <div style={{
        minWidth: 340,
        maxHeight: 600,
        overflowY: "auto"
      }}>
          <h3 style={{
          margin: "0 0 8px"
        }}>Selected Points ({selected.length})</h3>
          {selected.length > 0 ? <table style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid #ddd",
          fontSize: 13
        }}>
              <thead>
                <tr style={{
              backgroundColor: "#f0f0f0"
            }}>
                  {["ID", "X", "Y", "Cluster", "Value"].map(h => <th key={h} style={cellStyle}>
                      {h}
                    </th>)}
                </tr>
              </thead>
              <tbody>
                {selected.map(p => <tr key={p.id}>
                    <td style={cellStyle}>{p.id}</td>
                    <td style={cellStyle}>{p.x.toFixed(2)}</td>
                    <td style={cellStyle}>{p.y.toFixed(2)}</td>
                    <td style={cellStyle}>{String(p.metadata?.cluster ?? "")}</td>
                    <td style={cellStyle}>
                      {typeof p.metadata?.value === "number" ? (p.metadata.value as number).toFixed(2) : "–"}
                    </td>
                  </tr>)}
              </tbody>
            </table> : <p style={{
          color: "#888"
        }}>Select points to populate the grid.</p>}
        </div>
      </div>;
  },
  args: {
    data: CLUSTERED_DATA,
    title: "Selection → Data Grid",
    xAxis: {
      title: "X Axis"
    },
    yAxis: {
      title: "Y Axis"
    },
    colorMapping: {
      type: "categorical",
      field: "cluster"
    },
    enableClickSelection: true,
    enableBoxSelection: true,
    enableLassoSelection: true,
    width: 700,
    height: 600
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Selection → Data Grid")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Single scatter trace renders", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(1);
    });
    await step("Data grid heading is displayed", async () => {
      expect(canvas.getByText("Selected Points (0)")).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1156"
    }
  }
}`,...K.parameters?.docs?.source},description:{story:"Select points and a data grid to the right updates in real time.",...K.parameters?.docs?.description}}};H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  args: {
    data: TOOLTIP_DATA,
    title: "Custom Rich Tooltips",
    xAxis: {
      title: "X Axis"
    },
    yAxis: {
      title: "Y Axis"
    },
    colorMapping: {
      type: "categorical",
      field: "category",
      categoryColors: {
        "Group A": "#4575b4",
        "Group B": "#d73027",
        "Group C": "#1a9850"
      }
    },
    sizeMapping: {
      type: "continuous",
      field: "intensity",
      sizeRange: [5, 18]
    },
    tooltip: {
      enabled: true,
      content: (point: ScatterPoint) => {
        const status = point.metadata?.status ?? "Unknown";
        const value = typeof point.metadata?.value === "number" ? (point.metadata.value as number).toFixed(1) : "–";
        const badge = status === "Active" ? "#1a9850" : status === "Inactive" ? "#d73027" : "#fdae61";
        return [\`<b>\${point.label ?? point.id}</b>\`, \`<span style="background:\${badge};color:#fff;padding:1px 6px;border-radius:3px;font-size:11px">\${String(status)}</span>\`, \`X: \${point.x.toFixed(2)} · Y: \${point.y.toFixed(2)}\`, \`Value: <b>\${value}</b> · Conc: \${String(point.metadata?.concentration ?? "–")}\`].join("<br>");
      }
    },
    ...DEFAULT_DIMS
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Custom Rich Tooltips")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Single scatter trace renders", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(1);
    });
    await step("Axis titles are displayed", async () => {
      expect(canvas.getByText("X Axis")).toBeInTheDocument();
      expect(canvas.getByText("Y Axis")).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1157"
    }
  }
}`,...H.parameters?.docs?.source},description:{story:"Uses `tooltip.content` to render rich HTML tooltips with status badges.",...H.parameters?.docs?.description}}};Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  args: {
    data: AXIS_DATA,
    title: "Fixed Axis Ranges (zoomed to 20-80)",
    xAxis: {
      title: "X Axis",
      range: [20, 80]
    },
    yAxis: {
      title: "Y Axis",
      range: [20, 80]
    },
    colorMapping: {
      type: "categorical",
      field: "category"
    },
    ...DEFAULT_DIMS
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Fixed Axis Ranges (zoomed to 20-80)")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Single scatter trace renders", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(1);
    });
    await step("Axis titles are displayed", async () => {
      expect(canvas.getByText("X Axis")).toBeInTheDocument();
      expect(canvas.getByText("Y Axis")).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1158"
    }
  }
}`,...Z.parameters?.docs?.source},description:{story:"Fixed axis ranges zoom the viewport to a specific data region.",...Z.parameters?.docs?.description}}};J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  args: {
    data: LOG_DATA,
    title: "Log-Scale Axes",
    xAxis: {
      title: "X (log)",
      scale: "log"
    },
    yAxis: {
      title: "Y (log)",
      scale: "log"
    },
    colorMapping: {
      type: "categorical",
      field: "category"
    },
    ...DEFAULT_DIMS
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Log-Scale Axes")).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Single scatter trace renders", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(1);
    });
    await step("Log axis titles are displayed", async () => {
      expect(canvas.getByText("X (log)")).toBeInTheDocument();
      expect(canvas.getByText("Y (log)")).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1159"
    }
  }
}`,...J.parameters?.docs?.source},description:{story:"Log-scale axes for data spanning several orders of magnitude.",...J.parameters?.docs?.description}}};Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [data, setData] = useState<ScatterPoint[]>([]);
    const [source, setSource] = useState<"generated" | string>("generated");
    const [error, setError] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
      const handle = requestAnimationFrame(() => {
        setData(scatterData(LARGE_DATA_COUNT));
      });
      return () => cancelAnimationFrame(handle);
    }, []);
    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setError(null);
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const text = ev.target?.result as string;
          const points = file.name.endsWith(".json") ? parseJsonToPoints(text) : parseCsvToPoints(text);
          if (points.length === 0) {
            setError("No valid points found. CSV needs x,y columns; JSON needs [{x, y}, …].");
            return;
          }
          setData(points);
          setSource(file.name);
        } catch {
          setError("Failed to parse file. Check that it is valid CSV or JSON.");
        }
      };
      reader.readAsText(file);
    };
    const resetToGenerated = () => {
      setData(scatterData(LARGE_DATA_COUNT));
      setSource("generated");
      setError(null);
      if (fileRef.current) fileRef.current.value = "";
    };
    if (data.length === 0) {
      return <div style={{
        width: args.width,
        height: args.height,
        display: "grid",
        placeItems: "center",
        color: "#888"
      }}>
          Generating {LARGE_DATA_COUNT.toLocaleString()} points…
        </div>;
    }
    return <div>
        <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 12,
        fontSize: 13
      }}>
          <Button variant="secondary" size="small" onClick={() => fileRef.current?.click()}>
            Upload CSV / JSON
          </Button>
          <input ref={fileRef} type="file" accept=".csv,.json" onChange={handleFile} style={{
          display: "none"
        }} />
          {source !== "generated" && <Button variant="tertiary" size="small" onClick={resetToGenerated}>
              Reset to random data
            </Button>}
          <span style={{
          color: "#666"
        }}>
            {source === "generated" ? \`\${data.length.toLocaleString()} random points\` : \`\${data.length.toLocaleString()} points from \${source}\`}
          </span>
          {error && <span style={{
          color: "#d73027"
        }}>{error}</span>}
        </div>
        <InteractiveScatter {...args} data={data} />
      </div>;
  },
  args: {
    data: [],
    title: "Downsampling (10k → 1k via LTTB)",
    xAxis: {
      title: "X Axis"
    },
    yAxis: {
      title: "Y Axis"
    },
    downsampling: {
      enabled: true,
      maxPoints: 1000,
      strategy: "lttb"
    },
    ...DEFAULT_DIMS
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      expect(await canvas.findByText("Downsampling (10k → 1k via LTTB)", {}, {
        timeout: 15000
      })).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });
    await step("Single scatter trace renders", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(1);
    });
    await step("Upload control is displayed", async () => {
      expect(canvas.getByRole("button", {
        name: /upload csv \\/ json/i
      })).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1161"
    },
    docs: {
      source: {
        code: \`
function scatterData(count: number): ScatterPoint[] {
  return Array.from({ length: count }, (_, i) => ({
    id: \\\`point-\\\${i}\\\`,
    x: rand() * 100,
    y: rand() * 100,
    label: \\\`Point \\\${i}\\\`,
    metadata: {
      category: CATEGORIES[\\\${i} % 3],
      status: STATUSES[\\\${i} % 3],
      value: rand() * 1000,
      intensity: rand() * 10,
      concentration: Number((\\\${rand()} * 100).toFixed(2)),
    },
  }));
}

const [data, setData] = useState<ScatterPoint[]>([]);

useEffect(() => {
  const handle = requestAnimationFrame(() => {
    setData(scatterData(10_000));
  });
  return () => cancelAnimationFrame(handle);
}, []);

return (
  <InteractiveScatter
    data={data}
    title="Downsampling (10k → 1k via LTTB)"
    xAxis={{ title: "X Axis" }}
    yAxis={{ title: "Y Axis" }}
    downsampling={{ enabled: true, maxPoints: 1000, strategy: "lttb" }}
    width={800}
    height={600}
  />
);\`.trim(),
        language: "tsx"
      }
    }
  }
}`,...Q.parameters?.docs?.source},description:{story:'10k points downsampled to 1k via LTTB to keep the chart responsive.\n\nYou can upload your own data file to test downsampling:\n- **CSV** — must have `x` and `y` columns. Optional: `id`, `label`. Any extra columns become `metadata`.\n  ```\n  id,x,y,label,category,value\n  p-0,2.3,4.1,Alpha,Group A,120.5\n  ```\n- **JSON** — array of objects with at least `x` and `y` fields.\n  ```\n  [{ "id": "p-0", "x": 2.3, "y": 4.1, "label": "Alpha", "category": "Group A" }]\n  ```',...Q.parameters?.docs?.description}}};const dt=["BasicScatter","DataDrivenStyling","StaticStyling","Selection","KeyboardModifierSelection","SelectionWithDataGrid","CustomTooltips","AxisFixedRanges","AxisLogScale","Downsampling"];export{Z as AxisFixedRanges,J as AxisLogScale,X as BasicScatter,H as CustomTooltips,$ as DataDrivenStyling,Q as Downsampling,V as KeyboardModifierSelection,W as Selection,K as SelectionWithDataGrid,U as StaticStyling,dt as __namedExportsOrder,ct as default};
