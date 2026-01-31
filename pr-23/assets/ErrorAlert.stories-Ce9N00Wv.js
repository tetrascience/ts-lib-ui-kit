import{j as e}from"./jsx-runtime-CDt2p4po.js";import{r as ur}from"./index-GiUgBvb1.js";import{a as u}from"./index-B-lxVbXh.js";import{B as p}from"./Button-tnMIwByE.js";import{a}from"./styled-components.browser.esm-Ctfm6iBV.js";import"./v4-CtRu48qb.js";const mr=a.div`
  width: 100%;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 16px;
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  display: flex;
  flex-direction: column;
  gap: 8px;
`,fr=a.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`,Er=a.div`
  color: #ff4d4f;
  font-size: 18px;
  margin-right: 12px;
  display: flex;
  align-items: center;
`,hr=a.button`
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.45);
  padding: 0;
  line-height: 1;
  &:hover {
    color: rgba(0, 0, 0, 0.75);
  }
`,xr=a.div`
  font-weight: 500;
  font-size: 16px;
  display: flex;
  align-items: center;
  flex-grow: 1;
`,wr=a.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`,q=a.p`
  margin: 0;
  padding: 0;
  line-height: 1.5;
`,pr=a.span`
  font-weight: ${r=>r.$strong?"600":"400"};
  color: ${r=>r.$type==="secondary"?"rgba(0, 0, 0, 0.45)":"inherit"};
`,Cr=a(pr).attrs({$type:"secondary"})``,yr=a.div`
  margin-left: -15px;
  margin-right: -15px;
  margin-bottom: -5px;
`,br=a.div`
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  user-select: none;

  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }

  &::after {
    content: "${r=>r.$isActive?"▼":"▶"}";
    font-size: 12px;
    margin-left: 8px;
  }
`,vr=a.div`
  padding: ${r=>r.$isVisible?"0 16px 12px":"0 16px"};
  max-height: ${r=>r.$isVisible?"300px":"0"};
  overflow: hidden;
  transition: max-height 0.3s ease;
`,Ar=a.pre`
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 300px;
  overflow-y: auto;
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  margin: 0;
`;function kr(r){return typeof r=="object"&&r!==null&&"isAxiosError"in r&&r.isAxiosError===!0}const Sr=({children:r,header:l,defaultExpanded:t=!1})=>{const[i,n]=ur.useState(t);return e.jsxs("div",{children:[e.jsx(br,{$isActive:i,onClick:()=>n(!i),children:l}),e.jsx(vr,{$isVisible:i,children:r})]})},k=({error:r,title:l="An Error Occurred",onClose:t,showDetailsDefault:i=!1})=>{var S,j,R,D,N,T;if(!r)return e.jsx(e.Fragment,{});let n="An unexpected error occurred.",c=null,s=null,o="Unknown Error";if(kr(r)){if(o="Network/API Error",n=r.message,r.response){const A=r.response.status,$=r.response.statusText;n=`API Error: ${A} ${$}`;const d=r.response.data;if(typeof d=="string")c=d;else if(d&&typeof d=="object"){const I=d.detail||d.message||d.error;typeof I=="string"?c=I:(c="Check details for response data.",s=JSON.stringify(d,null,2))}else c=`Request failed with status code ${A}.`;s=`URL: ${(j=(S=r.config)==null?void 0:S.method)==null?void 0:j.toUpperCase()} ${(R=r.config)==null?void 0:R.url}
Status: ${A} ${$}
Response Data:
${s??JSON.stringify(d,null,2)}`}else r.request?(o="Network Error",n="Network Error: Could not reach the server.",c="Please check your internet connection or contact support if the problem persists.",s=`URL: ${(N=(D=r.config)==null?void 0:D.method)==null?void 0:N.toUpperCase()} ${(T=r.config)==null?void 0:T.url}
Error Message: ${r.message}`):n=`Request Setup Error: ${r.message}`;r.code&&(o+=` (Code: ${r.code})`)}else if(r instanceof Error)o=r.name||"Error",n=r.message,s=r.stack??"No stack trace available.";else if(typeof r=="string")o="Message",n=r;else if(typeof r=="object"&&r!==null){o="Object Error",n=r.message||r.error||"An object was thrown as an error.";try{s=JSON.stringify(r,null,2)}catch{s="Could not stringify the error object."}}return e.jsxs(mr,{type:"error",children:[e.jsxs(fr,{children:[e.jsxs(xr,{children:[e.jsx(Er,{children:"⚠️"}),l]}),t&&e.jsx(hr,{onClick:t,children:"✕"})]}),e.jsxs(wr,{children:[e.jsxs(q,{children:[e.jsxs(pr,{$strong:!0,children:[o,":"]})," ",n]}),c&&e.jsx(q,{children:e.jsx(Cr,{children:c})}),s&&e.jsx(yr,{children:e.jsx(Sr,{header:"Details",defaultExpanded:i,children:e.jsx(Ar,{children:s})})})]})]})};k.__docgenInfo={description:"",methods:[],displayName:"ErrorAlert",props:{error:{required:!0,tsType:{name:"unknown"},description:"The error object to display. Can be Error, AxiosError, string, or any other type."},title:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:"Optional title for the error alert. Defaults to 'An Error Occurred'.",defaultValue:{value:'"An Error Occurred"',computed:!1}},onClose:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:"Optional callback function when the alert is closed."},showDetailsDefault:{required:!1,tsType:{name:"boolean"},description:"Set to true to show technical details expanded by default. Defaults to false.",defaultValue:{value:"false",computed:!1}},noErrorContent:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:"Custom message to show when error is null/undefined (optional, component renders nothing by default)"}}};const v=(r,l,t,i=`Request failed with status code ${r}`,n={url:"/api/data",method:"get"},c,s)=>{const o=new Error(i);return o.isAxiosError=!0,o.config=n,o.code=s,o.request=c,o.response={data:t,status:r,statusText:l,headers:{},config:n},o.name="AxiosError",o},gr=(r="Network Error",l={url:"/api/data",method:"get"})=>{const t=new Error(r);return t.isAxiosError=!0,t.config=l,t.request={},t.response=void 0,t.name="AxiosError",t.code="ERR_NETWORK",t},Ir={title:"Atoms/ErrorAlert",component:k,tags:["autodocs"],argTypes:{error:{control:"object",description:"The error object (Error, AxiosError, string, etc.)"},title:{control:"text",description:"Optional title for the error alert"},onClose:{action:"closed",description:"Callback function when the alert is closed"},showDetailsDefault:{control:"boolean",description:"Show details expanded by default"},noErrorContent:{control:"text",description:"Content to show when error is null/undefined"}},parameters:{layout:"padded"}},g={args:{error:null,title:"Status Indicator",noErrorContent:"Everything is running smoothly."}},m={args:{error:new Error("Something went wrong during processing."),title:"Processing Error",onClose:u("closed")}},f={args:{error:(()=>{try{null.doSomething()}catch(r){return r}})(),title:"Application Logic Error",onClose:u("closed"),showDetailsDefault:!0}},E={args:{error:v(404,"Not Found",{message:"The requested resource could not be found."},"Request failed with status code 404"),title:"API Resource Not Found",onClose:u("closed")}},h={args:{error:v(500,"Internal Server Error","An unexpected error occurred on the server.","Request failed with status code 500"),title:"Server Error",onClose:u("closed")}},x={args:{error:v(400,"Bad Request",{code:"VALIDATION_ERROR",detail:"Username is required.",field:"username"},"Request failed with status code 400"),title:"Validation Failed",onClose:u("closed"),showDetailsDefault:!0}},w={args:{error:gr(),title:"Connection Problem",onClose:u("closed")}},C={args:{error:"Invalid user input provided.",title:"Input Error",onClose:u("closed")}},y={args:{error:{code:123,reason:"Custom error structure without standard message.",data:{info:"abc"}},title:"Custom Object Error",onClose:u("closed"),showDetailsDefault:!0}},b={render:function(l){const[t,i]=ur.useState(null),n=()=>i(new Error("A standard error occurred!")),c=()=>i(v(503,"Service Unavailable",{detail:"The service is temporarily down for maintenance."})),s=()=>i(gr("Failed to connect to backend.")),o=()=>i(null);return e.jsxs("div",{children:[e.jsxs("div",{style:{marginBottom:"16px"},children:[e.jsx(p,{onClick:n,style:{marginRight:"8px"},children:"Trigger Standard Error"}),e.jsx(p,{onClick:c,style:{marginRight:"8px"},children:"Trigger Axios 503 Error"}),e.jsx(p,{onClick:s,style:{marginRight:"8px"},children:"Trigger Network Error"}),e.jsx(p,{onClick:o,variant:"primary",children:"Clear Error"})]}),e.jsx(k,{...l,error:t,onClose:o})]})},args:{title:"Live Error Demo",showDetailsDefault:!1,noErrorContent:"Click a button above to generate an error."}};var O,B,P;g.parameters={...g.parameters,docs:{...(O=g.parameters)==null?void 0:O.docs,source:{originalSource:`{
  args: {
    error: null,
    title: "Status Indicator",
    // Example: use a different title when no error
    noErrorContent: "Everything is running smoothly." // Example content for no error
  }
}`,...(P=(B=g.parameters)==null?void 0:B.docs)==null?void 0:P.source}}};var M,F,U;m.parameters={...m.parameters,docs:{...(M=m.parameters)==null?void 0:M.docs,source:{originalSource:`{
  args: {
    error: new Error("Something went wrong during processing."),
    title: "Processing Error",
    onClose: action("closed")
  }
}`,...(U=(F=m.parameters)==null?void 0:F.docs)==null?void 0:U.source}}};var V,L,W;f.parameters={...f.parameters,docs:{...(V=f.parameters)==null?void 0:V.docs,source:{originalSource:`{
  args: {
    error: (() => {
      try {
        // Intentionally cause a TypeError

        const x: any = null;
        x.doSomething(); // This will throw
      } catch (e) {
        return e;
      }
    })(),
    title: "Application Logic Error",
    onClose: action("closed"),
    showDetailsDefault: true
  }
}`,...(W=(L=f.parameters)==null?void 0:L.docs)==null?void 0:W.source}}};var _,z,H;E.parameters={...E.parameters,docs:{...(_=E.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    error: createMockAxiosError(404, "Not Found", {
      message: "The requested resource could not be found."
    }, "Request failed with status code 404"),
    title: "API Resource Not Found",
    onClose: action("closed")
  }
}`,...(H=(z=E.parameters)==null?void 0:z.docs)==null?void 0:H.source}}};var J,K,G;h.parameters={...h.parameters,docs:{...(J=h.parameters)==null?void 0:J.docs,source:{originalSource:`{
  args: {
    error: createMockAxiosError(500, "Internal Server Error", "An unexpected error occurred on the server.", "Request failed with status code 500"),
    title: "Server Error",
    onClose: action("closed")
  }
}`,...(G=(K=h.parameters)==null?void 0:K.docs)==null?void 0:G.source}}};var Q,X,Y;x.parameters={...x.parameters,docs:{...(Q=x.parameters)==null?void 0:Q.docs,source:{originalSource:`{
  args: {
    error: createMockAxiosError(400, "Bad Request", {
      code: "VALIDATION_ERROR",
      detail: "Username is required.",
      field: "username"
    }, "Request failed with status code 400"),
    title: "Validation Failed",
    onClose: action("closed"),
    showDetailsDefault: true
  }
}`,...(Y=(X=x.parameters)==null?void 0:X.docs)==null?void 0:Y.source}}};var Z,rr,er;w.parameters={...w.parameters,docs:{...(Z=w.parameters)==null?void 0:Z.docs,source:{originalSource:`{
  args: {
    error: createMockNetworkError(),
    title: "Connection Problem",
    onClose: action("closed")
  }
}`,...(er=(rr=w.parameters)==null?void 0:rr.docs)==null?void 0:er.source}}};var or,tr,nr;C.parameters={...C.parameters,docs:{...(or=C.parameters)==null?void 0:or.docs,source:{originalSource:`{
  args: {
    error: "Invalid user input provided.",
    title: "Input Error",
    onClose: action("closed")
  }
}`,...(nr=(tr=C.parameters)==null?void 0:tr.docs)==null?void 0:nr.source}}};var sr,ar,ir;y.parameters={...y.parameters,docs:{...(sr=y.parameters)==null?void 0:sr.docs,source:{originalSource:`{
  args: {
    error: {
      code: 123,
      reason: "Custom error structure without standard message.",
      data: {
        info: "abc"
      }
    },
    title: "Custom Object Error",
    onClose: action("closed"),
    showDetailsDefault: true
  }
}`,...(ir=(ar=y.parameters)==null?void 0:ar.docs)==null?void 0:ir.source}}};var cr,lr,dr;b.parameters={...b.parameters,docs:{...(cr=b.parameters)==null?void 0:cr.docs,source:{originalSource:`{
  render: function InteractiveErrorHandler(args) {
    const [currentError, setCurrentError] = useState<unknown>(null);
    const triggerStandardError = () => setCurrentError(new Error("A standard error occurred!"));
    const triggerAxiosError = () => setCurrentError(createMockAxiosError(503, "Service Unavailable", {
      detail: "The service is temporarily down for maintenance."
    }));
    const triggerNetworkError = () => setCurrentError(createMockNetworkError("Failed to connect to backend."));
    const clearError = () => setCurrentError(null);
    return <div>
        <div style={{
        marginBottom: "16px"
      }}>
          <Button onClick={triggerStandardError} style={{
          marginRight: "8px"
        }}>
            Trigger Standard Error
          </Button>
          <Button onClick={triggerAxiosError} style={{
          marginRight: "8px"
        }}>
            Trigger Axios 503 Error
          </Button>
          <Button onClick={triggerNetworkError} style={{
          marginRight: "8px"
        }}>
            Trigger Network Error
          </Button>
          <Button onClick={clearError} variant="primary">
            Clear Error
          </Button>
        </div>
        <ErrorAlert {...args} error={currentError} onClose={clearError} />
      </div>;
  },
  args: {
    // Default args for the interactive story - error will be controlled by state
    title: "Live Error Demo",
    showDetailsDefault: false,
    noErrorContent: "Click a button above to generate an error."
  }
}`,...(dr=(lr=b.parameters)==null?void 0:lr.docs)==null?void 0:dr.source}}};const qr=["NoError","StandardError","TypeErrorWithErrorStack","AxiosError404","AxiosError500WithStringData","AxiosError400WithObjectData","AxiosNetworkError","StringError","ObjectError","Interactive"];export{x as AxiosError400WithObjectData,E as AxiosError404,h as AxiosError500WithStringData,w as AxiosNetworkError,b as Interactive,g as NoError,y as ObjectError,m as StandardError,C as StringError,f as TypeErrorWithErrorStack,qr as __namedExportsOrder,Ir as default};
