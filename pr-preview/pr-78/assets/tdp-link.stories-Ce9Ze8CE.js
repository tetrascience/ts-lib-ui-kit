import{j as o,r as C}from"./iframe-14YYbrss.js";import"./preload-helper-BbFkF2Um.js";const H=["/data-workspace","/data-apps","/pipelines","/pipeline-edit/","/pipeline-details/","/pipeline-processing/","/file/","/file-details/","/files","/search","/search-classic","/artifacts/","/admin","/settings","/agent-studio"];function W(){if(typeof document>"u"||!document.referrer)return null;try{const a=new URL(document.referrer),e=a.pathname;for(const t of H){const i=e.indexOf(t);if(i!==-1){const s=e.slice(0,i).replace(/\/$/u,"");return`${a.origin}${s}`}}return a.origin}catch{return null}}function S(a,e){try{const t=e.startsWith("/")?e:`/${e}`,i=new URL(a);return i.pathname=`${i.pathname.replace(/\/$/u,"")}${t}`,i.href}catch{return null}}function N(a,e={}){if(e.newTab){window.open(a,"_blank","noopener,noreferrer");return}if(window.parent!==window)try{window.parent.location.href}catch{try{const t=new URL(a),i=`${t.pathname}${t.search}${t.hash}`;window.parent.postMessage({type:"navigate",path:i},"*");return}catch{}}window.location.href=a}const I=C.createContext(null);function O(){const a=C.useContext(I);if(!a)throw new Error("useTdpNavigationContext must be used within a TdpNavigationProvider. Wrap your app with <TdpNavigationProvider> or use the standalone useTdpNavigation() hook instead.");return a}const D=({tdpBaseUrl:a,children:e})=>{const t=C.useMemo(()=>a?a.replace(/\/$/u,""):W(),[a]),i=C.useMemo(()=>({tdpBaseUrl:t,getTdpUrl:s=>t?S(t,s):null,navigateToTdp:(s,B)=>{if(!t){console.warn("[TdpNavigation] Cannot navigate: TDP base URL not resolved");return}const p=S(t,s);p&&N(p,B)}}),[t]);return o.jsx(I.Provider,{value:i,children:e})},R=({path:a,navigationOptions:e={newTab:!0},children:t,onClick:i,className:s,...B})=>{const{getTdpUrl:p,navigateToTdp:P}=O(),A=p(a),_=l=>{l.metaKey||l.ctrlKey||l.shiftKey||(l.preventDefault(),i?.(l),P(a,e))};return o.jsx("a",{href:A??"#",target:e.newTab?"_blank":void 0,rel:e.newTab?"noopener noreferrer":void 0,onClick:_,className:`no-underline cursor-pointer hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:rounded-[2px] ${s??""}`,style:{color:"var(--primary)",outlineColor:"var(--border)"},...B,children:t})};D.__docgenInfo={description:`Provider that resolves the TDP base URL and exposes navigation helpers.

Resolution order:
1. Explicit \`tdpBaseUrl\` prop (if provided)
2. \`document.referrer\` parsing (production iframe)

@example
\`\`\`tsx
<TdpNavigationProvider tdpBaseUrl="https://tetrascience.com/my-org">
  <App />
</TdpNavigationProvider>
\`\`\``,methods:[],displayName:"TdpNavigationProvider",props:{tdpBaseUrl:{required:!1,tsType:{name:"string"},description:"Explicit TDP base URL override. Skips auto-detection when provided."},children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""}}};R.__docgenInfo={description:`A link component that navigates to TDP pages.

Renders a standard \`<a>\` tag with the correct href for right-click
"Open in new tab" support, accessibility, and SEO.

Must be used inside a \`<TdpNavigationProvider>\`.

@example
\`\`\`tsx
import { TDPLink, tdpPaths } from '@tetrascience-npm/tetrascience-react-ui';

<TDPLink path={tdpPaths.fileDetails("abc-123")}>
  View File Details
</TDPLink>

<TDPLink path="/search?q=test" navigationOptions={{ newTab: false }}>
  Search in TDP (same tab)
</TDPLink>
\`\`\``,methods:[],displayName:"TDPLink",props:{path:{required:!0,tsType:{name:"string"},description:'TDP page path (e.g., "/file/abc-123" or use tdpPaths helpers)'},navigationOptions:{required:!1,tsType:{name:"TdpNavigationOptions"},description:"Navigation behavior. Default: { newTab: true }",defaultValue:{value:"{ newTab: true }",computed:!1}},children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLAnchorElement>",elements:[{name:"HTMLAnchorElement"}]},description:""}},composes:["Omit"]};const{expect:n,fn:E,userEvent:x,within:r}=__STORYBOOK_MODULE_TEST__,c="https://example.tetrascience.com/my-org",$={title:"TetraData Platform/Link",component:R,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{path:{control:"text"},navigationOptions:{control:"object"}},decorators:[a=>o.jsx(D,{tdpBaseUrl:c,children:o.jsx(a,{})})]},d={name:"Default",args:{path:"/file/abc-123",children:"View File Details"},play:async({canvasElement:a,step:e})=>{const t=r(a);await e("Link renders",async()=>{await n(t.getByRole("link",{name:/view file details/i})).toBeInTheDocument()}),await e("Link has correct href",async()=>{await n(t.getByRole("link")).toHaveAttribute("href",`${c}/file/abc-123`)})},parameters:{zephyr:{testCaseId:"SW-T1127"}}},m={name:"Same Tab",args:{path:"/file/abc-123",children:"Open in Same Tab",navigationOptions:{newTab:!1}},play:async({canvasElement:a,step:e})=>{const t=r(a);await e("Link renders",async()=>{await n(t.getByRole("link",{name:/open in same tab/i})).toBeInTheDocument()}),await e("Link does not open in new tab",async()=>{await n(t.getByRole("link")).not.toHaveAttribute("target")})},parameters:{zephyr:{testCaseId:"SW-T1128"}}},h={name:"New Tab (default)",args:{path:"/file/abc-123",children:"Open in New Tab",navigationOptions:{newTab:!0}},play:async({canvasElement:a,step:e})=>{const t=r(a);await e("Link renders",async()=>{await n(t.getByRole("link",{name:/open in new tab/i})).toBeInTheDocument()}),await e("Link opens in new tab",async()=>{await n(t.getByRole("link")).toHaveAttribute("target","_blank")})},parameters:{zephyr:{testCaseId:"SW-T1129"}}},u={name:"Search Link",args:{path:"/search?q=experiment",children:"Search for experiments"},play:async({canvasElement:a,step:e})=>{const t=r(a);await e("Link renders",async()=>{await n(t.getByRole("link",{name:/search for experiments/i})).toBeInTheDocument()}),await e("Link has correct search href",async()=>{await n(t.getByRole("link",{name:/search for experiments/i})).toHaveAttribute("href",`${c}/search%3Fq=experiment`)})},parameters:{zephyr:{testCaseId:"SW-T1130"}}},w={name:"Pipeline Link",args:{path:"/pipeline-details/pipeline-456",children:"View Pipeline"},play:async({canvasElement:a,step:e})=>{const t=r(a);await e("Link renders",async()=>{await n(t.getByRole("link",{name:/view pipeline/i})).toBeInTheDocument()}),await e("Link has correct pipeline href",async()=>{await n(t.getByRole("link")).toHaveAttribute("href",`${c}/pipeline-details/pipeline-456`)})},parameters:{zephyr:{testCaseId:"SW-T1131"}}},y={name:"Data Workspace Link",args:{path:"/data-workspace",children:"Go to Data Workspace"},play:async({canvasElement:a,step:e})=>{const t=r(a);await e("Link renders",async()=>{await n(t.getByRole("link",{name:/go to data workspace/i})).toBeInTheDocument()}),await e("Link has correct href",async()=>{await n(t.getByRole("link")).toHaveAttribute("href",`${c}/data-workspace`)})},parameters:{zephyr:{testCaseId:"SW-T1132"}}},k={name:"With Custom Class",args:{path:"/file/abc-123",children:"Styled Link",className:"custom-link-class"},play:async({canvasElement:a,step:e})=>{const t=r(a);await e("Link renders",async()=>{await n(t.getByRole("link",{name:/styled link/i})).toBeInTheDocument()}),await e("Link has custom class",async()=>{await n(t.getByRole("link")).toHaveClass("custom-link-class")})},parameters:{zephyr:{testCaseId:"SW-T1133"}}},v={name:"Inline with Text",render:a=>o.jsxs("p",{children:["Click here to ",o.jsx(R,{...a,children:"view the file details"})," for more information."]}),args:{path:"/file/abc-123"},play:async({canvasElement:a,step:e})=>{const t=r(a);await e("Link renders inline with surrounding text",async()=>{await n(t.getByRole("link",{name:/view the file details/i})).toBeInTheDocument()}),await e("Surrounding text is present",async()=>{await n(t.getByText(/click here to/i)).toBeInTheDocument()})},parameters:{zephyr:{testCaseId:"SW-T1134"}}},g={name:"Click Interaction",tags:["!dev"],args:{path:"/file/abc-123",children:"Click Me",onClick:E()},play:async({canvasElement:a,args:e,step:t})=>{const s=r(a).getByRole("link",{name:/click me/i});await t("Link renders with correct href",async()=>{await n(s).toBeInTheDocument(),await n(s).toHaveAttribute("href",`${c}/file/abc-123`)}),await t("Click triggers onClick handler",async()=>{await x.click(s),await n(e.onClick).toHaveBeenCalledTimes(1)})},parameters:{zephyr:{testCaseId:"SW-T1135"}}},T={name:"New Tab Attributes",tags:["!dev"],args:{path:"/file/abc-123",children:"New Tab Link",navigationOptions:{newTab:!0}},play:async({canvasElement:a,step:e})=>{const i=r(a).getByRole("link",{name:/new tab link/i});await e("Link opens in new tab",async()=>{await n(i).toHaveAttribute("target","_blank")}),await e("Link has noopener noreferrer",async()=>{await n(i).toHaveAttribute("rel","noopener noreferrer")})},parameters:{zephyr:{testCaseId:"SW-T1136"}}},f={name:"Same Tab Attributes",tags:["!dev"],args:{path:"/file/abc-123",children:"Same Tab Link",navigationOptions:{newTab:!1}},play:async({canvasElement:a,step:e})=>{const i=r(a).getByRole("link",{name:/same tab link/i});await e("Link has no target attribute",async()=>{await n(i).not.toHaveAttribute("target")}),await e("Link has no rel attribute",async()=>{await n(i).not.toHaveAttribute("rel")})},parameters:{zephyr:{testCaseId:"SW-T1137"}}},b={name:"Keyboard Interaction",tags:["!dev"],args:{path:"/file/abc-123",children:"Keyboard Link",onClick:E()},play:async({canvasElement:a,args:e,step:t})=>{const s=r(a).getByRole("link",{name:/keyboard link/i});await t("Link receives focus via Tab",async()=>{await x.tab(),await n(s).toHaveFocus()}),await t("Enter key triggers onClick",async()=>{await x.keyboard("{Enter}"),await n(e.onClick).toHaveBeenCalledTimes(1)})},parameters:{zephyr:{testCaseId:"SW-T1138"}}},L={name:"Href Construction",tags:["!dev"],args:{path:"/pipeline-details/pipeline-456",children:"Pipeline Link"},play:async({canvasElement:a,step:e})=>{const i=r(a).getByRole("link",{name:/pipeline link/i});await e("Link href is constructed from base URL and path",async()=>{await n(i).toHaveAttribute("href",`${c}/pipeline-details/pipeline-456`)})},parameters:{zephyr:{testCaseId:"SW-T1139"}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: 'Default',
  args: {
    path: '/file/abc-123',
    children: 'View File Details'
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Link renders", async () => {
      await expect(canvas.getByRole('link', {
        name: /view file details/i
      })).toBeInTheDocument();
    });
    await step("Link has correct href", async () => {
      await expect(canvas.getByRole('link')).toHaveAttribute('href', \`\${MOCK_TDP_BASE_URL}/file/abc-123\`);
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1127"
    }
  }
}`,...d.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: 'Same Tab',
  args: {
    path: '/file/abc-123',
    children: 'Open in Same Tab',
    navigationOptions: {
      newTab: false
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Link renders", async () => {
      await expect(canvas.getByRole('link', {
        name: /open in same tab/i
      })).toBeInTheDocument();
    });
    await step("Link does not open in new tab", async () => {
      await expect(canvas.getByRole('link')).not.toHaveAttribute('target');
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1128"
    }
  }
}`,...m.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: 'New Tab (default)',
  args: {
    path: '/file/abc-123',
    children: 'Open in New Tab',
    navigationOptions: {
      newTab: true
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Link renders", async () => {
      await expect(canvas.getByRole('link', {
        name: /open in new tab/i
      })).toBeInTheDocument();
    });
    await step("Link opens in new tab", async () => {
      await expect(canvas.getByRole('link')).toHaveAttribute('target', '_blank');
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1129"
    }
  }
}`,...h.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: 'Search Link',
  args: {
    path: '/search?q=experiment',
    children: 'Search for experiments'
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Link renders", async () => {
      await expect(canvas.getByRole('link', {
        name: /search for experiments/i
      })).toBeInTheDocument();
    });
    await step("Link has correct search href", async () => {
      await expect(canvas.getByRole('link', {
        name: /search for experiments/i
      })).toHaveAttribute('href', \`\${MOCK_TDP_BASE_URL}/search%3Fq=experiment\`);
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1130"
    }
  }
}`,...u.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: 'Pipeline Link',
  args: {
    path: '/pipeline-details/pipeline-456',
    children: 'View Pipeline'
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Link renders", async () => {
      await expect(canvas.getByRole('link', {
        name: /view pipeline/i
      })).toBeInTheDocument();
    });
    await step("Link has correct pipeline href", async () => {
      await expect(canvas.getByRole('link')).toHaveAttribute('href', \`\${MOCK_TDP_BASE_URL}/pipeline-details/pipeline-456\`);
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1131"
    }
  }
}`,...w.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: 'Data Workspace Link',
  args: {
    path: '/data-workspace',
    children: 'Go to Data Workspace'
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Link renders", async () => {
      await expect(canvas.getByRole('link', {
        name: /go to data workspace/i
      })).toBeInTheDocument();
    });
    await step("Link has correct href", async () => {
      await expect(canvas.getByRole('link')).toHaveAttribute('href', \`\${MOCK_TDP_BASE_URL}/data-workspace\`);
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1132"
    }
  }
}`,...y.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  name: 'With Custom Class',
  args: {
    path: '/file/abc-123',
    children: 'Styled Link',
    className: 'custom-link-class'
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Link renders", async () => {
      await expect(canvas.getByRole('link', {
        name: /styled link/i
      })).toBeInTheDocument();
    });
    await step("Link has custom class", async () => {
      await expect(canvas.getByRole('link')).toHaveClass('custom-link-class');
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1133"
    }
  }
}`,...k.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: 'Inline with Text',
  render: args => <p>
      Click here to <TDPLink {...args}>view the file details</TDPLink> for more information.
    </p>,
  args: {
    path: '/file/abc-123'
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Link renders inline with surrounding text", async () => {
      await expect(canvas.getByRole('link', {
        name: /view the file details/i
      })).toBeInTheDocument();
    });
    await step("Surrounding text is present", async () => {
      await expect(canvas.getByText(/click here to/i)).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1134"
    }
  }
}`,...v.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: 'Click Interaction',
  tags: ['!dev'],
  args: {
    path: '/file/abc-123',
    children: 'Click Me',
    onClick: fn()
  },
  play: async ({
    canvasElement,
    args,
    step
  }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', {
      name: /click me/i
    });
    await step("Link renders with correct href", async () => {
      await expect(link).toBeInTheDocument();
      await expect(link).toHaveAttribute('href', \`\${MOCK_TDP_BASE_URL}/file/abc-123\`);
    });
    await step("Click triggers onClick handler", async () => {
      await userEvent.click(link);
      await expect(args.onClick).toHaveBeenCalledTimes(1);
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1135"
    }
  }
}`,...g.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: 'New Tab Attributes',
  tags: ['!dev'],
  args: {
    path: '/file/abc-123',
    children: 'New Tab Link',
    navigationOptions: {
      newTab: true
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', {
      name: /new tab link/i
    });
    await step("Link opens in new tab", async () => {
      await expect(link).toHaveAttribute('target', '_blank');
    });
    await step("Link has noopener noreferrer", async () => {
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1136"
    }
  }
}`,...T.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: 'Same Tab Attributes',
  tags: ['!dev'],
  args: {
    path: '/file/abc-123',
    children: 'Same Tab Link',
    navigationOptions: {
      newTab: false
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', {
      name: /same tab link/i
    });
    await step("Link has no target attribute", async () => {
      await expect(link).not.toHaveAttribute('target');
    });
    await step("Link has no rel attribute", async () => {
      await expect(link).not.toHaveAttribute('rel');
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1137"
    }
  }
}`,...f.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'Keyboard Interaction',
  tags: ['!dev'],
  args: {
    path: '/file/abc-123',
    children: 'Keyboard Link',
    onClick: fn()
  },
  play: async ({
    canvasElement,
    args,
    step
  }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', {
      name: /keyboard link/i
    });
    await step("Link receives focus via Tab", async () => {
      await userEvent.tab();
      await expect(link).toHaveFocus();
    });
    await step("Enter key triggers onClick", async () => {
      await userEvent.keyboard('{Enter}');
      await expect(args.onClick).toHaveBeenCalledTimes(1);
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1138"
    }
  }
}`,...b.parameters?.docs?.source}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  name: 'Href Construction',
  tags: ['!dev'],
  args: {
    path: '/pipeline-details/pipeline-456',
    children: 'Pipeline Link'
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', {
      name: /pipeline link/i
    });
    await step("Link href is constructed from base URL and path", async () => {
      await expect(link).toHaveAttribute('href', \`\${MOCK_TDP_BASE_URL}/pipeline-details/pipeline-456\`);
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1139"
    }
  }
}`,...L.parameters?.docs?.source}}};const K=["Default","SameTab","NewTab","SearchLink","PipelineLink","DataWorkspaceLink","CustomClassName","InlineWithText","ClickInteraction","NewTabAttributes","SameTabAttributes","KeyboardInteraction","HrefConstruction"];export{g as ClickInteraction,k as CustomClassName,y as DataWorkspaceLink,d as Default,L as HrefConstruction,v as InlineWithText,b as KeyboardInteraction,h as NewTab,T as NewTabAttributes,w as PipelineLink,m as SameTab,f as SameTabAttributes,u as SearchLink,K as __namedExportsOrder,$ as default};
