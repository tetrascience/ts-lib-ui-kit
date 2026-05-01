import{T as c}from"./TdpSearch-BsrgIuZl.js";import"./iframe-14YYbrss.js";import"./preload-helper-BbFkF2Um.js";import"./select-B5d0bdmo.js";import"./chevron-down-DJZ_3i8R.js";import"./check-B_BC0xs5.js";import"./chevron-up-CzLCBlyb.js";import"./index-BdQq_4o_.js";import"./index-CzkjiSpZ.js";import"./index-SK9A3v17.js";import"./index-Bjo__dt-.js";import"./index-CoM-oBxn.js";import"./button-BSJeE99h.js";import"./index-B8eA1Gpy.js";import"./table-CAGB-JIG.js";import"./arrow-up-B6U4VEKO.js";import"./chevron-left-C34xjuVG.js";import"./chevron-right-CDyisS10.js";import"./input-CUCTLqrj.js";import"./search-5w6eG1Tc.js";import"./alert-Bm4-XRaT.js";import"./circle-alert-DKEVX4i9.js";const{expect:a,within:i}=__STORYBOOK_MODULE_TEST__,r={baseUrl:"https://api.tetrascience-dev.com",authToken:"",orgSlug:"data-apps-demo"},U={title:"TetraData Platform/Search/Standalone",component:c,argTypes:{baseUrl:{description:"TDP API base URL.",table:{category:"Connection"},control:"text"},authToken:{description:"JWT for TDP API.",table:{category:"Connection"},control:"text"},orgSlug:{description:"Organization slug.",table:{category:"Connection"},control:"text"}},parameters:{layout:"padded",docs:{description:{component:"Standalone TdpSearch: calls TDP API directly (baseUrl + /v1/datalake/searchEql) with auth headers. No backend required. Edit baseUrl / authToken / orgSlug in Controls."}}},tags:["autodocs"]},l=[{key:"id",header:"ID"},{key:"filePath",header:"File Path",sortable:!0},{key:"sourceType",header:"Source Type",sortable:!0}],n={args:{standalone:!0,baseUrl:r.baseUrl,authToken:r.authToken,orgSlug:r.orgSlug,columns:l,defaultQuery:"experiment",pageSize:10},parameters:{zephyr:{testCaseId:"SW-T1125"}},play:async({canvasElement:o,step:t})=>{const e=i(o);await t("Search input renders",async()=>{const s=e.queryByRole("searchbox")??e.queryByRole("textbox");a(s).toBeInTheDocument()}),await t("Default placeholder is displayed",async()=>{a(e.getByPlaceholderText("Enter search term...")).toBeInTheDocument()}),await t("Search button is present",async()=>{a(e.getByRole("button",{name:/search/i})).toBeInTheDocument()}),await t("Search icon is visible in the bar",async()=>{a(e.getByRole("textbox").closest(".tdp-search__search-bar")).toBeTruthy()}),await t("Initial empty state prompts to search",async()=>{a(e.getByText("Enter a search query and click Search to get started.")).toBeInTheDocument()})}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    standalone: true,
    baseUrl: standaloneDefaults.baseUrl,
    authToken: standaloneDefaults.authToken,
    orgSlug: standaloneDefaults.orgSlug,
    columns: standaloneColumns,
    defaultQuery: "experiment",
    pageSize: 10
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1125"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Search input renders", async () => {
      const searchInput = canvas.queryByRole("searchbox") ?? canvas.queryByRole("textbox");
      expect(searchInput).toBeInTheDocument();
    });
    await step("Default placeholder is displayed", async () => {
      expect(canvas.getByPlaceholderText("Enter search term...")).toBeInTheDocument();
    });
    await step("Search button is present", async () => {
      expect(canvas.getByRole("button", {
        name: /search/i
      })).toBeInTheDocument();
    });
    await step("Search icon is visible in the bar", async () => {
      expect(canvas.getByRole("textbox").closest(".tdp-search__search-bar")).toBeTruthy();
    });
    await step("Initial empty state prompts to search", async () => {
      expect(canvas.getByText("Enter a search query and click Search to get started.")).toBeInTheDocument();
    });
  }
}`,...n.parameters?.docs?.source}}};const q=["Default"];export{n as Default,q as __namedExportsOrder,U as default};
