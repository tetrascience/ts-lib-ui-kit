import{r as M,j as te}from"./iframe-14YYbrss.js";import{P as ne}from"./plotly-BfU08UT2.js";import{C as X,a as b}from"./colors-ClKyOP62.js";import{u as pe}from"./use-plotly-theme-DDaBOKiZ.js";import"./preload-helper-BbFkF2Um.js";const C={MARGIN_LEFT:70,MARGIN_RIGHT:30,MARGIN_BOTTOM:60,MARGIN_TOP_WITH_TITLE:50,MARGIN_TOP_NO_TITLE:30,MARGIN_PAD:5},ae={USER_ANNOTATION_FONT_SIZE:11,AUTO_ANNOTATION_FONT_SIZE:10},Y={default:{ax:0,ay:-35},overlap:[{ax:50,ay:-35},{ax:-60,ay:-35},{ax:70,ay:-55},{ax:-80,ay:-55},{ax:50,ay:-75},{ax:-60,ay:-75}]};function he(t,n){const a=[...t].sort((o,s)=>o.peak.x-s.peak.x),e=[];let r=[];for(const o of a){if(r.length===0){r.push(o);continue}const s=r[r.length-1];Math.abs(o.peak.x-s.peak.x)<n?r.push(o):(e.push(r),r=[o])}return r.length>0&&e.push(r),e}function re(t,n,a){const e=n===-1,r=e?X.GREY_500:b[n%b.length],o=e?X.BLACK_900:r,s=t.text??(t._computed?.area===void 0?"":`Area: ${t._computed.area.toFixed(2)}`),c=e&&t.ax!==void 0?t.ax:a.ax,l=e&&t.ay!==void 0?t.ay:a.ay;return{x:t.x,y:t.y,text:s,showarrow:!0,arrowhead:2,arrowsize:1,arrowwidth:1,arrowcolor:r,ax:c,ay:l,font:{size:e?ae.USER_ANNOTATION_FONT_SIZE:ae.AUTO_ANNOTATION_FONT_SIZE,color:o,family:"Inter, sans-serif"},bgcolor:X.WHITE,borderpad:2,bordercolor:e?void 0:r,borderwidth:e?0:1}}function ye(t){if(t.length===1){const{peak:a,seriesIndex:e}=t[0];return[re(a,e,Y.default)]}return[...t].sort((a,e)=>a.peak.y-e.peak.y).map(({peak:a,seriesIndex:e},r)=>{const o=Y.overlap[r%Y.overlap.length];return re(a,e,o)})}const fe=-5,ge=-12,oe=-16;function se(t,n,a,e){return a==="none"?[]:[{x:[t],y:[n],type:"scatter",mode:"markers",marker:{symbol:a==="diamond"?"diamond":"triangle-up",size:8,color:e},showlegend:!1,hoverinfo:"skip"}]}function Te(t){const n=[];for(const{peaks:a,seriesIndex:e,x:r}of t){const o=b[e%b.length],s=fe+e*oe,c=ge+e*oe;for(const l of a){const u=l._computed?.startIndex??0,k=l._computed?.endIndex??0,T=r[u],d=r[k],A=l.startMarker??"triangle",w=l.endMarker??"diamond";n.push(...se(T,s,A,o)),n.push(...se(d,c,w,o))}}return n}function we(t,n,a){let e=t[n],r=t[n];for(let o=n-1;o>=Math.max(0,n-a);o--)e=Math.min(e,t[o]);for(let o=n+1;o<Math.min(t.length,n+a);o++)r=Math.min(r,t[o]);return t[n]-Math.max(e,r)}function xe(t,n){let a=n,e=n;for(let r=n-1;r>=0&&t[r]<=t[r+1];r--)a=r;for(let r=n+1;r<t.length&&t[r]<=t[r-1];r++)e=r;return{startIndex:a,endIndex:e}}function ie(t,n,a,e){const r=Math.min(n[a],n[e]);let o=0;for(let s=a;s<e;s++){const c=t[s+1]-t[s],l=n[s]-r,u=n[s+1]-r;o+=(l+u)*c/2}return o}function ke(t,n,a,e,r){const o=Math.min(n[e],n[r]),s=(n[a]+o)/2;let c=a,l=a;for(let u=a;u>=e;u--)if(n[u]<s){c=u;break}for(let u=a;u<=r;u++)if(n[u]<s){l=u;break}return t[l]-t[c]}function Be(t,n){const a=[];for(const e of t)a.some(o=>Math.abs((o._computed?.index??0)-(e._computed?.index??0))<n)?a.length>0&&e.y>a[a.length-1].y&&(a.pop(),a.push(e)):a.push(e);return a.sort((e,r)=>e.x-r.x)}function Ie(t,n,a={}){const{minHeight:e=.05,minDistance:r=5,prominence:o=.02,relativeThreshold:s=!0}=a;if(n.length<3)return[];const c=Math.max(...n),l=s?e*c:e,u=s?o*c:o,k=r*3,T=[];for(let d=1;d<n.length-1;d++){if(!(n[d]>n[d-1]&&n[d]>n[d+1]&&n[d]>=l)||we(n,d,k)<u)continue;const{startIndex:B,endIndex:I}=xe(n,d),x=ie(t,n,B,I),G=ke(t,n,d,B,I);T.push({x:t[d],y:n[d],_computed:{area:x,index:d,startIndex:B,endIndex:I,widthAtHalfMax:G}})}return Be(T,r)}function $(t,n){if(t.length===0||t.length===1)return 0;let a=0,e=t.length-1;for(;a<e;){const r=Math.floor((a+e)/2);t[r]<n?a=r+1:e=r}return a>0&&Math.abs(t[a-1]-n)<Math.abs(t[a]-n)?a-1:a}function Ce(t,n,a){return t.map(e=>{if(e.startX!==void 0&&e.endX!==void 0){const r=$(n,e.startX),o=$(n,e.endX),s=$(n,e.x),c=e._computed?.area??ie(n,a,r,o);return{...e,_computed:{...e._computed,index:s,startIndex:r,endIndex:o,area:c}}}return e})}function ve(t,n,a){const e=[];t.forEach(({peaks:o,seriesIndex:s})=>{e.push({peaks:o,seriesIndex:s,x:a[s].x,y:a[s].y})});const r=n.filter(o=>o._computed?.startIndex!==void 0&&o._computed?.endIndex!==void 0);return r.length>0&&a.length>0&&e.push({peaks:r,seriesIndex:0,x:a[0].x,y:a[0].y}),e}function be(t,n){if(!n)return t;const a=[];for(const[e,r]of Object.entries(n))if(r!=null&&r!==""){const o=e.replace(/([A-Z])/g," $1").replace(/^./,s=>s.toUpperCase()).trim();a.push(`${o}: ${String(r)}`)}return a.length>0?`${t}<br>${a.join("<br>")}`:t}function Ae(t,n){const a=Math.min(t.length,n.length),e=t.slice(0,a),o=n.slice(0,a).map(c=>Number.isFinite(c)?c:0);return{x:e.map(c=>Number.isFinite(c)?c:0),y:o}}function De(t,n,a=50){if(n==="none"||t.length===0)return t;if(n==="linear"){if(t.length===1)return[0];const e=(t[t.length-1]-t[0])/(t.length-1);return t.map((r,o)=>r-(t[0]+e*o))}if(n==="rolling"){const e=[],r=Math.floor(a/2);for(let o=0;o<t.length;o++){const s=Math.max(0,o-r),c=Math.min(t.length,o+r+1),l=t.slice(s,c);e.push(Math.min(...l))}return t.map((o,s)=>o-e[s])}return t}const ce=({series:t,width:n=900,height:a=500,title:e,xAxisTitle:r="Retention Time (min)",yAxisTitle:o="Signal (mAU)",annotations:s=[],xRange:c,yRange:l,showLegend:u=!0,showGridX:k=!0,showGridY:T=!0,showMarkers:d=!1,markerSize:A=4,showCrosshairs:w=!1,baselineCorrection:B="none",baselineWindowSize:I=50,peakDetectionOptions:x,showPeakAreas:G=!1,boundaryMarkers:K="none",annotationOverlapThreshold:J=.4,showExportButton:L=!0})=>{const z=x!==void 0,Z=M.useRef(null),m=pe(),f=M.useMemo(()=>t.map(h=>{const y=Ae(h.x,h.y);return{...h,x:y.x,y:De(y.y,B,I)}}),[t,B,I]),V=M.useMemo(()=>{if(s.length===0||f.length===0)return s;const{x:h,y}=f[0];return Ce(s,h,y)},[s,f]),F=M.useMemo(()=>{const h=[];return z&&x&&f.forEach((y,D)=>{const H=Ie(y.x,y.y,x);H.length>0&&h.push({peaks:H,seriesIndex:D})}),h},[f,z,x]);return M.useEffect(()=>{const h=Z.current;if(!h||t.length===0)return;const y=f.map((p,S)=>{const W=p.color||b[S%b.length],me=be(p.name,p.metadata),ee={x:p.x,y:p.y,type:"scatter",mode:d?"lines+markers":"lines",name:p.name,line:{color:W,width:1.5},hovertemplate:`%{x:.2f} ${r}<br>%{y:.2f} ${o}<extra>${me}</extra>`};return d&&(ee.marker={size:A,color:W}),ee});if(K!=="none"){const p=ve(F,V,f);if(p.length>0){const S=Te(p);y.push(...S)}}const D=[];V.forEach(p=>{D.push({peak:p,seriesIndex:-1})}),G&&z&&F.forEach(({peaks:p,seriesIndex:S})=>{p.forEach(W=>{D.push({peak:W,seriesIndex:S})})});const H=he(D,J),Q=[];for(const p of H)Q.push(...ye(p));const de={title:e?{text:e,font:{size:20,family:"Inter, sans-serif",color:m.textColor}}:void 0,width:n,height:a,margin:{l:C.MARGIN_LEFT,r:C.MARGIN_RIGHT,b:C.MARGIN_BOTTOM,t:e?C.MARGIN_TOP_WITH_TITLE:C.MARGIN_TOP_NO_TITLE,pad:C.MARGIN_PAD},paper_bgcolor:m.paperBg,plot_bgcolor:m.plotBg,font:{family:"Inter, sans-serif"},hovermode:w?"x":"x unified",dragmode:"zoom",xaxis:{title:{text:r,font:{size:14,color:m.textSecondary,family:"Inter, sans-serif"},standoff:15},showgrid:k,gridcolor:m.gridColor,linecolor:m.lineColor,linewidth:1,range:c,autorange:!c,zeroline:!1,tickfont:{size:12,color:m.textColor,family:"Inter, sans-serif"},showspikes:w,spikemode:"across",spikesnap:"cursor",spikecolor:m.spikeColor,spikethickness:1,spikedash:"dot"},yaxis:{title:{text:o,font:{size:14,color:m.textSecondary,family:"Inter, sans-serif"},standoff:10},showgrid:T,gridcolor:m.gridColor,linecolor:m.lineColor,linewidth:1,range:l,autorange:!l,zeroline:!1,tickfont:{size:12,color:m.textColor,family:"Inter, sans-serif"},showspikes:w,spikemode:"across",spikesnap:"cursor",spikecolor:m.spikeColor,spikethickness:1,spikedash:"dot"},legend:{x:.5,y:-.15,xanchor:"center",yanchor:"top",orientation:"h",font:{size:12,color:m.textColor,family:"Inter, sans-serif"}},showlegend:u&&t.length>1,annotations:Q},ue={responsive:!0,displayModeBar:!0,displaylogo:!1,modeBarButtonsToRemove:["lasso2d","select2d",...L?[]:["toImage"]],...L&&{toImageButtonOptions:{format:"png",filename:"chromatogram",width:n,height:a}}};return ne.newPlot(h,y,de,ue),()=>{h&&ne.purge(h)}},[f,F,t.length,n,a,e,r,o,V,c,l,u,k,T,d,A,w,z,x,G,K,J,L,m]),te.jsx("div",{className:"chromatogram-chart-container",children:te.jsx("div",{ref:Z,style:{width:"100%",height:"100%"}})})};ce.__docgenInfo={description:"",methods:[],displayName:"ChromatogramChart",props:{series:{required:!0,tsType:{name:"Array",elements:[{name:"ChromatogramSeries"}],raw:"ChromatogramSeries[]"},description:"Array of data series to display"},width:{required:!1,tsType:{name:"number"},description:"Chart width in pixels",defaultValue:{value:"900",computed:!1}},height:{required:!1,tsType:{name:"number"},description:"Chart height in pixels",defaultValue:{value:"500",computed:!1}},title:{required:!1,tsType:{name:"string"},description:"Chart title"},xAxisTitle:{required:!1,tsType:{name:"string"},description:"X-axis label",defaultValue:{value:'"Retention Time (min)"',computed:!1}},yAxisTitle:{required:!1,tsType:{name:"string"},description:"Y-axis label",defaultValue:{value:'"Signal (mAU)"',computed:!1}},annotations:{required:!1,tsType:{name:"Array",elements:[{name:"PeakAnnotation"}],raw:"PeakAnnotation[]"},description:"Peak annotations to display",defaultValue:{value:"[]",computed:!1}},xRange:{required:!1,tsType:{name:"tuple",raw:"[number, number]",elements:[{name:"number"},{name:"number"}]},description:"Fixed x-axis range [min, max]"},yRange:{required:!1,tsType:{name:"tuple",raw:"[number, number]",elements:[{name:"number"},{name:"number"}]},description:"Fixed y-axis range [min, max]"},showLegend:{required:!1,tsType:{name:"boolean"},description:"Show legend (default: true)",defaultValue:{value:"true",computed:!1}},showGridX:{required:!1,tsType:{name:"boolean"},description:"Show vertical grid lines (default: true)",defaultValue:{value:"true",computed:!1}},showGridY:{required:!1,tsType:{name:"boolean"},description:"Show horizontal grid lines (default: true)",defaultValue:{value:"true",computed:!1}},showMarkers:{required:!1,tsType:{name:"boolean"},description:"Show data point markers (default: false)",defaultValue:{value:"false",computed:!1}},markerSize:{required:!1,tsType:{name:"number"},description:"Marker size when showMarkers is true (default: 4)",defaultValue:{value:"4",computed:!1}},showCrosshairs:{required:!1,tsType:{name:"boolean"},description:"Show crosshairs on hover (default: false)",defaultValue:{value:"false",computed:!1}},baselineCorrection:{required:!1,tsType:{name:"union",raw:'"none" | "linear" | "rolling"',elements:[{name:"literal",value:'"none"'},{name:"literal",value:'"linear"'},{name:"literal",value:'"rolling"'}]},description:'Baseline correction method (default: "none")',defaultValue:{value:'"none"',computed:!1}},baselineWindowSize:{required:!1,tsType:{name:"number"},description:"Rolling baseline window size (default: 50)",defaultValue:{value:"50",computed:!1}},peakDetectionOptions:{required:!1,tsType:{name:"PeakDetectionOptions"},description:"Peak detection algorithm options - if provided, enables automatic peak detection"},showPeakAreas:{required:!1,tsType:{name:"boolean"},description:"Show peak areas as annotations (default: false)",defaultValue:{value:"false",computed:!1}},boundaryMarkers:{required:!1,tsType:{name:"union",raw:'"none" | "enabled"',elements:[{name:"literal",value:'"none"'},{name:"literal",value:'"enabled"'}]},description:`Show peak boundary markers (default: "none").
- "none": No boundary markers displayed
- "enabled": Show boundary markers using per-peak startMarker/endMarker settings

Per-peak marker defaults: startMarker="triangle", endMarker="diamond"`,defaultValue:{value:'"none"',computed:!1}},annotationOverlapThreshold:{required:!1,tsType:{name:"number"},description:`Retention time threshold for grouping overlapping annotations (default: 0.4 minutes).
Peaks closer than this threshold will have their annotations staggered to avoid overlap.`,defaultValue:{value:"0.4",computed:!1}},showExportButton:{required:!1,tsType:{name:"boolean"},description:"Show export button in modebar (default: true)",defaultValue:{value:"true",computed:!1}}}};const{expect:i,within:g}=__STORYBOOK_MODULE_TEST__,v=(t,n=.5)=>{const a=[],e=[];for(let r=0;r<=30;r+=.05){a.push(parseFloat(r.toFixed(2)));let o=0;t.forEach(s=>{o+=s.height*Math.exp(-Math.pow(r-s.rt,2)/(2*Math.pow(s.width,2)))}),o+=(Math.random()-.5)*n,e.push(Math.max(0,o))}return{x:a,y:e}},R=v([{rt:3.2,height:150,width:.3},{rt:5.8,height:420,width:.4},{rt:8.1,height:280,width:.35},{rt:12.5,height:180,width:.5},{rt:18.3,height:350,width:.45},{rt:24.1,height:220,width:.4}]),le=[{...v([{rt:5.8,height:420,width:.4},{rt:12.5,height:180,width:.5},{rt:18.3,height:350,width:.45}]),name:"Injection 1"},{...v([{rt:5.9,height:380,width:.42},{rt:12.6,height:195,width:.48},{rt:18.4,height:320,width:.47}],.8),name:"Injection 2"},{...v([{rt:5.7,height:440,width:.38},{rt:12.4,height:170,width:.52},{rt:18.2,height:365,width:.43}],.6),name:"Injection 3"}],Se=[{x:5.8,y:420,text:"Caffeine",ax:0,ay:-40},{x:12.5,y:180,text:"Theobromine",ax:30,ay:-55},{x:18.3,y:350,text:"Theophylline",ax:-30,ay:-80}],Me=[{x:5.8,y:420,text:"Caffeine",ay:-40,startX:5,endX:6.6},{x:12.5,y:180,text:"Theobromine",ay:-55,startX:11.5,endX:13.5},{x:18.3,y:350,text:"Theophylline",ay:-80,startX:17.3,endX:19.3}],Ue={title:"Charts/ChromatogramChart",component:ce,parameters:{layout:"centered"},tags:["autodocs"]},P={args:{series:[{...R,name:"Sample A"}],title:"HPLC Chromatogram - Single Injection"},play:async({canvasElement:t,step:n})=>{const a=g(t);await n("Chart title is displayed",async()=>{const e=a.getByText("HPLC Chromatogram - Single Injection");i(e).toBeInTheDocument()}),await n("Chart container renders",async()=>{const e=t.querySelector(".js-plotly-plot");i(e).toBeInTheDocument()}),await n("Trace is rendered",async()=>{const e=t.querySelectorAll(".scatterlayer .trace");i(e.length).toBe(1)})},parameters:{docs:{description:{story:"Basic chromatogram with a single trace. This is the simplest usage of the component."}},zephyr:{testCaseId:"SW-T1108"}}},j={args:{series:le,title:"HPLC Chromatogram - Injection Overlay",showCrosshairs:!0},play:async({canvasElement:t,step:n})=>{const a=g(t);await n("Chart title is displayed",async()=>{const e=a.getByText("HPLC Chromatogram - Injection Overlay");i(e).toBeInTheDocument()}),await n("Chart container renders",async()=>{const e=t.querySelector(".js-plotly-plot");i(e).toBeInTheDocument()}),await n("Multiple traces are rendered",async()=>{const e=t.querySelectorAll(".scatterlayer .trace");i(e.length).toBe(3)}),await n("Legend shows all series names",async()=>{i(a.getByText("Injection 1")).toBeInTheDocument(),i(a.getByText("Injection 2")).toBeInTheDocument(),i(a.getByText("Injection 3")).toBeInTheDocument()})},parameters:{docs:{description:{story:"Overlay multiple injections to compare retention times and peak intensities. Crosshairs help compare values across traces."}},zephyr:{testCaseId:"SW-T1109"}}},_={args:{series:[{...v([{rt:5.8,height:420,width:.4},{rt:12.5,height:180,width:.5},{rt:18.3,height:350,width:.45}]),name:"Sample A - UV 254nm",metadata:{sampleName:"Caffeine Standard",injectionId:"INJ-2024-001",detectorType:"UV",wavelength:254,methodName:"Caffeine_HPLC_v2",instrumentName:"Agilent 1260",wellPosition:"A1",injectionVolume:10}},{...v([{rt:5.9,height:380,width:.42},{rt:12.6,height:195,width:.48},{rt:18.4,height:320,width:.47}],.8),name:"Sample B - UV 254nm",metadata:{sampleName:"Coffee Extract",injectionId:"INJ-2024-002",detectorType:"UV",wavelength:254,methodName:"Caffeine_HPLC_v2",wellPosition:"A2"}}],title:"Chromatogram with Injection Metadata",showCrosshairs:!0},play:async({canvasElement:t,step:n})=>{const a=g(t);await n("Chart title is displayed",async()=>{const e=a.getByText("Chromatogram with Injection Metadata");i(e).toBeInTheDocument()}),await n("Chart container renders",async()=>{const e=t.querySelector(".js-plotly-plot");i(e).toBeInTheDocument()}),await n("Both traces are rendered",async()=>{const e=t.querySelectorAll(".scatterlayer .trace");i(e.length).toBe(2)}),await n("Legend shows series names",async()=>{i(a.getByText("Sample A - UV 254nm")).toBeInTheDocument(),i(a.getByText("Sample B - UV 254nm")).toBeInTheDocument()})},parameters:{docs:{description:{story:"Hover over traces to see injection metadata in the tooltip. Metadata includes sample name, injection ID, detector type, wavelength, method name, and well position."}},zephyr:{testCaseId:"SW-T1110"}}},O={args:{series:[{...R,name:"Sample A"}],title:"Automatic Peak Detection",peakDetectionOptions:{minHeight:.1,prominence:.05,minDistance:20},showPeakAreas:!0},play:async({canvasElement:t,step:n})=>{const a=g(t);await n("Chart title is displayed",async()=>{const e=a.getByText("Automatic Peak Detection");i(e).toBeInTheDocument()}),await n("Chart container renders",async()=>{const e=t.querySelector(".js-plotly-plot");i(e).toBeInTheDocument()}),await n("Peak area annotations are displayed",async()=>{const e=t.querySelectorAll(".annotation-text");i(e.length).toBeGreaterThan(0)})},parameters:{docs:{description:{story:"Automatic peak detection identifies peaks based on height, prominence, and minimum distance. Peak areas are calculated using trapezoidal integration."}},zephyr:{testCaseId:"SW-T1111"}}},q={args:{series:le,annotations:Se,title:"Full Featured Chromatogram",showGridX:!0,showGridY:!0,showCrosshairs:!0,baselineCorrection:"linear",peakDetectionOptions:{minHeight:.15,prominence:.1},showPeakAreas:!0,boundaryMarkers:"enabled"},play:async({canvasElement:t,step:n})=>{const a=g(t);await n("Chart title is displayed",async()=>{const e=a.getByText("Full Featured Chromatogram");i(e).toBeInTheDocument()}),await n("Chart container renders",async()=>{const e=t.querySelector(".js-plotly-plot");i(e).toBeInTheDocument()}),await n("Multiple traces are rendered",async()=>{const e=t.querySelectorAll(".scatterlayer .trace");i(e.length).toBeGreaterThanOrEqual(3)}),await n("User annotations are displayed",async()=>{i(a.getByText("Caffeine")).toBeInTheDocument(),i(a.getByText("Theobromine")).toBeInTheDocument(),i(a.getByText("Theophylline")).toBeInTheDocument()}),await n("Peak area annotations are displayed",async()=>{const e=t.querySelectorAll(".annotation-text");i(e.length).toBeGreaterThanOrEqual(3)})},parameters:{docs:{description:{story:"Combines all major features: multiple traces, grid lines, crosshairs, manual annotations, baseline correction, and automatic peak detection."}},zephyr:{testCaseId:"SW-T1112"}}},U={args:{series:[{...R,name:"Sample A"}],title:"Peak Boundary Markers",peakDetectionOptions:{minHeight:.1,prominence:.05,minDistance:20},showPeakAreas:!0,boundaryMarkers:"enabled"},play:async({canvasElement:t,step:n})=>{const a=g(t);await n("Chart title is displayed",async()=>{const e=a.getByText("Peak Boundary Markers");i(e).toBeInTheDocument()}),await n("Chart container renders",async()=>{const e=t.querySelector(".js-plotly-plot");i(e).toBeInTheDocument()}),await n("Boundary marker traces are rendered",async()=>{const e=t.querySelectorAll(".scatterlayer .trace");i(e.length).toBeGreaterThan(1)}),await n("Peak area annotations are displayed",async()=>{const e=t.querySelectorAll(".annotation-text");i(e.length).toBeGreaterThan(0)})},parameters:{docs:{description:{story:"Peak boundary markers visually indicate peak start and end points. Use 'auto' to automatically choose triangle markers (▲) for isolated boundaries at baseline or diamond markers (◆) with vertical lines for overlapping peaks. Set to 'triangle' or 'diamond' to force a specific marker style."}},zephyr:{testCaseId:"SW-T1113"}}},N={args:{series:[{...R,name:"Sample A"}],title:"User-Defined Peak Boundaries",annotations:Me,boundaryMarkers:"enabled"},play:async({canvasElement:t,step:n})=>{const a=g(t);await n("Chart title is displayed",async()=>{const e=a.getByText("User-Defined Peak Boundaries");i(e).toBeInTheDocument()}),await n("Chart container renders",async()=>{const e=t.querySelector(".js-plotly-plot");i(e).toBeInTheDocument()}),await n("User-defined peak annotations are displayed",async()=>{i(a.getByText("Caffeine")).toBeInTheDocument(),i(a.getByText("Theobromine")).toBeInTheDocument(),i(a.getByText("Theophylline")).toBeInTheDocument()}),await n("Boundary marker traces are rendered for user-defined peaks",async()=>{const e=t.querySelectorAll(".scatterlayer .trace");i(e.length).toBeGreaterThan(1)})},parameters:{docs:{description:{story:"Users can provide their own peak annotations with boundary information (startIndex, endIndex) to display boundary markers. This is useful when peak boundaries are known from external analysis or when manual peak integration is required. The annotations array accepts PeakAnnotation objects with optional index, startIndex, endIndex, and area fields."}},zephyr:{testCaseId:"SW-T1114"}}},E={args:{series:[{...R,name:"Sample A"}],title:"Combined Auto-Detected and User-Defined Peaks",annotations:[{x:5.8,y:420,text:"Caffeine (user-defined)",ay:-40,startX:5,endX:6.6},{x:24.1,y:220,text:"Unknown Peak",ay:-60}],peakDetectionOptions:{minHeight:.1,prominence:.05},showPeakAreas:!0,boundaryMarkers:"enabled"},play:async({canvasElement:t,step:n})=>{const a=g(t);await n("Chart title is displayed",async()=>{const e=a.getByText("Combined Auto-Detected and User-Defined Peaks");i(e).toBeInTheDocument()}),await n("Chart container renders",async()=>{const e=t.querySelector(".js-plotly-plot");i(e).toBeInTheDocument()}),await n("User-defined annotations are displayed",async()=>{i(a.getByText("Caffeine (user-defined)")).toBeInTheDocument(),i(a.getByText("Unknown Peak")).toBeInTheDocument()}),await n("Auto-detected peak area annotations are displayed",async()=>{const e=t.querySelectorAll(".annotation-text");i(e.length).toBeGreaterThan(2)}),await n("Boundary markers from both sources are rendered",async()=>{const e=t.querySelectorAll(".scatterlayer .trace");i(e.length).toBeGreaterThan(1)})},parameters:{docs:{description:{story:"This example shows automatic peak detection combined with user-provided annotations. The auto-detected peaks display computed areas, while user annotations can provide custom labels. User annotations with boundary info (startIndex, endIndex) will also display boundary markers alongside auto-detected peaks."}},zephyr:{testCaseId:"SW-T1115"}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    series: [{
      ...singleInjectionData,
      name: "Sample A"
    }],
    title: "HPLC Chromatogram - Single Injection"
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      const title = canvas.getByText("HPLC Chromatogram - Single Injection");
      expect(title).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });
    await step("Trace is rendered", async () => {
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBe(1);
    });
  },
  parameters: {
    docs: {
      description: {
        story: "Basic chromatogram with a single trace. This is the simplest usage of the component."
      }
    },
    zephyr: {
      testCaseId: "SW-T1108"
    }
  }
}`,...P.parameters?.docs?.source},description:{story:"Basic single trace chromatogram - the simplest usage of the component.",...P.parameters?.docs?.description}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    series: multiInjectionData,
    title: "HPLC Chromatogram - Injection Overlay",
    showCrosshairs: true
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      const title = canvas.getByText("HPLC Chromatogram - Injection Overlay");
      expect(title).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });
    await step("Multiple traces are rendered", async () => {
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBe(3);
    });
    await step("Legend shows all series names", async () => {
      expect(canvas.getByText("Injection 1")).toBeInTheDocument();
      expect(canvas.getByText("Injection 2")).toBeInTheDocument();
      expect(canvas.getByText("Injection 3")).toBeInTheDocument();
    });
  },
  parameters: {
    docs: {
      description: {
        story: "Overlay multiple injections to compare retention times and peak intensities. Crosshairs help compare values across traces."
      }
    },
    zephyr: {
      testCaseId: "SW-T1109"
    }
  }
}`,...j.parameters?.docs?.source},description:{story:"Overlay multiple injections to compare retention times and peak intensities.",...j.parameters?.docs?.description}}};_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    series: [{
      ...generateChromatogramData([{
        rt: 5.8,
        height: 420,
        width: 0.4
      }, {
        rt: 12.5,
        height: 180,
        width: 0.5
      }, {
        rt: 18.3,
        height: 350,
        width: 0.45
      }]),
      name: "Sample A - UV 254nm",
      metadata: {
        sampleName: "Caffeine Standard",
        injectionId: "INJ-2024-001",
        detectorType: "UV",
        wavelength: 254,
        methodName: "Caffeine_HPLC_v2",
        instrumentName: "Agilent 1260",
        wellPosition: "A1",
        injectionVolume: 10
      }
    }, {
      ...generateChromatogramData([{
        rt: 5.9,
        height: 380,
        width: 0.42
      }, {
        rt: 12.6,
        height: 195,
        width: 0.48
      }, {
        rt: 18.4,
        height: 320,
        width: 0.47
      }], 0.8),
      name: "Sample B - UV 254nm",
      metadata: {
        sampleName: "Coffee Extract",
        injectionId: "INJ-2024-002",
        detectorType: "UV",
        wavelength: 254,
        methodName: "Caffeine_HPLC_v2",
        wellPosition: "A2"
      }
    }],
    title: "Chromatogram with Injection Metadata",
    showCrosshairs: true
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      const title = canvas.getByText("Chromatogram with Injection Metadata");
      expect(title).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });
    await step("Both traces are rendered", async () => {
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBe(2);
    });
    await step("Legend shows series names", async () => {
      expect(canvas.getByText("Sample A - UV 254nm")).toBeInTheDocument();
      expect(canvas.getByText("Sample B - UV 254nm")).toBeInTheDocument();
    });
  },
  parameters: {
    docs: {
      description: {
        story: "Hover over traces to see injection metadata in the tooltip. Metadata includes sample name, injection ID, detector type, wavelength, method name, and well position."
      }
    },
    zephyr: {
      testCaseId: "SW-T1110"
    }
  }
}`,..._.parameters?.docs?.source},description:{story:"Series with injection metadata displayed in tooltips.",..._.parameters?.docs?.description}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    series: [{
      ...singleInjectionData,
      name: "Sample A"
    }],
    title: "Automatic Peak Detection",
    peakDetectionOptions: {
      minHeight: 0.1,
      prominence: 0.05,
      minDistance: 20
    },
    showPeakAreas: true
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      const title = canvas.getByText("Automatic Peak Detection");
      expect(title).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });
    await step("Peak area annotations are displayed", async () => {
      // Peak areas are displayed as annotations with "Area:" text
      const annotations = canvasElement.querySelectorAll(".annotation-text");
      expect(annotations.length).toBeGreaterThan(0);
    });
  },
  parameters: {
    docs: {
      description: {
        story: "Automatic peak detection identifies peaks based on height, prominence, and minimum distance. Peak areas are calculated using trapezoidal integration."
      }
    },
    zephyr: {
      testCaseId: "SW-T1111"
    }
  }
}`,...O.parameters?.docs?.source},description:{story:"Automatic peak detection with area calculations using trapezoidal integration.",...O.parameters?.docs?.description}}};q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  args: {
    series: multiInjectionData,
    annotations: sampleAnnotations,
    title: "Full Featured Chromatogram",
    showGridX: true,
    showGridY: true,
    showCrosshairs: true,
    baselineCorrection: "linear",
    peakDetectionOptions: {
      minHeight: 0.15,
      prominence: 0.1
    },
    showPeakAreas: true,
    boundaryMarkers: "enabled"
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      const title = canvas.getByText("Full Featured Chromatogram");
      expect(title).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });
    await step("Multiple traces are rendered", async () => {
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBeGreaterThanOrEqual(3);
    });
    await step("User annotations are displayed", async () => {
      expect(canvas.getByText("Caffeine")).toBeInTheDocument();
      expect(canvas.getByText("Theobromine")).toBeInTheDocument();
      expect(canvas.getByText("Theophylline")).toBeInTheDocument();
    });
    await step("Peak area annotations are displayed", async () => {
      const annotations = canvasElement.querySelectorAll(".annotation-text");
      // User annotations are displayed (auto-detected peaks at same positions are filtered out)
      expect(annotations.length).toBeGreaterThanOrEqual(3);
    });
  },
  parameters: {
    docs: {
      description: {
        story: "Combines all major features: multiple traces, grid lines, crosshairs, manual annotations, baseline correction, and automatic peak detection."
      }
    },
    zephyr: {
      testCaseId: "SW-T1112"
    }
  }
}`,...q.parameters?.docs?.source},description:{story:"Full featured chromatogram combining all major features.",...q.parameters?.docs?.description}}};U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    series: [{
      ...singleInjectionData,
      name: "Sample A"
    }],
    title: "Peak Boundary Markers",
    peakDetectionOptions: {
      minHeight: 0.1,
      prominence: 0.05,
      minDistance: 20
    },
    showPeakAreas: true,
    boundaryMarkers: "enabled"
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      const title = canvas.getByText("Peak Boundary Markers");
      expect(title).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });
    await step("Boundary marker traces are rendered", async () => {
      // Boundary markers add additional scatter traces for the markers
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBeGreaterThan(1); // Main trace + boundary marker traces
    });
    await step("Peak area annotations are displayed", async () => {
      const annotations = canvasElement.querySelectorAll(".annotation-text");
      expect(annotations.length).toBeGreaterThan(0);
    });
  },
  parameters: {
    docs: {
      description: {
        story: "Peak boundary markers visually indicate peak start and end points. Use 'auto' to automatically choose triangle markers (▲) for isolated boundaries at baseline or diamond markers (◆) with vertical lines for overlapping peaks. Set to 'triangle' or 'diamond' to force a specific marker style."
      }
    },
    zephyr: {
      testCaseId: "SW-T1113"
    }
  }
}`,...U.parameters?.docs?.source},description:{story:`Peak boundary markers showing triangle markers at peak start and diamond markers
with vertical lines at peak end (the default styling).`,...U.parameters?.docs?.description}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    series: [{
      ...singleInjectionData,
      name: "Sample A"
    }],
    title: "User-Defined Peak Boundaries",
    annotations: userDefinedPeaksWithBoundaries,
    boundaryMarkers: "enabled"
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      const title = canvas.getByText("User-Defined Peak Boundaries");
      expect(title).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });
    await step("User-defined peak annotations are displayed", async () => {
      expect(canvas.getByText("Caffeine")).toBeInTheDocument();
      expect(canvas.getByText("Theobromine")).toBeInTheDocument();
      expect(canvas.getByText("Theophylline")).toBeInTheDocument();
    });
    await step("Boundary marker traces are rendered for user-defined peaks", async () => {
      // With boundary markers enabled, additional traces should be rendered
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBeGreaterThan(1);
    });
  },
  parameters: {
    docs: {
      description: {
        story: "Users can provide their own peak annotations with boundary information (startIndex, endIndex) to display boundary markers. This is useful when peak boundaries are known from external analysis or when manual peak integration is required. The annotations array accepts PeakAnnotation objects with optional index, startIndex, endIndex, and area fields."
      }
    },
    zephyr: {
      testCaseId: "SW-T1114"
    }
  }
}`,...N.parameters?.docs?.source},description:{story:`User-defined peaks with boundary information. Users can provide their own peak
annotations with startIndex and endIndex to display boundary markers without
using automatic peak detection.`,...N.parameters?.docs?.description}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    series: [{
      ...singleInjectionData,
      name: "Sample A"
    }],
    title: "Combined Auto-Detected and User-Defined Peaks",
    annotations: [
    // User-defined annotation with boundaries (will show boundary markers)
    // Just provide startX and endX - area is auto-computed
    {
      x: 5.8,
      y: 420,
      text: "Caffeine (user-defined)",
      ay: -40,
      startX: 5.0,
      endX: 6.6
    },
    // Simple user annotation without boundaries (just a label)
    {
      x: 24.1,
      y: 220,
      text: "Unknown Peak",
      ay: -60
    }],
    peakDetectionOptions: {
      minHeight: 0.1,
      prominence: 0.05
    },
    showPeakAreas: true,
    boundaryMarkers: "enabled"
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Chart title is displayed", async () => {
      const title = canvas.getByText("Combined Auto-Detected and User-Defined Peaks");
      expect(title).toBeInTheDocument();
    });
    await step("Chart container renders", async () => {
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });
    await step("User-defined annotations are displayed", async () => {
      expect(canvas.getByText("Caffeine (user-defined)")).toBeInTheDocument();
      expect(canvas.getByText("Unknown Peak")).toBeInTheDocument();
    });
    await step("Auto-detected peak area annotations are displayed", async () => {
      // Peak areas from auto-detection + user annotations
      const annotations = canvasElement.querySelectorAll(".annotation-text");
      expect(annotations.length).toBeGreaterThan(2);
    });
    await step("Boundary markers from both sources are rendered", async () => {
      // Main trace + boundary marker traces from both auto-detected and user-defined peaks
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBeGreaterThan(1);
    });
  },
  parameters: {
    docs: {
      description: {
        story: "This example shows automatic peak detection combined with user-provided annotations. The auto-detected peaks display computed areas, while user annotations can provide custom labels. User annotations with boundary info (startIndex, endIndex) will also display boundary markers alongside auto-detected peaks."
      }
    },
    zephyr: {
      testCaseId: "SW-T1115"
    }
  }
}`,...E.parameters?.docs?.source},description:{story:`Combining automatic peak detection with user-defined annotations. Auto-detected peaks
show computed areas while user annotations provide custom labels. Both can have
boundary markers displayed.`,...E.parameters?.docs?.description}}};const Ne=["SingleTrace","MultipleTraces","WithMetadata","PeakDetection","FullFeatured","WithBoundaryMarkers","UserDefinedPeakBoundaries","CombinedAutoAndUserPeaks"];export{E as CombinedAutoAndUserPeaks,q as FullFeatured,j as MultipleTraces,O as PeakDetection,P as SingleTrace,N as UserDefinedPeakBoundaries,U as WithBoundaryMarkers,_ as WithMetadata,Ne as __namedExportsOrder,Ue as default};
