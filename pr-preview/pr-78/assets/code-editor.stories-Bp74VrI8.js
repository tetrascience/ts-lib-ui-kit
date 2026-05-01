import{r as i,R as A,F as Pe,j as w,B as le,E as de,y as fe,c as De}from"./iframe-14YYbrss.js";import{B as pe}from"./button-BSJeE99h.js";import{C as Le}from"./copy-CeUeG-Dw.js";import{R as Ae}from"./rocket-C4MnzVS6.js";import"./preload-helper-BbFkF2Um.js";import"./index-B8eA1Gpy.js";function me(e,t){(t==null||t>e.length)&&(t=e.length);for(var r=0,n=Array(t);r<t;r++)n[r]=e[r];return n}function Be(e){if(Array.isArray(e))return e}function qe(e,t,r){return(t=_e(t))in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function ke(e,t){var r=e==null?null:typeof Symbol<"u"&&e[Symbol.iterator]||e["@@iterator"];if(r!=null){var n,o,a,c,l=[],d=!0,s=!1;try{if(a=(r=r.call(e)).next,t!==0)for(;!(d=(n=a.call(r)).done)&&(l.push(n.value),l.length!==t);d=!0);}catch(C){s=!0,o=C}finally{try{if(!d&&r.return!=null&&(c=r.return(),Object(c)!==c))return}finally{if(s)throw o}}return l}}function ze(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function ge(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter(function(o){return Object.getOwnPropertyDescriptor(e,o).enumerable})),r.push.apply(r,n)}return r}function he(e){for(var t=1;t<arguments.length;t++){var r=arguments[t]!=null?arguments[t]:{};t%2?ge(Object(r),!0).forEach(function(n){qe(e,n,r[n])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):ge(Object(r)).forEach(function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(r,n))})}return e}function He(e,t){if(e==null)return{};var r,n,o=Ne(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)===-1&&{}.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}function Ne(e,t){if(e==null)return{};var r={};for(var n in e)if({}.hasOwnProperty.call(e,n)){if(t.indexOf(n)!==-1)continue;r[n]=e[n]}return r}function Ve(e,t){return Be(e)||ke(e,t)||Fe(e,t)||ze()}function $e(e,t){if(typeof e!="object"||!e)return e;var r=e[Symbol.toPrimitive];if(r!==void 0){var n=r.call(e,t);if(typeof n!="object")return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(e)}function _e(e){var t=$e(e,"string");return typeof t=="symbol"?t:t+""}function Fe(e,t){if(e){if(typeof e=="string")return me(e,t);var r={}.toString.call(e).slice(8,-1);return r==="Object"&&e.constructor&&(r=e.constructor.name),r==="Map"||r==="Set"?Array.from(e):r==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?me(e,t):void 0}}function We(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function ve(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter(function(o){return Object.getOwnPropertyDescriptor(e,o).enumerable})),r.push.apply(r,n)}return r}function ye(e){for(var t=1;t<arguments.length;t++){var r=arguments[t]!=null?arguments[t]:{};t%2?ve(Object(r),!0).forEach(function(n){We(e,n,r[n])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):ve(Object(r)).forEach(function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(r,n))})}return e}function Ue(){for(var e=arguments.length,t=new Array(e),r=0;r<e;r++)t[r]=arguments[r];return function(n){return t.reduceRight(function(o,a){return a(o)},n)}}function N(e){return function t(){for(var r=this,n=arguments.length,o=new Array(n),a=0;a<n;a++)o[a]=arguments[a];return o.length>=e.length?e.apply(this,o):function(){for(var c=arguments.length,l=new Array(c),d=0;d<c;d++)l[d]=arguments[d];return t.apply(r,[].concat(o,l))}}}function X(e){return{}.toString.call(e).includes("Object")}function Ge(e){return!Object.keys(e).length}function $(e){return typeof e=="function"}function Ke(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function Je(e,t){return X(t)||S("changeType"),Object.keys(t).some(function(r){return!Ke(e,r)})&&S("changeField"),t}function Ye(e){$(e)||S("selectorType")}function Qe(e){$(e)||X(e)||S("handlerType"),X(e)&&Object.values(e).some(function(t){return!$(t)})&&S("handlersType")}function Xe(e){e||S("initialIsRequired"),X(e)||S("initialType"),Ge(e)&&S("initialContent")}function Ze(e,t){throw new Error(e[t]||e.default)}var et={initialIsRequired:"initial state is required",initialType:"initial state should be an object",initialContent:"initial state shouldn't be an empty object",handlerType:"handler should be an object or a function",handlersType:"all handlers should be a functions",selectorType:"selector should be a function",changeType:"provided value of changes should be an object",changeField:'it seams you want to change a field in the state which is not specified in the "initial" state',default:"an unknown error accured in `state-local` package"},S=N(Ze)(et),U={changes:Je,selector:Ye,handler:Qe,initial:Xe};function tt(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};U.initial(e),U.handler(t);var r={current:e},n=N(ot)(r,t),o=N(nt)(r),a=N(U.changes)(e),c=N(rt)(r);function l(){var s=arguments.length>0&&arguments[0]!==void 0?arguments[0]:function(C){return C};return U.selector(s),s(r.current)}function d(s){Ue(n,o,a,c)(s)}return[l,d]}function rt(e,t){return $(t)?t(e.current):t}function nt(e,t){return e.current=ye(ye({},e.current),t),t}function ot(e,t,r){return $(t)?t(e.current):Object.keys(r).forEach(function(n){var o;return(o=t[n])===null||o===void 0?void 0:o.call(t,e.current[n])}),r}var at={create:tt},it={paths:{vs:"https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs"}};function ct(e){return function t(){for(var r=this,n=arguments.length,o=new Array(n),a=0;a<n;a++)o[a]=arguments[a];return o.length>=e.length?e.apply(this,o):function(){for(var c=arguments.length,l=new Array(c),d=0;d<c;d++)l[d]=arguments[d];return t.apply(r,[].concat(o,l))}}}function ut(e){return{}.toString.call(e).includes("Object")}function st(e){return e||be("configIsRequired"),ut(e)||be("configType"),e.urls?(lt(),{paths:{vs:e.urls.monacoBase}}):e}function lt(){console.warn(we.deprecation)}function dt(e,t){throw new Error(e[t]||e.default)}var we={configIsRequired:"the configuration object is required",configType:"the configuration object should be an object",default:"an unknown error accured in `@monaco-editor/loader` package",deprecation:`Deprecation warning!
    You are using deprecated way of configuration.

    Instead of using
      monaco.config({ urls: { monacoBase: '...' } })
    use
      monaco.config({ paths: { vs: '...' } })

    For more please check the link https://github.com/suren-atoyan/monaco-loader#config
  `},be=ct(dt)(we),ft={config:st},pt=function(){for(var t=arguments.length,r=new Array(t),n=0;n<t;n++)r[n]=arguments[n];return function(o){return r.reduceRight(function(a,c){return c(a)},o)}};function je(e,t){return Object.keys(t).forEach(function(r){t[r]instanceof Object&&e[r]&&Object.assign(t[r],je(e[r],t[r]))}),he(he({},e),t)}var mt={type:"cancelation",msg:"operation is manually canceled"};function ne(e){var t=!1,r=new Promise(function(n,o){e.then(function(a){return t?o(mt):n(a)}),e.catch(o)});return r.cancel=function(){return t=!0},r}var gt=["monaco"],ht=at.create({config:it,isInitialized:!1,resolve:null,reject:null,monaco:null}),Ee=Ve(ht,2),_=Ee[0],Z=Ee[1];function vt(e){var t=ft.config(e),r=t.monaco,n=He(t,gt);Z(function(o){return{config:je(o.config,n),monaco:r}})}function yt(){var e=_(function(t){var r=t.monaco,n=t.isInitialized,o=t.resolve;return{monaco:r,isInitialized:n,resolve:o}});if(!e.isInitialized){if(Z({isInitialized:!0}),e.monaco)return e.resolve(e.monaco),ne(oe);if(window.monaco&&window.monaco.editor)return Ce(window.monaco),e.resolve(window.monaco),ne(oe);pt(bt,jt)(Et)}return ne(oe)}function bt(e){return document.body.appendChild(e)}function wt(e){var t=document.createElement("script");return e&&(t.src=e),t}function jt(e){var t=_(function(n){var o=n.config,a=n.reject;return{config:o,reject:a}}),r=wt("".concat(t.config.paths.vs,"/loader.js"));return r.onload=function(){return e()},r.onerror=t.reject,r}function Et(){var e=_(function(r){var n=r.config,o=r.resolve,a=r.reject;return{config:n,resolve:o,reject:a}}),t=window.require;t.config(e.config),t(["vs/editor/editor.main"],function(r){var n=r.m||r;Ce(n),e.resolve(n)},function(r){e.reject(r)})}function Ce(e){_().monaco||Z({monaco:e})}function Ct(){return _(function(e){var t=e.monaco;return t})}var oe=new Promise(function(e,t){return Z({resolve:e,reject:t})}),Oe={config:vt,init:yt,__getMonacoInstance:Ct},Ot={wrapper:{display:"flex",position:"relative",textAlign:"initial"},fullWidth:{width:"100%"},hide:{display:"none"}},ae=Ot,St={container:{display:"flex",height:"100%",width:"100%",justifyContent:"center",alignItems:"center"}},Tt=St;function Mt({children:e}){return A.createElement("div",{style:Tt.container},e)}var xt=Mt,Rt=xt;function It({width:e,height:t,isEditorReady:r,loading:n,_ref:o,className:a,wrapperProps:c}){return A.createElement("section",{style:{...ae.wrapper,width:e,height:t},...c},!r&&A.createElement(Rt,null,n),A.createElement("div",{ref:o,style:{...ae.fullWidth,...!r&&ae.hide},className:a}))}var Pt=It,Se=i.memo(Pt);function Dt(e){i.useEffect(e,[])}var Te=Dt;function Lt(e,t,r=!0){let n=i.useRef(!0);i.useEffect(n.current||!r?()=>{n.current=!1}:e,t)}var j=Lt;function V(){}function L(e,t,r,n){return At(e,n)||Bt(e,t,r,n)}function At(e,t){return e.editor.getModel(Me(e,t))}function Bt(e,t,r,n){return e.editor.createModel(t,r,n?Me(e,n):void 0)}function Me(e,t){return e.Uri.parse(t)}function qt({original:e,modified:t,language:r,originalLanguage:n,modifiedLanguage:o,originalModelPath:a,modifiedModelPath:c,keepCurrentOriginalModel:l=!1,keepCurrentModifiedModel:d=!1,theme:s="light",loading:C="Loading...",options:E={},height:B="100%",width:R="100%",className:q,wrapperProps:I={},beforeMount:P=V,onMount:k=V}){let[g,T]=i.useState(!1),[M,p]=i.useState(!0),h=i.useRef(null),m=i.useRef(null),z=i.useRef(null),y=i.useRef(k),u=i.useRef(P),D=i.useRef(!1);Te(()=>{let f=Oe.init();return f.then(v=>(m.current=v)&&p(!1)).catch(v=>v?.type!=="cancelation"&&console.error("Monaco initialization: error:",v)),()=>h.current?H():f.cancel()}),j(()=>{if(h.current&&m.current){let f=h.current.getOriginalEditor(),v=L(m.current,e||"",n||r||"text",a||"");v!==f.getModel()&&f.setModel(v)}},[a],g),j(()=>{if(h.current&&m.current){let f=h.current.getModifiedEditor(),v=L(m.current,t||"",o||r||"text",c||"");v!==f.getModel()&&f.setModel(v)}},[c],g),j(()=>{let f=h.current.getModifiedEditor();f.getOption(m.current.editor.EditorOption.readOnly)?f.setValue(t||""):t!==f.getValue()&&(f.executeEdits("",[{range:f.getModel().getFullModelRange(),text:t||"",forceMoveMarkers:!0}]),f.pushUndoStop())},[t],g),j(()=>{h.current?.getModel()?.original.setValue(e||"")},[e],g),j(()=>{let{original:f,modified:v}=h.current.getModel();m.current.editor.setModelLanguage(f,n||r||"text"),m.current.editor.setModelLanguage(v,o||r||"text")},[r,n,o],g),j(()=>{m.current?.editor.setTheme(s)},[s],g),j(()=>{h.current?.updateOptions(E)},[E],g);let F=i.useCallback(()=>{if(!m.current)return;u.current(m.current);let f=L(m.current,e||"",n||r||"text",a||""),v=L(m.current,t||"",o||r||"text",c||"");h.current?.setModel({original:f,modified:v})},[r,t,o,e,n,a,c]),W=i.useCallback(()=>{!D.current&&z.current&&(h.current=m.current.editor.createDiffEditor(z.current,{automaticLayout:!0,...E}),F(),m.current?.editor.setTheme(s),T(!0),D.current=!0)},[E,s,F]);i.useEffect(()=>{g&&y.current(h.current,m.current)},[g]),i.useEffect(()=>{!M&&!g&&W()},[M,g,W]);function H(){let f=h.current?.getModel();l||f?.original?.dispose(),d||f?.modified?.dispose(),h.current?.dispose()}return A.createElement(Se,{width:R,height:B,isEditorReady:g,loading:C,_ref:z,className:q,wrapperProps:I})}var kt=qt;i.memo(kt);function zt(e){let t=i.useRef();return i.useEffect(()=>{t.current=e},[e]),t.current}var Ht=zt,G=new Map;function Nt({defaultValue:e,defaultLanguage:t,defaultPath:r,value:n,language:o,path:a,theme:c="light",line:l,loading:d="Loading...",options:s={},overrideServices:C={},saveViewState:E=!0,keepCurrentModel:B=!1,width:R="100%",height:q="100%",className:I,wrapperProps:P={},beforeMount:k=V,onMount:g=V,onChange:T,onValidate:M=V}){let[p,h]=i.useState(!1),[m,z]=i.useState(!0),y=i.useRef(null),u=i.useRef(null),D=i.useRef(null),F=i.useRef(g),W=i.useRef(k),H=i.useRef(),f=i.useRef(n),v=Ht(a),ue=i.useRef(!1),ee=i.useRef(!1);Te(()=>{let b=Oe.init();return b.then(O=>(y.current=O)&&z(!1)).catch(O=>O?.type!=="cancelation"&&console.error("Monaco initialization: error:",O)),()=>u.current?Ie():b.cancel()}),j(()=>{let b=L(y.current,e||n||"",t||o||"",a||r||"");b!==u.current?.getModel()&&(E&&G.set(v,u.current?.saveViewState()),u.current?.setModel(b),E&&u.current?.restoreViewState(G.get(a)))},[a],p),j(()=>{u.current?.updateOptions(s)},[s],p),j(()=>{!u.current||n===void 0||(u.current.getOption(y.current.editor.EditorOption.readOnly)?u.current.setValue(n):n!==u.current.getValue()&&(ee.current=!0,u.current.executeEdits("",[{range:u.current.getModel().getFullModelRange(),text:n,forceMoveMarkers:!0}]),u.current.pushUndoStop(),ee.current=!1))},[n],p),j(()=>{let b=u.current?.getModel();b&&o&&y.current?.editor.setModelLanguage(b,o)},[o],p),j(()=>{l!==void 0&&u.current?.revealLine(l)},[l],p),j(()=>{y.current?.editor.setTheme(c)},[c],p);let se=i.useCallback(()=>{if(!(!D.current||!y.current)&&!ue.current){W.current(y.current);let b=a||r,O=L(y.current,n||e||"",t||o||"",b||"");u.current=y.current?.editor.create(D.current,{model:O,automaticLayout:!0,...s},C),E&&u.current.restoreViewState(G.get(b)),y.current.editor.setTheme(c),l!==void 0&&u.current.revealLine(l),h(!0),ue.current=!0}},[e,t,r,n,o,a,s,C,E,c,l]);i.useEffect(()=>{p&&F.current(u.current,y.current)},[p]),i.useEffect(()=>{!m&&!p&&se()},[m,p,se]),f.current=n,i.useEffect(()=>{p&&T&&(H.current?.dispose(),H.current=u.current?.onDidChangeModelContent(b=>{ee.current||T(u.current.getValue(),b)}))},[p,T]),i.useEffect(()=>{if(p){let b=y.current.editor.onDidChangeMarkers(O=>{let te=u.current.getModel()?.uri;if(te&&O.find(re=>re.path===te.path)){let re=y.current.editor.getModelMarkers({resource:te});M?.(re)}});return()=>{b?.dispose()}}return()=>{}},[p,M]);function Ie(){H.current?.dispose(),B?E&&G.set(a,u.current.saveViewState()):u.current.getModel()?.dispose(),u.current.dispose()}return A.createElement(Se,{width:R,height:q,isEditorReady:p,loading:d,_ref:D,className:I,wrapperProps:P})}var Vt=Nt,$t=i.memo(Vt),_t=$t;const Ft={monacoTheme:"vs",editorBg:"#ffffff",editorFg:"rgba(26, 26, 26, 1)",lineNumberColor:"rgba(26, 26, 26, 0.4)",lineNumberActiveColor:"rgba(26, 26, 26, 0.8)",selectionBg:"rgba(47, 69, 181, 0.15)",gutterBg:"#f9fafb",borderColor:"rgba(229, 231, 235, 1)",isDark:!1},Wt={monacoTheme:"vs-dark",editorBg:"rgba(20, 30, 53, 1)",editorFg:"rgba(255, 255, 255, 0.9)",lineNumberColor:"rgba(255, 255, 255, 0.35)",lineNumberActiveColor:"rgba(255, 255, 255, 0.7)",selectionBg:"rgba(84, 157, 255, 0.2)",gutterBg:"rgba(29, 40, 57, 1)",borderColor:"rgba(51, 65, 86, 1)",isDark:!0};function Ut(){const e=Pe();return i.useMemo(()=>e?Wt:Ft,[e])}const Gt={light:"vs",dark:"vs-dark"},xe=({value:e,onChange:t,language:r="python",theme:n,height:o=400,width:a="100%",options:c={},onCopy:l,onLaunch:d,disabled:s=!1})=>{const C=Ut(),E=i.useRef(null),[B,R]=i.useState("Copy"),[q,I]=i.useState("Launch"),P=1e3,k=i.useCallback(p=>{l&&!s&&(l(p),R("Copied"),setTimeout(()=>{R("Copy")},P))},[l,s]),g=i.useCallback(p=>{d&&!s&&(d(p),I("Launched"),setTimeout(()=>{I("Launch")},P))},[d,s]),T=async p=>{E.current=p},M={minimap:{enabled:!1},scrollBeyondLastLine:!1,lineNumbers:"on",padding:{top:12,bottom:12,left:20,right:20},scrollbar:{vertical:"hidden",verticalScrollbarSize:0},readOnly:s,...c};return w.jsxs("div",{className:De("rounded-2xl overflow-hidden relative border",s&&"opacity-60 cursor-not-allowed"),children:[w.jsxs("div",{className:"ml-auto flex gap-2 px-4 py-2 absolute top-0 right-0 z-[1]",children:[l&&w.jsxs(le,{children:[w.jsx(de,{asChild:!0,children:w.jsx("div",{className:"w-8 h-8 flex items-center justify-center",children:w.jsx(pe,{className:"w-full h-full",variant:"outline",size:"icon-sm",onClick:()=>k(e),disabled:s,children:w.jsx(Le,{})})})}),w.jsx(fe,{side:"bottom",children:B})]}),d&&w.jsxs(le,{children:[w.jsx(de,{asChild:!0,children:w.jsx("div",{className:"w-8 h-8 flex items-center justify-center",children:w.jsx(pe,{className:"w-full h-full",variant:"outline",size:"icon-sm",onClick:()=>g(e),disabled:s,children:w.jsx(Ae,{})})})}),w.jsx(fe,{side:"bottom",children:q})]})]}),w.jsx(_t,{value:e,onChange:t,language:r,theme:n?Gt[n]:C.monacoTheme,height:o,width:a,options:M,beforeMount:T})]})};xe.__docgenInfo={description:"",methods:[],displayName:"CodeEditor",props:{value:{required:!0,tsType:{name:"string"},description:""},onChange:{required:!0,tsType:{name:"OnChange"},description:""},language:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"python"',computed:!1}},theme:{required:!1,tsType:{name:"union",raw:'"light" | "dark"',elements:[{name:"literal",value:'"light"'},{name:"literal",value:'"dark"'}]},description:""},height:{required:!1,tsType:{name:"union",raw:"string | number",elements:[{name:"string"},{name:"number"}]},description:"",defaultValue:{value:"400",computed:!1}},width:{required:!1,tsType:{name:"union",raw:"string | number",elements:[{name:"string"},{name:"number"}]},description:"",defaultValue:{value:'"100%"',computed:!1}},options:{required:!1,tsType:{name:"Record",elements:[{name:"string"},{name:"unknown"}],raw:"Record<string, unknown>"},description:"",defaultValue:{value:"{}",computed:!1}},label:{required:!1,tsType:{name:"string"},description:""},onCopy:{required:!1,tsType:{name:"signature",type:"function",raw:"(code: string) => void",signature:{arguments:[{type:{name:"string"},name:"code"}],return:{name:"void"}}},description:""},onLaunch:{required:!1,tsType:{name:"signature",type:"function",raw:"(code: string) => void",signature:{arguments:[{type:{name:"string"},name:"code"}],return:{name:"void"}}},description:""},disabled:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}}}};const{expect:x,waitFor:Re,within:ie}=__STORYBOOK_MODULE_TEST__,er={title:"Components/CodeEditor",component:xe,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{language:{control:{type:"select"},options:["python","javascript","json","markdown"]},theme:{control:{type:"select"},options:["dark","light"]},height:{control:{type:"number"}},width:{control:{type:"text"}},label:{control:{type:"text"}},onChange:{action:"changed"},onCopy:{action:"copied"},onLaunch:{action:"launched"}}},ce={onCopy:e=>{navigator.clipboard.writeText(e),console.log("Code copied to clipboard")},onLaunch:e=>{console.log("Launching code:",e)}},K={name:"Default",parameters:{zephyr:{testCaseId:"SW-T772"}},args:{value:"print('Hello, world!')",language:"python",theme:"dark",height:400,width:"400px",label:"Description",...ce},play:async({canvasElement:e,step:t})=>{const r=ie(e);await t("Editor container renders",async()=>{x(e.querySelector(".rounded-2xl")).toBeInTheDocument()}),await t("Copy and launch controls render",async()=>{x(r.getAllByRole("button").length).toBeGreaterThanOrEqual(2)})}},J={name:"Light Mode",parameters:{zephyr:{testCaseId:"SW-T773"}},args:{value:"console.log('Hello, world!')",language:"javascript",height:400,width:"400px",label:"Description",theme:"light",...ce},play:async({canvasElement:e,step:t})=>{const r=ie(e);await t("Editor renders in light theme",async()=>{await Re(()=>x(e.querySelector(".monaco-editor")).toBeInTheDocument())}),await t("Toolbar actions present",async()=>{x(r.getAllByRole("button").length).toBeGreaterThanOrEqual(2)})}},Y={name:"React Javascript Example",parameters:{zephyr:{testCaseId:"SW-T774"}},args:{value:`import React, { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);
  
  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

export default Counter;`,language:"javascript",height:400,width:"600px",label:"React Counter Component",theme:"dark",...ce},play:async({canvasElement:e,step:t})=>{const r=ie(e);await t("Editor renders for larger snippet",async()=>{await Re(()=>x(e.querySelector(".monaco-editor")).toBeInTheDocument())}),await t("Copy and launch controls render",async()=>{x(r.getAllByRole("button")).toHaveLength(2)})}},Q={name:"Interactive",parameters:{zephyr:{testCaseId:"SW-T775"}},args:{value:"print('Helommlkmllo, world!')",language:"javascript",height:400,width:"400px",label:"Description"},play:async({canvasElement:e,step:t})=>{await t("Editor container renders",async()=>{x(e.querySelector(".rounded-2xl")).toBeInTheDocument()})}};K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  name: "Default",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T772"
    }
  },
  args: {
    value: "print('Hello, world!')",
    language: "python",
    theme: "dark",
    height: 400,
    width: "400px",
    label: "Description",
    ...defaultHandlers
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Editor container renders", async () => {
      expect(canvasElement.querySelector(".rounded-2xl")).toBeInTheDocument();
    });
    await step("Copy and launch controls render", async () => {
      expect(canvas.getAllByRole("button").length).toBeGreaterThanOrEqual(2);
    });
  }
}`,...K.parameters?.docs?.source}}};J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  name: "Light Mode",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T773"
    }
  },
  args: {
    value: "console.log('Hello, world!')",
    language: "javascript",
    height: 400,
    width: "400px",
    label: "Description",
    theme: "light",
    ...defaultHandlers
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Editor renders in light theme", async () => {
      await waitFor(() => expect(canvasElement.querySelector(".monaco-editor")).toBeInTheDocument());
    });
    await step("Toolbar actions present", async () => {
      expect(canvas.getAllByRole("button").length).toBeGreaterThanOrEqual(2);
    });
  }
}`,...J.parameters?.docs?.source}}};Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  name: "React Javascript Example",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T774"
    }
  },
  args: {
    value: \`import React, { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    document.title = \\\`Count: \\\${count}\\\`;
  }, [count]);
  
  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

export default Counter;\`,
    language: "javascript",
    height: 400,
    width: "600px",
    label: "React Counter Component",
    theme: "dark",
    ...defaultHandlers
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Editor renders for larger snippet", async () => {
      await waitFor(() => expect(canvasElement.querySelector(".monaco-editor")).toBeInTheDocument());
    });
    await step("Copy and launch controls render", async () => {
      expect(canvas.getAllByRole("button")).toHaveLength(2);
    });
  }
}`,...Y.parameters?.docs?.source}}};Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  name: "Interactive",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: {
      testCaseId: "SW-T775"
    }
  },
  args: {
    value: "print('Helommlkmllo, world!')",
    language: "javascript",
    height: 400,
    width: "400px",
    label: "Description"
  },
  play: async ({
    canvasElement,
    step
  }) => {
    await step("Editor container renders", async () => {
      expect(canvasElement.querySelector(".rounded-2xl")).toBeInTheDocument();
    });
  }
}`,...Q.parameters?.docs?.source}}};const tr=["Default","LightMode","ReactJavascriptExample","Interactive"];export{K as Default,Q as Interactive,J as LightMode,Y as ReactJavascriptExample,tr as __namedExportsOrder,er as default};
