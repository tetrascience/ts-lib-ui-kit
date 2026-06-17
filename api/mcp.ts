/**
 * Deployed MCP endpoint for the TetraScience UI kit Storybook.
 *
 * `@storybook/addon-mcp` only serves `/mcp` from a running `storybook dev`
 * process, so it cannot run on the static Storybook we deploy to Vercel. This
 * Vercel serverless function provides the deployed equivalent: a stateless
 * Streamable-HTTP MCP server exposing the "docs" toolset (component discovery,
 * props/variants, and authored usage examples) over the catalog produced at
 * build time by `scripts/mcp/build-metadata.ts`.
 *
 * Vercel auto-routes this file to `/api/mcp`. AI agents connect with:
 *   npx mcp-add --type http --url "https://<deployment-host>/api/mcp"
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

import type { VercelRequest, VercelResponse } from "@vercel/node";

interface ArgType {
  control?: string;
  options?: unknown[];
  description?: string;
}

interface StoryMeta {
  name: string;
  args?: Record<string, unknown>;
  hasPlayTest?: boolean;
}

interface ComponentMeta {
  title: string;
  name: string;
  importPath: string;
  tags: string[];
  hasDocsPage: boolean;
  argTypes: Record<string, ArgType>;
  defaultArgs: Record<string, unknown>;
  stories: StoryMeta[];
}

interface Catalog {
  generatedAt: string;
  packageName: string;
  packageVersion: string;
  componentCount: number;
  components: ComponentMeta[];
}

const CATALOG_PATH = "/mcp/components.json";

// The catalog is static per deployment, so cache it per origin across warm
// invocations rather than re-fetching on every request.
const catalogCache = new Map<string, Catalog>();

function resolveOrigin(req: VercelRequest): string {
  const proto =
    (req.headers["x-forwarded-proto"] as string | undefined)?.split(",")[0] ?? "https";
  const host =
    (req.headers["x-forwarded-host"] as string | undefined) ?? req.headers.host;
  return `${proto}://${host}`;
}

async function getCatalog(origin: string): Promise<Catalog> {
  const cached = catalogCache.get(origin);
  if (cached) return cached;
  const response = await fetch(`${origin}${CATALOG_PATH}`);
  if (!response.ok) {
    throw new Error(
      `Could not load component catalog (${response.status}) from ${origin}${CATALOG_PATH}. ` +
        `Ensure \`yarn build-storybook\` ran the metadata step.`,
    );
  }
  const catalog = (await response.json()) as Catalog;
  catalogCache.set(origin, catalog);
  return catalog;
}

function findComponent(catalog: Catalog, query: string): ComponentMeta | undefined {
  const needle = query.trim().toLowerCase();
  return (
    catalog.components.find((c) => c.title.toLowerCase() === needle) ??
    catalog.components.find((c) => c.name.toLowerCase() === needle) ??
    catalog.components.find((c) => c.title.toLowerCase().endsWith(`/${needle}`)) ??
    catalog.components.find((c) => c.name.toLowerCase().includes(needle))
  );
}

function jsonContent(value: unknown): { content: { type: "text"; text: string }[] } {
  return { content: [{ type: "text", text: JSON.stringify(value, null, 2) }] };
}

function buildServer(catalog: Catalog): McpServer {
  const server = new McpServer({
    name: `${catalog.packageName}-storybook`,
    version: catalog.packageVersion,
  });

  server.registerTool(
    "list_components",
    {
      title: "List UI kit components",
      description:
        `List every component published in the ${catalog.packageName} Storybook, ` +
        `with its story count, tags, and whether it has a docs page. ` +
        `Use this first to discover what the UI kit offers before scaffolding.`,
    },
    () =>
      jsonContent({
        packageName: catalog.packageName,
        packageVersion: catalog.packageVersion,
        componentCount: catalog.componentCount,
        components: catalog.components.map((c) => ({
          title: c.title,
          name: c.name,
          tags: c.tags,
          storyCount: c.stories.length,
          hasDocsPage: c.hasDocsPage,
        })),
      }),
  );

  server.registerTool(
    "get_component",
    {
      title: "Get component details",
      description:
        `Get the full metadata for one component: its prop controls (argTypes, ` +
        `including the exact allowed variant/size options), default args, and every ` +
        `story with its concrete args (copy-pasteable usage examples). Always prefer ` +
        `these authoritative values over guessing a component's API.`,
      inputSchema: {
        name: z
          .string()
          .describe(
            'Component name or Storybook title, e.g. "Button" or "Components/Button".',
          ),
      },
    },
    ({ name }) => {
      const component = findComponent(catalog, name);
      if (!component) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `No component matching "${name}". Call list_components to see available names.`,
            },
          ],
        };
      }
      return jsonContent({
        ...component,
        importHint: `import { ${component.name} } from "${catalog.packageName}";`,
      });
    },
  );

  server.registerTool(
    "search_components",
    {
      title: "Search components",
      description:
        "Search components by name, Storybook title, tags, or prop names. Returns " +
        "matching components ranked by relevance. Use when you know what you need " +
        '(e.g. "chart", "table", "form input") but not the exact component name.',
      inputSchema: {
        query: z.string().describe("Free-text search term."),
      },
    },
    ({ query }) => {
      const needle = query.trim().toLowerCase();
      const matches = catalog.components
        .map((c) => {
          const haystack = [
            c.title,
            c.name,
            ...c.tags,
            ...Object.keys(c.argTypes),
          ]
            .join(" ")
            .toLowerCase();
          return { component: c, hit: haystack.includes(needle) };
        })
        .filter((m) => m.hit)
        .map((m) => ({
          title: m.component.title,
          name: m.component.name,
          tags: m.component.tags,
          storyCount: m.component.stories.length,
        }));
      return jsonContent({ query, matchCount: matches.length, matches });
    },
  );

  return server;
}

function setCorsHeaders(res: VercelResponse): void {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, mcp-session-id, mcp-protocol-version",
  );
  res.setHeader("Access-Control-Expose-Headers", "mcp-session-id");
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  try {
    const catalog = await getCatalog(resolveOrigin(req));
    const server = buildServer(catalog);

    // Stateless mode: a fresh server + transport per request (no sessions),
    // which matches the serverless execution model. JSON responses avoid SSE.
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    res.on("close", () => {
      void transport.close();
      void server.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: `MCP server error: ${message}` },
        id: null,
      });
    }
  }
}
