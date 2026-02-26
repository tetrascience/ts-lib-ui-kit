import { TdpSearch } from "./TdpSearch";

import type { TdpSearchColumn } from "./types";
import type { Meta, StoryObj } from "@storybook/react-vite";

const standaloneDefaults = {
  baseUrl: "https://api.tetrascience-dev.com",
  authToken: "",
  orgSlug: "data-apps-demo",
};

const meta: Meta<typeof TdpSearch> = {
  title: "Organisms/TdpSearch/Standalone",
  component: TdpSearch,
  argTypes: {
    baseUrl: {
      description: "TDP API base URL.",
      table: { category: "Connection" },
      control: "text",
    },
    authToken: {
      description: "JWT for TDP API.",
      table: { category: "Connection" },
      control: "text",
    },
    orgSlug: {
      description: "Organization slug.",
      table: { category: "Connection" },
      control: "text",
    },
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Standalone TdpSearch: calls TDP API directly (baseUrl + /v1/datalake/searchEql) with auth headers. " +
          "No backend required. Edit baseUrl / authToken / orgSlug in Controls.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TdpSearch>;

const standaloneColumns: TdpSearchColumn[] = [
  { key: "id", header: "ID" },
  { key: "filePath", header: "File Path", sortable: true },
  { key: "sourceType", header: "Source Type", sortable: true },
];

export const Default: Story = {
  args: {
    standalone: true,
    baseUrl: standaloneDefaults.baseUrl,
    authToken: standaloneDefaults.authToken,
    orgSlug: standaloneDefaults.orgSlug,
    columns: standaloneColumns,
    defaultQuery: "experiment",
    pageSize: 10,
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1125" },
  },
};
