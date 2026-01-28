/**
 * Databricks Data Provider
 *
 * TypeScript equivalent of DatabricksProvider from
 * ts-lib-ui-kit-streamlit/tetrascience/data_app_providers/provider.py
 */

import { DBSQLClient } from "@databricks/sql";
import type IDBSQLSession from "@databricks/sql/dist/contracts/IDBSQLSession";
import type { ProviderConfiguration } from "./types";
import { InvalidProviderConfigurationError } from "./exceptions";

/**
 * Databricks data provider
 */
export class DatabricksProvider {
  private client: DBSQLClient;
  private session: IDBSQLSession;

  /**
   * Initialize the Databricks data provider
   *
   * @param client - Databricks SQL client
   * @param session - Databricks SQL session
   */
  constructor(client: DBSQLClient, session: IDBSQLSession) {
    this.client = client;
    this.session = session;
  }

  /**
   * Query the Databricks database
   *
   * @param sqlQuery - SQL query to execute
   * @param _params - Parameters to pass to the query (currently not used)
   * @returns Promise resolving to array of row objects
   */
  async query(
    sqlQuery: string,
    _params: Record<string, unknown> = {},
  ): Promise<Array<Record<string, unknown>>> {
    const operation = await this.session.executeStatement(sqlQuery);
    const result = await operation.fetchAll();
    await operation.close();
    return result as Array<Record<string, unknown>>;
  }

  /**
   * Close the Databricks connection
   */
  async close(): Promise<void> {
    await this.session.close();
    await this.client.close();
  }
}

/**
 * Get the default Athena schema from environment
 */
function getDefaultSchema(): string {
  const orgSlug = process.env.ORG_SLUG ?? "";
  const orgSlugDbFriendly = orgSlug.replace(/-/g, "_");
  return `${orgSlugDbFriendly}__tss__default`;
}

/**
 * Build a Databricks data provider from the configuration
 *
 * @param config - Provider configuration
 * @returns Promise resolving to Databricks data provider
 */
export async function buildDatabricksProvider(
  config: ProviderConfiguration,
): Promise<DatabricksProvider> {
  const requiredFields = [
    "server_hostname",
    "http_path",
    "client_id",
    "client_secret",
    "catalog",
  ] as const;

  for (const field of requiredFields) {
    if (!config.fields[field]) {
      throw new InvalidProviderConfigurationError(
        `Missing field '${field}' in the provider '${config.name}' to connect to Databricks.`,
      );
    }
  }

  const serverHostname = config.fields["server_hostname"]!;
  const httpPath = config.fields["http_path"]!;
  const clientId = config.fields["client_id"]!;
  const clientSecret = config.fields["client_secret"]!;
  const catalog = config.fields["catalog"]!;
  const schema = config.fields["schema"] ?? getDefaultSchema();

  const client = new DBSQLClient();

  await client.connect({
    host: serverHostname,
    path: httpPath,
    authType: "databricks-oauth",
    oauthClientId: clientId,
    oauthClientSecret: clientSecret,
  });

  const session = await client.openSession({
    initialCatalog: catalog,
    initialSchema: schema,
  });

  return new DatabricksProvider(client, session);
}

