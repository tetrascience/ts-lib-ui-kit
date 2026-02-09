import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within, waitFor } from "@storybook/test";
import { TdpSearch } from "./TdpSearch";
import { TdpSearchColumn, TdpSearchFilter } from "./TdpSearch";
import { TdpSearchClient, SearchResponse, EqlQuery } from "../../../utils/tdpClient";

/**
 * Interactive test stories for the TdpSearch component.
 * These are excluded from the Storybook UI but run as part of the test suite.
 */
const meta: Meta<typeof TdpSearch> = {
  title: "Tests/Organisms/TdpSearch",
  component: TdpSearch,
  tags: ["!dev"],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof TdpSearch>;

// Mock configuration
const mockConfig = {
  baseUrl: "https://api.tetrascience-dev.com",
  authToken: "test-token",
  orgSlug: "test-org",
};

// Test columns
const testColumns: TdpSearchColumn[] = [
  { key: "id", header: "ID", width: "120px" },
  { key: "name", header: "Name", sortable: true },
  { key: "status", header: "Status", sortable: true },
  { key: "type", header: "Type" },
];

// Test filters
const testFilters: TdpSearchFilter[] = [
  {
    key: "type",
    label: "Type",
    options: [
      { value: "", label: "All Types" },
      { value: "sample", label: "Sample" },
      { value: "experiment", label: "Experiment" },
    ],
  },
  {
    key: "status",
    label: "Status",
    options: [
      { value: "", label: "All Statuses" },
      { value: "active", label: "Active" },
      { value: "pending", label: "Pending" },
    ],
  },
];

// Mock search results
const mockResults = [
  { id: "1", name: "Sample A", status: "active", type: "sample" },
  { id: "2", name: "Sample B", status: "pending", type: "experiment" },
  { id: "3", name: "Sample C", status: "active", type: "sample" },
];

// Helper to mock TdpSearchClient
const mockSearchClient = (
  response: Partial<SearchResponse> | null,
  error?: Error
) => {
  const originalSearchEql = TdpSearchClient.prototype.searchEql;

  TdpSearchClient.prototype.searchEql = async (
    query: EqlQuery
  ): Promise<SearchResponse> => {
    if (error) {
      throw error;
    }
    return {
      results: response?.results || [],
      total: response?.total || 0,
      from: query.from || 0,
      size: query.size || 10,
    };
  };

  return () => {
    TdpSearchClient.prototype.searchEql = originalSearchEql;
  };
};

export const BasicRendering: Story = {
  name: "Basic Rendering",
  args: {
    ...mockConfig,
    columns: testColumns,
    defaultQuery: "SELECT * FROM samples",
    searchPlaceholder: "Enter your search query...",
    pageSize: 10,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify search input is rendered
    const searchInput = canvas.getByPlaceholderText("Enter your search query...");
    await expect(searchInput).toBeInTheDocument();
    await expect(searchInput).toHaveValue("SELECT * FROM samples");

    // Verify search button is rendered
    const searchButton = canvas.getByRole("button", { name: /search/i });
    await expect(searchButton).toBeInTheDocument();
    await expect(searchButton).not.toBeDisabled();

    // Verify placeholder state is shown before search
    await expect(canvas.getByText(/Enter a search query and click Search to get started/i)).toBeInTheDocument();
  },
};

export const BasicRenderingWithFilters: Story = {
  name: "Basic Rendering With Filters",
  args: {
    ...mockConfig,
    columns: testColumns,
    filters: testFilters,
    defaultQuery: "",
    pageSize: 10,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify filters are rendered
    await expect(canvas.getByText("Type")).toBeInTheDocument();
    await expect(canvas.getByText("Status")).toBeInTheDocument();

    // Verify search input is rendered
    const searchInput = canvas.getByPlaceholderText(/enter eql query/i);
    await expect(searchInput).toBeInTheDocument();
  },
};

export const SearchExecutionOnButtonClick: Story = {
  name: "Search Execution On Button Click",
  args: {
    ...mockConfig,
    columns: testColumns,
    defaultQuery: "",
    pageSize: 10,
    onSearch: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const cleanup = mockSearchClient({
      results: mockResults,
      total: mockResults.length,
    });

    try {
      const canvas = within(canvasElement);

      // Type a query
      const searchInput = canvas.getByPlaceholderText(/enter eql query/i);
      await userEvent.clear(searchInput);
      await userEvent.type(searchInput, "SELECT * FROM samples");

      // Click search button
      const searchButton = canvas.getByRole("button", { name: /search/i });
      await userEvent.click(searchButton);

      // Wait for loading state to appear and disappear
      await waitFor(
        async () => {
          await expect(canvas.queryByText(/loading results/i)).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Verify results are displayed
      await waitFor(
        async () => {
          await expect(canvas.getByText("Sample A")).toBeInTheDocument();
          await expect(canvas.getByText("Sample B")).toBeInTheDocument();
          await expect(canvas.getByText("Sample C")).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Verify onSearch callback was called
      await expect(args.onSearch).toHaveBeenCalledTimes(1);

      // Verify results count is displayed
      await expect(canvas.getByText(/Showing 1-3 of 3 results/i)).toBeInTheDocument();
    } finally {
      cleanup();
    }
  },
};

export const LoadingState: Story = {
  name: "Loading State Display",
  args: {
    ...mockConfig,
    columns: testColumns,
    defaultQuery: "",
    pageSize: 10,
  },
  play: async ({ canvasElement }) => {
    // Mock with delay to keep loading state visible
    const originalSearchEql = TdpSearchClient.prototype.searchEql;
    TdpSearchClient.prototype.searchEql = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        results: mockResults,
        total: mockResults.length,
        from: 0,
        size: 10,
      };
    };

    try {
      const canvas = within(canvasElement);

      // Type a query
      const searchInput = canvas.getByPlaceholderText(/enter eql query/i);
      await userEvent.type(searchInput, "SELECT * FROM samples");

      // Click search button
      const searchButton = canvas.getByRole("button", { name: /search/i });
      await userEvent.click(searchButton);

      // Verify loading state appears
      await waitFor(
        async () => {
          await expect(canvas.getByText(/loading results/i)).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      // Verify search button shows loading text
      await expect(canvas.getByRole("button", { name: /searching/i })).toBeInTheDocument();

      // Wait for loading to complete
      await waitFor(
        async () => {
          await expect(canvas.queryByText(/loading results/i)).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    } finally {
      TdpSearchClient.prototype.searchEql = originalSearchEql;
    }
  },
};

export const NoResultsState: Story = {
  name: "No Results State After Search",
  args: {
    ...mockConfig,
    columns: testColumns,
    defaultQuery: "",
    pageSize: 10,
  },
  play: async ({ canvasElement, args: _args }) => {
    const cleanup = mockSearchClient({
      results: [],
      total: 0,
    });

    try {
      const canvas = within(canvasElement);

      // Type a query
      const searchInput = canvas.getByPlaceholderText(/enter eql query/i);
      await userEvent.type(searchInput, "SELECT * FROM samples WHERE id = 'nonexistent'");

      // Click search button
      const searchButton = canvas.getByRole("button", { name: /search/i });
      await userEvent.click(searchButton);

      // Wait for loading to complete
      await waitFor(
        async () => {
          await expect(canvas.queryByText(/loading results/i)).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Verify no results message is displayed
      await waitFor(
        async () => {
          await expect(
            canvas.getByText(/No results found. Try adjusting your search query or filters./i)
          ).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    } finally {
      cleanup();
    }
  },
};

export const ErrorStateHandling: Story = {
  name: "Error State Handling",
  args: {
    ...mockConfig,
    columns: testColumns,
    defaultQuery: "",
    pageSize: 10,
  },
  play: async ({ canvasElement }) => {
    const cleanup = mockSearchClient(null, {
      name: "SearchError",
      message: "Failed to execute search query",
    } as Error);

    try {
      const canvas = within(canvasElement);

      // Type a query
      const searchInput = canvas.getByPlaceholderText(/enter eql query/i);
      await userEvent.type(searchInput, "SELECT * FROM invalid_table");

      // Click search button
      const searchButton = canvas.getByRole("button", { name: /search/i });
      await userEvent.click(searchButton);

      // Wait for loading to complete
      await waitFor(
        async () => {
          await expect(canvas.queryByText(/loading results/i)).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Verify error message is displayed
      await waitFor(
        async () => {
          await expect(canvas.getByText(/Failed to execute search query/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Verify no results message is also shown
      await expect(
        canvas.getByText(/No results found. Try adjusting your search query or filters./i)
      ).toBeInTheDocument();
    } finally {
      cleanup();
    }
  },
};

export const FilterChanges: Story = {
  name: "Filter Changes",
  args: {
    ...mockConfig,
    columns: testColumns,
    filters: testFilters,
    defaultQuery: "SELECT * FROM samples",
    pageSize: 10,
    onSearch: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const cleanup = mockSearchClient({
      results: mockResults.filter((r) => r.type === "sample"),
      total: 2,
    });

    try {
      const canvas = within(canvasElement);

      // Verify filters are rendered
      await expect(canvas.getByText("Type")).toBeInTheDocument();

      // Find the type filter dropdown button
      const typeFilterLabel = canvas.getByText("Type");
      const filterWrapper = typeFilterLabel.parentElement;
      
      if (!filterWrapper) {
        throw new Error("Filter wrapper not found");
      }

      // Find the dropdown button and click to open menu
      const dropdownButton = within(filterWrapper).getByRole("button");
      await userEvent.click(dropdownButton);

      // Wait for menu to appear and select "Sample" option
      await waitFor(
        async () => {
          const sampleOption = canvas.getByText("Sample");
          await expect(sampleOption).toBeInTheDocument();
          await userEvent.click(sampleOption);
        },
        { timeout: 2000 }
      );

      // Execute search with filter
      const searchButton = canvas.getByRole("button", { name: /search/i });
      await userEvent.click(searchButton);

      // Wait for results
      await waitFor(
        async () => {
          await expect(canvas.queryByText(/loading results/i)).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Verify filtered results
      await waitFor(
        async () => {
          await expect(canvas.getByText(/Showing 1-2 of 2 results/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    } finally {
      cleanup();
    }
  },
};

export const Pagination: Story = {
  name: "Pagination",
  args: {
    ...mockConfig,
    columns: testColumns,
    defaultQuery: "SELECT * FROM samples",
    pageSize: 2,
  },
  play: async ({ canvasElement }) => {
    const allResults = [
      { id: "1", name: "Sample 1", status: "active", type: "sample" },
      { id: "2", name: "Sample 2", status: "pending", type: "sample" },
      { id: "3", name: "Sample 3", status: "active", type: "sample" },
      { id: "4", name: "Sample 4", status: "pending", type: "sample" },
      { id: "5", name: "Sample 5", status: "active", type: "sample" },
    ];

    const originalSearchEql = TdpSearchClient.prototype.searchEql;
    TdpSearchClient.prototype.searchEql = async (query: EqlQuery): Promise<SearchResponse> => {
      const from = query.from || 0;
      const size = query.size || 2;
      const results = allResults.slice(from, from + size);

      return {
        results,
        total: allResults.length,
        from,
        size,
      };
    };

    try {
      const canvas = within(canvasElement);

      // Execute initial search
      const searchButton = canvas.getByRole("button", { name: /search/i });
      await userEvent.click(searchButton);

      // Wait for first page results
      await waitFor(
        async () => {
          await expect(canvas.queryByText(/loading results/i)).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Verify first page results
      await expect(canvas.getByText("Sample 1")).toBeInTheDocument();
      await expect(canvas.getByText("Sample 2")).toBeInTheDocument();
      await expect(canvas.getByText(/Showing 1-2 of 5 results/i)).toBeInTheDocument();

      // Find and click next page button
      const nextPageButton = canvas.getByRole("button", { name: "Next page" });
      await userEvent.click(nextPageButton);

      // Wait for second page results
      await waitFor(
        async () => {
          await expect(canvas.getByText("Sample 3")).toBeInTheDocument();
          await expect(canvas.getByText("Sample 4")).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Verify second page results count
      await expect(canvas.getByText(/Showing 3-4 of 5 results/i)).toBeInTheDocument();
    } finally {
      TdpSearchClient.prototype.searchEql = originalSearchEql;
    }
  },
};
