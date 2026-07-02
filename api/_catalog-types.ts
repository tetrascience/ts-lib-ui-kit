/**
 * Shared shape of the MCP component catalog.
 *
 * The catalog is produced by `scripts/mcp/build-metadata.ts` and consumed by the
 * `api/mcp.ts` serverless function; both import these types so the contract is
 * defined in one place. Co-located with the function (the consumer); the leading
 * underscore keeps Vercel from treating this file as a routable function.
 */

export interface ArgType {
  control?: string;
  options?: unknown[];
  description?: string;
}

export interface StoryMeta {
  name: string;
  args?: Record<string, unknown>;
  hasPlayTest: boolean;
}

export interface ComponentMeta {
  title: string;
  name: string;
  importPath: string;
  tags: string[];
  hasDocsPage: boolean;
  argTypes: Record<string, ArgType>;
  defaultArgs: Record<string, unknown>;
  stories: StoryMeta[];
}

export interface Catalog {
  generatedAt: string;
  packageName: string;
  packageVersion: string;
  componentCount: number;
  components: ComponentMeta[];
}
