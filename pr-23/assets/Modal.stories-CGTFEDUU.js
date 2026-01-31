import{j as e}from"./jsx-runtime-CDt2p4po.js";import{r as U}from"./index-GiUgBvb1.js";import{B as V}from"./Button-tnMIwByE.js";import{M as x}from"./Modal-sd89y6Dy.js";import{T as u}from"./ThemeProvider-BrrJ8DNK.js";import"./styled-components.browser.esm-Ctfm6iBV.js";import"./Icon-CuK57VyF.js";const oe={title:"Atoms/Modal",component:x,parameters:{layout:"centered"},tags:["autodocs"]},r={args:{isOpen:!0,onClose:()=>console.log("Modal closed"),onConfirm:()=>console.log("Modal confirmed"),title:"Title",children:e.jsx("p",{children:"Are you sure you want to reset this view? you will need to input all the settings and load all the graph from the start"})}},a={args:{...r.args,hideActions:!0}},i={args:{...r.args,width:"800px"}},l={args:{...r.args,children:e.jsx(e.Fragment,{children:Array(10).fill(0).map((n,o)=>e.jsxs("p",{children:["This is paragraph ",o+1,". Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam eu justo eu nisi ultrices facilisis. Donec vestibulum metus at sem faucibus, a commodo nunc ultricies."]},o))})}},s=()=>{const[n,o]=U.useState(!1),h=()=>{o(!0)},g=()=>{o(!1)},f=()=>{console.log("Reset confirmed"),o(!1)};return e.jsxs("div",{children:[e.jsx(V,{onClick:h,variant:"primary",children:"Open Modal"}),e.jsx(x,{isOpen:n,onClose:g,onConfirm:f,title:"Title",children:e.jsx("p",{children:"Are you sure you want to reset this view? you will need to input all the settings and load all the graph from the start"})})]})},d={args:{...r.args,title:"Custom Form",children:e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px"},children:[e.jsx("input",{type:"text",placeholder:"Enter your name",style:{padding:"8px",borderRadius:"4px",border:"1px solid var(--grey-200)"}}),e.jsx("textarea",{placeholder:"Enter your message",rows:4,style:{padding:"8px",borderRadius:"4px",border:"1px solid var(--grey-200)"}})]})}},c={args:{...r.args,title:"Sharp Corners Modal"},decorators:[n=>e.jsx(u,{theme:{radius:{large:"4px"}},children:e.jsx(n,{})})]},m={args:{...r.args,title:"Custom Background Modal"},decorators:[n=>e.jsx(u,{theme:{colors:{background:"#FEF3C7"}},children:e.jsx(n,{})})]},p={args:{...r.args,title:"Fully Themed Modal"},decorators:[n=>e.jsx(u,{theme:{colors:{background:"#F3E8FF",primary:"#9333EA",primaryHover:"#7E22CE",primaryActive:"#6B21A8"},radius:{large:"24px",medium:"12px"}},children:e.jsx(n,{})})]},t=()=>{const[n,o]=U.useState(!1),h=()=>{o(!0)},g=()=>{o(!1)},f=()=>{console.log("Reset confirmed"),o(!1)};return e.jsx(u,{theme:{colors:{primary:"#DC2626",primaryHover:"#B91C1C",primaryActive:"#991B1B",background:"#FEE2E2"},radius:{large:"8px",medium:"8px"}},children:e.jsxs("div",{children:[e.jsx(V,{onClick:h,variant:"primary",children:"Open Themed Modal"}),e.jsx(x,{isOpen:n,onClose:g,onConfirm:f,title:"Themed Modal",children:e.jsx("p",{children:"This modal and button are both themed with custom red colors and sharp corners!"})})]})})};s.__docgenInfo={description:"",methods:[],displayName:"Interactive"};t.__docgenInfo={description:"",methods:[],displayName:"InteractiveWithTheme"};var y,C,v;r.parameters={...r.parameters,docs:{...(y=r.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    isOpen: true,
    onClose: () => console.log("Modal closed"),
    onConfirm: () => console.log("Modal confirmed"),
    title: "Title",
    children: <p>
        Are you sure you want to reset this view? you will need to input all the
        settings and load all the graph from the start
      </p>
  }
}`,...(v=(C=r.parameters)==null?void 0:C.docs)==null?void 0:v.source}}};var O,T,j;a.parameters={...a.parameters,docs:{...(O=a.parameters)==null?void 0:O.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    hideActions: true
  }
}`,...(j=(T=a.parameters)==null?void 0:T.docs)==null?void 0:j.source}}};var S,E,M;i.parameters={...i.parameters,docs:{...(S=i.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    width: "800px"
  }
}`,...(M=(E=i.parameters)==null?void 0:E.docs)==null?void 0:M.source}}};var b,A,F;l.parameters={...l.parameters,docs:{...(b=l.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    children: <>
        {Array(10).fill(0).map((_, i) => <p key={i}>
              This is paragraph {i + 1}. Lorem ipsum dolor sit amet, consectetur
              adipiscing elit. Nullam eu justo eu nisi ultrices facilisis. Donec
              vestibulum metus at sem faucibus, a commodo nunc ultricies.
            </p>)}
      </>
  }
}`,...(F=(A=l.parameters)==null?void 0:A.docs)==null?void 0:F.source}}};var w,B,I;s.parameters={...s.parameters,docs:{...(w=s.parameters)==null?void 0:w.docs,source:{originalSource:`() => {
  const [isOpen, setIsOpen] = useState(false);
  const handleOpen = () => {
    setIsOpen(true);
  };
  const handleClose = () => {
    setIsOpen(false);
  };
  const handleConfirm = () => {
    console.log("Reset confirmed");
    setIsOpen(false);
  };
  return <div>
      <Button onClick={handleOpen} variant="primary">
        Open Modal
      </Button>
      <Modal isOpen={isOpen} onClose={handleClose} onConfirm={handleConfirm} title="Title">
        <p>
          Are you sure you want to reset this view? you will need to input all
          the settings and load all the graph from the start
        </p>
      </Modal>
    </div>;
}`,...(I=(B=s.parameters)==null?void 0:B.docs)==null?void 0:I.source}}};var k,D,W;d.parameters={...d.parameters,docs:{...(k=d.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    title: "Custom Form",
    children: <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "16px"
    }}>
        <input type="text" placeholder="Enter your name" style={{
        padding: "8px",
        borderRadius: "4px",
        border: "1px solid var(--grey-200)"
      }} />
        <textarea placeholder="Enter your message" rows={4} style={{
        padding: "8px",
        borderRadius: "4px",
        border: "1px solid var(--grey-200)"
      }} />
      </div>
  }
}`,...(W=(D=d.parameters)==null?void 0:D.docs)==null?void 0:W.source}}};var P,R,_;c.parameters={...c.parameters,docs:{...(P=c.parameters)==null?void 0:P.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    title: "Sharp Corners Modal"
  },
  decorators: [Story => <ThemeProvider theme={{
    radius: {
      large: "4px"
    }
  }}>
        <Story />
      </ThemeProvider>]
}`,...(_=(R=c.parameters)==null?void 0:R.docs)==null?void 0:_.source}}};var H,L,N;m.parameters={...m.parameters,docs:{...(H=m.parameters)==null?void 0:H.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    title: "Custom Background Modal"
  },
  decorators: [Story => <ThemeProvider theme={{
    colors: {
      background: "#FEF3C7"
    }
  }}>
        <Story />
      </ThemeProvider>]
}`,...(N=(L=m.parameters)==null?void 0:L.docs)==null?void 0:N.source}}};var q,z,G;p.parameters={...p.parameters,docs:{...(q=p.parameters)==null?void 0:q.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    title: "Fully Themed Modal"
  },
  decorators: [Story => <ThemeProvider theme={{
    colors: {
      background: "#F3E8FF",
      primary: "#9333EA",
      primaryHover: "#7E22CE",
      primaryActive: "#6B21A8"
    },
    radius: {
      large: "24px",
      medium: "12px"
    }
  }}>
        <Story />
      </ThemeProvider>]
}`,...(G=(z=p.parameters)==null?void 0:z.docs)==null?void 0:G.source}}};var J,K,Q;t.parameters={...t.parameters,docs:{...(J=t.parameters)==null?void 0:J.docs,source:{originalSource:`() => {
  const [isOpen, setIsOpen] = useState(false);
  const handleOpen = () => {
    setIsOpen(true);
  };
  const handleClose = () => {
    setIsOpen(false);
  };
  const handleConfirm = () => {
    console.log("Reset confirmed");
    setIsOpen(false);
  };
  return <ThemeProvider theme={{
    colors: {
      primary: "#DC2626",
      primaryHover: "#B91C1C",
      primaryActive: "#991B1B",
      background: "#FEE2E2"
    },
    radius: {
      large: "8px",
      medium: "8px"
    }
  }}>
      <div>
        <Button onClick={handleOpen} variant="primary">
          Open Themed Modal
        </Button>
        <Modal isOpen={isOpen} onClose={handleClose} onConfirm={handleConfirm} title="Themed Modal">
          <p>
            This modal and button are both themed with custom red colors and
            sharp corners!
          </p>
        </Modal>
      </div>
    </ThemeProvider>;
}`,...(Q=(K=t.parameters)==null?void 0:K.docs)==null?void 0:Q.source}}};const se=["Default","HiddenActions","CustomWidth","LongContent","Interactive","CustomContent","WithSharpCorners","WithCustomBackground","WithFullTheme","InteractiveWithTheme"];export{d as CustomContent,i as CustomWidth,r as Default,a as HiddenActions,s as Interactive,t as InteractiveWithTheme,l as LongContent,m as WithCustomBackground,p as WithFullTheme,c as WithSharpCorners,se as __namedExportsOrder,oe as default};
