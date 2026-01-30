# TdpSearch Component

A search component for querying the TetraScience Data Platform (TDP). Provides a search input, filters, sortable results table, and pagination.

## Basic Usage

```tsx
import { TdpSearch, TdpSearchColumn } from '@tetrascience-npm/tetrascience-react-ui';

const columns: TdpSearchColumn[] = [
  { key: "id", header: "ID", width: "120px" },
  { key: "name", header: "Name", sortable: true },
  { key: "type", header: "Type", sortable: true },
  { key: "createdAt", header: "Created", sortable: true },
];

function MyApp() {
  return (
    <TdpSearch
      baseUrl="https://api.tetrascience.com"
      authToken="your-auth-token"
      orgSlug="your-org-slug"
      columns={columns}
      defaultQuery="SELECT * FROM samples LIMIT 10"
      searchPlaceholder="Search samples..."
    />
  );
}
```

## With Filters

```tsx
import { TdpSearch, TdpSearchColumn, TdpSearchFilter } from '@tetrascience-npm/tetrascience-react-ui';

const columns: TdpSearchColumn[] = [
  { key: "id", header: "ID" },
  { key: "name", header: "Name", sortable: true },
  { key: "type", header: "Type", sortable: true },
];

const filters: TdpSearchFilter[] = [
  {
    key: "type",
    label: "Type",
    options: [
      { value: "", label: "All Types" },
      { value: "sample", label: "Sample" },
      { value: "experiment", label: "Experiment" },
      { value: "protocol", label: "Protocol" },
    ],
  },
];

function MyApp() {
  return (
    <TdpSearch
      baseUrl="https://api.tetrascience.com"
      authToken="your-auth-token"
      orgSlug="your-org-slug"
      columns={columns}
      filters={filters}
      defaultQuery="SELECT * FROM samples"
    />
  );
}
```

## Custom Cell Rendering

```tsx
const columns: TdpSearchColumn[] = [
  { key: "id", header: "ID" },
  { key: "name", header: "Name" },
  {
    key: "status",
    header: "Status",
    render: (value) => (
      <span style={{
        padding: "4px 8px",
        borderRadius: "4px",
        backgroundColor: value === "active" ? "#d1fae5" : "#fee2e2",
        color: value === "active" ? "#065f46" : "#991b1b",
      }}>
        {value}
      </span>
    ),
  },
  {
    key: "size",
    header: "Size",
    align: "right",
    render: (value) => {
      const mb = (value / 1024 / 1024).toFixed(2);
      return `${mb} MB`;
    },
  },
];
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `baseUrl` | `string` | Yes | TDP API base URL |
| `authToken` | `string` | Yes | Authentication token |
| `orgSlug` | `string` | Yes | Organization slug |
| `columns` | `TdpSearchColumn[]` | Yes | Column definitions |
| `filters` | `TdpSearchFilter[]` | No | Filter configurations |
| `sortOptions` | `TdpSearchSort[]` | No | Default sort options |
| `pageSize` | `number` | No | Results per page (default: 10) |
| `defaultQuery` | `string` | No | Initial EQL query |
| `searchPlaceholder` | `string` | No | Search input placeholder |
| `className` | `string` | No | Custom CSS class |
| `onSearch` | `function` | No | Callback when search executes |

## EQL Query Language

The component uses TetraScience's EQL (Event Query Language) for searching:

```sql
-- Basic search
SELECT * FROM samples LIMIT 10

-- With filters
SELECT * FROM samples WHERE type = 'experiment'

-- With sorting
SELECT * FROM samples ORDER BY createdAt DESC

-- Complex query
SELECT id, name, type FROM samples 
WHERE type IN ('sample', 'experiment') 
AND createdAt > '2024-01-01'
ORDER BY name ASC
LIMIT 20
```
