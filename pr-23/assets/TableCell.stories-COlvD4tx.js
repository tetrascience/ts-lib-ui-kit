import{j as e}from"./jsx-runtime-CDt2p4po.js";import{T as l}from"./TableCell-D_umdoex.js";import"./index-GiUgBvb1.js";import"./styled-components.browser.esm-Ctfm6iBV.js";const u={title:"Atoms/TableCell",component:l,parameters:{layout:"padded"},tags:["autodocs"],argTypes:{align:{control:{type:"select"},options:["left","center","right"]}}},r={render:w=>e.jsx("table",{style:{borderCollapse:"collapse",width:"100%"},children:e.jsx("tbody",{children:e.jsx("tr",{children:e.jsx(l,{...w,children:"Label"})})})}),args:{children:"Label"}},n={render:()=>e.jsx("table",{style:{borderCollapse:"collapse",width:"100%"},children:e.jsx("tbody",{children:e.jsxs("tr",{children:[e.jsx(l,{align:"left",children:"Left Aligned"}),e.jsx(l,{align:"center",children:"Center Aligned"}),e.jsx(l,{align:"right",children:"Right Aligned"})]})})})},t={render:()=>e.jsx("table",{style:{borderCollapse:"collapse",width:"100%"},children:e.jsx("tbody",{children:e.jsxs("tr",{children:[e.jsx(l,{width:"100px",children:"Fixed 100px"}),e.jsx(l,{width:"200px",children:"Fixed 200px"}),e.jsx(l,{children:"Auto Width"})]})})})},a={render:()=>e.jsx("table",{style:{borderCollapse:"collapse",width:"100%"},children:e.jsxs("tbody",{children:[e.jsxs("tr",{children:[e.jsx(l,{children:"Row 1, Cell 1"}),e.jsx(l,{children:"Row 1, Cell 2"}),e.jsx(l,{children:"Row 1, Cell 3"})]}),e.jsxs("tr",{children:[e.jsx(l,{children:"Row 2, Cell 1"}),e.jsx(l,{children:"Row 2, Cell 2"}),e.jsx(l,{children:"Row 2, Cell 3"})]}),e.jsxs("tr",{children:[e.jsx(l,{children:"Row 3, Cell 1"}),e.jsx(l,{children:"Row 3, Cell 2"}),e.jsx(l,{children:"Row 3, Cell 3"})]})]})})};var s,o,d;r.parameters={...r.parameters,docs:{...(s=r.parameters)==null?void 0:s.docs,source:{originalSource:`{
  render: args => <table style={{
    borderCollapse: "collapse",
    width: "100%"
  }}>
      <tbody>
        <tr>
          <TableCell {...args}>Label</TableCell>
        </tr>
      </tbody>
    </table>,
  args: {
    children: "Label"
  }
}`,...(d=(o=r.parameters)==null?void 0:o.docs)==null?void 0:d.source}}};var i,c,b;n.parameters={...n.parameters,docs:{...(i=n.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: () => <table style={{
    borderCollapse: "collapse",
    width: "100%"
  }}>
      <tbody>
        <tr>
          <TableCell align="left">Left Aligned</TableCell>
          <TableCell align="center">Center Aligned</TableCell>
          <TableCell align="right">Right Aligned</TableCell>
        </tr>
      </tbody>
    </table>
}`,...(b=(c=n.parameters)==null?void 0:c.docs)==null?void 0:b.source}}};var C,h,p;t.parameters={...t.parameters,docs:{...(C=t.parameters)==null?void 0:C.docs,source:{originalSource:`{
  render: () => <table style={{
    borderCollapse: "collapse",
    width: "100%"
  }}>
      <tbody>
        <tr>
          <TableCell width="100px">Fixed 100px</TableCell>
          <TableCell width="200px">Fixed 200px</TableCell>
          <TableCell>Auto Width</TableCell>
        </tr>
      </tbody>
    </table>
}`,...(p=(h=t.parameters)==null?void 0:h.docs)==null?void 0:p.source}}};var x,T,j;a.parameters={...a.parameters,docs:{...(x=a.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => <table style={{
    borderCollapse: "collapse",
    width: "100%"
  }}>
      <tbody>
        <tr>
          <TableCell>Row 1, Cell 1</TableCell>
          <TableCell>Row 1, Cell 2</TableCell>
          <TableCell>Row 1, Cell 3</TableCell>
        </tr>
        <tr>
          <TableCell>Row 2, Cell 1</TableCell>
          <TableCell>Row 2, Cell 2</TableCell>
          <TableCell>Row 2, Cell 3</TableCell>
        </tr>
        <tr>
          <TableCell>Row 3, Cell 1</TableCell>
          <TableCell>Row 3, Cell 2</TableCell>
          <TableCell>Row 3, Cell 3</TableCell>
        </tr>
      </tbody>
    </table>
}`,...(j=(T=a.parameters)==null?void 0:T.docs)==null?void 0:j.source}}};const f=["Default","Alignments","WithDifferentWidths","MultipleRows"];export{n as Alignments,r as Default,a as MultipleRows,t as WithDifferentWidths,f as __namedExportsOrder,u as default};
